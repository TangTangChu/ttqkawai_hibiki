<template>
    <main class="w-full mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 xl:max-w-5xl">
        <header class="text-center mb-12">
            <h1 class="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
                {{ t("menu.about") }}
            </h1>
        </header>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <NuxtLink 
                to="/about/favorites" 
                class="flex items-center gap-4 p-4 rounded-xl bg-surface/50"
            >
                <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <HeartIcon class="w-6 h-6" />
                </div>
                <div class="flex-1 min-w-0">
                    <h2 class="text-lg font-bold text-on-background truncate">
                        {{ t("menu.favorites") }}
                    </h2>
                </div>
            </NuxtLink>
        </div>

        <div>有缘再写</div>
    </main>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useNavTitle } from "~/composables/useNavTitle";
import { HeartIcon } from "@heroicons/vue/24/outline";

const { t } = useI18n();
const { reset: resetNavTitle } = useNavTitle();

resetNavTitle();

useHead(() => ({
    title: t("menu.about"),
}));
</script>
