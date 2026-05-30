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
            <button
                v-if="hasToc && !isMobileDrawerOpen"
                type="button"
                class="fixed right-4 bottom-6 z-40 inline-flex items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-background px-4 py-2 text-sm font-semibold text-[color-mix(in_srgb,var(--on-surface)_80%,transparent)] shadow-lg transition-all active:scale-95 lg:hidden"
                @click="isMobileDrawerOpen = true"
            >
                <Bars3BottomLeftIcon class="h-4 w-4" aria-hidden="true" />
                {{ t("common.label.toc") }}
            </button>
            <Transition
                enter-active-class="transition-opacity duration-200"
                leave-active-class="transition-opacity duration-200"
                enter-from-class="opacity-0"
                leave-to-class="opacity-0"
            >
                <div
                    v-if="isMobileDrawerOpen"
                    class="fixed inset-0 z-50 lg:hidden"
                >
                    <div
                        class="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        @click="isMobileDrawerOpen = false"
                    />

                    <div
                        class="absolute right-0 bottom-0 left-0 flex max-h-[85vh] flex-col rounded-t-3xl border-t border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-background p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
                    >
                        <div class="mb-4 flex items-center justify-between">
                            <h2 class="text-xl font-bold text-on-background">
                                {{ t("common.label.toc") }}
                            </h2>
                            <button
                                type="button"
                                class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--on-surface)_5%,transparent)] text-[color-mix(in_srgb,var(--on-surface)_70%,transparent)]"
                                @click="isMobileDrawerOpen = false"
                            >
                                <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                            </button>
                        </div>
                        <div class="min-h-0 flex-1 overflow-y-auto">
                            <ArchiveSidebar
                                :items="items"
                                :markdown-render-ref="markdownRenderRef"
                                is-mobile
                                @close="isMobileDrawerOpen = false"
                            />
                        </div>
                    </div>
                </div>
            </Transition>
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

const props = defineProps<{
    items: TocItem[];
    markdownRenderRef?: any;
    isMobile?: boolean;
}>();

const emit = defineEmits(["close"]);

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
    scrollTo(id);
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

const scrollTo = (id: string): void => {
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
    transition: all 0.5s ease-in-out;
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
    transition: all 0.5s ease-in-out;
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
    transition: all 0.5s ease-in-out;
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
    transition: all 0.5s ease-in-out;
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
    transition: all 0.5s ease-in-out;
}
.toc-fade-enter-from,
.toc-fade-leave-to {
    opacity: 0;
    transform: translateY(-0.5rem);
}
</style>
