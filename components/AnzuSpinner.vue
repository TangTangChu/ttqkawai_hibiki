<template>
    <div
        class="inline-block animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        :class="[sizeClass, colorClass]"
        role="status"
    >
        <span
            class="absolute! -m-px! h-px! w-px! overflow-hidden! whitespace-nowrap! border-0! p-0! [clip:rect(0,0,0,0)]!"
        >
            {{ t("common.status.loading") }}
        </span>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const { t } = useI18n();

const props = defineProps({
    size: {
        type: String,
        default: "md",
        validator: (value: string) => ["sm", "md", "lg", "xl"].includes(value),
    },
    color: {
        type: String,
        default: "primary",
    },
});

const sizeClass = computed(() => {
    switch (props.size) {
        case "sm":
            return "h-4 w-4 border-2";
        case "md":
            return "h-8 w-8 border-4";
        case "lg":
            return "h-12 w-12 border-4";
        case "xl":
            return "h-16 w-16 border-4";
        default:
            return "h-8 w-8 border-4";
    }
});

const colorClass = computed(() => {
    if (props.color === "primary") return "text-primary";
    if (props.color === "secondary") return "text-secondary";
    if (props.color === "white") return "text-white";
    return `text-${props.color}`;
});
</script>
