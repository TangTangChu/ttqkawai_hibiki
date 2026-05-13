<template>
    <div class="relative w-full group">
        <div
            v-if="hasIcon || props.search"
            class="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-on-background/40 transition-colors duration-200 group-focus-within:text-on-background/70"
        >
            <MagnifyingGlassIcon v-if="props.search" class="w-5 h-5" />
            <slot v-else name="icon" />
        </div>

        <input
            v-bind="$attrs"
            :type="props.type"
            :value="modelValue"
            :disabled="props.disabled"
            :placeholder="props.placeholder"
            class="w-full transition-all duration-200 ease-out outline-none rounded-xl border-2 font-bold bg-surface/50 text-on-background placeholder:text-on-background/30"
            :class="[
                sizeClasses[props.size],
                variantClasses[props.variant],
                hasIcon || props.search ? 'pl-11' : 'pl-4',
                props.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-text',
            ]"
            @input="onInput"
            @compositionstart="onCompositionStart"
            @compositionend="onCompositionEnd"
            @change="onChange"
            @focus="$emit('focus', $event)"
            @blur="$emit('blur', $event)"
        />
        <div
            v-if="props.allowClear && modelValue"
            class="absolute inset-y-0 right-0 flex items-center pr-3"
        >
            <button
                type="button"
                class="p-1 rounded-lg hover:bg-on-background/10 text-on-background/40 hover:text-on-background/70 transition-all duration-200"
                @click="clear"
            >
                <XMarkIcon class="w-4 h-4" />
            </button>
        </div>
        <div
            v-else-if="$slots.suffix"
            class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-on-background/40"
        >
            <slot name="suffix" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/vue/24/outline";

type AnriInputVariant = "default" | "soft" | "ghost";
type AnriInputSize = "sm" | "md" | "lg";

defineOptions({
    inheritAttrs: false,
});

const props = withDefaults(
    defineProps<{
        modelValue?: string | number;
        type?: string;
        variant?: AnriInputVariant;
        size?: AnriInputSize;
        placeholder?: string;
        disabled?: boolean;
        search?: boolean;
        allowClear?: boolean;
    }>(),
    {
        modelValue: "",
        type: "text",
        variant: "default",
        size: "md",
        placeholder: "",
        disabled: false,
        search: false,
        allowClear: false,
    },
);

const emit = defineEmits<{
    (e: "update:modelValue", value: string): void;
    (e: "change", value: string): void;
    (e: "focus", event: FocusEvent): void;
    (e: "blur", event: FocusEvent): void;
    (e: "clear"): void;
}>();

const slots = useSlots();
const hasIcon = computed(() => !!slots.icon);

let isComposing = false;

const sizeClasses: Record<AnriInputSize, string> = {
    sm: "min-h-9 px-3 py-1.5 text-sm",
    md: "min-h-11 px-4 py-2 text-sm",
    lg: "min-h-12 px-5 py-2.5 text-base",
};

const variantClasses: Record<AnriInputVariant, string> = {
    default:
        "border-transparent bg-on-background/5 text-on-background hover:bg-on-background/10 focus:bg-on-background/10 focus:outline-none focus:ring-2 focus:ring-on-background/10",
    soft: "border-on-background/5 bg-on-background/5 focus:bg-on-background/10 focus:border-on-background/20",
    ghost: "border-transparent bg-transparent hover:bg-on-background/5 focus:bg-on-background/5 focus:border-on-background/10",
};

const onCompositionStart = () => {
    isComposing = true;
};

const onCompositionEnd = (event: CompositionEvent) => {
    isComposing = false;
    const target = event.target as HTMLInputElement;
    emit("update:modelValue", target.value);
};

const onInput = (event: Event) => {
    if (isComposing) return;
    const target = event.target as HTMLInputElement;
    emit("update:modelValue", target.value);
};

const onChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit("change", target.value);
};

const clear = () => {
    emit("update:modelValue", "");
    emit("change", "");
    emit("clear");
};
</script>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
input[type="number"] {
    appearance: textfield;
    -moz-appearance: textfield;
}
</style>
