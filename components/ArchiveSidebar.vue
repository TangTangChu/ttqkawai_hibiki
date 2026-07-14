<template>
    <div
        class="archive-sidebar-container"
        :class="[
            isMobile
                ? 'flex flex-col w-full mobile-instance'
                : 'hidden lg:block shrink-0 desktop-instance',
            isMobile || isTocVisible ? 'is-visible' : 'is-hidden',
            !isMobile && isCollapsed ? 'is-collapsed' : 'is-expanded',
            hasToc ? 'has-toc' : 'no-toc',
        ]"
    >
        <div class="archive-sidebar-sticky">
            <div v-if="!isMobile" class="sidebar-tools">
                <div
                    v-if="hasToc && !isCollapsed"
                    class="sidebar-title flex items-center gap-3"
                >
                    <h2 class="text-lg font-bold text-on-surface truncate">
                        {{ t("common.label.toc") }}
                    </h2>
                </div>

                <div class="tools-group">
                    <button
                        v-if="hasToc"
                        type="button"
                        class="tool-button"
                        :title="
                            isCollapsed
                                ? t('common.action.expand')
                                : t('common.action.collapse')
                        "
                        @click="toggleCollapse"
                    >
                        <ChevronDoubleRightIcon
                            v-if="!isCollapsed"
                            class="h-4 w-4"
                        />
                        <ChevronDoubleLeftIcon v-else class="h-4 w-4" />
                    </button>
                    <Transition name="tool-pop">
                        <button
                            v-if="showBackToTop"
                            type="button"
                            class="tool-button"
                            :title="t('common.label.top')"
                            @click="scrollToTop"
                        >
                            <ArrowUpIcon class="h-4 w-4" />
                        </button>
                    </Transition>
                </div>
            </div>
            <Transition :name="isMobile ? '' : 'toc-fade'">
                <div
                    v-show="hasToc && (isMobile || !isCollapsed)"
                    class="sidebar-content"
                >
                    <ul class="toc-list">
                        <li
                            v-for="item in displayItems"
                            :key="item.id"
                            class="toc-item"
                            :style="{ paddingLeft: item.indent }"
                        >
                            <a
                                :title="item.text"
                                class="block py-1.5 px-2 md:px-3 no-underline rounded-lg text-sm transition-all duration-300 cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis"
                                :class="
                                    activeId === item.id
                                        ? 'bg-primary text-on-primary font-medium'
                                        : 'text-on-surface/70 hover:bg-primary-container hover:text-primary'
                                "
                                :style="{ fontSize: item.fontSize }"
                                @click="handleTocClick(item.id)"
                            >
                                {{ item.label }}
                            </a>
                        </li>
                    </ul>
                    <div v-if="items.length === 0" class="toc-empty">
                        {{ t("common.label.emptyToc") }}
                    </div>
                </div>
            </Transition>
        </div>
        <Teleport v-if="!isMobile" to="body">
            <div
                class="fixed right-4 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-3 lg:hidden"
            >
                <Transition name="fab-pop">
                    <button
                        v-if="showBackToTop && !isMobileDrawerOpen"
                        type="button"
                        class="fab-button"
                        :title="t('common.label.top')"
                        @click="scrollToTop"
                    >
                        <ArrowUpIcon class="h-5 w-5" />
                    </button>
                </Transition>

                <Transition name="fab-pop">
                    <button
                        v-if="hasToc && !isMobileDrawerOpen"
                        type="button"
                        class="fab-button"
                        :title="t('common.label.toc')"
                        @click="isMobileDrawerOpen = true"
                    >
                        <Bars3BottomLeftIcon
                            class="h-6 w-6"
                            aria-hidden="true"
                        />
                    </button>
                </Transition>
            </div>

            <AnriDrawer
                v-model:show="isMobileDrawerOpen"
                :title="t('common.label.toc')"
            >
                <ArchiveSidebar
                    :items="items"
                    :markdown-render-ref="markdownRenderRef"
                    is-mobile
                    @close="isMobileDrawerOpen = false"
                />
            </AnriDrawer>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import {
    ArrowUpIcon,
    ChevronDoubleLeftIcon,
    ChevronDoubleRightIcon,
    Bars3BottomLeftIcon,
    XMarkIcon,
} from "@heroicons/vue/24/outline";
import type { TocItem } from "~/types/tocItems";

type MarkdownRenderRef =
    | HTMLElement
    | { markdownRoot?: HTMLElement; $el?: HTMLElement }
    | null
    | undefined;

const props = defineProps<{
    items: TocItem[];
    markdownRenderRef?: MarkdownRenderRef;
    isMobile?: boolean;
}>();

const emit = defineEmits<{
    (e: "close"): void;
}>();

const { t } = useI18n();
const isCollapsed = ref(false);
const isTocVisible = ref(false);
const showBackToTop = ref(false);
const isMobileDrawerOpen = ref(false);

const hasToc = computed(() => props.items.length > 0);

const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
};

const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleTocClick = (id: string) => {
    scrollToHeading(id);
    if (props.isMobile) {
        emit("close");
    }
};

// TOC Logic
const activeId = ref("");
const MIN_LEVEL = 1;

const getRootElement = (): HTMLElement | null => {
    const refValue = props.markdownRenderRef;
    if (!refValue) return null;
    if (refValue instanceof HTMLElement) return refValue;
    if (refValue.markdownRoot instanceof HTMLElement)
        return refValue.markdownRoot;
    if (refValue.$el instanceof HTMLElement) return refValue.$el;
    return null;
};

const minLevel = computed(() => {
    if (!props.items.length) return MIN_LEVEL;
    return Math.min(...props.items.map((i) => i.level));
});

const FONT_SIZES: Record<number, string> = {
    0: "0.9rem",
    1: "0.875rem",
    2: "0.85rem",
    3: "0.825rem",
    4: "0.8rem",
    5: "0.8rem",
};

const getDisplayText = (text: string) => {
    const MAX_LEN = 26;
    const normalizedText = text.trim();
    if (normalizedText.length <= MAX_LEN) {
        return normalizedText;
    }

    return `${normalizedText.slice(0, MAX_LEN).trimEnd()}...`;
};

const displayItems = computed(() =>
    props.items.map((item) => {
        const diff = item.level - minLevel.value;
        return {
            id: item.id,
            text: item.text,
            label: getDisplayText(item.text),
            indent: `${diff * 0.75}rem`,
            fontSize: FONT_SIZES[diff] || "0.8rem",
        };
    }),
);

const scrollToHeading = (id: string): void => {
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
};

// Cached heading list — re-queried only when the TOC changes, not on scroll.
let cachedHeadings: HTMLElement[] = [];

const refreshHeadings = (): void => {
    const scope = getRootElement() || document;
    cachedHeadings = Array.from(
        scope.querySelectorAll(
            "h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]",
        ),
    ) as HTMLElement[];
};

const updateActiveHeading = (): void => {
    let current = "";
    let closestDistance = Number.POSITIVE_INFINITY;

    for (const heading of cachedHeadings) {
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
};

let scrollRaf = 0;

const onScroll = (): void => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        showBackToTop.value = window.scrollY > 400;
        updateActiveHeading();
    });
};

onMounted(() => {
    if (props.isMobile) return;

    window.addEventListener("scroll", onScroll, { passive: true });

    setTimeout(() => {
        isTocVisible.value = true;
        refreshHeadings();
        updateActiveHeading();
    }, 300);
});

onUnmounted(() => {
    if (props.isMobile) return;
    window.removeEventListener("scroll", onScroll);
    if (scrollRaf) {
        cancelAnimationFrame(scrollRaf);
        scrollRaf = 0;
    }
});

watch(
    () => props.items,
    () => {
        if (props.isMobile) return;
        setTimeout(() => {
            refreshHeadings();
            updateActiveHeading();
        }, 100);
    },
);
</script>

<style scoped>
@reference "tailwindcss";
.archive-sidebar-container {
    transition:
        width 0.5s ease-in-out,
        opacity 0.5s ease-in-out,
        transform 0.5s ease-in-out;
}

.archive-sidebar-container:not(.w-full) {
    display: none;
}

@media (min-width: 1024px) {
    .archive-sidebar-container:not(.w-full) {
        display: block;
        flex-shrink: 0;
    }
}

.archive-sidebar-container.is-hidden {
    opacity: 0;
    transform: translateX(1rem);
}

.archive-sidebar-container.is-visible {
    opacity: 1;
    transform: translateX(0);
}

.archive-sidebar-container.mobile-instance {
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
}

.archive-sidebar-container.is-expanded {
    width: 18rem;
}

.archive-sidebar-container.is-collapsed,
.archive-sidebar-container.no-toc {
    width: 3.5rem;
}

.desktop-instance .archive-sidebar-sticky {
    position: sticky;
    top: 6rem;
    max-height: calc(100vh - 8rem);
    transition: padding 0.5s ease-in-out;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.mobile-instance .archive-sidebar-sticky {
    position: static;
    max-height: none;
    padding: 0;
}

.is-expanded .archive-sidebar-sticky {
    padding-left: 1rem;
    padding-right: 1rem;
}

.is-collapsed .archive-sidebar-sticky,
.no-toc .archive-sidebar-sticky {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}

.sidebar-tools {
    margin-bottom: 1rem;
    display: flex;
    transition:
        gap 0.5s ease-in-out,
        padding 0.5s ease-in-out;
    flex-shrink: 0;
    position: relative;
}

.is-expanded .sidebar-tools {
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding-bottom: 0.75rem;
}

.is-collapsed .sidebar-tools,
.no-toc .sidebar-tools {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.tools-group {
    display: flex;
}

.is-collapsed .tools-group,
.no-toc .tools-group {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
}

.is-expanded .tools-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.tool-button {
    display: flex;
    height: 2.25rem;
    width: 2.25rem;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 0.75rem;
    background-color: transparent;
    transition:
        color 0.5s ease-in-out,
        background-color 0.5s ease-in-out,
        transform 0.5s ease-in-out;
    color: color-mix(in srgb, var(--on-surface) 50%, transparent);
    cursor: pointer;
    border: none;
}

.tool-button:hover {
    color: var(--primary);
    background-color: color-mix(in srgb, var(--primary) 5%, transparent);
}

.tool-button:active {
    transform: scale(0.95);
    background-color: color-mix(in srgb, var(--primary) 10%, transparent);
}

/* Mobile floating buttons: same primary hover/active model as .tool-button,
   plus a translucent surface + backdrop-blur + Nav-matched warm shadow so the
   chip stays legible while floating over arbitrary article content. */
.fab-button {
    display: flex;
    height: 2.75rem;
    width: 2.75rem;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 0.75rem;
    background-color: color-mix(in srgb, var(--surface) 80%, transparent);
    color: color-mix(in srgb, var(--on-surface) 70%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 2px 16px 0 rgba(113, 93, 84, 0.06);
    cursor: pointer;
    transition:
        color 0.2s ease-out,
        background-color 0.2s ease-out,
        transform 0.2s ease-out;
}

.fab-button:hover {
    color: var(--primary);
    background-color: color-mix(in srgb, var(--primary) 10%, var(--surface));
}

.fab-button:active {
    transform: scale(0.95);
    background-color: color-mix(in srgb, var(--primary) 16%, var(--surface));
}

/* Enter/leave for the floating buttons: rise up + scale + fade, asymmetric
   ease-out / ease-in per the pop-in spec. Named (scoped) so it beats the base
   .fab-button transition by source order instead of fighting utility classes. */
.fab-pop-enter-active {
    transition:
        transform 0.3s ease-out,
        opacity 0.3s ease-out;
}

.fab-pop-leave-active {
    transition:
        transform 0.2s ease-in,
        opacity 0.2s ease-in;
}

.fab-pop-enter-from,
.fab-pop-leave-to {
    opacity: 0;
    transform: translateY(0.75rem) scale(0.9);
}

.sidebar-content {
    flex: 1 1 0%;
    min-height: 0;
    overflow: hidden;
}

@media (min-width: 1024px) {
    .archive-sidebar-container:not(.w-full) .sidebar-content {
        width: 16rem;
        flex-shrink: 0;
    }
}

.toc-list {
    margin: 0;
    list-style-type: none;
    padding: 0;
    overflow-y: auto;
    padding-right: 0.5rem;
}

.toc-list > * + * {
    margin-top: 0.25rem;
}

.toc-list::-webkit-scrollbar {
    @apply w-1;
}

.toc-list::-webkit-scrollbar-thumb {
    @apply rounded;
    background-color: color-mix(in srgb, var(--on-surface) 10%, transparent);
}

.toc-list::-webkit-scrollbar-thumb:hover {
    background-color: color-mix(in srgb, var(--on-surface) 20%, transparent);
}

.toc-empty {
    @apply mt-2 text-sm italic;
    color: color-mix(in srgb, var(--on-surface) 40%, transparent);
}

.tool-pop-enter-active,
.tool-pop-leave-active {
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.is-expanded .tool-pop-enter-from,
.is-expanded .tool-pop-leave-to {
    opacity: 0;
    width: 0;
    margin-left: -0.5rem;
    transform: scale(0.5);
}

.is-collapsed .tool-pop-enter-from,
.is-collapsed .tool-pop-leave-to,
.no-toc .tool-pop-enter-from,
.no-toc .tool-pop-leave-to {
    opacity: 0;
    height: 0;
    margin-top: -1rem;
    transform: scale(0.5);
}

.toc-fade-enter-active,
.toc-fade-leave-active {
    transition:
        opacity 0.5s ease-in-out,
        transform 0.5s ease-in-out;
}
.toc-fade-enter-from,
.toc-fade-leave-to {
    opacity: 0;
    transform: translateY(-0.5rem);
}
</style>
