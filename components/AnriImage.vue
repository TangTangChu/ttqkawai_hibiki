<template>
    <div
        class="relative overflow-hidden rounded-[inherit]"
        :class="[
            wrapperClass,
            wFull && hFull ? 'w-full h-full' : 'inline-block',
        ]"
    >
        <div
            v-if="isLoading"
            class="absolute inset-0 flex items-center justify-center bg-on-background/5 rounded-[inherit]"
            :class="{ 'min-h-32': !hFull }"
        >
            <AnriSpinner :size="spinnerSize" />
        </div>
        <div
            v-else-if="isError"
            class="absolute inset-0 flex items-center justify-center bg-on-background/5 text-on-background/20 rounded-[inherit]"
            :class="{ 'min-h-32': !hFull }"
        >
            <PhotoIcon :class="errorIconSize" />
        </div>
        <img
            v-bind="$attrs"
            :src="safeSrc"
            class="transition-opacity duration-300 rounded-[inherit]"
            :class="[
                imgClass,
                {
                    'opacity-0': isLoading || isError,
                    'opacity-100': !isLoading && !isError,
                    'w-full h-full': wFull && hFull,
                },
            ]"
            @load="onLoad"
            @error="onError"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { PhotoIcon } from "@heroicons/vue/24/outline";

defineOptions({
    inheritAttrs: false,
});

const props = withDefaults(
    defineProps<{
        src?: string;
        spinnerSize?: "sm" | "md" | "lg" | "xl";
        wrapperClass?: string;
        imgClass?: string;
        wFull?: boolean;
        hFull?: boolean;
    }>(),
    {
        spinnerSize: "md",
        wFull: true,
        hFull: true,
    },
);

const ensureHttps = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http://")) {
        return url.replace("http://", "https://");
    }
    return url;
};

const safeSrc = computed(() => ensureHttps(props.src));

const { getStatus, setStatus } = useImageCache();

const isLoading = ref(true);
const isError = ref(false);

const initStatus = () => {
    const url = safeSrc.value;
    if (!url) {
        isLoading.value = false;
        return;
    }

    const status = getStatus(url);
    if (status === "loaded") {
        isLoading.value = false;
        isError.value = false;
    } else if (status === "error") {
        isError.value = true;
        isLoading.value = false;
    } else {
        isLoading.value = true;
        isError.value = false;
    }
};

initStatus();

const errorIconSize = computed(() => {
    switch (props.spinnerSize) {
        case "sm":
            return "h-5 w-5";
        case "md":
            return "h-8 w-8";
        case "lg":
            return "h-12 w-12";
        case "xl":
            return "h-16 w-16";
        default:
            return "h-8 w-8";
    }
});

const onLoad = () => {
    if (safeSrc.value) {
        setStatus(safeSrc.value, "loaded");
    }
    isLoading.value = false;
    isError.value = false;
};

const onError = () => {
    if (safeSrc.value) {
        setStatus(safeSrc.value, "error");
    }
    isLoading.value = false;
    isError.value = true;
};

watch(
    () => safeSrc.value,
    (newSrc) => {
        if (!newSrc) {
            isLoading.value = false;
            isError.value = false;
            return;
        }

        const status = getStatus(newSrc);
        if (status === "loaded") {
            isLoading.value = false;
            isError.value = false;
        } else if (status === "error") {
            isLoading.value = false;
            isError.value = true;
        } else {
            isLoading.value = true;
            isError.value = false;
        }
    },
);

watch(
    () => (safeSrc.value ? getStatus(safeSrc.value) : undefined),
    (newStatus) => {
        if (newStatus === "loaded") {
            isLoading.value = false;
            isError.value = false;
        } else if (newStatus === "error") {
            isLoading.value = false;
            isError.value = true;
        }
    },
);
</script>
