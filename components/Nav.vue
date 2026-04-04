<template>
    <header class="fixed inset-x-0 top-0 z-50">
        <div class="mx-auto max-w-7xl px-3 pt-3 sm:px-6 sm:pt-4">
            <div
                ref="headerRef"
                class="relative rounded-2xl transition-[background-color,backdrop-filter] duration-500 ease-out"
                :style="headerStyles"
            >
                <nav
                    class="relative flex h-14 items-center justify-between gap-2 px-3 sm:h-16 sm:px-4"
                    role="navigation"
                    aria-label="主导航"
                >
                    <div class="flex min-w-0 shrink-0 items-center">
                        <NuxtLink
                            to="/"
                            class="nav-link-block nav-link-block--brand px-2! py-1!"
                        >
                            <img
                                src="https://img.tantanchugasuki.cn/i/r/avatar"
                                alt="Logo"
                                class="mr-2 h-9 w-9 shrink-0 rounded-xl object-cover"
                            />
                            <span
                                class="block max-w-34 min-w-0 truncate text-base font-bold tracking-wide sm:max-w-56 sm:text-lg lg:max-w-[20rem]"
                            >
                                {{ $t("site.title") }}
                            </span>
                        </NuxtLink>
                    </div>

                    <div
                        ref="centerColRef"
                        class="relative mx-2 h-10 min-w-0 flex-1 items-center justify-center"
                        :class="isWideLayout ? 'flex' : 'hidden'"
                    >
                        <div
                            ref="measureRowRef"
                            class="pointer-events-none invisible absolute top-0 left-0 flex items-center gap-2 whitespace-nowrap lg:gap-2.5"
                        >
                            <div
                                v-for="(item, index) in menu"
                                :key="`measure-${item.route}`"
                                :ref="
                                    (el) =>
                                        setMeasureItemRef(
                                            el as HTMLElement | null,
                                            index,
                                        )
                                "
                                class="shrink-0"
                            >
                                <div class="nav-link-block px-3 py-2">
                                    <span
                                        class="relative z-10 flex items-center"
                                    >
                                        <component
                                            :is="item.icon"
                                            v-if="item.icon"
                                            class="mr-1.5 h-4 w-4"
                                        />
                                        {{ $t(item.label) }}
                                    </span>
                                </div>
                            </div>

                            <div ref="moreMeasureRef" class="shrink-0">
                                <div class="nav-link-block px-3 py-2">
                                    <span
                                        class="relative z-10 flex items-center"
                                    >
                                        <EllipsisHorizontalIcon
                                            class="mr-1.5 h-4 w-4"
                                        />
                                        {{ $t("common.actions.more") }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div
                            class="flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap transition-all duration-300"
                            :class="{
                                'invisible scale-95 opacity-0':
                                    showArticleTitle &&
                                    scrollDirection === 'down',
                            }"
                        >
                            <NuxtLink
                                v-for="item in visibleLinks"
                                :key="item.route"
                                :to="item.route"
                                class="nav-link-block px-3 py-2"
                                :class="[
                                    isMenuItemActive(item)
                                        ? 'active-link'
                                        : 'text-on-background/75',
                                ]"
                            >
                                <span class="relative z-10 flex items-center">
                                    <component
                                        :is="item.icon"
                                        v-if="item.icon"
                                        class="mr-1.5 h-4 w-4"
                                    />
                                    {{ $t(item.label) }}
                                </span>
                            </NuxtLink>

                            <div
                                v-if="overflowLinks.length"
                                class="relative group"
                                @mouseenter="moreOpen = true"
                                @mouseleave="moreOpen = false"
                            >
                                <button
                                    type="button"
                                    class="nav-link-block px-3 py-2"
                                    :class="[
                                        moreOpen
                                            ? 'active-link'
                                            : 'text-on-background/75',
                                    ]"
                                    :aria-expanded="moreOpen"
                                    aria-label="更多菜单"
                                    @click="moreOpen = !moreOpen"
                                >
                                    <span
                                        class="relative z-10 flex items-center"
                                    >
                                        <EllipsisHorizontalIcon
                                            class="mr-1.5 h-4 w-4"
                                        />
                                        {{ $t("common.actions.more") }}
                                    </span>
                                </button>

                                <div
                                    v-show="moreOpen"
                                    class="absolute top-full left-1/2 z-30 w-52 -translate-x-1/2 pt-2"
                                >
                                    <div
                                        class="flex flex-col gap-1 rounded-2xl border border-primary/10 bg-surface p-2 backdrop-blur-xl"
                                    >
                                        <NuxtLink
                                            v-for="item in overflowLinks"
                                            :key="`more-${item.route}`"
                                            :to="item.route"
                                            class="flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200"
                                            :class="[
                                                isMenuItemActive(item)
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-on-background hover:bg-primary/5',
                                            ]"
                                            @click="moreOpen = false"
                                        >
                                            <component
                                                :is="item.icon"
                                                v-if="item.icon"
                                                class="mr-2 h-4 w-4"
                                            />
                                            {{ $t(item.label) }}
                                        </NuxtLink>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            v-if="navTitleBox.title"
                            class="pointer-events-none absolute inset-0 flex flex-col items-start justify-center px-4 text-left transition-all duration-300"
                            :class="{
                                'invisible translate-y-1 opacity-0':
                                    !showArticleTitle ||
                                    scrollDirection === 'up',
                            }"
                        >
                            <div
                                class="w-full truncate text-sm font-semibold text-on-background md:text-base"
                            >
                                {{ navTitleBox.title }}
                            </div>
                            <div
                                v-if="navTitleBox.subtitle"
                                class="w-full truncate text-xs text-on-background/60"
                            >
                                {{ navTitleBox.subtitle }}
                            </div>
                        </div>
                    </div>

                    <div
                        class="ml-2 flex min-w-0 shrink-0 items-center gap-1 sm:gap-2"
                    >
                        <AnzuThemeToggle />

                        <AnzuLocaleSelect class="shrink-0" />

                        <button
                            v-if="!isWideLayout"
                            type="button"
                            class="action-icon-button"
                            :aria-expanded="isMobileMenuOpen"
                            aria-label="打开菜单"
                            @click.stop="isMobileMenuOpen = !isMobileMenuOpen"
                        >
                            <Bars3Icon
                                v-if="!isMobileMenuOpen"
                                class="h-5 w-5"
                            />
                            <XMarkIcon v-else class="h-5 w-5" />
                        </button>
                    </div>
                </nav>

                <transition
                    enter-active-class="transition duration-200 ease-out"
                    enter-from-class="scale-95 opacity-0"
                    enter-to-class="scale-100 opacity-100"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="scale-100 opacity-100"
                    leave-to-class="scale-95 opacity-0"
                >
                    <div
                        v-show="!isWideLayout && isMobileMenuOpen"
                        class="border-t border-primary/10 px-3 pb-3 pt-1 md:hidden"
                    >
                        <nav class="flex flex-col gap-1.5 py-2">
                            <NuxtLink
                                v-for="item in menu"
                                :key="`mobile-${item.route}`"
                                :to="item.route"
                                class="mobile-nav-link"
                                :class="[
                                    isMenuItemActive(item)
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-on-background hover:bg-primary/5',
                                ]"
                                @click="isMobileMenuOpen = false"
                            >
                                <component
                                    :is="item.icon"
                                    v-if="item.icon"
                                    class="mr-3 h-5 w-5"
                                />
                                {{ $t(item.label) }}
                            </NuxtLink>
                        </nav>
                    </div>
                </transition>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import type { CSSProperties } from "vue";
import { useRoute } from "vue-router";
import {
    Bars3Icon,
    EllipsisHorizontalIcon,
    XMarkIcon,
} from "@heroicons/vue/24/outline";
import AnzuLocaleSelect from "~/components/AnzuLocaleSelect.vue";
import AnzuThemeToggle from "~/components/AnzuThemeToggle.vue";
import { menu, type MenuItem } from "~/data/menu";
import { useClickAway } from "~/composables/useClickAway";
import { useNavTitle } from "~/composables/useNavTitle";

const route = useRoute();
const { navTitleBox, reset: resetNavTitle } = useNavTitle();

const headerRef = ref<HTMLElement | null>(null);
const centerColRef = ref<HTMLElement | null>(null);
const measureRowRef = ref<HTMLElement | null>(null);
const moreMeasureRef = ref<HTMLElement | null>(null);
const measureItemRefs = ref<Array<HTMLElement | null>>([]);
const isMobileMenuOpen = ref(false);
const isWideLayout = ref(false);
const moreOpen = ref(false);
const opacity = ref(0);
const lastScrollY = ref(0);
const scrollDirection = ref<"up" | "down">("up");
const showArticleTitle = ref(false);

const visibleCount = ref(menu.length);
const visibleLinks = computed(() => menu.slice(0, visibleCount.value));
const overflowLinks = computed(() => menu.slice(visibleCount.value));

const easeOutCubic = (value: number): number => 1 - Math.pow(1 - value, 3);

const updateLayoutMode = (): void => {
    if (!import.meta.client) return;

    isWideLayout.value =
        window.innerWidth >= 768 ||
        window.matchMedia("(orientation: landscape)").matches;

    if (isWideLayout.value) {
        isMobileMenuOpen.value = false;
    } else {
        moreOpen.value = false;
    }

    scheduleRecompute();
};

const isMenuItemActive = (item: MenuItem): boolean => {
    if (item.route === "/") return route.path === "/";
    if (item.route === "/archive") {
        return route.path === "/archive" || route.path.startsWith("/archives/");
    }
    return route.path === item.route || route.path.startsWith(`${item.route}/`);
};

const headerStyles = computed((): CSSProperties => {
    const bgEffect =
        isMobileMenuOpen.value || moreOpen.value || opacity.value > 0.08;
    const alphaValue =
        isMobileMenuOpen.value || moreOpen.value
            ? 0.95
            : Math.min(0.82, 0.56 + opacity.value * 0.22);

    return {
        backgroundColor: bgEffect
            ? `color-mix(in srgb, var(--surface) ${Math.round(alphaValue * 100)}%, transparent)`
            : "transparent",
        backdropFilter: bgEffect ? "blur(12px)" : "none",
        WebkitBackdropFilter: bgEffect ? "blur(12px)" : "none",
    };
});

const handleScroll = (): void => {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    scrollDirection.value = scrollPosition > lastScrollY.value ? "down" : "up";
    lastScrollY.value = scrollPosition;
    opacity.value = easeOutCubic(Math.min(scrollPosition / 120, 1));
    showArticleTitle.value =
        navTitleBox.value.showOnScroll && scrollPosition > 120;
};

useClickAway(
    headerRef,
    () => {
        isMobileMenuOpen.value = false;
        moreOpen.value = false;
    },
    {
        enabled: () => isMobileMenuOpen.value || moreOpen.value,
    },
);

const setMeasureItemRef = (el: HTMLElement | null, index: number): void => {
    measureItemRefs.value[index] = el;
};

let ro: ResizeObserver | null = null;
const scheduleRecompute = (): void => {
    if (!import.meta.client) return;
    window.requestAnimationFrame(recomputeOverflow);
};

const recomputeOverflow = async (): Promise<void> => {
    await nextTick();

    const center = centerColRef.value;
    const row = measureRowRef.value;
    if (!center || !row) return;

    const availableWidth = center.clientWidth;
    if (!availableWidth) return;

    const itemEls = measureItemRefs.value.filter(Boolean) as HTMLElement[];
    if (!itemEls.length) return;

    const styles = window.getComputedStyle(row);
    const gap = parseFloat(styles.columnGap || styles.gap || "8") || 8;
    const widths = itemEls.map((el) => el.getBoundingClientRect().width);
    const moreWidth = moreMeasureRef.value?.getBoundingClientRect().width ?? 0;

    const totalWidth = (count: number): number => {
        if (count <= 0) return 0;
        return (
            widths.slice(0, count).reduce((total, width) => total + width, 0) +
            gap * (count - 1)
        );
    };

    let count = itemEls.length;
    while (count > 0 && totalWidth(count) > availableWidth) {
        count--;
    }

    if (count === itemEls.length) {
        visibleCount.value = itemEls.length;
        moreOpen.value = false;
        return;
    }

    const reservedWidth = moreWidth + gap;
    const limit = Math.max(0, availableWidth - reservedWidth);
    count = itemEls.length;
    while (count > 0 && totalWidth(count) > limit) {
        count--;
    }

    visibleCount.value = Math.max(0, count);
};

onMounted(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", scheduleRecompute);
    window.addEventListener("resize", updateLayoutMode);

    if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(scheduleRecompute);
        if (centerColRef.value) ro.observe(centerColRef.value);
    }

    updateLayoutMode();
    handleScroll();
    scheduleRecompute();
});

onUnmounted(() => {
    window.removeEventListener("scroll", handleScroll);
    window.removeEventListener("resize", scheduleRecompute);
    window.removeEventListener("resize", updateLayoutMode);
    ro?.disconnect();
});

watch(
    () => route.path,
    () => {
        isMobileMenuOpen.value = false;
        moreOpen.value = false;
        showArticleTitle.value = false;
        resetNavTitle();
        scheduleRecompute();
        handleScroll();
    },
);
</script>

<style scoped>
@reference "tailwindcss";

.nav-link-block {
    @apply relative flex min-w-0 items-center overflow-hidden rounded-xl px-3 py-2 text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-out;
    @apply before:absolute before:inset-0 before:z-0 before:scale-[0.8] before:rounded-xl before:opacity-0 before:transition-all before:duration-300 before:ease-out;
    @apply before:origin-center;
    @apply hover:before:scale-100 hover:before:opacity-100;
    @apply before:bg-(--primary)/10;
    @apply hover:text-(--primary);
}

.nav-link-block--brand {
    @apply rounded-2xl;
}

.active-link {
    @apply bg-(--primary)/10 text-(--primary);
}

.nav-link-block > span {
    position: relative;
    z-index: 10;
}

.action-icon-button {
    @apply flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-(--on-background) opacity-70 transition-colors duration-200;
    @apply hover:bg-(--primary)/5 hover:text-(--primary) hover:opacity-100;
}

.mobile-nav-link {
    @apply flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200;
}

.group:hover .absolute.top-full {
    pointer-events: auto;
}

.group:hover::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100%;
    height: 10px;
    background: transparent;
    z-index: 40;
}
</style>
