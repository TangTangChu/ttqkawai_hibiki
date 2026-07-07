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
                class="fixed inset-0 bg-surface/50 backdrop-blur-[2px]"
                :class="zIndexClass"
                @mousedown.self="handleBackdropClick"
            >
                <slot />
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onUnmounted } from "vue";

const props = withDefaults(
    defineProps<{
        modelValue: boolean;
        closeOnBackdrop?: boolean;
        zIndex?: number;
    }>(),
    {
        closeOnBackdrop: true,
        zIndex: 100,
    },
);

const emit = defineEmits<{
    (e: "update:modelValue", value: boolean): void;
}>();

const zIndexClass = computed(() => {
    const map: Record<number, string> = {
        40: "z-40",
        50: "z-50",
        100: "z-100",
    };
    return map[props.zIndex] || "z-100";
});

const handleBackdropClick = () => {
    if (props.closeOnBackdrop) {
        emit("update:modelValue", false);
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
