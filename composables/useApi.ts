import { ref, computed } from "vue";
import type { Ref } from "vue";

export interface ApiResponse<T> {
    data: T | null;
    error: ApiError | null;
    loading: boolean;
    meta?: ApiMeta;
}

interface ErrorResponse {
    status?: number;
    name?: string;
    message: string;
    details?: Record<string, unknown>;
}

export interface ApiMeta {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
}

const DEFAULT_BASE_URL = "https://cms.tantanchugasuki.cn/nozomi";

interface CmsEnvelope<T> {
    code: number;
    message: string;
    data: T;
    meta?: ApiMeta;
}

interface ApiError {
    status: number;
    name: string;
    message: string;
    details: Record<string, unknown>;
}

const isCmsEnvelope = <T>(value: unknown): value is CmsEnvelope<T> => {
    if (!value || typeof value !== "object") return false;
    const record = value as Record<string, unknown>;
    return typeof record.code === "number" && "data" in record;
};

const normalizeError = (err: unknown): ApiError => {
    const fallback: ApiError = {
        status: 500,
        name: "UnknownError",
        message: "Unknown error occurred",
        details: {},
    };

    if (typeof err !== "object" || err === null) return fallback;
    const e = err as Partial<ApiError>;
    return {
        status: e.status ?? 500,
        name: e.name ?? "UnknownError",
        message: e.message ?? "Unknown error occurred",
        details: e.details ?? {},
    };
};

export function useApi<T>(): {
    data: Ref<T | null>;
    error: Ref<ApiError | null>;
    loading: Ref<boolean>;
    meta: Ref<ApiMeta | undefined>;
    get: (endpoint: string) => Promise<void>;
    post: (endpoint: string, body: unknown) => Promise<void>;
    put: (endpoint: string, body: unknown) => Promise<void>;
    del: (endpoint: string) => Promise<void>;
} {
    const response: Ref<ApiResponse<T>> = ref({
        data: null,
        error: null,
        loading: false,
    });

    const config = useRuntimeConfig();
    const baseURL =
        config.public !== null &&
        config.public.apiBase !== null &&
        config.public.apiBase !== ""
            ? config.public.apiBase
            : DEFAULT_BASE_URL;
    let activeController: AbortController | null = null;
    let requestId = 0;

    const fetchData = (
        endpoint: string,
        options: RequestInit = {},
    ): Promise<void> => {
        requestId += 1;
        const currentId = requestId;
        if (activeController) {
            activeController.abort();
        }
        activeController = new AbortController();

        response.value.loading = true;
        response.value.error = null;
        response.value.data = null;

        return fetch(
            `${baseURL}${endpoint}`,
            Object.assign({}, options, {
                signal: activeController.signal,
                headers: Object.assign(
                    {
                        "Content-Type": "application/json",
                    },
                    options.headers,
                ),
            }),
        )
            .then((res) => {
                if (!res.ok) {
                    let errorData: ErrorResponse;
                    try {
                        return res.json().then((data) => {
                            errorData = data;
                            throw {
                                status: res.status,
                                name: errorData.name || "ApiError",
                                message:
                                    errorData.message ||
                                    `API request failed with status ${res.status}`,
                                details: errorData.details || {},
                            };
                        });
                    } catch {
                        throw {
                            status: res.status,
                            name: "ApiError",
                            message: res.statusText,
                            details: {},
                        };
                    }
                }

                return res.json().then((payload: unknown) => {
                    if (currentId !== requestId) return;

                    if (isCmsEnvelope<T>(payload)) {
                        if (payload.code !== 200) {
                            throw {
                                status: res.status,
                                name: "ApiError",
                                message:
                                    payload.message ||
                                    `API request failed with status ${payload.code}`,
                                details: {},
                            };
                        }
                        response.value.data = payload.data;
                        response.value.meta = payload.meta;
                        return;
                    }

                    response.value.data = payload as T;
                });
            })
            .catch((err) => {
                if (
                    (err instanceof Object &&
                        (err as Record<string, unknown>).name) === "AbortError"
                )
                    return;
                response.value.error = normalizeError(err);
            })
            .finally(() => {
                if (currentId === requestId) {
                    response.value.loading = false;
                }
            });
    };

    const get = (endpoint: string): Promise<void> =>
        fetchData(endpoint, { method: "GET" });

    const post = (endpoint: string, body: unknown): Promise<void> =>
        fetchData(endpoint, {
            method: "POST",
            body: JSON.stringify({ data: body }),
        });

    const put = (endpoint: string, body: unknown): Promise<void> =>
        fetchData(endpoint, {
            method: "PUT",
            body: JSON.stringify({ data: body }),
        });

    const del = (endpoint: string): Promise<void> =>
        fetchData(endpoint, { method: "DELETE" });

    return {
        data: computed(() => response.value.data),
        error: computed(() => response.value.error),
        loading: computed(() => response.value.loading),
        meta: computed(() => response.value.meta),
        get,
        post,
        put,
        del,
    };
}
