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
            <div class="mb-4">
                <AnriSelector v-model="activeTab" :options="tabs" />
            </div>
            <div class="mb-8 max-w-md mx-auto">
                <AnriInput
                    v-model="searchQuery"
                    :placeholder="t('pages.about.searchPlaceholder')"
                    search
                    allow-clear
                    @update:model-value="onSearch"
                />
            </div>

            <AnriAlert
                v-if="showBangumiNotice"
                type="warn"
                :title="t('pages.about.bangumiNotice.title')"
            >
                {{ t("pages.about.bangumiNotice.content") }}
            </AnriAlert>

            <div class="min-h-100">
                <div
                    v-if="loading && displayData.length === 0"
                    class="flex justify-center py-12"
                >
                    <AnriSpinner class="w-8 h-8 text-primary" />
                </div>

                <ErrorDisplay v-else-if="error" :error="error" />

                <div v-else-if="displayData.length > 0">
                    <div
                        v-if="activeTab === 'fav_char' && !searchQuery"
                        class="flex flex-col items-center"
                    >
                        <div class="w-full flex justify-center mb-6 min-h-16">
                            <AnriSpinner
                                v-if="isCharListLoading"
                                class="w-5 h-5 text-primary my-auto"
                            />
                            <AnriSelector
                                v-else-if="charListCache.length > 0"
                                variant="text"
                                :model-value="tabPages[activeTab] || 1"
                                :options="charListCache"
                                @update:model-value="
                                    onPageChange(Number($event))
                                "
                            />
                        </div>
                        <AnriCharCard
                            v-for="item in displayData"
                            :key="item.id"
                            :char="item as FavCharItem"
                        />
                    </div>
                    <div
                        v-else
                        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                    >
                        <AnriTooltip
                            v-for="item in displayData"
                            :key="item.id"
                            :content="(item as FavItem).record.desc"
                            class="w-full h-full"
                        >
                            <div
                                class="relative flex flex-col h-full gap-2 cursor-pointer rounded-xl p-3 transition-colors duration-200 ease-out hover:bg-on-background/5 group"
                                @click="openDialog(item as FavItem)"
                            >
                                <div
                                    class="w-full shrink-0 rounded-xl overflow-hidden bg-surface-variant/50"
                                    :class="
                                        activeTab === 'fav_music'
                                            ? 'aspect-square'
                                            : 'aspect-105/148'
                                    "
                                >
                                    <AnriImage
                                        :src="item.record.cover"
                                        :alt="item.record.title"
                                        :w-full="true"
                                        :h-full="true"
                                        class="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                    <div
                                        v-if="activeTab === 'fav_music'"
                                        class="absolute top-2 right-2 w-7 h-7 opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 cursor-pointer text-white drop-shadow-md hover:text-primary"
                                        @click.stop="playMusic(item as FavItem)"
                                    >
                                        <PlayCircleIcon class="w-full h-full" />
                                    </div>
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
                            </div>
                        </AnriTooltip>
                    </div>

                    <div v-if="!searchQuery" class="mt-8">
                        <AnriPagination
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

        <AnriDialog v-model="isDialogOpen" max-width="3xl">
            <div
                v-if="selectedItem"
                class="flex flex-col md:flex-row overflow-y-auto md:overflow-hidden max-h-[85vh] md:max-h-150"
            >
                <div
                    class="w-full md:w-1/2 shrink-0 bg-surface-variant/50 relative"
                    :class="
                        activeTab === 'fav_music'
                            ? 'aspect-square'
                            : 'aspect-105/148'
                    "
                >
                    <AnriImage
                        :src="selectedItem.record.cover"
                        :alt="selectedItem.record.title"
                        :w-full="true"
                        :h-full="true"
                        class="w-full h-full object-cover"
                    />
                </div>
                <div
                    class="px-6 py-8 md:p-8 flex flex-col flex-1 shrink-0 md:shrink md:overflow-y-auto"
                >
                    <h2
                        class="text-2xl font-bold text-on-background mb-2 pr-10"
                    >
                        {{ selectedItem.record.title }}
                    </h2>
                    <p
                        v-if="selectedItem.record.raw_name"
                        class="text-sm text-on-background/60 mb-6"
                    >
                        {{ selectedItem.record.raw_name }}
                    </p>

                    <div
                        v-if="selectedItem.record.desc"
                        class="mb-8 prose prose-sm prose-p:text-on-background/80 max-w-none font-['ChillRoundF']"
                    >
                        <p>{{ selectedItem.record.desc }}</p>
                    </div>

                    <div class="mt-auto flex flex-col gap-4">
                        <div class="pt-2 flex gap-3">
                            <a
                                v-if="selectedItem.record.link"
                                :href="selectedItem.record.link"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="inline-flex items-center justify-center rounded-xl whitespace-nowrap shrink-0 bg-primary/10 text-primary px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/20"
                            >
                                {{ t("common.label.viewDetails") }}
                                <ArrowTopRightOnSquareIcon
                                    class="ml-2 w-4 h-4"
                                />
                            </a>
                            <button
                                v-if="activeTab === 'fav_music'"
                                class="inline-flex items-center justify-center rounded-xl whitespace-nowrap shrink-0 bg-secondary/10 text-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/20"
                                @click="playMusic(selectedItem)"
                            >
                                {{ t("pages.about.tabs.music") }}
                                <PlayCircleIcon class="ml-2 w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AnriDialog>
    </main>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { useNavTitle } from "~/composables/useNavTitle";
import { useApi } from "~/composables/useApi";
import { usePlayer } from "~/composables/usePlayer";
import {
    PlayCircleIcon,
    ArrowTopRightOnSquareIcon,
} from "@heroicons/vue/24/solid";
import AnriDialog from "~/components/AnriDialog.vue";
import AnriSelector from "~/components/AnriSelector.vue";
import AnriInput from "~/components/AnriInput.vue";
import AnriPagination from "~/components/AnriPagination.vue";
import AnriSpinner from "~/components/AnriSpinner.vue";
import AnriTooltip from "~/components/AnriTooltip.vue";
import AnriCharCard from "~/components/AnriCharCard.vue";
import AnriAlert from "~/components/AnriAlert.vue";
import type { FavItem, FavCharItem } from "~/types/record";
const { t } = useI18n();
const { reset: resetNavTitle } = useNavTitle();
const { setTrack, playlist } = usePlayer();

resetNavTitle();

const isDialogOpen = ref(false);
const selectedItem = ref<FavItem | null>(null);

const openDialog = (item: FavItem) => {
    selectedItem.value = item;
    isDialogOpen.value = true;
};

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

usePageSeo({
    title: () => t("menu.favorites"),
    description: () => t("pages.meta.favorites"),
});

const parseHashToTab = (hash: string) => {
    if (!hash) return "fav_music";
    const h = hash.replace("#", "");
    const valid = ["music", "anime", "galgame", "novel", "comic", "char"];
    return valid.includes(h) ? `fav_${h}` : "fav_music";
};

const activeTab = ref("fav_music");
const searchQuery = ref("");

// 番剧 / 轻小说 / 漫画 三个分类封面走 Bangumi 图源，可能加载失败，需提示用户。
const BANGUMI_SOURCE_TABS = new Set(["fav_anime", "fav_novel", "fav_comic"]);
const showBangumiNotice = computed(() =>
    BANGUMI_SOURCE_TABS.has(activeTab.value),
);

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
const searchResults = ref<(FavItem | FavCharItem)[]>([]);

const displayData = computed(() => {
    return searchQuery.value ? searchResults.value : currentData.value;
});

const currentMeta = ref<any>(undefined);
const tabDataCache = ref<
    Record<string, Record<number, (FavItem | FavCharItem)[]>>
>({});
const tabMetaCache = ref<Record<string, Record<number, any>>>({});

const playMusic = (item: FavItem) => {
    const extractId = (link?: string) => link?.split("id=")[1]?.split("&")[0];
    const musicId = extractId(item.record.link);
    if (!musicId) return;

    // 优先从全局播放列表中定位
    const existingTrack = (playlist.value as any[]).find(
        (t) => String(t.id) === String(musicId),
    );
    if (existingTrack) {
        setTrack(existingTrack, playlist.value);
        return;
    }

    // 兜底逻辑：如果全局列表没加载完或没找到
    const track = {
        id: musicId,
        title: item.record.title,
        cover: item.record.cover,
        source: `https://music.163.com/song/media/outer/url?id=${musicId}.mp3`,
    };

    // 如果 playlist 为空，直接设置 [track]；如果不为空，尝试合并
    const newList =
        playlist.value && playlist.value.length > 0
            ? [...playlist.value, track]
            : [track];

    setTrack(track, newList);
};

const charListCache = ref<{ label: string; value: number }[]>([]);
const isCharListLoading = ref(false);

let searchTimer: any = null;
const onSearch = (val: string) => {
    if (searchTimer) clearTimeout(searchTimer);

    if (!val) {
        searchResults.value = [];
        return;
    }

    searchTimer = setTimeout(async () => {
        try {
            const config = useRuntimeConfig();
            const apiBase =
                config.public.apiBase ||
                "https://cms.tantanchugasuki.cn/nozomi";
            const res = await $fetch<{ data: (FavItem | FavCharItem)[] }>(
                `${apiBase}/v1/datasets/${activeTab.value}?filter[title][contains]=${encodeURIComponent(val)}&page=1&page_size=40`,
            );
            if (res && res.data) {
                searchResults.value = res.data;
            }
        } catch (e) {
            console.error("Search failed:", e);
        }
    }, 300);
};

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
    searchQuery.value = "";
    searchResults.value = [];

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
