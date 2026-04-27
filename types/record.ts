import type { DatasetItem } from './datasetItem';
export interface BaseRecord {
    cover: string;
    link: string;
    title: string;
    is_container: boolean;
    raw_name?: string;
    desc?: string;
}

export interface CharRecord extends Omit<BaseRecord, 'link'> {
    origin?: string; // 立绘来源
    kotoba?: string[]; // 角色语录
    alias?: string[]; // 角色别号
}

export type FavItem = DatasetItem<BaseRecord>;
export type FavCharItem = DatasetItem<CharRecord>;