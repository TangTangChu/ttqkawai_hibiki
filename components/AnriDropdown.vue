<script lang="ts" setup>
import { ref } from "vue";
import { useClickAway } from "~/composables/useClickAway";

type Align = "left" | "right";
type Placement = "bottom" | "top";

const props = withDefaults(
    defineProps<{
        align?: Align;
        placement?: Placement;
        widthClass?: string;
        offsetClass?: string;
        panelClass?: string;
        panelRole?: string;
        transition?: boolean;
        openOnHover?: boolean;
        hoverCloseDelay?: number;
        bridgeHeightClass?: string;
    }>(),
    {
        align: "right",
        placement: "bottom",
        widthClass: "w-56",
        offsetClass: "",
        panelClass: "",
        panelRole: "dialog",
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

const ANCHOR_CLASS: Record<Placement, Record<Align, string>> = {
    bottom: {
        left: "top-full left-0 origin-top-left",
        right: "top-full right-0 origin-top-right",
    },
    top: {
        left: "bottom-full left-0 origin-bottom-left",
        right: "bottom-full right-0 origin-bottom-right",
    },
};

const panelBaseClass = computed(() =>
    [
        "absolute z-50 flex flex-col gap-1 rounded-xl bg-surface p-2 shadow-[0px_2px_16px_0px_rgba(113,93,84,0.06)] backdrop-blur-md",
        ANCHOR_CLASS[props.placement][props.align],
        props.offsetClass ||
            (props.placement === "top" ? "mb-3" : "mt-3"),
        props.widthClass,
        props.panelClass,
    ]
        .filter(Boolean)
        .join(" "),
);
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
            enter-active-class="transition-all duration-150 ease-out"
            enter-from-class="opacity-0 translate-y-2 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition-all duration-100 ease-in"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-2 scale-95"
        >
            <div
                v-if="isOpen"
                :class="panelBaseClass"
                :role="panelRole"
            >
                <slot name="menu" :close="close" />
            </div>
        </transition>

        <div
            v-else
            v-if="isOpen"
            :class="panelBaseClass"
            :role="panelRole"
        >
            <slot name="menu" :close="close" />
        </div>
    </div>
</template>
