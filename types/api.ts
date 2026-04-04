import type { ApiMeta } from "~/composables/useApi";

export interface I18nMeta {
    current: string;
    default: string;
    available: string[];
    fallback: boolean;
    fallback_to: string;
}

export interface ExtendedApiMeta extends ApiMeta {
    i18n?: I18nMeta;
}
