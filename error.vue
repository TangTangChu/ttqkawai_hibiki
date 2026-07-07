<template>
    <NuxtLayout>
        <main
            class="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 xl:max-w-5xl"
        >
            <div
                class="flex w-full max-w-xl flex-col items-center justify-center p-8 text-center sm:p-12"
            >
                <div
                    class="mb-8 flex h-24 w-24 select-none items-center justify-center rounded-2xl bg-primary/10 text-4xl font-black tracking-tighter text-primary transition-transform duration-500 hover:scale-105"
                >
                    {{ error?.statusCode || "ERR" }}
                </div>

                <h1
                    class="mb-3 text-3xl font-bold tracking-tight text-on-background sm:text-4xl"
                >
                    {{ t("common.label.errorPageTitle") }}
                </h1>

                <p class="mb-10 text-base text-on-background/60 sm:text-lg">
                    {{ t("common.label.errorPageDesc") }}
                </p>

                <AnriButton variant="soft" size="lg" @click="handleGoHome">
                    {{ t("common.label.backToHome") }}
                </AnriButton>
            </div>
        </main>
    </NuxtLayout>
</template>

<script setup lang="ts">
const { t } = useI18n();
const props = defineProps<{
    error?: Record<string, unknown> | null;
}>();

const handleGoHome = () => {
    clearError({ redirect: "/" });
};

useHead({
    title: `Error - ${t("common.label.errorPageTitle")}`,
});
</script>
