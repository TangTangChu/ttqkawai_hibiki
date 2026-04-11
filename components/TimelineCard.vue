<template>
    <div
        class="group relative flex w-full flex-col gap-4 rounded-xl p-4 md:flex-row md:gap-6 md:p-6 transition-colors duration-200 ease-out hover:bg-on-background/5 mb-2 last:mb-0"
    >
        <div
            class="flex shrink-0 flex-row items-center gap-3 md:w-32 md:flex-col md:items-start md:gap-1.5 md:pt-1"
        >
            <time
                class="text-sm font-mono font-bold tracking-tight text-on-background"
            >
                {{ item.date }}
            </time>
            <span
                v-if="item.type"
                class="inline-flex items-center justify-center rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary"
            >
                {{ item.type }}
            </span>
        </div>
        <div class="flex-1 min-w-0 flex flex-col gap-2">
            <h3
                class="text-lg font-bold leading-snug tracking-tight text-on-background sm:text-xl wrap-break-word transition-colors group-hover:text-primary"
            >
                <a
                    v-if="item.link"
                    :href="item.link"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {{ item.title }}
                </a>
                <span v-else>{{ item.title }}</span>
            </h3>

            <div
                v-if="item.location"
                class="flex items-center gap-1.5 text-xs font-medium text-on-background/50"
            >
                <MapPinIcon class="h-3.5 w-3.5" aria-hidden="true" />
                <span>{{ item.location }}</span>
            </div>

            <p
                v-if="item.description"
                class="text-sm leading-relaxed text-on-background/70 mt-1"
            >
                {{ item.description }}
            </p>

            <div v-if="item.tags && item.tags.length > 0" class="mt-1">
                <span
                    v-for="tag in item.tags"
                    :key="tag"
                    class="inline-flex items-center rounded-lg bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary transition-colors duration-200 hover:bg-secondary/20 mr-2"
                >
                    <TagIcon class="mr-1 h-3 w-3" aria-hidden="true" />
                    {{ tag }}
                </span>
            </div>
            <div v-if="$slots.default" class="mt-2 text-on-background/80">
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { MapPinIcon, TagIcon } from "@heroicons/vue/20/solid";
import type { TimelineItem } from "~/data/timeline";

defineProps<{
    item: TimelineItem;
}>();
</script>
