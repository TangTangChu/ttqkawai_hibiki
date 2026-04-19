<template>
    <div class="w-full max-w-full">
        <div ref="markdownRoot" class="w-full" @click="handleCopyClick">
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
                <AnzuSpinner size="lg" />
            </div>

            <p v-else-if="errorMessage" class="text-on-background/80">
                {{ errorMessage }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { MDCParserResult } from "@nuxtjs/mdc";
import { computed, ref, watch } from "vue";
import type { DefineComponent } from "vue";
import { useMarkdown } from "~/composables/UseMarkdown";
import AnzuSpinner from "~/components/AnzuSpinner.vue";
import BilibiliEmbed from "~/components/mdc/BilibiliEmbed.vue";
import MarkdownAlert from "~/components/mdc/MarkdownAlert.vue";
import ProseA from "~/components/prose/ProseA.vue";
import ProseH1 from "~/components/prose/ProseH1.vue";
import ProseH2 from "~/components/prose/ProseH2.vue";
import ProseH3 from "~/components/prose/ProseH3.vue";
import ProseH4 from "~/components/prose/ProseH4.vue";
import ProseH5 from "~/components/prose/ProseH5.vue";
import ProseH6 from "~/components/prose/ProseH6.vue";
import ProseImg from "~/components/prose/ProseImg.vue";
import ProsePre from "~/components/prose/ProsePre.vue";
import GithubCard from "~/components/GithubCard.vue";
import type { TocItem } from "~/types/tocItems";
import "~/assets/css/markdown.css";

const { t } = useI18n();

const props = defineProps<{
    content: string | "";
    sanitize?: boolean;
}>();

const emit = defineEmits<{
    (e: "toc-updated", items: TocItem[]): void;
}>();

const { parseMdcMarkdown, extractTocItems } = useMarkdown();
const markdownRoot = ref<HTMLElement | null>(null);
const parsedContent = ref<MDCParserResult | null>(null);
const tocItems = ref<TocItem[]>([]);
const errorMessage = ref("");
const parsing = ref(false);

const rendererComponents = {
    a: ProseA,
    pre: ProsePre,
    h1: ProseH1,
    h2: ProseH2,
    h3: ProseH3,
    h4: ProseH4,
    h5: ProseH5,
    h6: ProseH6,
    img: ProseImg,
    "markdown-alert": MarkdownAlert,
    "bilibili-embed": BilibiliEmbed,
    "github-card": GithubCard as unknown as DefineComponent<any, any, any>,
};

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

const updateParsedContent = (content: string): Promise<void> => {
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
            parsedContent.value = result;
            tocItems.value = extractTocItems(result);
            emit("toc-updated", tocItems.value);
        })
        .catch((error) => {
            console.error(t("common.label.renderFailed"), error);
            parsedContent.value = null;
            tocItems.value = [];
            emit("toc-updated", []);
            errorMessage.value = t("common.label.renderFailed");
        })
        .finally(() => {
            parsing.value = false;
        });
};

const handleCopyClick = (event: Event): void => {
    const target = event.target as Element | null;
    if (!target) return;

    const button = target.closest(".code-copy-btn") as HTMLButtonElement | null;
    if (!button) return;

    const encodedCode = button.getAttribute("data-code") || "";
    const codeEncoding = button.getAttribute("data-code-encoding") || "";

    if (!encodedCode) return;

    let code = encodedCode;
    if (codeEncoding === "uri") {
        try {
            code = decodeURIComponent(encodedCode);
        } catch {
            code = encodedCode;
        }
    }

    navigator.clipboard
        .writeText(code)
        .then(() => {
            button.classList.add("copied");
            setTimeout(() => {
                button.classList.remove("copied");
            }, 2000);
        })
        .catch((error) => {
            console.error(t("common.label.copyFailed"), error);
        });
};

watch(
    () => props.content,
    (content) => {
        updateParsedContent(content).catch((error) => {
            console.error(t("common.label.updateFailed"), error);
        });
    },
    { immediate: true },
);

defineExpose({
    tocItems,
    markdownRoot,
});
</script>
