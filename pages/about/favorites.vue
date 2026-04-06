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
                    v-if="loading && currentPage === 1"
                    class="flex justify-center py-12"
                >
                    <AnzuSpinner class="w-8 h-8 text-primary" />
                </div>

                <ErrorDisplay v-else-if="error" :error="error" />

                <div v-else-if="accumulatedData.length > 0">
                    <div
                        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
                    >
                        <a
                            v-for="item in accumulatedData"
                            :key="item.id"
                            :href="(item.record as BaseRecord).link"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="relative flex flex-col gap-2 cursor-pointer rounded-xl p-3 transition-colors duration-200 ease-out hover:bg-on-background/5 group"
                        >
                            <div
                                class="w-full shrink-0 rounded-xl overflow-hidden bg-surface-variant/50"
                                :class="
                                    activeTab === 'fav_music'
                                        ? 'aspect-square'
                                        : activeTab === 'fav_novel'
                                          ? 'aspect-105/148'
                                          : 'aspect-3/4'
                                "
                            >
                                <img
                                    :src="(item.record as BaseRecord).cover"
                                    :alt="(item.record as BaseRecord).title"
                                    class="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                            <div class="flex-1 min-w-0 text-center mt-2">
                                <h3
                                    class="text-sm font-bold text-on-background line-clamp-2 transition-colors duration-200 group-hover:text-primary"
                                >
                                    {{ (item.record as BaseRecord).title }}
                                </h3>
                                <p
                                    v-if="
                                        (activeTab === 'fav_galgame' ||
                                            activeTab === 'fav_novel') &&
                                        (item.record as GalgameRecord).raw_name
                                    "
                                    class="text-xs text-on-background/60 line-clamp-1 mt-1"
                                >
                                    {{
                                        (item.record as GalgameRecord).raw_name
                                    }}
                                </p>
                            </div>
                        </a>
                    </div>

                    <div class="mt-8">
                        <AnzuLoadMore
                            :has-more="
                                meta ? currentPage < meta.total_pages : false
                            "
                            :loading="loading"
                            @load-more="onLoadMore"
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
import { ref, watch, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useNavTitle } from "~/composables/useNavTitle";
import { useApi } from "~/composables/useApi";
import AnzuSelector from "~/components/AnzuSelector.vue";
import AnzuLoadMore from "~/components/AnzuLoadMore.vue";

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
]);

const activeTab = ref("fav_music");

interface BaseRecord {
    cover: string;
    link: string;
    title: string;
    is_container: boolean;
}

interface GalgameRecord extends BaseRecord {
    raw_name?: string;
}

interface DatasetItem<T = Record<string, any>> {
    id: string;
    slug: string;
    record: T;
}

const { data, loading, error, meta, get } = useApi<DatasetItem[]>();
const currentPage = ref(1);
const accumulatedData = ref<DatasetItem[]>([]);

const fetchData = (page: number) => {
    currentPage.value = page;
    get(`/v1/datasets/${activeTab.value}?page=${page}&page_size=20`);
};

const onLoadMore = () => {
    if (meta.value && currentPage.value < meta.value.total_pages) {
        fetchData(currentPage.value + 1);
    }
};

watch(data, (newData) => {
    if (newData) {
        if (currentPage.value === 1) {
            accumulatedData.value = [...newData];
        } else {
            const existingIds = new Set(
                accumulatedData.value.map((item) => item.id),
            );
            const freshData = newData.filter(
                (item) => !existingIds.has(item.id),
            );
            accumulatedData.value.push(...freshData);
        }
    }
});

watch(activeTab, () => {
    accumulatedData.value = [];
    fetchData(1);
});

onMounted(() => {
    fetchData(1);
});
</script>
