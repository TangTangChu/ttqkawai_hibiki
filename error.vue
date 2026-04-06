<template>
    <NuxtLayout>
        <main
            class="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-8 xl:max-w-5xl"
        >
            <div
                class="flex w-full max-w-xl flex-col items-center justify-center rounded-2xl bg-primary/5 p-8 text-center sm:p-12"
            >
                <div
                    class="mb-6 flex h-24 w-24 select-none items-center justify-center rounded-2xl bg-primary/10 text-4xl font-black tracking-tighter text-primary"
                >
                    {{ error?.statusCode || "Error" }}
                </div>

                <h1
                    class="mb-3 text-3xl font-extrabold tracking-tight text-primary sm:text-4xl"
                >
                    {{ t("common.label.errorPageTitle") }}
                </h1>

                <p class="mb-8 text-lg text-on-background/70 md:text-xl">
                    {{ t("common.label.errorPageDesc") }}
                </p>

                <AnzuButton
                    variant="primary"
                    size="lg"
                    @click="handleGoHome"
                    class="px-10"
                >
                    {{ t("common.label.backToHome") }}
                </AnzuButton>
            </div>
        </main>
    </NuxtLayout>
</template>

<script setup lang="ts">
const { t } = useI18n();
const props = defineProps({
    error: Object,
});

const handleGoHome = () => {
    clearError({ redirect: "/" });
};

useHead({
    title: `Error - ${t("common.label.errorPageTitle")}`,
});
</script>
