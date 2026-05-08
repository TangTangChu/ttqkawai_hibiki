<template>
    <div class="relative inline-block overflow-hidden" :class="wrapperClass">
        <div
            v-if="isLoading"
            class="absolute inset-0 flex items-center justify-center bg-gray-100/10 dark:bg-gray-800/10"
        >
            <AnriSpinner :size="spinnerSize" />
        </div>
        <img
            v-bind="$attrs"
            :src="src"
            class="transition-opacity duration-300"
            :class="[
                imgClass,
                { 'opacity-0': isLoading, 'opacity-100': !isLoading },
            ]"
            @load="onLoad"
            @error="onError"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineOptions({
    inheritAttrs: false,
});

const props = withDefaults(
    defineProps<{
        src?: string;
        spinnerSize?: "sm" | "md" | "lg" | "xl";
        wrapperClass?: string;
        imgClass?: string;
    }>(),
    {
        spinnerSize: "md",
    },
);

const isLoading = ref(true);

const onLoad = () => {
    isLoading.value = false;
};

const onError = () => {
    isLoading.value = false;
};
</script>
