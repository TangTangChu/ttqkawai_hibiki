<template>
    <div class="flex justify-center my-8">
        <AnzuButton 
            v-if="hasMore"
            variant="ghost"
            size="md"
            :loading="loading"
            @click="$emit('load-more')" 
            class="px-6 rounded-xl"
        >
            {{ loading ? t('common.label.loading') : t('common.action.loadMore') }}
        </AnzuButton>
        <span v-else class="text-on-background/40 text-sm">
            {{ t('common.label.noMore') }}
        </span>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import AnzuButton from "~/components/AnzuButton.vue";

const { t } = useI18n();

defineProps<{
    hasMore: boolean;
    loading: boolean;
}>();

defineEmits<{
    (e: 'load-more'): void;
}>();
</script>