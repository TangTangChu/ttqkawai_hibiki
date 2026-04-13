import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
    compatibilityDate: "2025-07-15",
    devtools: { enabled: true },
    css: ["~/assets/css/main.css"],
    runtimeConfig: {
        public: {
            apiBase:
                process.env.NUXT_PUBLIC_API_BASE ||
                "https://cms.tantanchugasuki.cn/nozomi",
        },
    },
    vite: {
        plugins: [tailwindcss()],
    },
    i18n: {
        strategy: "no_prefix",
        locales: [
            { code: "zh", iso: "zh-CN", name: "简体中文", file: "zh.json" },
            { code: "en", iso: "en-US", name: "English", file: "en.json" },
            { code: "ja", iso: "ja-JP", name: "日本語", file: "ja.json" },
        ],
        defaultLocale: "zh",
    },
    app: {
        head: {
            title: "糖糖毬的个人站",
            link: [
                {
                    rel: "icon",
                    type: "image/avif",
                    href: "https://img.tantanchugasuki.cn/i/r/avatar",
                },
            ],
            htmlAttrs: {
                lang: "zh-CN",
            },
        },
    },
    modules: ["@nuxtjs/i18n", "@nuxtjs/mdc"],
    mdc: {
        highlight: {
            langs: [
                "python",
                "javascript",
                "typescript",
                "bash",
                "json",
                "yaml",
                "markdown",
                "vue",
                "html",
                "css",
                "go",
                "java",
                "cpp",
                "csharp",
                "php",
                "ruby",
                "rust",
                "sql",
                "dockerfile",
                "powershell",
                "c"
            ],
        },
        headings: {
            anchorLinks: true,
        },
    },
});
