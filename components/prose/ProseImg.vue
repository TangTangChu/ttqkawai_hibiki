<template>
    <div class="relative flex justify-center w-full">
        <AnriImage
            ref="imgRef"
            :src="src"
            :alt="alt"
            :title="title"
            :w-full="false"
            :h-full="false"
            :style="style"
            class="md-zoomable-img cursor-zoom-in rounded-xl"
            @click="handleClick"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useImageViewer } from "~/composables/useImageViewer";

const props = defineProps<{
    src?: string;
    alt?: string;
    title?: string;
    width?: string | number;
    height?: string | number;
}>();

const style = computed(() => {
    const s: any = {};
    if (props.width) {
        s.width =
            typeof props.width === "number" ? `${props.width}px` : props.width;
    }
    if (props.height) {
        s.height =
            typeof props.height === "number"
                ? `${props.height}px`
                : props.height;
    }
    return s;
});

const imgRef = ref<any>(null);
const { openViewer } = useImageViewer();

const handleClick = () => {
    const el = imgRef.value?.$el;
    if (!el) return;
    const img = el.querySelector("img");
    if (!img) return;

    const wrapper = el.closest(".markdown-wrapper");
    const currentSrc = props.src || "";
    if (!wrapper) {
        openViewer(0, [currentSrc]);
        return;
    }

    const imgElements = Array.from(
        wrapper.querySelectorAll(".md-zoomable-img img"),
    ) as HTMLImageElement[];
    const images = imgElements.map((img) => img.src);
    const index = imgElements.indexOf(img);

    openViewer(
        index > -1 ? index : 0,
        images.length > 0 ? images : [currentSrc],
    );
};
</script>
