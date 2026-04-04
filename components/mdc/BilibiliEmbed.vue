<template>
    <div
        v-if="srcUrl"
        class="my-4 overflow-hidden rounded-2xl border border-primary/10 bg-surface/80 shadow-sm"
    >
        <iframe
            :src="srcUrl"
            scrolling="no"
            border="0"
            frameborder="no"
            framespacing="0"
            allowfullscreen="true"
            class="block aspect-video w-full"
        />
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
    identifier?: string;
}>();

const srcUrl = computed(() => {
    const rawIdentifier = props.identifier || "";
    const identifier = rawIdentifier.trim();
    if (!identifier) return "";

    if (identifier.startsWith("BV")) {
        return `//player.bilibili.com/player.html?bvid=${identifier}&page=1&high_quality=1&danmaku=0`;
    }

    if (identifier.startsWith("av")) {
        return `//player.bilibili.com/player.html?aid=${identifier.slice(2)}&page=1&high_quality=1&danmaku=0`;
    }

    return "";
});
</script>
