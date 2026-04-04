<template>
    <section
        class="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl flex-col items-center justify-center px-4 text-center"
    >
        <img
            src="https://img.tantanchugasuki.cn/i/r/avatar"
            alt="Avatar"
            class="h-32 w-32 rounded-xl object-cover md:h-40 md:w-40"
        />

        <h1
            class="mt-8 text-5xl font-extrabold tracking-wide text-primary md:text-7xl"
        >
            {{ t("site.title") }}
        </h1>

        <p
            class="mt-6 max-w-4xl text-3xl font-semibold leading-tight text-on-background md:text-5xl"
        >
            {{ t("site.slogan") }}
        </p>

        <div class="mt-8 flex gap-4">
            <a
                v-for="link in socialLinks"
                :key="link.name"
                :href="link.href"
                target="_blank"
                rel="noopener noreferrer"
                class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:bg-primary hover:text-on-primary transition-colors duration-300"
                :title="link.name"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    class="h-6 w-6 fill-current"
                >
                    <path :d="link.path" />
                </svg>
            </a>
        </div>
    </section>
</template>

<script setup lang="ts">
import { useHead } from "#imports";
import { useI18n } from "vue-i18n";
import { socialLinks } from "~/data/socialLinks";

const { t } = useI18n();

useHead(() => ({
    title: t("site.title"),
}));
</script>
