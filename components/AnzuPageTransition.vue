<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const nuxtApp = useNuxtApp();

const isNavigating = ref(false);
const pendingPath = ref<string | null>(null);
const showBlocks = computed(() => {
    const activePath =
        isNavigating.value && pendingPath.value
            ? pendingPath.value
            : route.path;
    return activePath !== "/";
});

let removeBeforeEach: (() => void) | undefined;
let removeAfterEach: (() => void) | undefined;
let removePageStartHook: (() => void) | undefined;
let removePageFinishHook: (() => void) | undefined;

onMounted(() => {
    removeBeforeEach = router.beforeEach((to) => {
        pendingPath.value = to.path;
    });

    removeAfterEach = router.afterEach(() => {
        pendingPath.value = null;
    });

    removePageStartHook = nuxtApp.hook("page:start", () => {
        isNavigating.value = true;
    });

    removePageFinishHook = nuxtApp.hook("page:finish", () => {
        isNavigating.value = false;
        pendingPath.value = null;
    });
});

onBeforeUnmount(() => {
    removeBeforeEach?.();
    removeAfterEach?.();
    removePageStartHook?.();
    removePageFinishHook?.();
});
</script>

<template>
    <div
        class="fixed inset-0 -z-10 pointer-events-none overflow-hidden flex flex-col justify-between"
    >
        <div
            class="flex justify-around h-48 w-full transform transition-transform duration-300 ease-out motion-reduce:transition-none origin-top opacity-80"
            :class="showBlocks ? 'translate-y-0' : '-translate-y-full'"
        >
            <div
                class="w-20 sm:w-24 md:w-32 h-[150%] bg-[#b3e5fc]/80 transform -rotate-45 -translate-y-10 origin-top-left"
            ></div>
            <div
                class="hidden sm:block sm:w-24 md:w-32 h-[150%] bg-[#fff9c4]/80 transform -rotate-45 -translate-y-10 origin-top-left"
            ></div>
            <div
                class="w-20 sm:w-24 md:w-32 h-[150%] bg-[#f8bbd0]/80 transform -rotate-45 -translate-y-10 origin-top-left"
            ></div>
            <div
                class="hidden sm:block sm:w-24 md:w-32 h-[150%] bg-[#dcedc8]/80 transform -rotate-45 -translate-y-10 origin-top-left"
            ></div>
            <div
                class="w-20 sm:w-24 md:w-32 h-[150%] bg-[#ffccbc]/80 transform -rotate-45 -translate-y-10 origin-top-left"
            ></div>
        </div>
        <div
            class="flex justify-around h-48 w-full transform transition-transform duration-300 ease-out motion-reduce:transition-none origin-bottom opacity-80"
            :class="showBlocks ? 'translate-y-0' : 'translate-y-full'"
        >
            <div
                class="w-20 sm:w-24 md:w-32 h-[150%] bg-[#ffccbc]/80 transform -rotate-45 translate-y-10 origin-bottom-right"
            ></div>
            <div
                class="hidden sm:block sm:w-24 md:w-32 h-[150%] bg-[#dcedc8]/80 transform -rotate-45 translate-y-10 origin-bottom-right"
            ></div>
            <div
                class="w-20 sm:w-24 md:w-32 h-[150%] bg-[#f8bbd0]/80 transform -rotate-45 translate-y-10 origin-bottom-right"
            ></div>
            <div
                class="hidden sm:block sm:w-24 md:w-32 h-[150%] bg-[#fff9c4]/80 transform -rotate-45 translate-y-10 origin-bottom-right"
            ></div>
            <div
                class="w-20 sm:w-24 md:w-32 h-[150%] bg-[#b3e5fc]/80 transform -rotate-45 translate-y-10 origin-bottom-right"
            ></div>
        </div>
    </div>
</template>
