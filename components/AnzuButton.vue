<template>
    <component
        :is="tagName"
        v-bind="rootProps"
        :class="[
            baseClass,
            sizeClasses[props.size],
            variantClasses[props.variant],
            props.block ? 'w-full' : 'w-auto',
            props.disabled || props.loading
                ? 'pointer-events-none opacity-60'
                : 'cursor-pointer',
        ]"
    >
        <span
            v-if="(hasIcon || props.loading) && props.iconPlacement === 'start'"
            class="flex shrink-0 items-center justify-center"
            :class="iconBoxClasses[props.size]"
            aria-hidden="true"
        >
            <AnzuSpinner v-if="props.loading" size="sm" color="current" />
            <slot v-else name="icon" :class="iconClasses[props.size]" />
        </span>

        <span class="min-w-0 leading-none">
            <slot />
        </span>

        <span
            v-if="(hasIcon || props.loading) && props.iconPlacement === 'end'"
            class="flex shrink-0 items-center justify-center"
            :class="iconBoxClasses[props.size]"
            aria-hidden="true"
        >
            <AnzuSpinner v-if="props.loading" size="sm" color="current" />
            <slot v-else name="icon" :class="iconClasses[props.size]" />
        </span>
    </component>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";
import type { RouteLocationRaw } from "vue-router";
import AnzuSpinner from "./AnzuSpinner.vue";

type AnzuButtonVariant = "primary" | "soft" | "outline" | "ghost";
type AnzuButtonSize = "sm" | "md" | "lg";
type AnzuButtonType = "button" | "submit" | "reset";
type AnzuButtonIconPlacement = "start" | "end";

const props = withDefaults(
    defineProps<{
        to?: RouteLocationRaw;
        href?: string;
        target?: string;
        rel?: string;
        type?: AnzuButtonType;
        variant?: AnzuButtonVariant;
        size?: AnzuButtonSize;
        iconPlacement?: AnzuButtonIconPlacement;
        disabled?: boolean;
        loading?: boolean;
        block?: boolean;
    }>(),
    {
        type: "button",
        variant: "primary",
        size: "md",
        iconPlacement: "start",
        disabled: false,
        loading: false,
        block: false,
    },
);

const slots = useSlots();

const baseClass =
    "inline-flex min-w-0 items-center justify-center rounded-xl border font-semibold whitespace-nowrap align-middle select-none transition-[background-color,border-color,color,box-shadow] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20";

const sizeClasses: Record<AnzuButtonSize, string> = {
    sm: "min-h-9 gap-2 px-4 text-sm",
    md: "min-h-11 gap-2.5 px-5 text-sm",
    lg: "min-h-12 gap-3 px-6 text-base",
};

const variantClasses: Record<AnzuButtonVariant, string> = {
    primary:
        "border-primary/70 bg-primary text-on-primary hover:bg-primary/90 active:bg-primary/80",
    soft: "border-primary/10 bg-primary/10 text-primary hover:bg-primary/15 active:bg-primary/20",
    outline:
        "border-primary/20 bg-surface/80 text-primary hover:bg-primary/5 active:bg-primary/10",
    ghost: "border-transparent bg-transparent text-on-background hover:bg-primary/5 hover:text-primary active:bg-primary/10",
};

const iconBoxClasses: Record<AnzuButtonSize, string> = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-5 w-5",
};

const iconClasses: Record<AnzuButtonSize, string> = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-5 w-5",
};

const hasIcon = computed(() => Boolean(slots.icon));

const tagName = computed(() => {
    if (props.to) return "NuxtLink";
    if (props.href) return "a";
    return "button";
});

const rootProps = computed(() => {
    if (props.to) {
        return {
            to: props.to,
            "aria-disabled": props.disabled || props.loading || undefined,
            tabindex: props.disabled || props.loading ? -1 : undefined,
        };
    }

    if (props.href) {
        return {
            href: props.disabled || props.loading ? undefined : props.href,
            target: props.target,
            rel: props.rel,
            "aria-disabled": props.disabled || props.loading || undefined,
            tabindex: props.disabled || props.loading ? -1 : undefined,
        };
    }

    return {
        type: props.type,
        disabled: props.disabled || props.loading,
    };
});
</script>
