import type { MarkdownDecorator } from "./plugin";

/** summary 行内提示文案的开合改写：展开 → 收起。 */
const toOpenLabel = (text: string): string => text.replace(/展开/g, "收起");

interface SummaryLabel {
    node: Text;
    closed: string;
    open: string;
}

/** details 折叠块：开合时同步 summary 文案，箭头旋转交由 CSS 过渡。 */
export const createMarkdownDetailsToggleController = (
    container: HTMLElement,
): MarkdownDecorator => {
    const labels = new WeakMap<HTMLDetailsElement, SummaryLabel>();

    const bind = (details: HTMLDetailsElement): void => {
        if (labels.has(details)) return;
        const summary = details.querySelector(":scope > summary");
        if (!summary) return;
        const node = [...summary.childNodes].find(
            (child): child is Text => child.nodeType === Node.TEXT_NODE,
        );
        if (!node) return;
        const closed = node.nodeValue ?? "";
        const open = toOpenLabel(closed);
        // 文案不含“展开”的 summary 视为章节标题，不做文字替换
        if (open === closed) return;
        labels.set(details, { node, closed, open });
        if (details.open) node.nodeValue = open;
    };

    const collect = (): void => {
        for (const details of container.querySelectorAll<HTMLDetailsElement>(
            "details",
        )) {
            bind(details);
        }
    };

    const handleToggle = (event: Event): void => {
        const details = event.target as Element | null;
        if (!(details instanceof HTMLDetailsElement)) return;
        const label = labels.get(details);
        if (!label) return;
        label.node.nodeValue = details.open ? label.open : label.closed;
    };

    collect();
    // toggle 事件不冒泡，需以捕获阶段委托到容器上
    container.addEventListener("toggle", handleToggle, true);

    return {
        refresh: collect,
        destroy: () => {
            container.removeEventListener("toggle", handleToggle, true);
        },
    };
};
