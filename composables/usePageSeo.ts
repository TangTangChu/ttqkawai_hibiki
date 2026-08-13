import { SITE_IMAGE, SITE_NAME, buildCanonicalUrl } from "~/utils/seo";

interface PageSeoOptions {
    title: () => string;
    description: () => string;
}

export const usePageSeo = (options: PageSeoOptions): void => {
    const config = useRuntimeConfig();
    const route = useRoute();
    const { locale, locales } = useI18n();

    const ogLocale = computed(() => {
        const current = (locales.value as { code: string; iso: string }[]).find(
            (l) => l.code === locale.value,
        );
        return (current?.iso ?? "zh-CN").replace("-", "_");
    });

    useHead(() => {
        const title = options.title();
        const description = options.description();
        const url = buildCanonicalUrl(config.public.siteUrl, route.path);

        return {
            title,
            link: [{ rel: "canonical", href: url }],
            meta: [
                { name: "description", content: description },
                { property: "og:title", content: title },
                { property: "og:description", content: description },
                { property: "og:image", content: SITE_IMAGE },
                { property: "og:type", content: "website" },
                { property: "og:url", content: url },
                { property: "og:site_name", content: SITE_NAME },
                { property: "og:locale", content: ogLocale.value },
                { name: "twitter:card", content: "summary_large_image" },
                { name: "twitter:title", content: title },
                { name: "twitter:description", content: description },
                { name: "twitter:image", content: SITE_IMAGE },
            ],
        };
    });
};
