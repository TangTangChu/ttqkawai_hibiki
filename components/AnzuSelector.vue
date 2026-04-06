<template>
    <div class="flex flex-wrap gap-2 md:gap-4">
        <button 
            v-for="option in options" 
            :key="option.value"
            @click="$emit('update:modelValue', option.value)"
            class="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 outline-none"
            :class="modelValue === option.value 
                ? 'bg-primary/10 text-primary' 
                : 'text-on-background/60 hover:bg-on-background/10 hover:text-on-background focus:bg-on-background/10'"
        >
            {{ option.label }}
        </button>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    modelValue: string | number;
    options: { label: string; value: string | number }[];
}>();

defineEmits<{
    (e: 'update:modelValue', value: string | number): void;
}>();
</script>