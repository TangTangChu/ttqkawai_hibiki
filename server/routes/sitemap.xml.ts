interface ArchiveEntry {
    slug: string;
    data?: {
        publish_time?: string;
        updated_at?: string;
    };
}

interface ApiEnvelope<T> {
    code: number;
    message?: string;
    data: T;
    meta: {
        current_page: number;
        total_pages: number;
    };
}

interface SitemapUrl {
    loc: string;
    lastmod?: string;
    changefreq?:
        | "always"
        | "hourly"
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
        | "never";
    priority?: number;
}

const STATIC_ROUTES: SitemapUrl[] = [
    { loc: "/", changefreq: "weekly", priority: 1.0 },
    { loc: "/archives", changefreq: "weekly", priority: 0.8 },
    { loc: "/about", changefreq: "monthly", priority: 0.7 },
    { loc: "/about/projects", changefreq: "monthly", priority: 0.6 },
    { loc: "/about/favorites", changefreq: "weekly", priority: 0.5 },
    { loc: "/about/timeline", changefreq: "monthly", priority: 0.5 },
    { loc: "/links", changefreq: "monthly", priority: 0.4 },
];

const escapeXml = (value: string): string =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

const encodePath = (path: string): string =>
    path
        .split("/")
        .map((seg) => (seg ? encodeURIComponent(seg) : seg))
        .join("/");

const toIsoDate = (input?: string): string | undefined => {
    if (!input) return undefined;
    const t = Date.parse(input);
    if (!Number.isFinite(t)) return undefined;
    return new Date(t).toISOString();
};

const fetchEnvelope = async <T>(
    url: string,
    ua?: string,
): Promise<ApiEnvelope<T>> => {
    const response = await $fetch<ApiEnvelope<T>>(url, {
        headers: {
            Accept: "application/json",
            ...(ua ? { "User-Agent": ua } : {}),
        },
    });

    if (response.code !== 200) {
        throw createError({
            statusCode: 502,
            statusMessage: response.message,
        });
    }

    return response;
};

const collectArchives = async (
    apiBase: string,
    ua?: string,
): Promise<SitemapUrl[]> => {
    const result: SitemapUrl[] = [];
    const seen = new Set<string>();
    const pageSize = 100;
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages && page <= 50) {
        // 分页拉取天然串行
        // eslint-disable-next-line no-await-in-loop
        const envelope = await fetchEnvelope<ArchiveEntry[]>(
            `${apiBase}/v1/contents?type_slug=archive&fields=publish_time&sort_order=desc&page=${page}&page_size=${pageSize}`,
            ua,
        );

        for (const entry of envelope.data) {
            if (!entry.slug || seen.has(entry.slug)) continue;
            seen.add(entry.slug);
            result.push({
                loc: `/archives/${entry.slug}`,
                lastmod:
                    toIsoDate(entry.data?.updated_at) ||
                    toIsoDate(entry.data?.publish_time),
                changefreq: "monthly",
                priority: 0.6,
            });
        }

        totalPages = envelope.meta.total_pages;
        page += 1;
    }

    return result;
};

const renderSitemap = (siteUrl: string, urls: SitemapUrl[]): string => {
    const lines: string[] = [
        `<?xml version="1.0" encoding="UTF-8"?>`,
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ];
    for (const url of urls) {
        const loc = `${siteUrl}${encodePath(url.loc)}`;
        lines.push("  <url>");
        lines.push(`    <loc>${escapeXml(loc)}</loc>`);
        if (url.lastmod) {
            lines.push(`    <lastmod>${url.lastmod}</lastmod>`);
        }
        if (url.changefreq) {
            lines.push(`    <changefreq>${url.changefreq}</changefreq>`);
        }
        if (typeof url.priority === "number") {
            lines.push(`    <priority>${url.priority.toFixed(1)}</priority>`);
        }
        lines.push("  </url>");
    }
    lines.push("</urlset>");
    return lines.join("\n");
};

const loadSitemap = cachedFunction(
    async (ua?: string): Promise<string> => {
        const config = useRuntimeConfig();
        const apiBase = config.public.apiBase;
        const siteUrl = config.public.siteUrl.replace(/\/+$/, "");

        const archives = await collectArchives(apiBase, ua);
        return renderSitemap(siteUrl, [...STATIC_ROUTES, ...archives]);
    },
    {
        maxAge: 60 * 30,
        swr: true,
        getKey: () => "sitemap-xml",
    },
);

export default defineEventHandler(async (event) => {
    // 缓存函数内请求头为空，UA 在外层读取后传入
    const rawUa = event.node.req.headers["user-agent"];
    const ua = Array.isArray(rawUa) ? rawUa[0] : rawUa;

    const xml = await loadSitemap(ua);
    setResponseHeader(event, "Content-Type", "application/xml; charset=utf-8");
    return xml;
});
