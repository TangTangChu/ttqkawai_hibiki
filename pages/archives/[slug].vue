<template>
    <main class="mx-auto w-full max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
        <div v-if="loading" class="flex items-center justify-center py-20">
            <AnzuSpinner size="xl" />
        </div>
        <div v-else-if="error" class="py-12">
            <ErrorDisplay :errorData="error" />
        </div>
        <div v-else-if="archive" class="flex flex-col lg:flex-row">
            <article class="min-w-0 flex-1">
                <header class="my-2 text-left">
                    <h1
                        class="mb-2 text-3xl font-extrabold leading-tight text-on-background sm:text-4xl md:text-5xl lg:text-6xl"
                    >
                        {{ archive.data?.title || archive.title }}
                    </h1>

                    <div
                        class="flex flex-wrap items-center justify-start gap-x-6 gap-y-3 text-sm font-medium text-on-background/60"
                    >
                        <div v-if="publisherText" class="flex items-center">
                            <UserIcon class="mr-2 h-4 w-4" aria-hidden="true" />
                            {{ publisherText }}
                        </div>

                        <div class="flex items-center">
                            <CalendarIcon
                                class="mr-2 h-4 w-4"
                                aria-hidden="true"
                            />
                            <time :datetime="archive.data?.publish_time">
                                {{
                                    formatDateTime(
                                        archive.data?.publish_time || "",
                                        locale,
                                    )
                                }}
                            </time>
                        </div>
                    </div>

                    <div
                        v-if="archive.tags && archive.tags.length > 0"
                        class="mt-8 flex justify-start"
                    >
                        <TagList :tags="archive.tags.map((t) => t.name)" />
                    </div>

                    <div
                        v-if="i18nFallback?.fallback"
                        class="mt-6 flex items-center rounded-xl bg-orange-500/10 px-4 py-3 text-sm text-orange-600 dark:text-orange-400"
                    >
                        <LanguageIcon class="mr-2 h-5 w-5" aria-hidden="true" />
                        {{
                            t("pages.archive.fallback", {
                                lang: getLangName(i18nFallback.fallback_to),
                            })
                        }}
                    </div>
                </header>

                <div class="prose-container relative w-full max-w-none">
                    <MarkdownRender
                        ref="markdownRenderRef"
                        :content="archive.data?.body ?? ''"
                        class="w-full"
                        @toc-updated="handleTocUpdate"
                    />
                </div>
                <AnzuPrevNextNav
                    v-if="prevNav || nextNav"
                    :prev="prevNav"
                    :next="nextNav"
                />
            </article>
            <aside
                v-if="tocItems.length > 0"
                class="hidden w-64 shrink-0 lg:block"
            >
                <div class="sticky top-24 p-6">
                    <MarkdownTOC
                        :items="tocItems"
                        :markdownRenderRef="markdownRenderRef"
                    />
                </div>
            </aside>
            <Teleport to="body">
                <button
                    v-if="tocItems.length > 0 && !isMobileTocOpen"
                    type="button"
                    class="fixed right-4 bottom-6 z-70 inline-flex items-center gap-2 rounded-xl border border-on-surface/10 bg-background px-4 py-2 text-sm font-semibold text-on-surface/80 transition-colors duration-200 hover:border-primary/30 hover:text-primary lg:hidden"
                    :aria-label="t('common.label.toc')"
                    @click="openMobileToc"
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
                        v-if="isMobileTocOpen"
                        class="fixed inset-0 z-80 lg:hidden"
                    >
                        <button
                            type="button"
                            class="absolute inset-0 bg-black/30"
                            :aria-label="t('common.label.toc')"
                            @click="closeMobileToc"
                        />

                        <div
                            class="absolute right-0 bottom-0 left-0 flex max-h-[78vh] flex-col rounded-t-2xl border-t border-on-surface/10 bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
                            @click="handleMobileDrawerClick"
                        >
                            <div class="mb-2 flex justify-end">
                                <button
                                    type="button"
                                    class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-on-surface/10 text-on-surface/70 transition-colors hover:border-primary/30 hover:text-primary"
                                    :aria-label="t('common.label.toc')"
                                    @click="closeMobileToc"
                                >
                                    <XMarkIcon
                                        class="h-5 w-5"
                                        aria-hidden="true"
                                    />
                                </button>
                            </div>
                            <div
                                class="min-h-0 flex-1 overflow-y-auto px-1 pb-1"
                            >
                                <MarkdownTOC
                                    :items="tocItems"
                                    :markdownRenderRef="markdownRenderRef"
                                />
                            </div>
                        </div>
                    </div>
                </Transition>
            </Teleport>
        </div>
    </main>
</template>

<script setup lang="ts">
import { CalendarIcon, UserIcon } from "@heroicons/vue/20/solid";
import { LanguageIcon } from "@heroicons/vue/20/solid";
import { Bars3BottomLeftIcon, XMarkIcon } from "@heroicons/vue/24/outline";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AnzuPrevNextNav from "~/components/AnzuPrevNextNav.vue";
import AnzuSpinner from "~/components/AnzuSpinner.vue";
import ErrorDisplay from "~/components/ErrorDisplay.vue";
import MarkdownRender from "~/components/MarkdownRender.vue";
import MarkdownTOC from "~/components/MarkdownTOC.vue";
import TagList from "~/components/TagList.vue";
import { useApi } from "~/composables/useApi";
import { useArchivePrevNext } from "~/composables/useArchivePrevNext";
import { useNavTitle } from "~/composables/useNavTitle";
import type { ArchiveData } from "~/types/archive";
import type { ExtendedApiMeta } from "~/types/api";
import type { TocItem } from "~/types/tocItems";
import { formatDate, resolveCmsLocale } from "~/utils/formatDate";

const { t, locale, locales } = useI18n();
const route = useRoute();

const markdownRenderRef = ref();
const tocItems = ref<TocItem[]>([]);
const isMobileTocOpen = ref(false);

const { setTitle, setScrollReveal, reset: resetNavTitle } = useNavTitle();

const slug = computed(() => String(route.params.slug || ""));
const cmsLocale = computed(() => resolveCmsLocale(locale.value));

const { data: archive, loading, error, get, meta } = useApi<ArchiveData>();
const { prev: prevNav, next: nextNav } = useArchivePrevNext(slug);

const i18nFallback = computed(() => {
    const m = meta.value as unknown as ExtendedApiMeta | undefined;
    return m?.i18n;
});

const getLangName = (code?: string): string => {
    if (!code) return "";
    const localeObj = locales.value.find(
        (l) => l.code === code || l.iso === code,
    );
    return localeObj ? localeObj.name || code : code;
};

const publisherText = computed(() => {
    const archiveValue = archive.value;
    if (!archiveValue || !archiveValue.data) return "";

    const value = archiveValue.data["publisher"];
    if (typeof value !== "string") return "";
    return value.trim();
});

const pageTitle = computed(() => {
    const archiveValue = archive.value;
    const title =
        archiveValue && archiveValue.data
            ? archiveValue.data.title || archiveValue.title
            : "";

    if (!title) return t("common.label.loading");
    return title;
});

useHead(() => ({
    title: pageTitle.value,
}));

const handleTocUpdate = (items: TocItem[]): void => {
    tocItems.value = items;
    if (!items.length) {
        isMobileTocOpen.value = false;
    }
};

const openMobileToc = (): void => {
    if (!tocItems.value.length) return;
    isMobileTocOpen.value = true;
};

const closeMobileToc = (): void => {
    isMobileTocOpen.value = false;
};

const handleMobileDrawerClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    if (target.closest("a")) {
        closeMobileToc();
    }
};

watch(
    cmsLocale,
    (newLocale) => {
        if (slug.value) {
            get(`/v1/contents/by-path/archive/${slug.value}?i18n=${newLocale}`);
        }
    },
    { immediate: true },
);

watch(archive, (newVal) => {
    if (newVal && newVal.data) {
        const title = newVal.data.title || newVal.title;
        const subtitle = [
            publisherText.value,
            formatDate(newVal.data.publish_time, locale.value),
        ]
            .filter(Boolean)
            .join(" · ");

        setTitle(title, subtitle);
        setScrollReveal(true);
    }
});

onMounted(() => {
    setScrollReveal(true);
});

onUnmounted(() => {
    isMobileTocOpen.value = false;
    resetNavTitle();
});
</script>
