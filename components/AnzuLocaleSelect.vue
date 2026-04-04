<template>
    <AnzuDropdown widthClass="w-32" align="right">
        <template #trigger="{ toggle, isOpen }">
            <button
                @click="toggle"
                class="p-2 rounded-lg text-on-background/70 hover:bg-primary/5 hover:text-primary transition-colors flex items-center justify-center gap-1"
                :class="{ 'bg-primary/5 text-primary': isOpen }"
                :title="$t('common.actions.switchLanguage')"
            >
                <LanguageIcon class="w-5 h-5" />
                <span v-if="showText" class="text-sm font-medium">{{
                    currentLocaleName
                }}</span>
            </button>
        </template>

        <template #menu="{ close }">
            <button
                v-for="loc in availableLocales"
                :key="loc.code"
                @click="switchLocale(loc.code, close)"
                class="flex items-center px-3 py-2 rounded-lg text-sm transition-colors text-left"
                :class="[
                    locale === loc.code
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-on-background hover:bg-surface-container hover:text-primary',
                ]"
            >
                {{ loc.name }}
            </button>
        </template>
    </AnzuDropdown>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { LanguageIcon } from "@heroicons/vue/24/outline";
import AnzuDropdown from "~/components/AnzuDropdown.vue";

const props = withDefaults(
    defineProps<{
        showText?: boolean;
    }>(),
    {
        showText: false,
    },
);

const { locale, setLocale } = useI18n();

const availableLocales: { code: "zh" | "en" | "ja"; name: string }[] = [
    { code: "zh", name: "简体中文" },
    { code: "en", name: "English" },
    { code: "ja", name: "日本語" },
];

const currentLocaleName = computed(() => {
    return (
        availableLocales.find((l) => l.code === locale.value)?.name ||
        "Language"
    );
});

const switchLocale = (code: "zh" | "en" | "ja", close: () => void) => {
    setLocale(code);
    close();
};
</script>
