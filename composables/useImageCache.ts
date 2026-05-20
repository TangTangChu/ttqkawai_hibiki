import { reactive } from 'vue';

type ImageState = 'loading' | 'loaded' | 'error';

const imageRegistry = reactive<Record<string, ImageState>>({});

export const useImageCache = () => {
    const getStatus = (src: string): ImageState | undefined => {
        if (import.meta.server || !src) return undefined;
        return imageRegistry[src];
    };

    const setStatus = (src: string, status: ImageState) => {
        if (import.meta.server || !src) return;
        imageRegistry[src] = status;
    };

    const isLoaded = (src: string) => getStatus(src) === 'loaded';
    const isLoading = (src: string) => getStatus(src) === 'loading';
    const isError = (src: string) => getStatus(src) === 'error';

    return {
        getStatus,
        setStatus,
        isLoaded,
        isLoading,
        isError,
    };
};
