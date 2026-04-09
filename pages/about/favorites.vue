<template>
    <main
        class="w-full mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 xl:max-w-5xl"
    >
        <header class="text-center mb-12">
            <h1
                class="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl"
            >
                {{ t("menu.favorites") }}
            </h1>
        </header>

        <section>
            <div class="mb-8">
                <AnzuSelector v-model="activeTab" :options="tabs" />
            </div>
            <div class="min-h-100">
                <div
                    v-if="loading && currentData.length === 0"
                    class="flex justify-center py-12"
                >
                    <AnzuSpinner class="w-8 h-8 text-primary" />
                </div>

                <ErrorDisplay v-else-if="error" :error="error" />

                <div v-else-if="currentData.length > 0">
                    <div
                        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                    >
                        <a
                            v-for="item in currentData"
                            :key="item.id"
                            :href="item.record.link"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="relative flex flex-col gap-2 cursor-pointer rounded-xl p-3 transition-colors duration-200 ease-out hover:bg-on-background/5 group"
                        >
                            <div
                                class="w-full shrink-0 rounded-xl overflow-hidden bg-surface-variant/50"
                                :class="
                                    activeTab === 'fav_music'
                                        ? 'aspect-square'
                                        : 'aspect-105/148'
                                "
                            >
                                <img
                                    :src="item.record.cover"
                                    :alt="item.record.title"
                                    class="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                            <div class="flex-1 min-w-0 text-center mt-2">
                                <h3
                                    class="text-sm font-bold text-on-background line-clamp-2 transition-colors duration-200 group-hover:text-primary"
                                >
                                    {{ item.record.title }}
                                </h3>
                                <p
                                    v-if="item.record.raw_name"
                                    class="text-xs text-on-background/60 line-clamp-1 mt-1"
                                >
                                    {{ item.record.raw_name }}
                                </p>
                            </div>
                        </a>
                    </div>

                    <div class="mt-8">
                        <AnzuPagination
                            v-if="currentMeta && currentMeta.total_pages > 1"
                            :current-page="tabPages[activeTab] || 1"
                            :total-pages="currentMeta.total_pages"
                            :loading="loading"
                            @page-change="onPageChange"
                        />
                    </div>
                </div>

                <div v-else class="text-center py-12 text-on-background/50">
                    {{ t("common.label.empty") }}
                </div>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useNavTitle } from "~/composables/useNavTitle";
import { useApi } from "~/composables/useApi";
import AnzuSelector from "~/components/AnzuSelector.vue";
import AnzuPagination from "~/components/AnzuPagination.vue";
import AnzuSpinner from "~/components/AnzuSpinner.vue";
import type { FavItem } from "~/types/record";
const { t } = useI18n();
const { reset: resetNavTitle } = useNavTitle();

resetNavTitle();

useHead(() => ({
    title: t("menu.favorites"),
}));

const tabs = computed(() => [
    { value: "fav_music", label: t("pages.about.tabs.music") },
    { value: "fav_anime", label: t("pages.about.tabs.anime") },
    { value: "fav_galgame", label: t("pages.about.tabs.galgame") },
    { value: "fav_novel", label: t("pages.about.tabs.novel") },
    { value: "fav_comic", label: t("pages.about.tabs.comic") },
]);

const activeTab = ref("fav_music");

const { data, loading, error, meta, get } = useApi<FavItem[]>();

const tabPages = ref<Record<string, number>>({
    fav_music: 1,
    fav_anime: 1,
    fav_galgame: 1,
    fav_novel: 1,
    fav_comic: 1,
});

const currentData = ref<FavItem[]>([]);
const currentMeta = ref<any>(undefined);
const tabDataCache = ref<Record<string, Record<number, FavItem[]>>>({});
const tabMetaCache = ref<Record<string, Record<number, any>>>({});

const fetchData = async (page: number) => {
    tabPages.value[activeTab.value] = page;
    const cachedData = tabDataCache.value[activeTab.value]?.[page];
    if (cachedData) {
        currentData.value = cachedData;
        const cachedMeta = tabMetaCache.value[activeTab.value]?.[page];
        if (cachedMeta) {
            currentMeta.value = cachedMeta;
        }
        return;
    }

    await get(`/v1/datasets/${activeTab.value}?page=${page}&page_size=20`);
};

const onPageChange = async (page: number) => {
    await fetchData(page);
    await nextTick();
    requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
};

watch(data, (newData) => {
    if (newData) {
        currentData.value = [...newData];
        currentMeta.value = meta.value;
        const tab = activeTab.value;
        const page = tabPages.value[tab];

        if (!tabDataCache.value[tab]) tabDataCache.value[tab] = {};
        if (!tabMetaCache.value[tab]) tabMetaCache.value[tab] = {};

        const tabData = tabDataCache.value[tab];
        const tabMeta = tabMetaCache.value[tab];

        if (tabData && tabMeta && page !== undefined) {
            tabData[page] = currentData.value;
            if (currentMeta.value) {
                tabMeta[page] = currentMeta.value;
            }
        }
    }
});

watch(activeTab, (newTab) => {
    const savedPage = tabPages.value[newTab] || 1;
    const cachedData = tabDataCache.value[newTab]?.[savedPage];
    if (cachedData) {
        currentData.value = cachedData;
        const cachedMeta = tabMetaCache.value[newTab]?.[savedPage];
        if (cachedMeta) {
            currentMeta.value = cachedMeta;
        }
    } else {
        currentData.value = [];
        currentMeta.value = undefined;
    }

    fetchData(savedPage);
});

onMounted(() => {
    fetchData(1);
});
</script>
