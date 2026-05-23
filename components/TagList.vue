<template>
    <div class="flex flex-wrap gap-2">
        <span
            v-for="tag in tags"
            :key="tag"
            class="inline-flex items-center text-xs font-medium text-on-background/50 transition-colors duration-200"
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
