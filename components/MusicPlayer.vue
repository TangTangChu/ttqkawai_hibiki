<template>
    <div
        v-show="playlist.length > 0"
        class="fixed bottom-6 left-4 right-4 sm:right-auto sm:bottom-6 sm:left-6 z-50 flex items-end pointer-events-none"
    >
        <transition name="player-anim" mode="out-in">
            <div
                v-if="isMinimized"
                class="relative bg-surface p-1 rounded-2xl cursor-pointer transition-colors duration-200 hover:bg-on-background/5 group pointer-events-auto shadow-[0px_2px_16px_0px_rgba(113,93,84,0.06)] backdrop-blur-md"
                @click="isMinimized = false"
            >
                <div class="relative w-12 h-12 rounded-xl overflow-hidden">
                    <AnriImage
                        v-if="currentTrack"
                        :src="currentTrack.cover"
                        :img-class="
                            isPlaying
                                ? 'object-cover animate-spin-slow'
                                : 'object-cover'
                        "
                        spinner-size="sm"
                        alt="cover"
                    />
                    <div
                        class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                        <ChevronRightIconOutline class="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>
            <div
                v-else
                class="flex flex-col gap-2 w-full sm:w-96 bg-surface p-3 pb-5 sm:pb-3 rounded-2xl pointer-events-auto transition-all duration-300 shadow-[0px_2px_16px_0px_rgba(113,93,84,0.06)] backdrop-blur-md"
            >
                <div
                    class="w-full flex items-center gap-2 px-1 text-[11px] text-on-background/60 select-none pb-1"
                    style="font-family: &quot;ChillRoundF&quot;, sans-serif"
                >
                    <span class="w-8 text-right shrink-0">{{
                        formatTime(currentTime)
                    }}</span>
                    <div
                        class="flex-1 h-1.5 bg-on-background/10 rounded-full cursor-pointer relative group overflow-hidden"
                        @click="seek"
                    >
                        <div
                            class="absolute top-0 left-0 h-full bg-primary rounded-full transition-[width] duration-300 ease-out"
                            :style="{ width: progress + '%' }"
                        ></div>
                        <div
                            class="absolute top-0 left-0 h-full bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full pointer-events-none"
                            :style="{ width: progress + '%' }"
                        ></div>
                    </div>
                    <span class="w-8 text-left shrink-0">{{
                        formatTime(duration) || "00:00"
                    }}</span>
                </div>

                <div class="flex items-center gap-2 sm:gap-4 px-1">
                    <!-- 封面 -->
                    <div
                        class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 relative"
                    >
                        <AnriImage
                            v-if="currentTrack"
                            :src="currentTrack.cover"
                            img-class="object-cover"
                            spinner-size="sm"
                            alt="cover"
                        />
                    </div>

                    <!-- 信息 -->
                    <div
                        class="flex flex-col min-w-0 flex-1 justify-center relative overflow-hidden h-12 sm:h-14"
                    >
                        <div v-if="currentTrack" class="w-full">
                            <span
                                class="text-sm sm:text-base font-bold text-on-background line-clamp-2 leading-tight pr-2"
                                :title="currentTrack.title"
                            >
                                {{ currentTrack.title }}
                            </span>
                        </div>
                    </div>

                    <!-- 控件 -->
                    <div
                        class="flex flex-col items-end justify-between h-12 sm:h-14 shrink-0 gap-1 mt-0.5"
                    >
                        <div class="flex items-center gap-1">
                            <button
                                @click="isMinimized = true"
                                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-on-background/10 text-on-background/50 hover:text-on-background/90 transition-colors duration-150"
                                title="最小化"
                            >
                                <ChevronDownIconOutline class="w-4 h-4" />
                            </button>
                            <button
                                @click="stop"
                                class="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-on-background/50 hover:text-red-500 transition-colors duration-150"
                                title="关闭"
                            >
                                <XMarkIconOutline class="w-4 h-4" />
                            </button>
                        </div>
                        <div class="flex items-center gap-0.5 sm:gap-1">
                            <button
                                @click="prevTrack"
                                class="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-on-background/10 text-on-background/80 hover:text-primary transition-colors duration-150"
                            >
                                <ChevronLeftIconOutline class="w-5 h-5" />
                            </button>
                            <button
                                @click="togglePlay"
                                class="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-primary/10 text-primary transition-colors duration-150"
                            >
                                <PauseIconOutline
                                    v-if="isPlaying"
                                    class="w-5 h-5"
                                />
                                <PlayIconOutline v-else class="w-5 h-5" />
                            </button>
                            <button
                                @click="nextTrack"
                                class="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-on-background/10 text-on-background/80 hover:text-primary transition-colors duration-150"
                            >
                                <ChevronRightIconOutline class="w-5 h-5" />
                            </button>

                            <!-- 播放列表选择器 -->
                            <AnriSelect
                                :model-value="currentTrackId"
                                :options="playlistOptions"
                                placement="top"
                                align="right"
                                width-class="w-[70vw] sm:w-72"
                                panel-class="max-h-72 overflow-y-auto"
                                class="ml-0.5"
                                @update:model-value="selectTrack"
                            >
                                <template #trigger="{ toggle, isOpen }">
                                    <button
                                        @click="toggle"
                                        class="w-8 h-8 flex items-center justify-center rounded-xl transition-colors duration-150"
                                        :class="
                                            isOpen
                                                ? 'bg-primary/10 text-primary'
                                                : 'hover:bg-on-background/10 text-on-background/80 hover:text-primary'
                                        "
                                    >
                                        <Bars4IconOutline class="w-5 h-5" />
                                    </button>
                                </template>
                            </AnriSelect>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <audio
            ref="audioRef"
            :src="currentTrack ? currentTrack.source : ''"
            referrerpolicy="no-referrer"
            @timeupdate="onTimeUpdate"
            @loadedmetadata="onLoadedMetadata"
            @ended="handleEnded"
            @play="onPlayEvent"
            @pause="onPauseEvent"
            @error="onAudioError"
        ></audio>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from "vue";
import { usePlayer } from "~/composables/usePlayer";
import {
    PlayIcon as PlayIconOutline,
    PauseIcon as PauseIconOutline,
    XMarkIcon as XMarkIconOutline,
    ChevronLeftIcon as ChevronLeftIconOutline,
    ChevronRightIcon as ChevronRightIconOutline,
    Bars4Icon as Bars4IconOutline,
    ChevronDownIcon as ChevronDownIconOutline,
    ArrowsPointingOutIcon as ArrowsPointingOutIconOutline,
} from "@heroicons/vue/24/outline";

const {
    currentTrack,
    playlist,
    isPlaying,
    setTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    stop,
    updatePlaylistOnly,
} = usePlayer();
const audioRef = ref<HTMLAudioElement | null>(null);

interface DatasetListResponse {
    data: {
        record: {
            title: string;
            cover?: string;
            link?: string;
        };
    }[];
    meta: {
        total_pages: number;
    };
}

const PAGE_SIZE = 100; // API 对 page_size 有 max=100 校验

const fetchFullMusicList = async () => {
    try {
        const config = useRuntimeConfig();
        const apiBase =
            config.public.apiBase || "https://cms.tantanchugasuki.cn/nozomi";

        // 先拉第 1 页拿 total_pages，再并行拉剩余页，按页序拼接出完整列表
        const first = await $fetch<DatasetListResponse>(
            `${apiBase}/v1/datasets/fav_music?page=1&page_size=${PAGE_SIZE}`,
        );
        const restPages =
            first.meta.total_pages > 1
                ? await Promise.all(
                      Array.from(
                          { length: first.meta.total_pages - 1 },
                          (_, i) =>
                              $fetch<DatasetListResponse>(
                                  `${apiBase}/v1/datasets/fav_music?page=${i + 2}&page_size=${PAGE_SIZE}`,
                              ),
                      ),
                  )
                : [];
        const items = [first, ...restPages].flatMap((res) => res.data);

        const extractId = (link?: string) =>
            link?.split("id=")[1]?.split("&")[0];
        const fullList = items
            .filter((item) => item.record.link)
            .map((item) => ({
                id: extractId(item.record.link)!,
                title: item.record.title,
                cover: item.record.cover,
                source: `https://music.163.com/song/media/outer/url?id=${extractId(item.record.link)}.mp3`,
            }));
        updatePlaylistOnly(fullList);
        // 默认载入第一首，但不自动播放
        if (fullList.length > 0 && !currentTrack.value) {
            currentTrack.value = fullList[0] || null;
        }
    } catch (e) {
        console.error("Failed to fetch full music list for player", e);
    }
};

// Media Session API 适配
const updateMediaMetadata = () => {
    if ("mediaSession" in navigator && currentTrack.value) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentTrack.value.title,
            artist: "",
            album: "Tantanchu's Favorite Tracks",
            artwork: [
                {
                    src: currentTrack.value.cover || "",
                    sizes: "512x512",
                    type: "image/png",
                },
            ],
        });
        navigator.mediaSession.setActionHandler("play", () => togglePlay());
        navigator.mediaSession.setActionHandler("pause", () => togglePlay());
        navigator.mediaSession.setActionHandler("previoustrack", () =>
            prevTrack(),
        );
        navigator.mediaSession.setActionHandler("nexttrack", () => nextTrack());
        navigator.mediaSession.setActionHandler("seekbackward", () => {
            if (audioRef.value)
                audioRef.value.currentTime = Math.max(
                    0,
                    audioRef.value.currentTime - 10,
                );
        });
        navigator.mediaSession.setActionHandler("seekforward", () => {
            if (audioRef.value)
                audioRef.value.currentTime = Math.min(
                    audioRef.value.duration,
                    audioRef.value.currentTime + 10,
                );
        });
        try {
            navigator.mediaSession.setActionHandler("stop", () => stop());
        } catch (error) {
            console.warn('MediaSession "stop" action not supported.');
        }
    }
};

const updatePlaybackState = (state: "playing" | "paused" | "none") => {
    if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = state;
    }
};

const updatePositionState = () => {
    if (
        "mediaSession" in navigator &&
        "setPositionState" in navigator.mediaSession &&
        audioRef.value &&
        !isNaN(audioRef.value.duration)
    ) {
        navigator.mediaSession.setPositionState({
            duration: audioRef.value.duration,
            playbackRate: audioRef.value.playbackRate,
            position: audioRef.value.currentTime,
        });
    }
};

onMounted(() => {
    fetchFullMusicList();
    if ("mediaSession" in navigator && currentTrack.value) {
        updateMediaMetadata();
    }
});

const currentTime = ref(0);
const duration = ref(0);
const progress = ref(0);
const isMinimized = ref(true);

const playlistOptions = computed(() =>
    playlist.value.map((item) => ({
        value: item.id,
        label: item.title,
        image: item.cover,
    })),
);

const currentTrackId = computed(() => currentTrack.value?.id ?? "");

const selectTrack = (value: string | number): void => {
    setTrack(
        playlist.value.find((item) => item.id === String(value))!,
        playlist.value,
    );
};

const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "00:00";
    const m = Math.floor(time / 60)
        .toString()
        .padStart(2, "0");
    const s = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");
    return `${m}:${s}`;
};

const onTimeUpdate = (e: Event) => {
    const target = e.target as HTMLAudioElement;
    if (!target.duration || isNaN(target.duration)) return;
    currentTime.value = target.currentTime;
    progress.value = (target.currentTime / target.duration) * 100;
    updatePositionState();
};

const onLoadedMetadata = (e: Event) => {
    const target = e.target as HTMLAudioElement;
    duration.value = target.duration;
    updateMediaMetadata();
    updatePositionState();
};

const onAudioError = (e: Event) => {
    const target = e.target as HTMLAudioElement;
    console.warn("Audio load failed, skipping to next track:", target.src);
    updatePlaybackState("none");
    // 延迟一秒自动下一首
    setTimeout(() => {
        if (playlist.value.length > 1) {
            nextTrack();
        } else {
            isPlaying.value = false;
        }
    }, 1000);
};

const seek = (e: MouseEvent) => {
    if (!audioRef.value || !duration.value) return;
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.value.currentTime = percent * duration.value;
    updatePositionState();
};

const handleEnded = () => {
    if (playlist.value.length > 1) {
        nextTrack();
    } else {
        isPlaying.value = false;
        currentTime.value = 0;
        progress.value = 0;
        updatePlaybackState("none");
    }
};

const onPlayEvent = () => {
    isPlaying.value = true;
    updatePlaybackState("playing");
    updatePositionState();
};

const onPauseEvent = () => {
    isPlaying.value = false;
    updatePlaybackState("paused");
};

// 状态同步
watch(isPlaying, async (val) => {
    await nextTick();
    if (!audioRef.value) return;

    if (val && audioRef.value.paused) {
        audioRef.value.play().catch((e) => {
            console.error("Audio play failed:", e);
            isPlaying.value = false;
        });
    } else if (!val && !audioRef.value.paused) {
        audioRef.value.pause();
    }
});

watch(
    () => currentTrack.value?.id,
    async (newId, oldId) => {
        if (newId !== oldId) {
            currentTime.value = 0;
            progress.value = 0;

            await nextTick();
            if (audioRef.value && isPlaying.value) {
                audioRef.value.play().catch(() => {
                    isPlaying.value = false;
                });
            }
        }
    },
);
</script>

<style scoped>
.player-anim-enter-active,
.player-anim-leave-active {
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.player-anim-enter-from,
.player-anim-leave-to {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
}
</style>
