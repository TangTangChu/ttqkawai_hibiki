<template>
    <figure class="flex flex-col items-center">
        <ProseImg :src="src" :alt="alt" />
        <figcaption
            v-if="caption"
            class="mt-2 text-center text-sm text-on-background/60"
        >
            {{ caption }}
        </figcaption>
    </figure>
</template>

<script setup lang="ts">
import ProseImg from "~/components/prose/ProseImg.vue";

defineProps<{
    src?: string;
    alt?: string;
    caption?: string;
}>();
</script>
