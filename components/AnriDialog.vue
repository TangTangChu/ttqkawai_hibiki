<template>
    <Teleport to="body">
        <Transition
            enter-active-class="transition-opacity duration-200 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-150 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div
                v-if="modelValue"
                class="fixed inset-0 z-100 flex items-center justify-center bg-surface/50 backdrop-blur-[2px] p-4 sm:p-6"
                @mousedown.self="handleBackdropClick"
            >
                <Transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="scale-95 opacity-0"
                    enter-to-class="scale-100 opacity-100"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="scale-100 opacity-100"
                    leave-to-class="scale-95 opacity-0"
                    appear
                >
                    <div
                        v-if="modelValue"
                        class="relative w-full bg-surface/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl text-on-background flex flex-col"
                        :class="[maxWidthClass]"
                        role="dialog"
                        aria-modal="true"
                    >
                        <button
                            v-if="showCloseButton"
                            type="button"
                            class="absolute top-4 right-4 z-10 p-2 rounded-xl text-on-background/50 hover:bg-on-background/5 hover:text-on-background transition-all duration-200 ease-out"
                            @click="close"
                            aria-label="Close modal"
                        >
                            <XMarkIcon class="w-5 h-5" />
                        </button>

                        <slot></slot>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onUnmounted } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    showCloseButton: {
        type: Boolean,
        default: true,
    },
    closeOnBackdrop: {
        type: Boolean,
        default: true,
    },
    maxWidth: {
        type: String,
        default: "md",
        validator: (val: string) =>
            ["sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"].includes(val),
    },
});

const emit = defineEmits(["update:modelValue", "close"]);

const maxWidthClass = computed(() => {
    const map: Record<string, string> = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        "3xl": "max-w-3xl",
        "4xl": "max-w-4xl",
        "5xl": "max-w-5xl",
    };
    return map[props.maxWidth] || "max-w-md";
});

const close = () => {
    emit("update:modelValue", false);
    emit("close");
};

const handleBackdropClick = () => {
    if (props.closeOnBackdrop) {
        close();
    }
};

watch(
    () => props.modelValue,
    (isOpen) => {
        if (typeof window !== "undefined") {
            if (isOpen) {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "";
            }
        }
    },
);

onUnmounted(() => {
    if (typeof window !== "undefined") {
        document.body.style.overflow = "";
    }
});
</script>
