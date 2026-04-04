const DEFAULT_LOCALE = "zh-CN";

const localeMap: Record<string, string> = {
    zh: DEFAULT_LOCALE,
    en: "en-US",
    ja: "ja-JP",
};

export const resolveLocaleCode = (locale: string): string => {
    return localeMap[locale] ?? DEFAULT_LOCALE;
};

export const resolveCmsLocale = (locale: string): string => {
    return resolveLocaleCode(locale);
};

export const formatDate = (
    dateText: string,
    locale: string,
    options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
    },
): string => {
    return new Intl.DateTimeFormat(resolveLocaleCode(locale), options).format(
        new Date(dateText),
    );
};

export const formatDateTime = (dateText: string, locale: string): string => {
    return formatDate(dateText, locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};
