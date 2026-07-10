<template>
    <main
        class="w-full mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 xl:max-w-5xl"
    >
        <header class="text-center mb-12">
            <h1
                class="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl"
            >
                {{ t("menu.archive") }}
            </h1>
        </header>
        <nav class="flex justify-center mb-4">
            <AnriSelector
                v-model="selectedCategory"
                :options="categoryOptions"
            />
        </nav>
        <div class="mb-8 max-w-md mx-auto">
            <AnriInput
                v-model="searchQuery"
                :placeholder="t('pages.archive.searchPlaceholder')"
                search
                allow-clear
                @update:model-value="onSearch"
            />
        </div>
        <div v-if="searchQuery" class="min-h-100">
            <div v-if="searchLoading" class="flex justify-center py-12">
                <AnriSpinner class="w-8 h-8 text-primary" />
            </div>
            <ul v-else-if="searchResults.length > 0" class="space-y-4">
                <ArticleBlock
                    v-for="archive in searchResults"
                    :key="archive.id"
                    :title="archive.title"
                    :linkto="`/archives/${archive.slug}`"
                    :datetime="
                        formatDateTime(archive.data.publish_time, locale)
                    "
                    :rawDate="archive.data.publish_time"
                    :summary="archive.data.summary"
                    :tags="archive.tags?.map((t) => t.name)"
                />
            </ul>
            <div v-else class="text-center py-12 text-on-background/50">
                {{ t("common.label.empty") }}
            </div>
        </div>
        <template v-else>
            <div v-if="initialLoading" class="flex items-center justify-center">
                <AnriSpinner size="xl" />
            </div>
            <div v-else-if="initialError" class="py-8">
                <ErrorDisplay :errorData="errorList || errorTop" />
            </div>
            <div v-else class="space-y-6">
                <ul
                    v-if="topArchives && topArchives.length > 0"
                    class="space-y-4"
                >
                    <ArticleBlock
                        v-for="archive in topArchives"
                        :key="archive.id"
                        :title="archive.title"
                        :linkto="`/archives/${archive.slug}`"
                        :datetime="
                            formatDateTime(archive.data.publish_time, locale)
                        "
                        :rawDate="archive.data.publish_time"
                        :summary="archive.data.summary"
                        :tags="archive.tags?.map((t) => t.name)"
                        :istop="true"
                    />
                </ul>
                <hr
                    v-if="
                        topArchives &&
                        topArchives.length > 0 &&
                        archives &&
                        archives.length > 0
                    "
                    class="mx-auto my-8 w-2/3 border-t-2 border-primary/10 transition-colors duration-300 hover:border-primary/30"
                />
                <ul v-if="archives && archives.length > 0" class="space-y-4">
                    <ArticleBlock
                        v-for="archive in archives"
                        :key="archive.id"
                        :title="archive.title"
                        :linkto="`/archives/${archive.slug}`"
                        :datetime="
                            formatDateTime(archive.data.publish_time, locale)
                        "
                        :rawDate="archive.data.publish_time"
                        :summary="archive.data.summary"
                        :tags="archive.tags?.map((t) => t.name)"
                    />
                </ul>

                <div
                    v-if="archives && archives.length === 0"
                    class="py-12 text-center"
                >
                    <p class="text-on-background/60">
                        {{ t("common.label.empty") }}
                    </p>
                </div>
            </div>

            <AnriPagination
                v-if="totalPages > 1"
                :currentPage="currentPage"
                :totalPages="totalPages"
                :loading="loadingList"
                @page-change="handlePageChange"
            />
        </template>
    </main>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ArticleBlock from "~/components/ArticleBlock.vue";
import AnriPagination from "~/components/AnriPagination.vue";
import AnriSpinner from "~/components/AnriSpinner.vue";
import AnriSelector from "~/components/AnriSelector.vue";
import AnriInput from "~/components/AnriInput.vue";
import ErrorDisplay from "~/components/ErrorDisplay.vue";
import { useApi } from "~/composables/useApi";
import { useNavTitle } from "~/composables/useNavTitle";
import type { Archive } from "~/types/archive";
import { resolveCmsLocale } from "~/utils/formatDate";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const { reset: resetNavTitle } = useNavTitle();

resetNavTitle();

usePageSeo({
    title: () => t("menu.archive"),
    description: () => t("pages.meta.archive"),
});

interface Taxonomy {
    id: string;
    name: string;
    slug: string;
}

const { data: taxonomies, get: getTaxonomies } = useApi<Taxonomy[]>();

const selectedCategory = ref(route.query.category?.toString() || "");
const searchQuery = ref("");
const searchResults = ref<Archive[]>([]);
const searchLoading = ref(false);

let searchTimer: ReturnType<typeof setTimeout> | null = null;
const onSearch = (val: string) => {
    if (searchTimer) clearTimeout(searchTimer);

    if (!val) {
        searchResults.value = [];
        return;
    }

    searchTimer = setTimeout(async () => {
        searchLoading.value = true;
        try {
            const config = useRuntimeConfig();
            const apiBase =
                config.public.apiBase ||
                "https://cms.tantanchugasuki.cn/nozomi";
            let url = `${apiBase}/v1/contents?type_slug=archive&fields=publish_time,summary&filter[title][contains]=${encodeURIComponent(val)}&page=1&page_size=40&sort_order=desc&i18n=${cmsLocale.value}`;
            if (selectedCategory.value) {
                url += `&taxonomy_slug=${selectedCategory.value}`;
            }
            const res = await $fetch<{ data: Archive[] }>(url);
            if (res && res.data) {
                searchResults.value = res.data;
            }
        } catch (e) {
            console.error("Search failed:", e);
        } finally {
            searchLoading.value = false;
        }
    }, 300);
};

const categoryOptions = computed(() => {
    const opts = [{ label: t("common.label.all"), value: "" }];
    if (taxonomies.value) {
        taxonomies.value.forEach((tax) => {
            opts.push({ label: tax.name, value: tax.slug });
        });
    }
    return opts;
});

const {
    data: topArchives,
    loading: loadingTop,
    error: errorTop,
    get: getTopArchives,
} = useApi<Archive[]>();

const {
    data: archives,
    meta,
    loading: loadingList,
    error: errorList,
    get: getArchives,
} = useApi<Archive[]>();

const currentPage = ref(Number(route.query.page) || 1);
const totalPages = ref(1);

const cmsLocale = computed(() => resolveCmsLocale(locale.value));

const hasAnyData = computed(
    () => Boolean(topArchives.value) || Boolean(archives.value),
);
const initialLoading = computed(
    () => (loadingTop.value || loadingList.value) && !hasAnyData.value,
);
const initialError = computed(
    () => Boolean(errorList.value || errorTop.value) && !hasAnyData.value,
);

const loadTopArchives = async () => {
    let url = `/v1/contents?type_slug=archive&fields=publish_time,summary&filter[isTop][eq]=true&sort_order=desc&i18n=${cmsLocale.value}`;
    if (selectedCategory.value) {
        url += `&taxonomy_slug=${selectedCategory.value}`;
    }
    await getTopArchives(url);
};

const loadArchives = async (page: number) => {
    let url = `/v1/contents?type_slug=archive&fields=publish_time,summary&page=${page}&sort_order=desc&i18n=${cmsLocale.value}`;
    if (selectedCategory.value) {
        url += `&taxonomy_slug=${selectedCategory.value}`;
    }
    await getArchives(url);
    if (meta.value) {
        totalPages.value = meta.value.total_pages;
        currentPage.value = meta.value.current_page;
    }
};

watch(
    () => route.query.page,
    async (newPage) => {
        const pageNum = Number(newPage) || 1;
        currentPage.value = pageNum;
        await loadArchives(pageNum);
        await nextTick();
        requestAnimationFrame(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    },
);

watch(
    () => route.query.category,
    (newCat) => {
        selectedCategory.value = newCat?.toString() || "";
    },
);

watch(selectedCategory, async (newVal) => {
    // Only push if different from current query to avoid loops
    if (newVal !== (route.query.category || "")) {
        router.push({
            query: {
                ...route.query,
                category: newVal || undefined,
                page: undefined,
            },
        });
    }
    // Clear search state when category changes
    searchQuery.value = "";
    searchResults.value = [];
    // Reload data when category changes
    currentPage.value = 1;
    await Promise.all([loadTopArchives(), loadArchives(1)]);
    await nextTick();
    requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});

watch(
    cmsLocale,
    () => {
        getTaxonomies("/v1/taxonomies");
        loadTopArchives();
        loadArchives(currentPage.value);
    },
    { immediate: true },
);

const handlePageChange = (page: number) => {
    router.push({
        query: {
            ...route.query,
            page: page > 1 ? page : undefined,
        },
    });
};
</script>
