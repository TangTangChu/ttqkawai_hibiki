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
        <div
            v-if="loadingTop || loadingList"
            class="flex items-center justify-center"
        >
            <AnzuSpinner size="xl" />
        </div>
        <div v-else-if="errorList || errorTop" class="py-8">
            <ErrorDisplay :errorData="errorList || errorTop" />
        </div>
        <div v-else class="space-y-6">
            <ul v-if="topArchives && topArchives.length > 0" class="space-y-4">
                <ArticleBlock
                    v-for="archive in topArchives"
                    :key="archive.id"
                    :title="archive.title"
                    :linkto="`/archives/${archive.slug}`"
                    :datetime="formatDateTime(archive.data.publish_time, locale)"
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
                    :datetime="formatDateTime(archive.data.publish_time, locale)"
                    :rawDate="archive.data.publish_time"
                    :summary="archive.data.summary"
                    :tags="archive.tags?.map((t) => t.name)"
                />
            </ul>

            <div
                v-if="!archives || archives.length === 0"
                class="py-12 text-center"
            >
                <p class="text-on-background/60">
                    {{ t("common.label.empty") }}
                </p>
            </div>
        </div>

        <AnzuPagination
            v-if="totalPages > 1"
            :currentPage="currentPage"
            :totalPages="totalPages"
            @page-change="handlePageChange"
        />
    </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ArticleBlock from "~/components/ArticleBlock.vue";
import AnzuPagination from "~/components/AnzuPagination.vue";
import AnzuSpinner from "~/components/AnzuSpinner.vue";
import ErrorDisplay from "~/components/ErrorDisplay.vue";
import { useApi } from "~/composables/useApi";
import { useNavTitle } from "~/composables/useNavTitle";
import type { Archive } from "~/types/archive";
import { formatDate, resolveCmsLocale } from "~/utils/formatDate";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const { reset: resetNavTitle } = useNavTitle();

resetNavTitle();

useHead(() => ({
    title: t("menu.archive"),
}));

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

const currentPage = ref(1);
const totalPages = ref(1);

const cmsLocale = computed(() => resolveCmsLocale(locale.value));

const loadTopArchives = async () => {
    await getTopArchives(
        `/v1/contents?type_slug=archive&fields=publish_time,summary&filter[isTop][eq]=true&sort_order=desc&i18n=${cmsLocale.value}`,
    );
};

const loadArchives = async (page: number) => {
    await getArchives(
        `/v1/contents?type_slug=archive&fields=publish_time,summary&page=${page}&sort_order=desc&i18n=${cmsLocale.value}`,
    );
    if (meta.value) {
        totalPages.value = meta.value.total_pages;
        currentPage.value = meta.value.current_page;
    }
};

watch(
    () => route.query.page,
    (newPage) => {
        const pageNum = Number(newPage) || 1;
        currentPage.value = pageNum;
        loadArchives(pageNum);
    },
);

watch(
    cmsLocale,
    () => {
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
