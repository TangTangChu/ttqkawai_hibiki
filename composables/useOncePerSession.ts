const isClient = (): boolean => typeof window !== "undefined";

export const useOncePerSession = (key: string, fn: () => void): void => {
    onMounted((): void => {
        if (!isClient()) return;
        const hasRun = sessionStorage.getItem(key);
        if (!hasRun) {
            fn();
            sessionStorage.setItem(key, "executed");
        }
    });
};
