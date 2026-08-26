import type { MarkdownPlugin } from "../plugin";
import { createMarkdownDetailsToggleController } from "../details-toggle";

export const detailsTogglePlugin: MarkdownPlugin = {
    name: "details-toggle",
    decorate: (root) => createMarkdownDetailsToggleController(root),
};
