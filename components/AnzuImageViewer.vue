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
                class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                @click="closeViewer"
            >
                <div
                    class="relative w-full h-full flex items-center justify-center p-4 sm:p-8"
                >
                    <!-- Close button -->
                    <button
                        class="absolute top-4 right-4 sm:top-8 sm:right-8 p-2 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors cursor-pointer z-10 shadow-lg"
                        @click.stop="closeViewer"
                    >
                        <XMarkIcon class="w-6 h-6 sm:w-8 sm:h-8" />
                    </button>

                    <!-- Prev button -->
                    <button
                        v-if="hasPrev"
                        class="absolute left-4 sm:left-8 p-3 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors cursor-pointer z-10 shadow-lg"
                        @click.stop="prevImage"
                    >
                        <ChevronLeftIcon class="w-6 h-6 sm:w-8 sm:h-8" />
                    </button>

                    <!-- Next button -->
                    <button
                        v-if="hasNext"
                        class="absolute right-4 sm:right-8 p-3 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white transition-colors cursor-pointer z-10 shadow-lg"
                        @click.stop="nextImage"
                    >
                        <ChevronRightIcon class="w-6 h-6 sm:w-8 sm:h-8" />
                    </button>

                    <!-- Image -->
                    <img
                        :src="currentImageSrc"
                        class="max-w-full max-h-full object-contain rounded-xl select-none"
                        @click.stop
                    />

                    <!-- Counter -->
                    <div
                        v-if="images.length > 1"
                        class="absolute bottom-4 sm:bottom-8 px-4 py-2 rounded-xl bg-black/50 text-white/90 text-sm font-medium tracking-wide backdrop-blur-md select-none"
                    >
                        {{ currentIndex + 1 }} / {{ images.length }}
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
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
