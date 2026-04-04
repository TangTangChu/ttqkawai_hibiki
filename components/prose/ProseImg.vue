<template>
    <img
        ref="imgRef"
        :src="src"
        :alt="alt"
        :title="title"
        class="md-zoomable-img cursor-zoom-in rounded-xl"
        @click="handleClick"
    />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useImageViewer } from "~/composables/useImageViewer";

const props = defineProps<{
    src?: string;
    alt?: string;
    title?: string;
}>();

const imgRef = ref<HTMLImageElement | null>(null);
const { openViewer } = useImageViewer();

const handleClick = () => {
    if (!imgRef.value) return;

    const wrapper = imgRef.value.closest(".markdown-wrapper");
    const currentSrc = props.src || "";
    if (!wrapper) {
        openViewer(0, [currentSrc]);
        return;
    }

    const imgElements = Array.from(
        wrapper.querySelectorAll(".md-zoomable-img"),
    ) as HTMLImageElement[];
    const images = imgElements.map((img) => img.src);
    const index = imgElements.indexOf(imgRef.value);

    openViewer(
        index > -1 ? index : 0,
        images.length > 0 ? images : [currentSrc],
    );
};
</script>
