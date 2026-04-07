<template>
    <div :class="['markdown-alert', colorClass]">
        <div v-if="title" class="markdown-alert-title">
            <component
                :is="iconComponent"
                class="alert-icon"
                aria-hidden="true"
            />
            <span>{{ title }}</span>
        </div>
        <div class="markdown-alert-content">
            <slot />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
    ExclamationCircleIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    LightBulbIcon,
    ShieldExclamationIcon,
    XCircleIcon,
} from "@heroicons/vue/24/outline";

const props = defineProps<{
    type?: "info" | "succ" | "warn" | "error" | "plain" | "important";
    title?: string;
}>();

const icons = {
    info: InformationCircleIcon,
    succ: CheckCircleIcon,
    warn: ExclamationTriangleIcon,
    error: XCircleIcon,
    plain: InformationCircleIcon,
    important: ExclamationCircleIcon,
} as const;

const labelIcons = {
    NOTE: InformationCircleIcon,
    TIP: LightBulbIcon,
    IMPORTANT: ExclamationCircleIcon,
    WARNING: ExclamationTriangleIcon,
    CAUTION: ShieldExclamationIcon,
} as const;

const colorClass = computed(() => `alert-${props.type || "plain"}`);
const iconComponent = computed(() => {
    const label = (props.title || "")
        .trim()
        .toUpperCase() as keyof typeof labelIcons;
    if (labelIcons[label]) {
        return labelIcons[label];
    }

    return icons[props.type || "plain"];
});
</script>
