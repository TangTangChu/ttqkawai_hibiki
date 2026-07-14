<template>
    <div :class="['markdown-alert', colorClass, { 'markdown-alert-row': !title }]">
        <div v-if="title" class="markdown-alert-title">
            <component
                :is="iconComponent"
                class="alert-icon"
                aria-hidden="true"
            />
            <span>{{ title }}</span>
        </div>
        <component
            v-else
            :is="iconComponent"
            class="alert-icon"
            aria-hidden="true"
        />
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

<style>
/* Alert 提示框：自包含全局样式，可脱离 markdown 独立使用。 */
.markdown-alert {
    --alert-bg-opacity: 15%;
    --fgColor-default: var(--on-surface);
    --fgColor-success: #4cd48a;
    --fgColor-danger: #fe728a;
    margin: 16px 0;
    padding: 14px 16px;
    border-radius: 12px;
}

.dark .markdown-alert {
    --alert-bg-opacity: 10%;
    --fgColor-success: #4cc785;
    --fgColor-danger: #ea647a;
}

.markdown-alert-title {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    font-weight: 600;
    line-height: 1.35;
}

.markdown-alert .alert-icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    flex-shrink: 0;
}

/* 无标题：图标与文本同一行（对齐 archive 语言回退提示的紧凑样式） */
.markdown-alert-row {
    display: flex;
    align-items: center;
}

.markdown-alert .markdown-alert-content > :first-child {
    margin-top: 0;
}

.markdown-alert .markdown-alert-content > :last-child {
    margin-bottom: 0;
}

.markdown-alert.alert-info {
    background-color: color-mix(in srgb, var(--secondary) var(--alert-bg-opacity), transparent);
}

.markdown-alert.alert-info .alert-icon,
.markdown-alert.alert-info .markdown-alert-title {
    color: var(--secondary);
}

.markdown-alert.alert-info .markdown-alert-content {
    color: color-mix(in srgb, var(--secondary) 80%, var(--fgColor-default) 20%);
}

.markdown-alert.alert-succ {
    background-color: color-mix(in srgb, var(--fgColor-success) var(--alert-bg-opacity), transparent);
}

.markdown-alert.alert-succ .alert-icon,
.markdown-alert.alert-succ .markdown-alert-title {
    color: var(--fgColor-success);
}

.markdown-alert.alert-succ .markdown-alert-content {
    color: color-mix(in srgb, var(--fgColor-success) 80%, var(--fgColor-default) 20%);
}

.markdown-alert.alert-warn {
    /* 橘色告警：对齐 archive 语言回退提示（Tailwind orange 500/600/400），比 tertiary 黄更易读且非琥珀 */
    --alert-warn-text: oklch(64.6% 0.222 41.116); /* orange-600 */
    background-color: color-mix(in srgb, oklch(70.5% 0.213 47.604) var(--alert-bg-opacity), transparent); /* orange-500 */
}

.dark .markdown-alert.alert-warn {
    --alert-warn-text: oklch(75% 0.183 55.934); /* orange-400 */
}

.markdown-alert.alert-warn .alert-icon,
.markdown-alert.alert-warn .markdown-alert-title,
.markdown-alert.alert-warn .markdown-alert-content {
    color: var(--alert-warn-text);
}

.markdown-alert.alert-error {
    background-color: color-mix(in srgb, var(--fgColor-danger) var(--alert-bg-opacity), transparent);
}

.markdown-alert.alert-error .alert-icon,
.markdown-alert.alert-error .markdown-alert-title {
    color: var(--fgColor-danger);
}

.markdown-alert.alert-error .markdown-alert-content {
    color: color-mix(in srgb, var(--fgColor-danger) 80%, var(--fgColor-default) 20%);
}

.markdown-alert.alert-important {
    background-color: color-mix(in srgb, var(--primary) var(--alert-bg-opacity), transparent);
}

.markdown-alert.alert-important .alert-icon,
.markdown-alert.alert-important .markdown-alert-title {
    color: var(--primary);
}

.markdown-alert.alert-important .markdown-alert-content {
    color: color-mix(in srgb, var(--primary) 80%, var(--fgColor-default) 20%);
}

.markdown-alert.alert-plain {
    background-color: color-mix(in srgb, var(--surface-container) var(--alert-bg-opacity), transparent);
}

.markdown-alert.alert-plain .alert-icon,
.markdown-alert.alert-plain .markdown-alert-title {
    color: var(--fgColor-default);
}

.markdown-alert.alert-plain .markdown-alert-content {
    color: var(--fgColor-default);
    margin-top: 0;
}
</style>
