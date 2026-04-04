<template>
    <div
        class="my-4 rounded-2xl border border-primary/10 bg-surface/85 p-6 text-center"
    >
        <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
        >
            <ExclamationTriangleIcon class="h-6 w-6" />
        </div>

        <h3 class="mt-4 text-lg font-bold text-on-background">
            {{ title || t("common.feedback.errorTitle") }}
        </h3>

        <p class="mt-2 text-sm leading-6 text-on-background/65">
            {{ message || t("common.feedback.loadFailed") }}
        </p>

        <p
            v-if="errorData?.message"
            class="mt-3 rounded-xl bg-primary/5 px-3 py-2 text-xs font-medium wrap-break-word text-on-background/60"
        >
            {{ errorData.message }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { ExclamationTriangleIcon } from "@heroicons/vue/24/outline";

interface ErrorLike {
    message?: string;
    status?: number;
    name?: string;
    details?: Record<string, unknown>;
}

withDefaults(
    defineProps<{
        title?: string;
        message?: string;
        errorData?: ErrorLike | null;
    }>(),
    {
        title: "",
        message: "",
        errorData: null,
    },
);

const { t } = useI18n();
</script>
