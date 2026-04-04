<template>
    <div class="relative">
        <div
            id="toc-container"
            aria-labelledby="toc-title"
            role="navigation"
            class="max-h-[calc(100vh-7rem)] overflow-y-auto text-on-surface/80 transition-all duration-300 ease-in-out"
        >
            <div v-if="items.length" class="mb-2 flex items-center">
                <h2 id="toc-title" class="text-lg font-bold">
                    {{ t("common.items.toc") }}
                </h2>
            </div>

            <ul class="m-0 list-none space-y-1 p-0">
                <li
                    v-for="item in items"
                    :key="item.id"
                    class="my-0.5 min-w-0 overflow-hidden leading-snug text-ellipsis"
                    :style="{ paddingLeft: getIndent(item.level) }"
                >
                    <a
                        :title="item.text"
                        :class="getLinkClasses(item)"
                        :style="{ fontSize: getLevelFontSize(item.level) }"
                        :aria-current="
                            activeId === item.id ? 'location' : undefined
                        "
                        @click="scrollTo(item.id)"
                    >
                        {{ getDisplayText(item.text) }}
                    </a>
                </li>
            </ul>

            <div
                v-if="items.length === 0"
                class="mt-2 text-sm text-on-surface/60 italic"
            >
                {{ t("common.items.emptyToc") }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import type { TocItem } from "~/types/tocItems";

const HEADING_SELECTOR = "h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]";
const TOC_TEXT_MAX_LENGTH = 26;

type MarkdownRenderLike =
    | HTMLElement
    | {
          markdownRoot?: HTMLElement | null;
          $el?: HTMLElement;
      }
    | null
    | undefined;

const { t } = useI18n();

const props = defineProps<{
    items: TocItem[];
    markdownRenderRef?: MarkdownRenderLike;
}>();

const activeId = ref("");

const getRootElement = (): HTMLElement | null => {
    const refValue = props.markdownRenderRef;

    if (!refValue) return null;
    if (refValue instanceof HTMLElement) return refValue;
    if (refValue.markdownRoot instanceof HTMLElement)
        return refValue.markdownRoot;
    if (refValue.$el instanceof HTMLElement) return refValue.$el;

    return null;
};

const getHeadings = (): HTMLElement[] => {
    const rootElement = getRootElement();
    const scope = rootElement || document;

    return Array.from(
        scope.querySelectorAll(HEADING_SELECTOR),
    ) as HTMLElement[];
};

const minLevel = computed((): number => {
    if (!props.items.length) return 1;
    return Math.min(...props.items.map((item) => item.level));
});

const getIndent = (level: number): string => {
    return `${(level - minLevel.value) * 0.75}rem`;
};

const getLinkClasses = (item: TocItem): string => {
    const baseClasses =
        "block py-1.5 px-2 md:px-3 no-underline rounded-lg text-sm transition-colors cursor-pointer whitespace-normal wrap-break-word";
    const activeClasses =
        activeId.value === item.id
            ? "bg-primary text-on-primary font-medium"
            : "text-on-surface/70 hover:bg-primary-container hover:text-primary";

    return `${baseClasses} ${activeClasses}`;
};

const getLevelFontSize = (level: number): string => {
    const relativeLevel = level - minLevel.value;
    const fontSizes: Record<number, string> = {
        0: "0.9rem",
        1: "0.875rem",
        2: "0.85rem",
        3: "0.825rem",
        4: "0.8rem",
        5: "0.8rem",
    };

    return fontSizes[relativeLevel] || "0.8rem";
};

const getDisplayText = (text: string): string => {
    const normalizedText = text.trim();
    if (normalizedText.length <= TOC_TEXT_MAX_LENGTH) {
        return normalizedText;
    }

    return `${normalizedText.slice(0, TOC_TEXT_MAX_LENGTH).trimEnd()}...`;
};

function scrollTo(id: string): void {
    if (!id) return;

    const rootElement = getRootElement();
    const scopedTarget = rootElement
        ? rootElement.querySelector<HTMLElement>(`#${CSS.escape(id)}`)
        : null;
    const target = scopedTarget || document.getElementById(id);

    if (!target) return;

    const header = document.querySelector("header");
    const headerHeight = header ? header.offsetHeight : 80;
    const elementPosition = target.getBoundingClientRect().top + window.scrollY;
    const targetPosition = elementPosition - headerHeight;

    window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
    });

    activeId.value = id;
}

function handleScroll(): void {
    const headings = getHeadings();
    let current = "";
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const heading of headings) {
        const rect = heading.getBoundingClientRect();
        const distance = Math.abs(rect.top - 100);

        if (rect.top <= 120 && distance < closestDistance) {
            closestDistance = distance;
            current = heading.id;
        }
    }

    if (current) {
        activeId.value = current;
    }
}

const scrollHandler = (): void => {
    handleScroll();
};

onMounted(() => {
    window.addEventListener("scroll", scrollHandler, { passive: true });
    handleScroll();
});

onUnmounted(() => {
    window.removeEventListener("scroll", scrollHandler);
});
</script>
