<template>
    <div
        v-if="parsed"
        class="js-gh-card my-3 block"
        :data-gh-key="linkKey"
        :data-gh-type="parsed.type"
        :data-gh-owner="parsed.owner"
        :data-gh-repo="parsed.repo || ''"
        :data-gh-number="parsed.number || ''"
        :data-gh-tag="parsed.tag || ''"
        data-gh-renderer="mdc"
    >
        <a
            :href="parsed.href"
            target="_blank"
            rel="noopener noreferrer"
            class="group block rounded-2xl border border-primary/10 bg-surface/80 p-4 text-on-background! no-underline! transition-[border-color,background-color] duration-200 hover:border-primary/20 hover:bg-primary/5"
        >
            <span class="flex items-center gap-3">
                <img
                    v-if="parsed.type === 'user'"
                    class="js-gh-image m-0 h-12 w-12 shrink-0 rounded-full object-cover shadow-none"
                    :src="previewImage"
                    alt="GitHub avatar"
                    loading="lazy"
                />
                <span class="block min-w-0 flex-1">
                    <span
                        class="js-gh-title block truncate text-base font-bold text-on-background"
                    >
                        {{ cardTitle }}
                    </span>
                    <span
                        class="js-gh-desc mt-0.5 block truncate text-sm text-on-background/60"
                    >
                        {{ parsed.href }}
                    </span>
                </span>
            </span>

            <img
                v-if="parsed.type !== 'user'"
                class="js-gh-image mt-3 hidden w-full rounded-xl object-contain shadow-none sm:block"
                :src="previewImage"
                alt="GitHub preview"
                loading="lazy"
            />

            <span class="mt-3 flex items-center justify-between gap-3">
                <span
                    class="js-gh-subtitle inline-flex items-center rounded-full border border-primary/10 px-2.5 py-1 text-[0.73rem] font-semibold leading-tight text-on-background/60"
                >
                    {{ cardSubtitle }}
                </span>

                <span
                    class="inline-flex min-w-0 items-center justify-end gap-2"
                >
                    <span
                        class="js-gh-stats hidden flex-wrap items-center justify-end gap-1.5 text-right text-[0.78rem] text-on-background/60 sm:inline-flex"
                    />
                    <span
                        class="js-gh-state text-[0.74rem] text-on-background/60 capitalize"
                    >
                        GitHub
                    </span>
                </span>
            </span>
        </a>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
    getCardSubTitle,
    getCardTitle,
    getLinkKey,
    getPreviewImage,
    parseGithubLink,
} from "~/utils/markdown-github-card";

const props = defineProps<{
    href: string;
}>();

const parsed = computed(() => parseGithubLink(props.href));
const linkKey = computed(() => (parsed.value ? getLinkKey(parsed.value) : ""));
const previewImage = computed(() =>
    parsed.value ? getPreviewImage(parsed.value) : "",
);
const cardTitle = computed(() =>
    parsed.value ? getCardTitle(parsed.value) : props.href,
);
const cardSubtitle = computed(() =>
    parsed.value ? getCardSubTitle(parsed.value) : "GitHub",
);
</script>
