import type { ArchiveData } from "~/types/archive";
import { SITE_IMAGE, SITE_NAME, buildCanonicalUrl } from "~/utils/seo";

const BOT_UA_PATTERNS: RegExp[] = [
    /Googlebot/i,
    /Bingbot/i,
    /Baiduspider/i,
    /YandexBot/i,
    /DuckDuckBot/i,
    /Sogou/i,
    /YisouSpider/i,
    /360Spider/i,
    /HaosouSpider/i,
    /Bytespider/i,
    /PetalBot/i,
    /Applebot/i,
    /Twitterbot/i,
    /facebookexternalhit/i,
    /facebot/i,
    /LinkedInBot/i,
    /WhatsApp/i,
    /TelegramBot/i,
    /Slackbot/i,
    /Discordbot/i,
    /WeChat/i,
    /MicroMessenger/i,
    /Weibo/i,
    /AhrefsBot/i,
    /SemrushBot/i,
    /MJ12bot/i,
    /SeznamBot/i,
    /ia_archiver/i,
];

const isBotUserAgent = (userAgent: string): boolean =>
    BOT_UA_PATTERNS.some((pattern) => pattern.test(userAgent));

const buildDescription = (markdown: string): string => {
    const content = markdown
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/`[^`\n]+`/g, " ")
        .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
        .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
        .replace(/<[^>]+>/g, " ")
        .replace(/[#>*_~-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    return content.length > 160
        ? `${content.slice(0, 160).trimEnd()}…`
        : content;
};

interface CmsEnvelope<T> {
    code: number;
    message: string;
    data: T;
}

interface ArchiveSeoData extends Omit<ArchiveData, "data"> {
    data: ArchiveData["data"] & {
        title: string;
        body: string;
    };
}

interface BotSeoOptions {
    endpoint: string;
    locale: string;
}

export const useBotSeo = async (options: BotSeoOptions): Promise<void> => {
    if (import.meta.client) return;

    const userAgent = useRequestHeader("user-agent") ?? "";
    if (!isBotUserAgent(userAgent)) return;

    const nuxtApp = useNuxtApp();
    const config = useRuntimeConfig();
    const route = useRoute();
    const response = await $fetch<CmsEnvelope<ArchiveSeoData>>(
        `${config.public.apiBase}${options.endpoint}`,
        { headers: { Accept: "application/json" } },
    );
    if (response.code !== 200) {
        throw createError({
            statusCode: 502,
            statusMessage: response.message,
        });
    }

    const archive = response.data;
    const title = archive.data.title;
    const description = buildDescription(archive.data.body);
    const url = buildCanonicalUrl(config.public.siteUrl, route.path);
    const tags = archive.tags.map((tag) => tag.name);
    const publishedAt = archive.data.publish_time;

    nuxtApp.runWithContext(() => {
        useHead(
            {
                title,
                link: [{ rel: "canonical", href: url }],
                meta: [
                    { name: "description", content: description },
                    { property: "og:title", content: title },
                    { property: "og:description", content: description },
                    { property: "og:image", content: SITE_IMAGE },
                    { property: "og:type", content: "article" },
                    { property: "og:url", content: url },
                    { property: "og:site_name", content: SITE_NAME },
                    {
                        property: "og:locale",
                        content: options.locale.replace("-", "_"),
                    },
                    {
                        property: "article:published_time",
                        content: publishedAt,
                    },
                    ...tags.map((tag) => ({
                        property: "article:tag",
                        content: tag,
                    })),
                    { name: "twitter:card", content: "summary" },
                    { name: "twitter:title", content: title },
                    { name: "twitter:description", content: description },
                    { name: "twitter:image", content: SITE_IMAGE },
                ],
                script: [
                    {
                        type: "application/ld+json",
                        innerHTML: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Article",
                            headline: title,
                            description: description,
                            url: url,
                            inLanguage: options.locale,
                            datePublished: publishedAt,
                            keywords: tags.join(", "),
                            image: SITE_IMAGE,
                            isPartOf: {
                                "@type": "WebSite",
                                name: SITE_NAME,
                                url: config.public.siteUrl,
                            },
                        }),
                    },
                ],
            },
            { tagPriority: "high" },
        );
    });
};
