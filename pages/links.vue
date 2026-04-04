<template>
    <main
        class="w-full mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 xl:max-w-5xl"
    >
        <header class="text-center mb-12">
            <h1
                class="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl"
            >
                {{ t("pages.links.title") }}
            </h1>
        </header>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <a
                v-for="(friend, index) in friends"
                :key="friend.name"
                :href="friend.url"
                target="_blank"
                rel="noopener noreferrer"
                class="relative flex items-center gap-4 cursor-pointer rounded-xl p-4 md:p-6 transition-all duration-200 ease-out before:absolute before:inset-0 before:z-[-1] before:scale-[0.92] before:rounded-2xl before:bg-secondary before:opacity-0 before:backdrop-blur-md before:transition-all before:duration-200 hover:translate-x-2 hover:before:scale-100 hover:before:opacity-20 dark:hover:before:opacity-40"
                :style="`--origin-x: ${(index * 13) % 100}%; --origin-y: ${(index * 7) % 30}%`"
                style="transform-origin: var(--origin-x) var(--origin-y)"
            >
                <div class="shrink-0">
                    <img
                        :src="friend.avatar"
                        :alt="friend.name"
                        class="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover"
                        loading="lazy"
                    />
                </div>
                <div class="flex-1 min-w-0">
                    <h2
                        class="text-xl font-bold text-on-background truncate mb-0.5"
                    >
                        {{ friend.name }}
                    </h2>
                    <p class="text-xs text-on-background/50 truncate mb-1.5 font-medium">
                        {{ friend.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') }}
                    </p>
                    <p
                        class="text-sm text-on-background/70 line-clamp-2 leading-relaxed"
                    >
                        {{ friend.description || "" }}
                    </p>
                </div>
            </a>
        </div>
    </main>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useNavTitle } from "~/composables/useNavTitle";
import { friends } from "~/data/friends";

const { t } = useI18n();
const { reset: resetNavTitle } = useNavTitle();

resetNavTitle();

useHead(() => ({
    title: t("pages.links.meta.title"),
}));
</script>
