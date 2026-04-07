export interface DatasetItem<T = Record<string, any>> {
    id: string;
    slug: string;
    record: T;
}