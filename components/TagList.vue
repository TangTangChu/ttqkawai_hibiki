<template>
    <div class="flex flex-wrap gap-2">
        <span
            v-for="tag in tags"
            :key="tag"
            class="inline-flex items-center rounded-lg bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary transition-colors duration-200 hover:bg-secondary/20"
        >
            <TagIcon class="mr-1 h-3 w-3" aria-hidden="true" />
            {{ tag }}
        </span>
    </div>
</template>

<script setup lang="ts">
import { TagIcon } from "@heroicons/vue/20/solid";

withDefaults(
    defineProps<{
        tags?: string[];
    }>(),
    {
        tags: () => [],
    },
);
</script>
