import { isbot } from "isbot";
import type { Archive } from "~/types/archive";
import { SITE_IMAGE, SITE_NAME, buildCanonicalUrl } from "~/utils/seo";

// 社交平台内置浏览器：抓取分享卡片，需要完整的 og 标签
const SOCIAL_SHARE_UA_PATTERNS: RegExp[] = [
    /MicroMessenger/i,
    /WeChat/i,
    /Weibo/i,
    /QBWebViewType/i,
];

export const isBotUserAgent = (userAgent: string): boolean =>
    isbot(userAgent) ||
    SOCIAL_SHARE_UA_PATTERNS.some((pattern) => pattern.test(userAgent));

const truncate = (text: string, max = 160): string => {
    const trimmed = text.trim();
    if (trimmed.length <= max) return trimmed;
    const cut = trimmed.slice(0, max);
    const lastSpace = cut.lastIndexOf(" ");
    const head = lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut;
    return `${head.trimEnd()}…`;
};

const buildDescription = (archive: Archive): string => {
    const summary = archive.data?.summary?.trim();
    if (summary) return truncate(summary);

    const content = (archive.data?.body ?? "")
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/`[^`\n]+`/g, " ")
        .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
        .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
        .replace(/<[^>]+>/g, " ")
        .replace(/^#{1,6}\s+/gm, " ")
        .replace(/^\s*[-*+]\s+/gm, " ")
        .replace(/^\s*>\s?/gm, " ")
        .replace(/^\s*[-*_]{3,}\s*$/gm, " ")
        .replace(/[*_~]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    return truncate(content);
};

const getFirstImage = (
    archive: Archive,
): { src: string; alt: string } | null => {
    const match = (archive.data?.body ?? "").match(/!\[([^\]]*)]\(([^)]+)\)/);
    if (!match) return null;
    const [, alt = "", src] = match;
    if (!src) return null;
    return { src, alt };
};

interface BotSeoOptions {
    /** CMS locale，如 "zh-CN" */
    locale: string;
}

/**
 * 为已加载的归档注入完整 SEO head（title / canonical / OG / Twitter / JSON-LD）。
 * 仅在服务端对爬虫请求调用，数据由调用方提供。
 */
export const useBotSeo = (archive: Archive, options: BotSeoOptions): void => {
    const route = useRoute();
    const config = useRuntimeConfig();
    const nuxtApp = useNuxtApp();

    const title = archive.data?.title || archive.title || SITE_NAME;
    const description = buildDescription(archive);
    const url = buildCanonicalUrl(config.public.siteUrl, route.path);
    const tags = (archive.tags ?? []).map((tag) => tag.name);
    const publishedAt = archive.data?.publish_time;
    const publisher =
        typeof archive.data?.publisher === "string"
            ? archive.data.publisher.trim()
            : "";
    const image = getFirstImage(archive);
    const imageUrl = image?.src || SITE_IMAGE;
    const imageAlt = image?.alt || title;

    const jsonLd: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description: description,
        url: url,
        inLanguage: options.locale,
        keywords: tags.join(", "),
        image: imageUrl,
        mainEntityOfPage: url,
        isPartOf: {
            "@type": "WebSite",
            name: SITE_NAME,
            url: config.public.siteUrl,
        },
    };
    if (publishedAt) jsonLd.datePublished = publishedAt;
    if (publisher) {
        jsonLd.author = { "@type": "Person", name: publisher };
    }

    nuxtApp.runWithContext(() => {
        useHead(
            {
                title,
                link: [{ rel: "canonical", href: url }],
                meta: [
                    { name: "description", content: description },
                    { property: "og:title", content: title },
                    { property: "og:description", content: description },
                    { property: "og:image", content: imageUrl },
                    { property: "og:image:alt", content: imageAlt },
                    { property: "og:type", content: "article" },
                    { property: "og:url", content: url },
                    { property: "og:site_name", content: SITE_NAME },
                    {
                        property: "og:locale",
                        content: options.locale.replace("-", "_"),
                    },
                    ...tags.map((tag) => ({
                        property: "article:tag",
                        content: tag,
                    })),
                    ...(publishedAt
                        ? [
                              {
                                  property: "article:published_time",
                                  content: publishedAt,
                              },
                          ]
                        : []),
                    { name: "twitter:card", content: "summary" },
                    { name: "twitter:title", content: title },
                    { name: "twitter:description", content: description },
                    { name: "twitter:image", content: imageUrl },
                    { name: "twitter:image:alt", content: imageAlt },
                ],
                script: [
                    {
                        type: "application/ld+json",
                        innerHTML: JSON.stringify(jsonLd),
                    },
                ],
            },
            { tagPriority: "high" },
        );
    });
};
