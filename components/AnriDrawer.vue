<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition-opacity duration-300 ease-out"
            leave-active-class="transition-opacity duration-200 ease-in"
            enter-from-class="opacity-0"
            leave-to-class="opacity-0"
            appear
        >
            <div
                v-if="show"
                class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
                @click="emit('update:show', false)"
            />
        </Transition>
        <Transition
            enter-active-class="transition-transform duration-300 ease-out"
            leave-active-class="transition-transform duration-200 ease-in"
            enter-from-class="translate-y-full"
            leave-to-class="translate-y-full"
            appear
        >
            <div
                v-if="show"
                class="fixed right-0 bottom-0 left-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl border-t border-[color-mix(in_srgb,var(--on-surface)_10%,transparent)] bg-background p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:hidden"
            >
                <div class="mb-4 flex items-center justify-between">
                    <h2
                        v-if="title"
                        class="text-xl font-bold text-on-background"
                    >
                        {{ title }}
                    </h2>
                    <div v-else />

                    <button
                        v-if="showClose"
                        type="button"
                        class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--on-surface)_5%,transparent)] text-[color-mix(in_srgb,var(--on-surface)_70%,transparent)] transition-colors hover:bg-on-background/10 active:scale-95"
                        @click="emit('update:show', false)"
                    >
                        <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
                <div class="min-h-0 flex-1 overflow-y-auto">
                    <slot />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { XMarkIcon } from "@heroicons/vue/24/outline";

withDefaults(
    defineProps<{
        show: boolean;
        title?: string;
        showClose?: boolean;
    }>(),
    {
        show: false,
        showClose: true,
    },
);

const emit = defineEmits<{
    (e: "update:show", value: boolean): void;
}>();
</script>
