<template>
    <main
        class="w-full mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 xl:max-w-5xl"
    >
        <header class="text-center mb-12">
            <h1
                class="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl"
            >
                {{ t("pages.about.timeline") }}
            </h1>
        </header>

        <div class="space-y-4">
            <TimelineCard
                v-for="(item, index) in timelineData"
                :key="index"
                :item="item"
                class="transition-colors duration-200 hover:bg-on-background/5 rounded-2xl"
            />
        </div>
    </main>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useNavTitle } from "~/composables/useNavTitle";
import { timelineData } from "~/data/timeline";
import TimelineCard from "~/components/TimelineCard.vue";

const { t } = useI18n();
const { reset: resetNavTitle } = useNavTitle();

resetNavTitle();

useHead(() => ({
    title: t("pages.about.timeline"),
}));
</script>
