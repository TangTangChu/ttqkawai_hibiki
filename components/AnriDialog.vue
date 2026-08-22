<template>
    <AnriOverlay v-model="modelValue">
        <div
            class="flex items-center justify-center p-4 sm:p-6 w-full h-full"
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
                    ref="dialogRef"
                    class="relative w-full max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] bg-surface/90 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl text-on-background flex flex-col"
                    :class="[maxWidthClass]"
                    role="dialog"
                    aria-modal="true"
                    :aria-labelledby="labelledBy"
                    tabindex="-1"
                >
                    <button
                        v-if="showCloseButton"
                        type="button"
                        class="absolute top-4 right-4 z-10 p-2 rounded-xl text-on-background/50 hover:bg-on-background/5 hover:text-on-background transition-all duration-200 ease-out"
                        :aria-label="t('common.action.close')"
                        @click="close"
                    >
                        <XMarkIcon class="w-5 h-5" />
                    </button>

                    <div class="min-h-0 overflow-y-auto overscroll-contain">
                        <slot></slot>
                    </div>
                </div>
            </Transition>
        </div>
    </AnriOverlay>
</template>

<script setup lang="ts">
import {
    computed,
    nextTick,
    onMounted,
    onUnmounted,
    ref,
    watch,
} from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "vue-i18n";
import AnriOverlay from "~/components/AnriOverlay.vue";

const { t } = useI18n();

const modelValue = defineModel<boolean>({ default: false });

const props = withDefaults(
    defineProps<{
        showCloseButton?: boolean;
        closeOnBackdrop?: boolean;
        maxWidth?:
            | "sm"
            | "md"
            | "lg"
            | "xl"
            | "2xl"
            | "3xl"
            | "4xl"
            | "5xl";
        labelledBy?: string;
    }>(),
    {
        showCloseButton: true,
        closeOnBackdrop: true,
        maxWidth: "md",
    },
);

const emit = defineEmits<{
    (e: "close"): void;
}>();

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

const dialogRef = ref<HTMLDivElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

const close = () => {
    modelValue.value = false;
    emit("close");
};

const handleBackdropClick = () => {
    if (props.closeOnBackdrop) {
        close();
    }
};

// 焦点陷阱：Tab 在对话框内部首尾循环，焦点外泄时拉回
const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const handleKeydown = (e: KeyboardEvent) => {
    if (!modelValue.value) return;
    const dialog = dialogRef.value;
    if (!dialog) return;

    if (e.key === "Escape") {
        close();
        return;
    }

    if (e.key !== "Tab") return;

    const focusables = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    if (focusables.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
    }

    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    const active = document.activeElement as HTMLElement | null;
    const inside = active !== null && dialog.contains(active);

    if (
        e.shiftKey &&
        (!inside || active === first || active === dialog)
    ) {
        e.preventDefault();
        last.focus();
    } else if (
        !e.shiftKey &&
        (!inside || active === last || active === dialog)
    ) {
        e.preventDefault();
        first.focus();
    }
};

watch(
    modelValue,
    (isOpen) => {
        if (typeof document === "undefined") return;
        if (isOpen) {
            previouslyFocused = document.activeElement as HTMLElement | null;
            nextTick(() => {
                if (dialogRef.value) {
                    dialogRef.value.focus();
                }
            });
        } else {
            if (previouslyFocused) {
                previouslyFocused.focus();
            }
            previouslyFocused = null;
        }
    },
);

onMounted(() => {
    document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
    document.removeEventListener("keydown", handleKeydown);
});
</script>
