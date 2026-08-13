<script setup lang="ts">
import { useHead } from "#imports";
import { useI18n } from "vue-i18n";
import { SITE_NAME } from "~/utils/seo";

const { t, locale, locales } = useI18n();
const config = useRuntimeConfig();

const htmlLang = computed(() => {
    const current = (locales.value as { code: string; iso: string }[]).find(
        (l) => l.code === locale.value,
    );
    return current?.iso ?? "zh-CN";
});

useHead(() => ({
    titleTemplate: (titleChunk) => {
        const siteTitle = t("site.title");
        return titleChunk && titleChunk !== siteTitle
            ? `${titleChunk} | ${siteTitle}`
            : siteTitle;
    },
    htmlAttrs: { lang: htmlLang.value },
}));

useHead({
    script: [
        {
            type: "application/ld+json",
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: SITE_NAME,
                url: config.public.siteUrl,
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
