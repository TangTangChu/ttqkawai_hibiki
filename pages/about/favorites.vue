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
                        v-if="activeTab === 'fav_char'"
                        class="flex flex-col items-center"
                    >
                        <div class="w-full flex justify-center mb-6 min-h-16">
                            <AnzuSpinner
                                v-if="isCharListLoading"
                                class="w-5 h-5 text-primary my-auto"
                            />
                            <AnzuSelector
                                v-else-if="charListCache.length > 0"
                                variant="text"
                                :model-value="tabPages[activeTab] || 1"
                                :options="charListCache"
                                @update:model-value="
                                    onPageChange(Number($event))
                                "
                            />
                        </div>
                        <AnzuCharCard
                            v-for="item in currentData"
                            :key="item.id"
                            :char="item as FavCharItem"
                        />
                    </div>
                    <div
                        v-else
                        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                    >
                        <AnzuTooltip
                            v-for="item in currentData"
                            :key="item.id"
                            :content="(item as FavItem).record.desc"
                            class="w-full h-full"
                        >
                            <a
                                :href="(item as FavItem).record.link"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="relative flex flex-col h-full gap-2 cursor-pointer rounded-xl p-3 transition-colors duration-200 ease-out hover:bg-on-background/5 group"
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
                        </AnzuTooltip>
                    </div>

                    <div class="mt-8">
                        <AnzuPagination
                            v-if="currentMeta && currentMeta.total_pages > 1"
                            :current-page="tabPages[activeTab] || 1"
                            :total-pages="currentMeta.total_pages"
                            :loading="loading"
                            :layout="
                                activeTab === 'fav_char' ? 'compact' : 'default'
                            "
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
import AnzuTooltip from "~/components/AnzuTooltip.vue";
import AnzuCharCard from "~/components/AnzuCharCard.vue";
import type { FavItem, FavCharItem } from "~/types/record";
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
    { value: "fav_char", label: t("pages.about.tabs.character") },
]);

const route = useRoute();
const router = useRouter();

const parseHashToTab = (hash: string) => {
    if (!hash) return "fav_music";
    const h = hash.replace("#", "");
    const valid = ["music", "anime", "galgame", "novel", "comic", "char"];
    return valid.includes(h) ? `fav_${h}` : "fav_music";
};

const activeTab = ref("fav_music");

const { data, loading, error, meta, get } = useApi<any>();

const tabPages = ref<Record<string, number>>({
    fav_char: 1,
    fav_music: 1,
    fav_anime: 1,
    fav_galgame: 1,
    fav_novel: 1,
    fav_comic: 1,
});

const currentData = ref<(FavItem | FavCharItem)[]>([]);
const currentMeta = ref<any>(undefined);
const tabDataCache = ref<
    Record<string, Record<number, (FavItem | FavCharItem)[]>>
>({});
const tabMetaCache = ref<Record<string, Record<number, any>>>({});

const charListCache = ref<{ label: string; value: number }[]>([]);
const isCharListLoading = ref(false);

const fetchCharList = async () => {
    if (charListCache.value.length > 0) return;
    isCharListLoading.value = true;
    try {
        const config = useRuntimeConfig();
        const apiBase =
            config.public.apiBase || "https://cms.tantanchugasuki.cn/nozomi";
        const res = await $fetch<{ data: FavCharItem[] }>(
            `${apiBase}/v1/datasets/fav_char?page=1&page_size=100`,
        );
        if (res && res.data) {
            charListCache.value = res.data.map((item, index) => ({
                label: item.record.title,
                value: index + 1,
            }));
            console.log("Char list fetched:", charListCache.value.length);
        }
    } catch (e) {
        console.error("Failed to fetch full char list", e);
    } finally {
        isCharListLoading.value = false;
    }
};

const fetchData = async (page: number) => {
    tabPages.value[activeTab.value] = page;

    if (activeTab.value === "fav_char") {
        await fetchCharList();
    }

    const cachedData = tabDataCache.value[activeTab.value]?.[page];
    if (cachedData) {
        currentData.value = cachedData;
        const cachedMeta = tabMetaCache.value[activeTab.value]?.[page];
        if (cachedMeta) {
            currentMeta.value = cachedMeta;
        }
        return;
    }

    await get(
        `/v1/datasets/${activeTab.value}?page=${page}&page_size=${activeTab.value === "fav_char" ? 1 : 20}`,
    );
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
    const hash = `#${newTab.replace("fav_", "")}`;
    if (route.hash !== hash) {
        router.replace({ hash });
    }

    if (newTab === "fav_char") {
        fetchCharList();
    }

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
    const hashTab = parseHashToTab(route.hash);
    if (hashTab !== "fav_music") {
        activeTab.value = hashTab;
    } else {
        fetchData(1);
    }

    if (activeTab.value === "fav_char") {
        fetchCharList();
    }
});
</script>
