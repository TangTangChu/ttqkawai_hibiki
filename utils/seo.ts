export const SITE_NAME = "糖糖毬的个人站";
export const SITE_IMAGE = "https://img.tantanchugasuki.cn/i/r/avatar";

export const buildCanonicalUrl = (siteUrl: string, path: string): string => {
    const encodedPath = path
        .split("/")
        .map((segment) =>
            segment ? encodeURIComponent(decodeURIComponent(segment)) : segment,
        )
        .join("/");

    return `${siteUrl.replace(/\/+$/, "")}${encodedPath}`;
};
