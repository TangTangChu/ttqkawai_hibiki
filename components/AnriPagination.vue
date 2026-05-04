<template>
    <nav
        class="my-8 flex items-center justify-center gap-2"
        :aria-label="t('common.label.pagination')"
    >
        <AnzuButton
            variant="ghost"
            size="sm"
            :disabled="currentPage <= 1"
            :loading="loading"
            :aria-label="t('common.label.prevPage')"
            @click="onPageChange(currentPage - 1)"
        >
            <template #icon>
                <ChevronLeftIcon class="h-4 w-4" />
            </template>
        </AnzuButton>

        <div v-if="layout === 'default'" class="flex items-center gap-1">
            <template
                v-for="(page, index) in displayPages"
                :key="`${page}-${index}`"
            >
                <span
                    v-if="page === 'ellipsis'"
                    class="px-2 py-1 text-sm text-on-background/45"
                    aria-hidden="true"
                >
                    …
                </span>
                <AnzuButton
                    v-else
                    :variant="page === currentPage ? 'primary' : 'ghost'"
                    size="sm"
                    :disabled="loading"
                    :aria-current="page === currentPage ? 'page' : undefined"
                    :aria-label="t('common.label.page', { page })"
                    @click="onPageChange(page)"
                >
                    {{ page }}
                </AnzuButton>
            </template>
        </div>

        <div
            v-else-if="layout === 'compact'"
            class="flex items-center gap-1 mx-2"
        >
            <input
                type="number"
                :value="currentPage"
                @keyup.enter="handleInputPageChange"
                @blur="handleInputPageChange"
                min="1"
                :max="totalPages"
                class="w-12 h-9 text-center text-sm font-semibold rounded-xl bg-transparent text-on-background hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                :aria-label="t('common.label.pagination')"
            />
            <span class="text-sm font-semibold text-on-background/50 px-1"
                >/</span
            >
            <span class="text-sm font-semibold text-on-background/80 px-2">{{
                totalPages
            }}</span>
        </div>

        <AnzuButton
            variant="ghost"
            size="sm"
            iconPlacement="end"
            :disabled="currentPage >= totalPages"
            :loading="loading"
            :aria-label="t('common.label.nextPage')"
            @click="onPageChange(currentPage + 1)"
        >
            <template #icon>
                <ChevronRightIcon class="h-4 w-4" />
            </template>
        </AnzuButton>
    </nav>
</template>

<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";
import { computed } from "vue";
import AnzuButton from "./AnzuButton.vue";

const { t } = useI18n();

const props = withDefaults(
    defineProps<{
        currentPage: number;
        totalPages: number;
        maxVisiblePages?: number;
        loading?: boolean;
        layout?: "default" | "compact";
    }>(),
    {
        maxVisiblePages: 5,
        loading: false,
        layout: "default",
    },
);

const emit = defineEmits<{
    (e: "page-change", page: number): void;
}>();

const displayPages = computed((): Array<number | "ellipsis"> => {
    const total = props.totalPages;
    const current = props.currentPage;
    const max = props.maxVisiblePages;

    if (total <= max) {
        return Array.from({ length: total }, (_, index) => index + 1);
    }

    const pages: Array<number | "ellipsis"> = [];
    const half = Math.floor(max / 2);

    let start = current - half;
    let end = current + half;

    if (start <= 1) {
        start = 1;
        end = max;
    }

    if (end >= total) {
        end = total;
        start = total - max + 1;
    }

    if (start > 1) {
        pages.push(1);
        if (start > 2) {
            pages.push("ellipsis");
        }
    }

    for (let page = start; page <= end; page += 1) {
        pages.push(page);
    }

    if (end < total) {
        if (end < total - 1) {
            pages.push("ellipsis");
        }
        pages.push(total);
    }

    return pages;
});

const onPageChange = (page: number): void => {
    if (page === props.currentPage || page < 1 || page > props.totalPages) {
        return;
    }

    emit("page-change", page);
};

const handleInputPageChange = (evt: Event) => {
    const target = evt.target as HTMLInputElement;
    let page = parseInt(target.value, 10);

    if (isNaN(page)) {
        target.value = props.currentPage.toString();
        return;
    }

    if (page < 1) page = 1;
    if (page > props.totalPages) page = props.totalPages;

    target.value = page.toString();

    if (page !== props.currentPage) {
        onPageChange(page);
    }
};
</script>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
input[type="number"] {
    -moz-appearance: textfield;
}
</style>
