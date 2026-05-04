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
                    class="w-full h-full object-contain"
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
                <div class="flex items-baseline gap-3 flex-wrap">
                    <h2
                        class="text-3xl md:text-4xl font-extrabold text-on-background truncate"
                    >
                        {{ char.record.title }}
                    </h2>
                    <span
                        v-if="char.record.raw_name"
                        class="text-lg md:text-xl text-on-background/60 font-medium"
                    >
                        {{ char.record.raw_name }}
                    </span>
                </div>
                <div
                    v-if="char.record.alias && char.record.alias.length"
                    class="mt-2 text-sm text-on-background/60"
                >
                    {{ char.record.alias.join(" / ") }}
                </div>
            </div>
            <div
                class="relative w-full overflow-hidden transition-[height] duration-500 ease-out"
                :style="{
                    height:
                        kotobaHeight === 'auto' ? 'auto' : `${kotobaHeight}px`,
                }"
            >
                <transition
                    name="kotoba-fade"
                    @before-leave="onBeforeLeave"
                    @leave="onLeave"
                    @enter="onEnter"
                    @after-enter="onAfterEnter"
                >
                    <div
                        :key="currentKotobaIndex"
                        class="w-full py-2 flex items-center min-h-20"
                    >
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

// Height animation hooks
const kotobaHeight = ref<number | "auto">("auto");

const onBeforeLeave = (el: Element) => {
    // Lock the current height before the element starts leaving
    kotobaHeight.value = (el as HTMLElement).offsetHeight;
};

const onLeave = (el: Element) => {
    // Remove the leaving element from normal document flow
    // so it doesn't push the newly entering element down.
    const htmlEl = el as HTMLElement;
    htmlEl.style.position = "absolute";
    htmlEl.style.top = "0";
    htmlEl.style.left = "0";
    htmlEl.style.width = "100%";
};

const onEnter = (el: Element) => {
    // Measure the natural height of the newly mounted element.
    // It's in the document flow now.
    const newHeight = (el as HTMLElement).offsetHeight;

    // Force a small tick so Vue applies the locked height first,
    // then immediately set the new target height to start the CSS transition.
    requestAnimationFrame(() => {
        kotobaHeight.value = newHeight;
    });
};

const onAfterEnter = () => {
    // Once the transition finishes, restore fluid height for any window resizing
    kotobaHeight.value = "auto";
};

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
.kotoba-fade-enter-active,
.kotoba-fade-leave-active {
    transition: opacity 0.5s ease-out;
}
.kotoba-fade-enter-from,
.kotoba-fade-leave-to {
    opacity: 0;
}
</style>
