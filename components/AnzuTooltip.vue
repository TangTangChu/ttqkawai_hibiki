<template>
    <div
        class="relative inline-block w-full h-full"
        @mouseenter="show = true"
        @mouseleave="show = false"
        @focusin="show = true"
        @focusout="show = false"
    >
        <slot />
        <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
        >
            <div
                v-if="show && content"
                class="absolute z-50 px-3 py-2 text-sm bg-primary rounded-xl text-on-primary bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-50 text-center pointer-events-none"
                style="font-family: &quot;ChillRoundF&quot;, sans-serif"
            >
                {{ content }}
            </div>
        </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

withDefaults(
    defineProps<{
        content?: string;
    }>(),
    {
        content: "",
    },
);

const show = ref(false);
</script>
