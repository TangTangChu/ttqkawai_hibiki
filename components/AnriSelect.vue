<script setup lang="ts">
import AnriDropdown from "~/components/AnriDropdown.vue";
import AnriImage from "~/components/AnriImage.vue";

interface SelectOption {
    value: string | number;
    label: string;
    hint?: string;
    image?: string;
}

withDefaults(
    defineProps<{
        modelValue: string | number;
        options: SelectOption[];
        align?: "left" | "right";
        placement?: "bottom" | "top";
        widthClass?: string;
        panelClass?: string;
    }>(),
    {
        align: "right",
        placement: "bottom",
        widthClass: "w-56",
        panelClass: "",
    },
);

const emit = defineEmits<{
    (e: "update:modelValue", value: string | number): void;
}>();

const select = (value: string | number, close: () => void): void => {
    emit("update:modelValue", value);
    close();
};
</script>

<template>
    <AnriDropdown
        :align="align"
        :placement="placement"
        :width-class="widthClass"
        :panel-class="panelClass"
        panel-role="listbox"
    >
        <template #trigger="{ toggle, isOpen }">
            <slot name="trigger" :toggle="toggle" :isOpen="isOpen" />
        </template>

        <template #menu="{ close }">
            <button
                v-for="option in options"
                :key="option.value"
                type="button"
                role="option"
                :aria-selected="option.value === modelValue"
                class="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5 text-left transition-colors duration-150"
                :class="
                    option.value === modelValue
                        ? 'bg-primary/10'
                        : 'hover:bg-on-background/5'
                "
                @click="select(option.value, close)"
            >
                <div v-if="option.image" class="w-8 h-8 shrink-0">
                    <AnriImage
                        :src="option.image"
                        img-class="object-cover rounded-lg"
                        spinner-size="sm"
                        :w-full="true"
                        :h-full="true"
                        loading="lazy"
                    />
                </div>
                <div class="flex flex-col min-w-0 flex-1">
                    <span
                        class="text-sm font-bold line-clamp-1 group-hover:text-primary transition-colors"
                        :class="
                            option.value === modelValue
                                ? 'text-primary'
                                : 'text-on-background'
                        "
                    >
                        {{ option.label }}
                    </span>
                </div>
                <span
                    v-if="option.hint"
                    class="shrink-0 whitespace-nowrap text-xs text-on-background/50"
                >
                    {{ option.hint }}
                </span>
            </button>
        </template>
    </AnriDropdown>
</template>
