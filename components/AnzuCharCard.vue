<template>
    <div
        class="relative w-full max-w-4xl mx-auto overflow-hidden rounded-2xl bg-surface-variant/30 flex flex-col md:flex-row gap-8 p-6 md:p-8 transition-all duration-300"
    >
        <div
            class="relative shrink-0 w-full md:w-80 rounded-xl overflow-hidden flex flex-col gap-2"
        >
            <div
                class="relative aspect-105/148 rounded-xl overflow-hidden bg-surface-variant/50 group"
            >
                <img
                    :src="char.record.cover"
                    :alt="char.record.title"
                    class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />
            </div>
            <a
                v-if="char.record.origin"
                :href="char.record.origin"
                target="_blank"
                rel="noopener noreferrer"
                class="text-on-background/40 hover:text-primary text-[10px] text-center transition-colors duration-300"
            >
                Origin Illustration
            </a>
        </div>
        <div class="flex flex-col justify-center flex-1 min-w-0 py-4">
            <div class="mb-8">
                <div class="flex items-center gap-4">
                    <h2
                        class="text-3xl md:text-4xl font-extrabold text-on-background truncate"
                    >
                        {{ char.record.title }}
                    </h2>
                </div>
                <p
                    v-if="char.record.raw_name"
                    class="text-base text-on-background/60 mt-2"
                >
                    {{ char.record.raw_name }}
                </p>
            </div>
            <div class="relative min-h-30 flex items-center">
                <transition name="fade" mode="out-in">
                    <div :key="currentKotobaIndex" class="relative py-2 w-full">
                        <p
                            class="text-lg md:text-xl text-on-background/90 leading-relaxed"
                        >
                            「 {{ currentKotoba }} 」
                        </p>
                    </div>
                </transition>
            </div>
            <div
                class="mt-6 flex gap-2"
                v-if="char.record.kotoba && char.record.kotoba.length > 1"
            >
                <button
                    v-for="(_, index) in char.record.kotoba"
                    :key="index"
                    @click="currentKotobaIndex = index"
                    class="w-8 h-1.5 rounded-full transition-colors duration-300"
                    :class="
                        index === currentKotobaIndex
                            ? 'bg-primary'
                            : 'bg-primary/20 hover:bg-primary/40'
                    "
                    :aria-label="`Quote ${index + 1}`"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import type { FavCharItem } from "~/types/record";

const props = defineProps<{
    char: FavCharItem;
}>();

const currentKotobaIndex = ref(0);
const currentKotoba = computed(() => {
    const kotobas = props.char.record.kotoba;
    if (!kotobas || kotobas.length === 0) return "";
    return kotobas[currentKotobaIndex.value] || "";
});

// 自动轮播语录
let intervalId: ReturnType<typeof setInterval>;
onMounted(() => {
    const kotobas = props.char.record.kotoba;
    if (kotobas && kotobas.length > 1) {
        intervalId = setInterval(() => {
            currentKotobaIndex.value =
                (currentKotobaIndex.value + 1) % kotobas.length;
        }, 8000);
    }
});

onUnmounted(() => {
    if (intervalId) {
        clearInterval(intervalId);
    }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.6s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
