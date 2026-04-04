<template>
    <li class="list-none mb-4 block w-full">
        <NuxtLink
            :to="linkto"
            class="group relative flex w-full flex-col justify-between gap-3 rounded-xl p-4 md:p-6 transition-all duration-200 ease-out before:absolute before:inset-0 before:z-[-1] before:scale-[0.92] before:rounded-2xl before:bg-secondary before:opacity-0 before:backdrop-blur-md before:transition-all before:duration-200 hover:translate-x-2 hover:before:scale-100 hover:before:opacity-20 dark:hover:before:opacity-40 md:flex-row md:items-center"
            :style="{ '--origin-x': `${(title.length * 13) % 100}%`, '--origin-y': `${(title.length * 7) % 30}%`, 'transform-origin': 'var(--origin-x) var(--origin-y)' }"
        >
            <div class="flex-1 min-w-0">
                <div class="flex items-start gap-3 mb-2">
                    <span
                        v-if="istop"
                        class="mt-1 inline-flex shrink-0 items-center justify-center rounded bg-tertiary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-background"
                    >
                        {{ t("pages.archive.badges.top") }}
                    </span>
                    <h3
                        class="text-lg font-bold leading-snug tracking-tight text-on-background sm:text-xl wrap-break-word"
                        :title="title"
                    >
                        {{ title }}
                    </h3>
                </div>

                <p
                    v-if="summary"
                    class="mb-3 line-clamp-2 text-sm leading-relaxed text-on-background/70"
                >
                    {{ summary }}
                </p>

                <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div
                        v-if="datetime"
                        class="flex items-center text-xs font-medium text-on-background/50"
                    >
                        <CalendarIcon
                            class="mr-1.5 h-3.5 w-3.5"
                            aria-hidden="true"
                        />
                        <time :datetime="rawDate || datetime">{{
                            datetime
                        }}</time>
                    </div>

                    <TagList v-if="tags && tags.length > 0" :tags="tags" />
                </div>
            </div>

            <div class="hidden shrink-0 items-center justify-center md:flex">
                <div
                    class="flex h-10 w-10 -translate-x-2.5 items-center justify-center rounded-full text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                    aria-hidden="true"
                >
                    <ChevronRightIcon class="h-5 w-5" />
                </div>
            </div>
        </NuxtLink>
    </li>
</template>

<script setup lang="ts">
import { CalendarIcon, ChevronRightIcon } from "@heroicons/vue/20/solid";
import TagList from "./TagList.vue";

const { t } = useI18n();

withDefaults(
    defineProps<{
        title: string;
        linkto: string;
        datetime?: string;
        rawDate?: string;
        summary?: string;
        tags?: string[];
        istop?: boolean;
    }>(),
    {
        datetime: "",
        rawDate: "",
        summary: "",
        tags: () => [],
        istop: false,
    },
);
</script>
