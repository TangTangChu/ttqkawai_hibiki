<template>
    <div
        ref="reference"
        class="relative"
        @mouseenter="show = true"
        @mouseleave="show = false"
        @focusin="show = true"
        @focusout="show = false"
    >
        <slot />
        <Teleport to="body">
            <Transition
                enter-active-class="transition-[opacity,scale] duration-200 ease-out"
                enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100"
                leave-active-class="transition-[opacity,scale] duration-150 ease-in"
                leave-from-class="opacity-100 scale-100"
                leave-to-class="opacity-0 scale-95"
            >
                <div
                    v-if="show && content"
                    ref="floating"
                    role="tooltip"
                    class="z-100 px-3 py-2 text-sm text-left leading-relaxed break-words bg-primary rounded-xl text-on-primary w-max max-w-xs shadow-lg origin-center pointer-events-none font-['ChillRoundF']"
                    :style="floatingStyles"
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
    middleware: [
        offset(10),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
    transform: false,
});
</script>
