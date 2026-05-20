<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition-opacity duration-300 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="isOpen"
                class="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                @click="closeViewer"
            >
                <div
                    class="relative w-full h-full flex items-center justify-center p-4 sm:p-8"
                >
                    <!-- Close button -->
                    <button
                        class="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all duration-200 ease-out cursor-pointer z-10"
                        @click.stop="closeViewer"
                    >
                        <XMarkIcon class="w-6 h-6 sm:w-8 sm:h-8" />
                    </button>

                    <!-- Prev button -->
                    <button
                        v-if="hasPrev"
                        class="absolute left-4 sm:left-8 p-3 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all duration-200 ease-out cursor-pointer z-10"
                        @click.stop="prevImage"
                    >
                        <ChevronLeftIcon class="w-6 h-6 sm:w-8 sm:h-8" />
                    </button>

                    <!-- Next button -->
                    <button
                        v-if="hasNext"
                        class="absolute right-4 sm:right-8 p-3 rounded-2xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-all duration-200 ease-out cursor-pointer z-10"
                        @click.stop="nextImage"
                    >
                        <ChevronRightIcon class="w-6 h-6 sm:w-8 sm:h-8" />
                    </button>

                    <!-- Image -->
                    <div
                        class="relative w-full h-full flex items-center justify-center"
                        @wheel.prevent="handleWheel"
                        @mousedown="startDrag"
                        @touchstart.passive="handleTouchStart"
                        @touchmove.prevent="handleTouchMove"
                        @touchend="handleTouchEnd"
                        @click.stop
                    >
                        <Transition
                            enter-active-class="transition-all duration-300 ease-out"
                            enter-from-class="opacity-0 scale-95"
                            enter-to-class="opacity-100 scale-100"
                            leave-active-class="transition-all duration-200 ease-in absolute"
                            leave-from-class="opacity-100 scale-100"
                            leave-to-class="opacity-0 scale-95"
                        >
                            <img
                                :key="currentIndex"
                                :src="currentImageSrc"
                                class="max-w-full max-h-full object-contain select-none will-change-transform rounded-xl"
                                :style="imageStyle"
                                draggable="false"
                            />
                        </Transition>
                    </div>

                    <!-- Counter -->
                    <div
                        v-if="images.length > 1"
                        class="absolute bottom-4 sm:bottom-8 px-4 py-2 rounded-2xl bg-black/50 text-white/90 text-sm font-medium tracking-wide backdrop-blur-md select-none"
                    >
                        {{ currentIndex + 1 }} / {{ images.length }}
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import {
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "@heroicons/vue/24/outline";
import { useImageViewer } from "~/composables/useImageViewer";

const { isOpen, images, currentIndex, closeViewer, nextImage, prevImage } =
    useImageViewer();

const hasPrev = computed(() => currentIndex.value > 0);
const hasNext = computed(() => currentIndex.value < images.value.length - 1);
const currentImageSrc = computed(() => images.value[currentIndex.value] || "");

const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const isDragging = ref(false);
const startX = ref(0);
const startY = ref(0);

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

// Reset transform when image changes or viewer opens
watch([currentIndex, isOpen], () => {
    resetTransform();
});

// Mouse Wheel Zoom
const handleWheel = (e: WheelEvent) => {
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
});
</script>
