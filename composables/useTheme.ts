import { onMounted, watchEffect } from "vue";
import { useState } from "#imports";

let themeInitialized = false;

const isClient = (): boolean => typeof window !== "undefined";

export default function useTheme(): {
    isDark: Ref<boolean>;
    toggleTheme: () => void;
} {
    const isDark = useState<boolean>("is-dark-theme", () => false);

    const updateHtmlClass = (): void => {
        if (!isClient()) return;
        document.documentElement.classList.toggle("dark", isDark.value);
    };

    const initTheme = (): void => {
        if (!isClient()) return;

        const savedTheme = localStorage.getItem("dark-theme");
        // 注释掉自动使用浏览器偏好色调的功能
        // const systemDark = window.matchMedia(
        //     "(prefers-color-scheme: dark)",
        // ).matches;
        isDark.value = savedTheme ? savedTheme === "dark" : false;
        updateHtmlClass();
    };

    const toggleTheme = (): void => {
        isDark.value = !isDark.value;
        if (isClient()) {
            localStorage.setItem("dark-theme", isDark.value ? "dark" : "light");
        }
        updateHtmlClass();
    };

    const watchSystemTheme = (): (() => void) | undefined => {
        // 注释掉监听系统主题变化
        /*
        if (!isClient()) return;

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e: MediaQueryListEvent): void => {
            if (!localStorage.getItem("dark-theme")) {
                isDark.value = e.matches;
                updateHtmlClass();
            }
        };

        mediaQuery.addEventListener("change", handler);
        return (): void => mediaQuery.removeEventListener("change", handler);
        */
        return undefined;
    };

    if (import.meta.client && !themeInitialized) {
        themeInitialized = true;

        onMounted((): (() => void) | undefined => {
            initTheme();
            const cleanup = watchSystemTheme();
            return (): void => {
                if (cleanup) cleanup();
            };
        });

        watchEffect((): void => {
            updateHtmlClass();
        });
    }

    return { isDark, toggleTheme };
}
