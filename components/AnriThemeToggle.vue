<template>
    <button
        type="button"
        class="theme-toggle-button"
        title="切换主题"
        @click="toggleTheme"
    >
        <MoonIcon v-if="isDark" class="h-5 w-5" />
        <SunIcon v-else class="h-5 w-5" />
    </button>
</template>

<script setup lang="ts">
import { MoonIcon, SunIcon } from "@heroicons/vue/24/outline";
import useTheme from "~/composables/useTheme";

const { isDark, toggleTheme } = useTheme();
</script>

<style scoped>
@reference "tailwindcss";

.theme-toggle-button {
    @apply flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200;
    @apply text-(--primary) opacity-100;
    @apply hover:bg-(--primary)/5;
}
</style>
