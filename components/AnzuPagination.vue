<template>
    <nav
        class="my-8 flex items-center justify-center gap-2"
        :aria-label="t('common.pagination.navigation')"
    >
        <AnzuButton
            variant="soft"
            size="sm"
            :disabled="currentPage <= 1"
            :aria-label="t('common.pagination.previous')"
            @click="onPageChange(currentPage - 1)"
        >
            <template #icon>
                <ChevronLeftIcon class="h-4 w-4" />
            </template>
        </AnzuButton>

        <div class="flex items-center gap-1">
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
                    :aria-current="page === currentPage ? 'page' : undefined"
                    :aria-label="t('common.pagination.page', { page })"
                    @click="onPageChange(page)"
                >
                    {{ page }}
                </AnzuButton>
            </template>
        </div>

        <AnzuButton
            variant="soft"
            size="sm"
            iconPlacement="end"
            :disabled="currentPage >= totalPages"
            :aria-label="t('common.pagination.next')"
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
    }>(),
    {
        maxVisiblePages: 5,
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
</script>
