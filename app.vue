<script setup lang="ts">
import { useHead } from "#imports";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

useHead(() => ({
    titleTemplate: (titleChunk) => {
        const siteTitle = t("site.title");
        return titleChunk && titleChunk !== siteTitle
            ? `${titleChunk} | ${siteTitle}`
            : siteTitle;
    },
}));
</script>

<template>
    <div class="contents">
        <NuxtLayout>
            <NuxtRouteAnnouncer />
            <AnriPageTransition />
            <NuxtPage />
            <AnriLightbox />
        </NuxtLayout>
        <MusicPlayer />
    </div>
</template>
