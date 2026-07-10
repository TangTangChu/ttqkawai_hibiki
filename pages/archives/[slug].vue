<template>
    <main class="mx-auto w-full px-4 py-8 sm:px-6">
        <div v-if="loading" class="flex items-center justify-center py-20">
            <AnriSpinner size="xl" />
        </div>
        <div v-else-if="error" class="py-12">
            <ErrorDisplay :errorData="error" />
        </div>
        <div v-else-if="archive">
            <header class="my-2 text-left">
                <h1
                    class="mb-2 text-2xl font-extrabold leading-tight text-on-background sm:text-3xl lg:text-4xl"
                >
                    {{ archive.data?.title || archive.title }}
                </h1>

                <div
                    class="mt-4 flex flex-wrap items-center justify-start gap-x-6 gap-y-3 text-sm font-medium text-on-background/60"
                >
                    <div v-if="publisherText" class="flex items-center">
                        <UserIcon class="mr-2 h-4 w-4" aria-hidden="true" />
                        {{ publisherText }}
                    </div>

                    <div class="flex items-center">
                        <CalendarIcon class="mr-2 h-4 w-4" aria-hidden="true" />
                        <time :datetime="archive.data?.publish_time">
                            {{
                                formatDateTime(
                                    archive.data?.publish_time || "",
                                    locale,
                                )
                            }}
                        </time>
                    </div>

                    <TagList
                        v-if="archive.tags && archive.tags.length > 0"
                        :tags="archive.tags.map((t) => t.name)"
                    />
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

            <div class="flex flex-col lg:flex-row">
                <article class="min-w-0 flex-1">
                    <div
                        class="prose-container relative mt-10 w-full max-w-none"
                    >
                        <MarkdownRender
                            ref="markdownRenderRef"
                            :content="archive.data?.body ?? ''"
                            class="w-full"
                            @toc-updated="handleTocUpdate"
                        />
                    </div>
                    <AnriPrevNextNav
                        v-if="prevNav || nextNav"
                        :prev="prevNav"
                        :next="nextNav"
                    />
                </article>
                <ArchiveSidebar
                    :items="tocItems"
                    :markdown-render-ref="markdownRenderRef"
                />
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import { CalendarIcon, UserIcon } from "@heroicons/vue/20/solid";
import { LanguageIcon } from "@heroicons/vue/20/solid";
import { computed, ref, watch, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import AnriPrevNextNav from "~/components/AnriPrevNextNav.vue";
import AnriSpinner from "~/components/AnriSpinner.vue";
import ErrorDisplay from "~/components/ErrorDisplay.vue";
import MarkdownRender from "~/components/MarkdownRender.vue";
import ArchiveSidebar from "~/components/ArchiveSidebar.vue";
import TagList from "~/components/TagList.vue";
import { useApi } from "~/composables/useApi";
import { useArchivePrevNext } from "~/composables/useArchivePrevNext";
import { useNavTitle } from "~/composables/useNavTitle";
import type { ArchiveData } from "~/types/archive";
import type { ExtendedApiMeta } from "~/types/api";
import type { TocItem } from "~/types/tocItems";
import { formatDateTime, resolveCmsLocale } from "~/utils/formatDate";

const { t, locale, locales } = useI18n();
const route = useRoute();

const markdownRenderRef = ref();
const tocItems = ref<TocItem[]>([]);

const { setTitle, setScrollReveal, reset: resetNavTitle } = useNavTitle();

const slug = computed(() => String(route.params.slug || ""));
const cmsLocale = computed(() => resolveCmsLocale(locale.value));

await useBotSeo({
    endpoint: `/v1/contents/by-path/archive/${slug.value}?i18n=${cmsLocale.value}`,
    locale: cmsLocale.value,
});

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

onUnmounted(() => {
    resetNavTitle();
});
</script>
