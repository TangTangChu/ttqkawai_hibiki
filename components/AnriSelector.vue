<template>
    <div
        class="flex flex-wrap"
        :class="
            variant === 'text'
                ? 'justify-center items-center gap-x-2 gap-y-1.5 text-sm md:text-base px-4 max-w-2xl mx-auto'
                : 'gap-2 md:gap-4'
        "
    >
        <template v-for="(option, index) in options" :key="option.value">
            <button
                @click="$emit('update:modelValue', option.value)"
                class="transition-all duration-200 outline-none"
                :class="[
                    variant === 'text'
                        ? modelValue === option.value
                            ? 'text-primary font-bold px-1 py-0.5'
                            : 'text-on-background/50 hover:text-on-background/80 px-1 py-0.5'
                        : 'px-4 py-2 rounded-xl text-sm font-bold ' +
                          (modelValue === option.value
                              ? 'bg-primary/10 text-primary'
                              : 'text-on-background/60 hover:bg-on-background/10 hover:text-on-background focus:bg-on-background/10'),
                ]"
            >
                {{ option.label }}
            </button>
            <span
                v-if="variant === 'text' && index !== options.length - 1"
                class="text-on-background/20 select-none text-xs"
            >
                ·
            </span>
        </template>
    </div>
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        modelValue: string | number;
        options: { label: string; value: string | number }[];
        variant?: "pill" | "text";
    }>(),
    {
        variant: "pill",
    },
);

defineEmits<{
    (e: "update:modelValue", value: string | number): void;
}>();
</script>
