import { useState } from "#app";

export const useImageViewer = () => {
    const isOpen = useState<boolean>("imageViewerIsOpen", () => false);
    const currentIndex = useState<number>("imageViewerIndex", () => 0);
    const images = useState<string[]>("imageViewerImages", () => []);

    const openViewer = (index: number, currentImages: string[]) => {
        images.value = currentImages;
        currentIndex.value = index;
        isOpen.value = true;
    };

    const closeViewer = () => {
        isOpen.value = false;
    };

    const nextImage = () => {
        if (currentIndex.value < images.value.length - 1) {
            currentIndex.value++;
        }
    };

    const prevImage = () => {
        if (currentIndex.value > 0) {
            currentIndex.value--;
        }
    };

    return {
        isOpen,
        currentIndex,
        images,
        openViewer,
        closeViewer,
        nextImage,
        prevImage,
    };
};
