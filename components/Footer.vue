<template>
    <footer class="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div
            class="border-t border-primary/10 py-5 text-center text-sm leading-6 text-on-background/60 sm:py-6"
        >
            <p>
                © {{ copyrightYears }}
                <span class="font-bold text-primary">糖糖毬</span> All Rights
                Reserved.
            </p>
        </div>
    </footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear();
const copyrightYears = currentYear === 2025 ? "2025" : `2025-${currentYear}`;
</script>
