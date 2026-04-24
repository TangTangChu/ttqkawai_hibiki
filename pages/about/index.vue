<template>
    <main
        class="w-full mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 xl:max-w-5xl"
    >
        <header class="text-center mb-12">
            <h1
                class="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl"
            >
                {{ t("menu.about") }}
            </h1>
        </header>

        <div
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-16"
        >
            <NuxtLink
                to="/about/favorites"
                class="flex items-center gap-4 p-4 rounded-xl bg-surface/50 transition-colors duration-200 hover:bg-on-background/5"
            >
                <div
                    class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
                >
                    <HeartIcon class="w-6 h-6" />
                </div>
                <div class="flex-1 min-w-0">
                    <h2 class="text-lg font-bold text-on-background truncate">
                        {{ t("menu.favorites") }}
                    </h2>
                </div>
            </NuxtLink>
            <NuxtLink
                to="/about/timeline"
                class="flex items-center gap-4 p-4 rounded-xl bg-surface/50 transition-colors duration-200 hover:bg-on-background/5"
            >
                <div
                    class="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary"
                >
                    <ClockIcon class="w-6 h-6" />
                </div>
                <div class="flex-1 min-w-0">
                    <h2 class="text-lg font-bold text-on-background truncate">
                        {{ t("pages.about.timeline") }}
                    </h2>
                </div>
            </NuxtLink>
        </div>
        <div class="flex flex-col md:flex-row items-center gap-8 mb-16">
            <div class="relative shrink-0">
                <img
                    src="https://img.tantanchugasuki.cn/i/r/avatar"
                    alt="Avatar"
                    class="w-32 h-32 rounded object-cover"
                />
            </div>
            <div class="flex-1 text-center md:text-left min-w-0">
                <h2
                    class="text-4xl font-extrabold tracking-tight text-on-background sm:text-5xl"
                >
                    {{ t("site.name") }}
                </h2>
                <p class="mt-2 text-lg text-on-background/60 italic">
                    {{ t("site.slogan") }}
                </p>
                <div
                    class="flex flex-wrap justify-center md:justify-start gap-2 mt-4"
                >
                    <span
                        v-for="tag in myTags"
                        :key="tag"
                        class="px-3 py-1 rounded-xl bg-secondary/10 text-secondary text-sm font-medium transition-colors duration-200 hover:bg-secondary/20"
                    >
                        <TagIcon
                            class="inline-block w-3.5 h-3.5 mr-1 align-text-top opacity-50"
                        />
                        {{ tag }}
                    </span>
                </div>
            </div>
        </div>
        <section class="mt-10">
            <h2 class="text-2xl font-bold text-on-background">
                {{ t("pages.about.aboutMe") }}
            </h2>
            <article class="text-on-background/70 leading-relaxed space-y-4">
                <p>Ciallo～(∠・ω<)⌒★</p>
            </article>
        </section>
        <section class="mt-10">
            <h2 class="text-2xl font-bold text-on-background">
                {{ t("pages.about.university") }}
            </h2>
            <div class="space-y-4 text-on-background/70">
                <div class="flex items-center gap-2">
                    <BookOpenIcon class="w-5 h-5 opacity-40" />
                    <span>{{ t("pages.about.major") }}</span>
                </div>
            </div>
            <div
                class="mt-2 p-8 rounded-2xl bg-surface-variant/30 border border-on-background/5"
            >
                <div class="flex items-center justify-between mb-4">
                    <span
                        class="text-sm font-bold text-on-background/50 uppercase tracking-widest"
                        >Progress</span
                    >
                    <span class="text-2xl font-black text-primary"
                        >{{ universityProgress }}%</span
                    >
                </div>
                <div
                    class="w-full bg-on-background/5 rounded-xl h-2 overflow-hidden shadow-inner font-mono"
                >
                    <div
                        class="bg-primary h-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]"
                        :style="{ width: `${universityProgress}%` }"
                    ></div>
                </div>
            </div>
        </section>
    </main>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useNavTitle } from "~/composables/useNavTitle";
import {
    HeartIcon,
    ClockIcon,
    TagIcon,
    BookOpenIcon,
} from "@heroicons/vue/24/outline";

const { t } = useI18n();
const { reset: resetNavTitle } = useNavTitle();

resetNavTitle();

useHead(() => ({
    title: t("menu.about"),
}));

const enrollDate = new Date("2024-09-07");
const graduateDate = new Date("2028-06-30");
const now = new Date();

const universityProgress = computed(() => {
    const total = graduateDate.getTime() - enrollDate.getTime();
    const passed = now.getTime() - enrollDate.getTime();
    const progress = Math.min(100, Math.max(0, (passed / total) * 100));
    return parseFloat(progress.toFixed(2));
});

const myTags = ref(["ACGN", "不想长大", "卷个屁"]);
</script>
