import { parseMarkdown } from "@nuxtjs/mdc/runtime";
import type { MDCParserResult } from "@nuxtjs/mdc";
import type { Component } from "vue";
import {
    runMarkdownPipeline,
    type SegmentTransform,
} from "~/utils/markdown/pipeline";
import {
    collectTransforms,
    type MarkdownPlugin,
} from "~/utils/markdown/plugin";
import {
    alertsPlugin,
    bilibiliPlugin,
    githubCardPlugin,
    imageSizePlugin,
    captionPlugin,
    highlightPlugin,
    mathPlugin,
    subSupPlugin,
    codeCopyPlugin,
} from "~/utils/markdown/plugins";
import MarkdownAlert from "~/components/mdc/MarkdownAlert.vue";
import BilibiliEmbed from "~/components/mdc/BilibiliEmbed.vue";
import Katex from "~/components/mdc/Katex.vue";
import MdFigure from "~/components/mdc/MdFigure.vue";
import GithubCard from "~/components/GithubCard.vue";
import ProseA from "~/components/prose/ProseA.vue";
import ProseH1 from "~/components/prose/ProseH1.vue";
import ProseH2 from "~/components/prose/ProseH2.vue";
import ProseH3 from "~/components/prose/ProseH3.vue";
import ProseH4 from "~/components/prose/ProseH4.vue";
import ProseH5 from "~/components/prose/ProseH5.vue";
import ProseH6 from "~/components/prose/ProseH6.vue";
import ProseImg from "~/components/prose/ProseImg.vue";
import ProsePre from "~/components/prose/ProsePre.vue";

// transform 顺序：块级/属性在前，行内（哨兵）其后，纯装饰器最后。
export const markdownPlugins: MarkdownPlugin[] = [
    alertsPlugin,
    bilibiliPlugin,
    githubCardPlugin,
    imageSizePlugin,
    captionPlugin,
    highlightPlugin,
    mathPlugin,
    subSupPlugin,
    codeCopyPlugin,
];

export const markdownComponents: Record<string, Component> = {
    a: ProseA,
    pre: ProsePre,
    h1: ProseH1,
    h2: ProseH2,
    h3: ProseH3,
    h4: ProseH4,
    h5: ProseH5,
    h6: ProseH6,
    img: ProseImg,
    "markdown-alert": MarkdownAlert,
    "bilibili-embed": BilibiliEmbed,
    "github-card": GithubCard,
    katex: Katex,
    "md-figure": MdFigure,
};

const transforms: SegmentTransform[] = collectTransforms(markdownPlugins);

const prepareMarkdown = (content: string): string =>
    runMarkdownPipeline(content, transforms);

const CACHE_LIMIT = 16;
const parseCache = new Map<string, Promise<MDCParserResult>>();

export const useMarkdown = (): {
    prepareMarkdown: (content: string) => string;
    parseMdcMarkdown: (
        content: string,
        sanitize?: boolean,
    ) => Promise<MDCParserResult>;
} => {
    const parseMdcMarkdown = (
        content: string,
        sanitize = true,
    ): Promise<MDCParserResult> => {
        const cacheKey = `${sanitize ? "1" : "0"}::${content}`;
        const cached = parseCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        const promise = parseMarkdown(prepareMarkdown(content), {
            rehype: { options: { allowDangerousHtml: !sanitize } },
            toc: { depth: 6, searchDepth: 6 },
        }).catch((error) => {
            parseCache.delete(cacheKey);
            throw error;
        });

        parseCache.set(cacheKey, promise);
        if (parseCache.size > CACHE_LIMIT) {
            const oldestKey = parseCache.keys().next().value;
            if (oldestKey !== undefined) {
                parseCache.delete(oldestKey);
            }
        }

        return promise;
    };

    return { prepareMarkdown, parseMdcMarkdown };
};
