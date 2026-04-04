<script lang="ts" setup>
import { ref } from "vue";
import { useClickAway } from "~/composables/useClickAway";

type Align = "left" | "right";

const props = withDefaults(
    defineProps<{
        align?: Align;
        widthClass?: string;
        offsetClass?: string;
        panelClass?: string;
        transition?: boolean;
        openOnHover?: boolean;
        hoverCloseDelay?: number;
        bridgeHeightClass?: string;
    }>(),
    {
        align: "right",
        widthClass: "w-56",
        offsetClass: "mt-2",
        panelClass: "",
        transition: true,
        openOnHover: false,
        hoverCloseDelay: 160,
        bridgeHeightClass: "h-2",
    },
);

const isOpen = defineModel<boolean>({ default: false });
const rootRef = ref<HTMLElement | null>(null);

const close = () => {
    isOpen.value = false;
};

const open = () => {
    isOpen.value = true;
};

const toggle = () => {
    isOpen.value = !isOpen.value;
};

let hoverCloseTimer: ReturnType<typeof setTimeout> | null = null;

const cancelHoverClose = () => {
    if (hoverCloseTimer) {
        clearTimeout(hoverCloseTimer);
        hoverCloseTimer = null;
    }
};

const scheduleHoverClose = () => {
    cancelHoverClose();
    hoverCloseTimer = setTimeout(() => {
        close();
        hoverCloseTimer = null;
    }, props.hoverCloseDelay);
};

const onMouseEnter = () => {
    cancelHoverClose();
    if (props.openOnHover) open();
};

const onMouseLeave = () => {
    if (!props.openOnHover) return;
    scheduleHoverClose();
};

useClickAway(
    rootRef,
    () => {
        close();
    },
    {
        enabled: () => isOpen.value,
    },
);

const panelBaseClass = computed(() => {
    const alignClass =
        props.align === "left" ? "left-0" : "right-0 origin-top-right";

    return [
        "absolute",
        "top-full",
        alignClass,
        "z-50",
        props.offsetClass,
        props.widthClass,
        "bg-surface",
        "rounded-xl",
        "shadow-sm",
        "ring-1",
        "ring-black/5",
        "dark:ring-white/5",
        "p-1.5",
        "flex",
        "flex-col",
        "gap-1",
        props.panelClass,
    ]
        .filter(Boolean)
        .join(" ");
});
</script>

<template>
    <div
        ref="rootRef"
        class="relative inline-block"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
    >
        <slot
            name="trigger"
            :open="open"
            :close="close"
            :toggle="toggle"
            :isOpen="isOpen"
        />

        <div
            v-if="isOpen && openOnHover"
            class="absolute top-full left-0 right-0"
            :class="bridgeHeightClass"
            aria-hidden="true"
        ></div>

        <transition
            v-if="transition"
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
        >
            <div v-if="isOpen" :class="panelBaseClass" role="dialog">
                <slot name="menu" :close="close" />
            </div>
        </transition>

        <div v-else v-if="isOpen" :class="panelBaseClass" role="dialog">
            <slot name="menu" :close="close" />
        </div>
    </div>
</template>
