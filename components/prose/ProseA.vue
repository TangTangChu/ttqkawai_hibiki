<template>
    <component :is="linkTag" v-bind="linkProps">
        <slot />
    </component>
</template>

<script setup lang="ts">
import { computed, useAttrs } from "vue";
import type { RouteLocationRaw } from "vue-router";

defineOptions({
    inheritAttrs: false,
});

const props = defineProps<{
    href?: string;
    target?: string;
}>();

const attrs = useAttrs();
const href = computed(() => props.href || "");
const isExternal = computed(() => /^(https?:)?\/\//.test(href.value));
const isAnchor = computed(() => href.value.startsWith("#"));
const linkTag = computed(() => {
    if (href.value && !isExternal.value && !isAnchor.value) {
        return "NuxtLink";
    }

    return "a";
});
const relValue = computed(() => {
    return props.target === "_blank" ? "noopener noreferrer" : "";
});

const baseAttrs = computed<Record<string, unknown>>(() => {
    const targetValue = props.target || "";
    const rel = relValue.value;
    const result = Object.assign({}, attrs);

    if (targetValue) {
        result.target = targetValue;
    }

    if (rel) {
        result.rel = rel;
    }

    return result;
});

const linkProps = computed(() => {
    if (linkTag.value === "NuxtLink") {
        return Object.assign({}, baseAttrs.value, {
            to: href.value as RouteLocationRaw,
        });
    }

    return Object.assign({}, baseAttrs.value, {
        href: href.value,
    });
});
</script>
