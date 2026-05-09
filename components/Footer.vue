<template>
    <footer class="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div
            class="border-t border-primary/10 py-5 text-center text-sm leading-6 text-on-background/60 sm:py-6"
        >
            <p>
                © {{ copyrightYears }}
                <span class="font-bold text-primary">糖糖毬</span> Some Rights
                Reserved.
            </p>
            <div
                class="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm"
            >
                <a
                    href="https://beian.miit.gov.cn/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-1 transition-colors hover:text-primary"
                >
                    <img
                        src="https://img.tantanchugasuki.cn/i/r/ICP备案"
                        class="h-4 w-4"
                        alt="ICP备案图标"
                    />
                    <span>赣ICP备2025067513号-1</span>
                </a>
                <a
                    href="http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=36073102000182"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-1 transition-colors hover:text-primary"
                >
                    <img
                        src="~/assets/images/备案图标.png"
                        class="h-4 w-4"
                        alt="公安备案图标"
                    />
                    <span>赣公网安备36073102000182号</span>
                </a>
                <a
                    href="https://icp.gov.moe/?keyword=20261230"
                    target="_blank"
                    class="flex items-center gap-1 transition-colors hover:text-primary"
                >
                    <img
                        src="https://img.tantanchugasuki.cn/i/r/萌ICP"
                        class="w-4 h-4"
                        alt="萌ICP备案图标"
                    />
                    <span>萌ICP备20261230号</span>
                </a>
                <a
                    href="https://github.com/TangTangChu/ttqkawai_hibiki"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="transition-colors hover:text-primary"
                    v-if="showGitHash"
                >
                    #{{ shortGitHash.toUpperCase() }}
                </a>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const gitHash = String(config.public.gitHash || "dev");
const shortGitHash = gitHash.slice(0, 7);
const showGitHash = gitHash !== "dev";
const currentYear = new Date().getFullYear();
const copyrightYears = currentYear === 2025 ? "2025" : `2025-${currentYear}`;
</script>
