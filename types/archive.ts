export interface Tag {
    id: string;
    name: string;
}

export interface ContentData {
    publish_time: string;
    title?: string;
    summary?: string;
    body?: string;
    publisher?: string;
    [key: string]: unknown;
}

export interface Archive {
    id: string;
    title: string;
    slug: string;
    path: string;
    tags: Tag[];
    data: ContentData;
    type: {
        id: string;
        name: string;
        slug: string;
    };
}

export type ArchiveData = Archive;
