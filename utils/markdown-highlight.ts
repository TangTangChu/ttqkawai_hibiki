import { transformOutsideFencedBlocks } from "./markdown-preprocess";

/**
 * 转换 ==highlight== 为 <mark>highlight</mark>
 */
const HIGHLIGHT_REGEX = /==([^=]+)==/g;

export const transformMarkdownHighlight = (content: string): string => {
    return transformOutsideFencedBlocks(content, (segment) => {
        return segment.replace(HIGHLIGHT_REGEX, "<mark>$1</mark>");
    });
};

export default transformMarkdownHighlight;
