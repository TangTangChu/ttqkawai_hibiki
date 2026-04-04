import { isRef, onMounted, onUnmounted, type Ref } from "vue";

export type ClickAwayEnabled = boolean | Ref<boolean> | (() => boolean);

interface ClickAwayEntry {
    id: number;
    target: Ref<HTMLElement | null>;
    onAway: (event: Event) => void;
    enabled?: ClickAwayEnabled;
}

let nextId = 1;
const entries: ClickAwayEntry[] = [];

let listening = false;
const EVENT_NAME: keyof DocumentEventMap = "pointerdown";

const isClient = (): boolean =>
    import.meta.client && typeof document !== "undefined";

const getEnabled = (enabled?: ClickAwayEnabled): boolean => {
    if (!enabled) return true;
    if (typeof enabled === "function") return enabled();
    if (typeof enabled === "boolean") return enabled;
    if (isRef(enabled)) return !!enabled.value;
    return true;
};

const onDocumentPointerDown = (event: Event): void => {
    const targetNode = event.target as Node | null;
    if (!targetNode) return;
    const snapshot = entries.slice();

    for (const entry of snapshot) {
        if (!getEnabled(entry.enabled)) continue;

        const el = entry.target.value;
        if (!el) continue;

        if (el.contains(targetNode)) continue;

        entry.onAway(event);
    }
};

const ensureListener = (): void => {
    if (!isClient() || listening) return;
    document.addEventListener(EVENT_NAME, onDocumentPointerDown, true);
    listening = true;
};

const maybeRemoveListener = (): void => {
    if (!isClient() || !listening) return;
    if (entries.length > 0) return;

    document.removeEventListener(EVENT_NAME, onDocumentPointerDown, true);
    listening = false;
};

export const useClickAway = (
    target: Ref<HTMLElement | null>,
    onAway: (event: Event) => void,
    options?: {
        enabled?: ClickAwayEnabled;
    },
): { id: number } => {
    nextId += 1;
    const id = nextId - 1;

    onMounted((): void => {
        const entry: ClickAwayEntry = {
            id,
            target,
            onAway,
        };
        if (options && options.enabled) {
            entry.enabled = options.enabled;
        }
        entries.push(entry);
        ensureListener();
    });

    onUnmounted((): void => {
        const idx = entries.findIndex((e) => e.id === id);
        if (idx >= 0) entries.splice(idx, 1);
        maybeRemoveListener();
    });

    return {
        id,
    };
};
