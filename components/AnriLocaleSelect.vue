<template>
    <AnriSelect
        :model-value="locale"
        :options="localeOptions"
        width-class="w-32"
        align="right"
        @update:model-value="switchLocale"
    >
        <template #trigger="{ toggle, isOpen }">
            <button
                @click="toggle"
                class="p-2 rounded-lg text-on-background/70 hover:bg-primary/5 hover:text-primary transition-colors flex items-center justify-center gap-1"
                :class="{ 'bg-primary/5 text-primary': isOpen }"
                :title="$t('common.action.switchLanguage')"
            >
                <LanguageIcon class="w-5 h-5" />
                <span v-if="showText" class="text-sm font-medium">{{
                    currentLocaleName
                }}</span>
            </button>
        </template>
    </AnriSelect>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { LanguageIcon } from "@heroicons/vue/24/outline";
import AnriSelect from "~/components/AnriSelect.vue";

withDefaults(
    defineProps<{
        showText?: boolean;
    }>(),
    {
        showText: false,
    },
);

type LocaleCode = "zh" | "en" | "ja";

const { locale, setLocale } = useI18n();

const availableLocales: { code: LocaleCode; name: string }[] = [
    { code: "zh", name: "简体中文" },
    { code: "en", name: "English" },
    { code: "ja", name: "日本語" },
];

const localeOptions = availableLocales.map(({ code, name }) => ({
    value: code,
    label: name,
}));

const currentLocaleName = computed(
    () =>
        availableLocales.find((item) => item.code === locale.value)?.name ?? "",
);

const switchLocale = (code: string | number): void => {
    setLocale(code as LocaleCode);
};
</script>
