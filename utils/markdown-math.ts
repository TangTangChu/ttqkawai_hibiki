import katex from "katex";
import "katex/dist/katex.min.css"; // 直接 import 样式，不再使用 CDN
import { transformOutsideFencedBlocks } from "./markdown-preprocess";

const BLOCK_MATH_REGEX = /\$\$\s*\n?([\s\S]*?)\n?\s*\$\$/g;
const INLINE_MATH_REGEX = /(?<![a-zA-Z0-9$])\$([^\s$](?:[^$]*[^\s$])?)\$(?![0-9])/g;

const renderKatex = (tex: string, displayMode: boolean): string => {
    try {
        return katex.renderToString(tex, {
            displayMode,
            throwOnError: false,
            trust: true,
        });
    } catch {
        return displayMode
            ? `<div class="math-error p-4 bg-error/10 text-error rounded-xl my-4">${tex}</div>`
            : `<code class="math-error text-error">${tex}</code>`;
    }
};

export const transformMarkdownMath = (content: string): string => {
    return transformOutsideFencedBlocks(content, (segment) => {
        // 先处理块级公式
        let result = segment.replace(BLOCK_MATH_REGEX, (_m, tex: string) => {
            return renderKatex(tex.trim(), true);
        });

        // 再处理行内公式
        result = result.replace(INLINE_MATH_REGEX, (_m, tex: string) => {
            return renderKatex(tex.trim(), false);
        });

        return result;
    });
};

export default transformMarkdownMath;
