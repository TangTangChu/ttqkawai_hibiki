<template>
    <div class="w-full max-w-full">
        <div ref="markdownRoot" class="w-full">
            <MDCRenderer
                v-if="renderPayload"
                :body="renderPayload.body"
                :data="renderPayload.data"
                :components="rendererComponents"
                prose
                tag="div"
                class="markdown-wrapper"
                :style="{
                    '--md-heading-base-level': headingSizeLevel.toString(),
                }"
            />

            <div
                v-else-if="parsing"
                class="flex items-center justify-center py-20"
                role="status"
                :aria-label="t('common.label.loading')"
            >
                <AnriSpinner size="lg" />
            </div>

            <p v-else-if="errorMessage" class="text-on-background/80">
                {{ errorMessage }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { MDCParserResult } from "@nuxtjs/mdc";
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import {
    useMarkdown,
    markdownPlugins,
    markdownComponents,
} from "~/composables/UseMarkdown";
import AnriSpinner from "~/components/AnriSpinner.vue";
import {
    collectDecorators,
    assertComponentsBound,
    type MarkdownDecorator,
} from "~/utils/markdown/plugin";
import { extractHeadingItems, tocItemsEqual } from "~/utils/markdown/toc";
import type { TocItem } from "~/types/tocItems";
import "~/assets/css/markdown.css";

const { t } = useI18n();

const props = defineProps<{
    content: string;
    sanitize?: boolean;
}>();

const emit = defineEmits<{
    (e: "toc-updated", items: TocItem[]): void;
}>();

const { parseMdcMarkdown } = useMarkdown();
const markdownRoot = ref<HTMLElement | null>(null);
const parsedContent = ref<MDCParserResult | null>(null);
const tocItems = ref<TocItem[]>([]);
const errorMessage = ref("");
const parsing = ref(false);

const rendererComponents = markdownComponents;
const decoratorFactories = collectDecorators(markdownPlugins);
const decorators = new Map<string, MarkdownDecorator>();

if (import.meta.dev) {
    assertComponentsBound(markdownPlugins, markdownComponents);
}

const renderPayload = computed(() => {
    if (!parsedContent.value) {
        return null;
    }

    return {
        body: parsedContent.value.body,
        data: parsedContent.value.data,
    };
});

const headingSizeLevel = computed(() => {
    if (tocItems.value.length === 0) return 1;
    return Math.min(...tocItems.value.map((item) => item.level));
});

let renderRequestId = 0;

const updateParsedContent = (content: string): Promise<void> => {
    const requestId = (renderRequestId += 1);

    if (!content.trim()) {
        parsedContent.value = null;
        tocItems.value = [];
        errorMessage.value = "";
        parsing.value = false;
        emit("toc-updated", []);
        return Promise.resolve();
    }

    errorMessage.value = "";
    parsing.value = true;

    return parseMdcMarkdown(content, props.sanitize !== false)
        .then((result) => {
            if (requestId !== renderRequestId) return;
            parsedContent.value = result;
        })
        .catch((error) => {
            if (requestId !== renderRequestId) return;
            console.error(t("common.label.renderFailed"), error);
            parsedContent.value = null;
            tocItems.value = [];
            emit("toc-updated", []);
            errorMessage.value = t("common.label.renderFailed");
        })
        .finally(() => {
            if (requestId === renderRequestId) {
                parsing.value = false;
            }
        });
};

const destroyDecorators = () => {
    for (const decorator of decorators.values()) {
        decorator.destroy();
    }
    decorators.clear();
};

const syncMarkdownDom = () => {
    const root = markdownRoot.value;
    if (!root) return;

    for (const factory of decoratorFactories) {
        const existing = decorators.get(factory.name);
        if (existing) {
            existing.refresh();
        } else {
            decorators.set(factory.name, factory.create(root));
        }
    }

    const items = extractHeadingItems(root);
    if (!tocItemsEqual(items, tocItems.value)) {
        tocItems.value = items;
        emit("toc-updated", items);
    }
};

watch(
    () => [props.content, props.sanitize] as const,
    ([content]) => {
        updateParsedContent(String(content || "")).catch((error) => {
            console.error(t("common.label.updateFailed"), error);
        });
    },
    { immediate: true },
);

let domSyncTimer: ReturnType<typeof setTimeout> | null = null;
let resizeObserver: ResizeObserver | null = null;

const clearDomSyncResources = () => {
    if (domSyncTimer !== null) {
        clearTimeout(domSyncTimer);
        domSyncTimer = null;
    }
    if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
    }
};

onMounted(() => {
    resizeObserver = new ResizeObserver(() => {
        if (domSyncTimer) clearTimeout(domSyncTimer);
        domSyncTimer = setTimeout(() => {
            syncMarkdownDom();
            domSyncTimer = null;
        }, 100);
    });

    if (markdownRoot.value) {
        resizeObserver.observe(markdownRoot.value);
    }
});

onUnmounted(() => {
    clearDomSyncResources();
    destroyDecorators();
});

watch(
    () => parsedContent.value,
    async (value) => {
        if (!value) {
            tocItems.value = [];
            emit("toc-updated", []);
            destroyDecorators();
            return;
        }
        await nextTick();
        syncMarkdownDom();
    },
);

defineExpose({
    tocItems,
    markdownRoot,
});
</script>
