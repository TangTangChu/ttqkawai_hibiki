import { transformOutsideFencedBlocks } from "./markdown-preprocess";

/**
 * 转换 ^text^ 为 <sup>text</sup>
 * 转换 ~text~ 为 <sub>text</sub>
 */
const SUPERSCRIPT_REGEX = /\^([^\^]+)\^/g;
const SUBSCRIPT_REGEX = /~([^~]+)~/g;

export const transformMarkdownSubSup = (content: string): string => {
    return transformOutsideFencedBlocks(content, (segment) => {
        return segment
            .replace(SUPERSCRIPT_REGEX, "<sup>$1</sup>")
            .replace(SUBSCRIPT_REGEX, "<sub>$1</sub>");
    });
};

export default transformMarkdownSubSup;
