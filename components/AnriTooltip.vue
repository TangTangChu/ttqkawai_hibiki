<template>
    <div
        ref="reference"
        class="relative inline-block w-fit h-fit"
        @mouseenter="show = true"
        @mouseleave="show = false"
        @focusin="show = true"
        @focusout="show = false"
    >
        <slot />
        <Teleport to="body">
            <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
            >
                <div
                    v-if="show && content"
                    ref="floating"
                    class="z-100 px-3 py-2 text-sm bg-primary rounded-xl text-on-primary w-max max-w-50 text-center shadow-lg origin-center pointer-events-none"
                    :style="[
                        floatingStyles,
                        { fontFamily: '&quot;ChillRoundF&quot;, sans-serif' },
                    ]"
                >
                    {{ content }}
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useFloating, offset, flip, shift, autoUpdate } from "@floating-ui/vue";

const props = withDefaults(
    defineProps<{
        content?: string;
    }>(),
    {
        content: "",
    },
);

const show = ref(false);
const reference = ref(null);
const floating = ref(null);

const { floatingStyles } = useFloating(reference, floating, {
    placement: "top",
    middleware: [offset(10), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
    transform: false,
});
</script>
