<template>
    <AnriOverlay v-model="modelValue">
        <div
            class="relative w-full h-full flex items-center justify-center p-4 sm:p-8"
        >
            <!-- Close button -->
            <button
                class="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 rounded-xl border-transparent bg-transparent text-on-background hover:bg-primary/5 hover:text-primary active:bg-primary/10 transition-[background-color,border-color,color,box-shadow] duration-200 ease-out cursor-pointer z-10"
                @click.stop="closeViewer"
            >
                <XMarkIcon class="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            <!-- Prev button -->
            <button
                v-if="hasPrev"
                class="absolute left-4 sm:left-8 p-3 rounded-xl border-transparent bg-transparent text-on-background hover:bg-primary/5 hover:text-primary active:bg-primary/10 transition-[background-color,border-color,color,box-shadow] duration-200 ease-out cursor-pointer z-10"
                @click.stop="prevImage"
            >
                <ChevronLeftIcon class="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            <!-- Next button -->
            <button
                v-if="hasNext"
                class="absolute right-4 sm:right-8 p-3 rounded-xl border-transparent bg-transparent text-on-background hover:bg-primary/5 hover:text-primary active:bg-primary/10 transition-[background-color,border-color,color,box-shadow] duration-200 ease-out cursor-pointer z-10"
                @click.stop="nextImage"
            >
                <ChevronRightIcon class="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            <!-- Image -->
            <div
                ref="viewportRef"
                class="relative w-full h-full overflow-hidden"
                @wheel.prevent="handleWheel"
                @mousedown="startDrag"
                @touchstart.passive="handleTouchStart"
                @touchmove.prevent="handleTouchMove"
                @touchend="handleTouchEnd"
                @click.stop
            >
                <Transition
                    mode="in-out"
                    enter-active-class="transition-opacity duration-200 ease-out"
                    enter-from-class="opacity-0"
                    enter-to-class="opacity-100"
                >
                    <div
                        v-if="displayedImageSrc"
                        :key="displayedImageKey"
                        class="absolute inset-0 flex items-center justify-center"
                    >
                        <img
                            ref="imageRef"
                            :src="displayedImageSrc"
                            class="max-w-full max-h-full object-contain select-none will-change-transform rounded-xl"
                            :style="imageStyle"
                            draggable="false"
                        />
                    </div>
                </Transition>
            </div>

            <!-- Bottom controls: counter + wheel mode toggle -->
            <div
                class="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 rounded-xl bg-surface/80 backdrop-blur-md select-none"
            >
                <div
                    v-if="images.length > 1"
                    class="px-3 py-2 text-on-background/80 text-sm font-medium tracking-wide"
                >
                    {{ displayedIndex + 1 }} / {{ images.length }}
                </div>
                <div
                    v-if="images.length > 1"
                    class="w-px h-4 bg-on-background/10"
                ></div>
                <button
                    class="p-2 rounded-lg transition-colors duration-200 ease-out cursor-pointer"
                    :class="
                        wheelMode === 'zoom'
                            ? 'bg-primary/10 text-primary'
                            : 'text-on-background/60 hover:bg-on-background/10 hover:text-on-background'
                    "
                    title="滚轮缩放"
                    @click.stop="setWheelMode('zoom')"
                >
                    <MagnifyingGlassPlusIcon class="w-5 h-5" />
                </button>
                <button
                    class="p-2 rounded-lg transition-colors duration-200 ease-out cursor-pointer"
                    :class="
                        wheelMode === 'pan'
                            ? 'bg-primary/10 text-primary'
                            : 'text-on-background/60 hover:bg-on-background/10 hover:text-on-background'
                    "
                    title="滚轮上下滑动"
                    @click.stop="setWheelMode('pan')"
                >
                    <ArrowsUpDownIcon class="w-5 h-5" />
                </button>
            </div>
        </div>
    </AnriOverlay>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import {
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassPlusIcon,
    ArrowsUpDownIcon,
} from "@heroicons/vue/24/outline";
import { useImageViewer } from "~/composables/useImageViewer";
import AnriOverlay from "~/components/AnriOverlay.vue";

const { isOpen, images, currentIndex, closeViewer, nextImage, prevImage } =
    useImageViewer();
const { getStatus, setStatus } = useImageCache();

const modelValue = computed({
    get: () => isOpen.value,
    set: (val) => {
        isOpen.value = val;
    },
});

const hasPrev = computed(() => currentIndex.value > 0);
const hasNext = computed(() => currentIndex.value < images.value.length - 1);
const displayedIndex = ref(0);
const displayedImageSrc = computed(
    () => images.value[displayedIndex.value] || "",
);
const displayedImageKey = computed(
    () => `${displayedIndex.value}:${displayedImageSrc.value}`,
);

const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);

const viewportRef = ref<HTMLDivElement | null>(null);
const imageRef = ref<HTMLImageElement | null>(null);

type WheelMode = "zoom" | "pan";
const wheelMode = ref<WheelMode>("zoom");

// Touch State
const lastTouchDistance = ref(0);

const imageStyle = computed(() => ({
    transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
    cursor: isDragging.value ? "grabbing" : "grab",
    transition: isDragging.value ? "none" : "transform 0.2s ease-out",
}));

const resetTransform = () => {
    scale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
};

// 计算当前缩放倍数下图片可平移的边界（transform-origin 居中，取溢出量的一半）
const panBounds = () => {
    const viewport = viewportRef.value;
    const img = imageRef.value;
    if (!viewport || !img) return { maxX: 0, maxY: 0 };
    const maxX = Math.max(
        0,
        (img.offsetWidth * scale.value - viewport.clientWidth) / 2,
    );
    const maxY = Math.max(
        0,
        (img.offsetHeight * scale.value - viewport.clientHeight) / 2,
    );
    return { maxX, maxY };
};

const clampTranslate = () => {
    const { maxX, maxY } = panBounds();
    translateX.value = Math.min(maxX, Math.max(-maxX, translateX.value));
    translateY.value = Math.min(maxY, Math.max(-maxY, translateY.value));
};

// 滑动模式：长图适配视口宽度并从顶部开始，滚轮上下浏览
const applyPanFit = async () => {
    await nextTick();
    const viewport = viewportRef.value;
    const img = imageRef.value;
    if (!viewport || !img) return;

    const fitScale = viewport.clientWidth / img.offsetWidth;
    scale.value = Math.max(1, fitScale);
    translateX.value = 0;
    translateY.value = panBounds().maxY;
};

const setWheelMode = (mode: WheelMode) => {
    if (wheelMode.value === mode) return;
    wheelMode.value = mode;
    if (mode === "pan") {
        void applyPanFit();
    } else {
        resetTransform();
    }
};

const decodedImages = new Set<string>();
const pendingPreloads = new Map<string, Promise<void>>();
let switchRequestId = 0;
let viewerWasOpen = false;

const getImageSrc = (index: number) => images.value[index] || "";

const clampImageIndex = (index: number) => {
    if (images.value.length === 0) return 0;
    return Math.min(Math.max(index, 0), images.value.length - 1);
};

const preloadImage = (src: string): Promise<void> => {
    if (!src || import.meta.server) {
        return Promise.resolve();
    }

    if (decodedImages.has(src)) {
        return Promise.resolve();
    }

    const pending = pendingPreloads.get(src);
    if (pending) {
        return pending;
    }

    if (getStatus(src) !== "loaded") {
        setStatus(src, "loading");
    }

    const task = new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => {
            const decodeTask = img.decode
                ? img.decode().catch(() => undefined)
                : Promise.resolve();

            decodeTask.then(() => {
                decodedImages.add(src);
                setStatus(src, "loaded");
                resolve();
            });
        };
        img.onerror = () => {
            setStatus(src, "error");
            reject(new Error(`Failed to load image: ${src}`));
        };
        img.src = src;
    }).finally(() => {
        pendingPreloads.delete(src);
    });

    pendingPreloads.set(src, task);
    return task;
};

const preloadAround = (index: number) => {
    const nearbySources = [getImageSrc(index - 1), getImageSrc(index + 1)];
    for (const src of nearbySources) {
        if (src) {
            void preloadImage(src).catch(() => undefined);
        }
    }
};

const commitDisplayedImage = (index: number) => {
    displayedIndex.value = index;
    resetTransform();
    if (wheelMode.value === "pan") {
        void applyPanFit();
    }
    preloadAround(index);
};

const syncDisplayedImage = async (index: number) => {
    const nextIndex = clampImageIndex(index);
    const src = getImageSrc(nextIndex);
    const requestId = ++switchRequestId;

    if (nextIndex === displayedIndex.value) {
        preloadAround(nextIndex);
        return;
    }

    try {
        await preloadImage(src);
    } catch (error) {
        console.error(error);
    }

    if (
        requestId !== switchRequestId ||
        !isOpen.value ||
        currentIndex.value !== nextIndex
    ) {
        return;
    }

    commitDisplayedImage(nextIndex);
};

// Mouse Wheel: 缩放模式下滚轮缩放，滑动模式下滚轮上下平移长图
const handleWheel = (e: WheelEvent) => {
    if (wheelMode.value === "pan") {
        translateY.value -= e.deltaY;
        clampTranslate();
        return;
    }

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(5, scale.value + delta));
    scale.value = newScale;
    if (scale.value === 1) {
        translateX.value = 0;
        translateY.value = 0;
    }
};

const startDrag = (e: MouseEvent) => {
    isDragging.value = true;
    startX.value = e.clientX - translateX.value;
    startY.value = e.clientY - translateY.value;

    window.addEventListener("mousemove", onDragging);
    window.addEventListener("mouseup", stopDrag);
};

const onDragging = (e: MouseEvent) => {
    if (!isDragging.value) return;
    translateX.value = e.clientX - startX.value;
    translateY.value = e.clientY - startY.value;
};

const stopDrag = () => {
    isDragging.value = false;
    window.removeEventListener("mousemove", onDragging);
    window.removeEventListener("mouseup", stopDrag);
};

const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1 && e.touches[0]) {
        isDragging.value = true;
        startX.value = e.touches[0].clientX - translateX.value;
        startY.value = e.touches[0].clientY - translateY.value;
    } else if (e.touches.length === 2 && e.touches[0] && e.touches[1]) {
        const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY,
        );
        lastTouchDistance.value = dist;
    }
};

const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1 && isDragging.value && e.touches[0]) {
        translateX.value = e.touches[0].clientX - startX.value;
        translateY.value = e.touches[0].clientY - startY.value;
    } else if (e.touches.length === 2 && e.touches[0] && e.touches[1]) {
        const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY,
        );
        const delta = (dist - lastTouchDistance.value) * 0.01;
        const newScale = Math.max(0.5, Math.min(5, scale.value + delta));
        scale.value = newScale;
        lastTouchDistance.value = dist;
    }
};

const handleTouchEnd = () => {
    isDragging.value = false;
    lastTouchDistance.value = 0;
};

const handleKeydown = (e: KeyboardEvent) => {
    if (!isOpen.value) return;
    if (e.key === "Escape") closeViewer();
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "ArrowRight") nextImage();
};

onMounted(() => {
    window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
    stopDrag();
});

watch(
    () => [isOpen.value, currentIndex.value, images.value] as const,
    ([open, index]) => {
        switchRequestId++;

        if (!open) {
            viewerWasOpen = false;
            return;
        }

        const nextIndex = clampImageIndex(index);
        if (!viewerWasOpen) {
            viewerWasOpen = true;
            commitDisplayedImage(nextIndex);
            return;
        }

        void syncDisplayedImage(nextIndex);
    },
    { flush: "sync" },
);
</script>
