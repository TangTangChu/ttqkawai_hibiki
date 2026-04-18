import type { DatasetItem } from './datasetItem';
export interface BaseRecord {
    cover: string;
    link: string;
    title: string;
    is_container: boolean;
    raw_name?: string;
}

export interface CharRecord extends Omit<BaseRecord, 'link'> {
    origin: string;
    kotoba: string[];
}

export type FavItem = DatasetItem<BaseRecord>;
export type FavCharItem = DatasetItem<CharRecord>;