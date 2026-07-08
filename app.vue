<script setup lang="ts">
import { useHead, useServerSeoMeta } from "#imports";
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

useServerSeoMeta({
    ogImage: "https://img.tantanchugasuki.cn/i/r/avatar",
    twitterCard: "summary",
    ogType: "website",
    ogSiteName: "糖糖毬的个人站",
});

useHead({
    script: [
        {
            type: "application/ld+json",
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "糖糖毬的个人站",
                "url": "https://tantanchugasuki.cn",
            }),
        },
    ],
});
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
