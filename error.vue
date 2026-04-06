<template>
    <NuxtLayout>
        <main
            class="w-full mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 xl:max-w-5xl flex flex-col items-center justify-center min-h-[70vh]"
        >
            <header class="text-center mb-12">
                <h1
                    class="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl"
                >
                    {{ t("common.label.notFoundTitle") }}
                </h1>
            </header>
            <div class="flex flex-col items-center text-center">
                <div
                    class="font-black text-primary leading-none select-none my-4 text-center flex items-center justify-center"
                >
                    {{ error?.statusCode || "404" }}
                </div>
                <p
                    class="text-lg md:text-xl text-on-background/70 mb-8 max-w-lg leading-relaxed mt-4"
                >
                    {{ t("common.label.notFoundDesc") }}
                </p>

                <AnzuButton
                    variant="primary"
                    size="lg"
                    @click="handleGoHome"
                    class="px-10 py-3 mt-4"
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
    title: `404 - ${t("common.label.notFoundTitle")}`,
});
</script>
