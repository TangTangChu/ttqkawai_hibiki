# Markdown 渲染链路与插件架构

> 本文档描述本项目（以及共享同一套机制的 JXUFE-CSG-Website 等仓库）的 markdown 渲染链路、插件系统、安全模型与跨仓库同步方式。共享层位于 `utils/markdown/`。

## 1. 总览

技术栈：Nuxt 4 + `@nuxtjs/mdc`（底层 unified / remark / rehype）。
渲染分三段：**预处理（字符串）→ MDC 解析（AST）→ 渲染后 DOM 装饰**。

```
原始 markdown
  │  prepareMarkdown —— 统一管线（单次代码围栏扫描）
  │   runMarkdownPipeline(content, collectTransforms(plugins))
  │   · 块级特性 → MDC 原生语法（::alert / ::bilibili / ::github-card / ::katex / ::md-figure / {width=}）
  │   · 行内特性 → 私有区 Unicode 哨兵（markdown 惰性，不与 GFM 冲突）
  ▼
  parseMarkdown(@nuxtjs/mdc)            rehype.allowDangerousHtml = !sanitize（AST 层拦截用户 raw HTML）
  ▼  ←━━ 模块级有界缓存（key = `${sanitize}::${content}`，命中即返回 Promise，去重在途）
  MDCParserResult
  ▼
  <MDCRenderer :components="markdownComponents">      （Prose* / Alert / Bilibili / GithubCard / Katex / MdFigure …）
  渲染后的 DOM
  ▼  syncMarkdownDom（parsedContent 变化 + ResizeObserver 兜底触发）
  │   1. 依次跑各插件 decorate（哨兵→真实元素、代码复制、图片查看器、视频播放器…）
  │   2. extractHeadingItems → DOM 提取 TOC（自定义 slugify）
  最终页面
```

## 2. 硬约束（改动时不可违反）

- **TOC 必须用「渲染后 DOM querySelectorAll + slugify」**，禁用 MDC 自带 `parsed.toc`（不符合需求）。
- **`ResizeObserver` 必须保留**：TOC 组件有概率因时序问题不显示，它作为「DOM 就绪/变化」的兜底重算入口。
- **不走 SSR**：markdown 仅在浏览器主线程解析渲染。
- **安全用 `allowDangerousHtml: !sanitize`**：不引入 rehype-sanitize（验证过是弯路），用户 markdown 源里的 raw HTML 在 AST 层被转义。
- **行内特性走「哨兵 + 渲染后装饰器」**：MDC 内联组件（`:name[...]`）在词中间（前面非空格）不渲染，无法支持 `H~2~O`、行内 `$..$`；raw HTML 又与上一条冲突。

## 3. 插件系统

一个特性 = 一个自包含插件对象，按需实现三个扩展点：

```ts
export interface MarkdownPlugin {
    name: string;                          // 唯一名，装饰器实例 key
    transform?: SegmentTransform;          // 预处理（纯逻辑，作用于非代码段字符串）
    decorate?: MarkdownDecoratorFactory;   // 渲染后 DOM 装饰（纯逻辑，返回 {refresh, destroy}）
    components?: string[];                  // 本插件产出的 MDC 组件名（契约，需各项目绑定组件实现）
}
```

- 装饰器统一为「工厂返回 `{refresh, destroy}`」。纯函数型（行内哨兵）用 `idempotentDecorator` 包装：create/refresh 时重跑、destroy 空操作；有状态型（代码复制、图片查看器、视频播放器）自带生命周期。
- 注册表辅助：`collectTransforms` / `collectDecorators` / `collectRequiredComponents` / `assertComponentsBound`（开发期校验契约组件是否漏绑，控制台告警，专防跨仓库同步遗漏）。

### 两种典型形态

| 形态 | 适用 | 例子 |
|---|---|---|
| transform → 哨兵 + decorate | 行内、词中间、需真实元素 | highlight、sub-sup、行内 math |
| transform → MDC 块组件（契约） | 块级、需复用项目组件 | alerts、bilibili、github-card、块级 math、caption |
| 纯 decorate | 仅操作渲染后 DOM | code-copy、image-viewer、video-player |

## 4. 文件布局

**可逐字复制的共享层** `utils/markdown/`（各仓库一致，零项目耦合，只 import 自身与 npm 包）：
```
pipeline.ts        围栏扫描 + runMarkdownPipeline
plugin.ts          MarkdownPlugin/Decorator 类型 + collect*/assert*
sentinel.ts        哨兵分配 + wrapSentinel + decorateSentinel + idempotentDecorator
toc.ts             extractHeadingItems + tocItemsEqual
code-copy.ts       代码复制 controller
image-viewer.ts    图片查看器（JXUFE 等使用）
video-player.ts    视频播放器（JXUFE 等使用）
plugins/
  alerts / bilibili / github-card / image-size / caption /
  highlight / sub-sup / math / code-copy / image-viewer / video-player / index
```

**每项目自有层**（差异集中点）：
- `composables/UseMarkdown.ts` —— **绑定文件**：装配本项目的 `markdownPlugins` 列表 + `markdownComponents`（绑定本项目组件），暴露 `parseMdcMarkdown`（管线 + allowDangerousHtml + 缓存）。
- `components/MarkdownRender.vue` —— **瘦壳**：MDCRenderer(componentMap) + 装饰器编排（`Map<name, Decorator>`，create/refresh，卸载 destroy）+ TOC + ResizeObserver；spinner 等用各项目自己的组件。
- `components/mdc/*`、`components/prose/*` —— 本项目组件实现。
- `assets/css/markdown.css` —— 本项目样式。

## 5. 安全模型

- 默认 `sanitize=true` → `allowDangerousHtml:false`：用户正文里手写的 `<script>`、`<img onerror>` 等被转义/丢弃。
- 我方插件**不注入 raw HTML**：块级走 MDC 组件，行内走「哨兵 + 装饰器（用 DOM API 创建元素 / 受信 KaTeX 输出）」，与 `allowDangerousHtml:false` 共存。
- 需放行 raw HTML 时给 `<MarkdownRender :sanitize="false" />`。

## 6. 现有插件与语法

| 插件 | 语法 | 产物 |
|---|---|---|
| alerts | `> [!NOTE] 标题` + 引用块 | `::anri-alert{type title}` |
| bilibili | `@[bilibili](BV... / av...)` | `::bilibili-embed{identifier}` |
| github-card | 独立成行的 github.com 链接 | `::github-card{href}` |
| image-size | `![alt\|宽x高](url)` 或 `![alt](url =宽x高)` | 给图片加 `{width= height=}` |
| caption | `![alt](url "说明文字")` | `::md-figure{src alt caption}`（图片下方居中说明） |
| highlight | `==高亮==` | 渲染后 → `<mark>` |
| sub-sup | `^上标^`、`~下标~`（`~~删除线~~` 不受影响） | 渲染后 → `<sup>` / `<sub>` |
| math | 行内 `$..$`、块级 `$$..$$` | 行内→哨兵→KaTeX；块级→`::katex{tex display}` |
| code-copy | 代码块右上角复制按钮 | 纯装饰器（`.code-copy-btn`） |
| image-viewer | —（自动） | 图片点击放大 / 手势查看（仅装饰器） |
| video-player | `![alt](xxx.mp4/webm/ogg)` | 自定义视频播放器（仅装饰器） |

> 行内特性走 transformOutsideFencedBlocks，代码块内不受影响。

## 7. 如何新增一个特性

1. 在共享层写一个 `utils/markdown/plugins/xxx.ts`，导出 `MarkdownPlugin` 对象（按需实现 transform / decorate / components）。
   - 行内类：在 `sentinel.ts` 的 `SENTINELS` 加一对唯一哨兵，用 `wrapSentinel` / `decorateSentinel`。
   - 块级带组件：transform 产出 `::your-component{...}`，`components: ["your-component"]`。
2. `plugins/index.ts` 加一行导出。
3. 在各项目 `composables/UseMarkdown.ts`：把插件加入 `markdownPlugins` 列表；若有 `components` 契约，在 `markdownComponents` 绑定本项目的组件实现。
4. 开发模式下 `assertComponentsBound` 会在漏绑契约组件时告警。

## 8. 三仓库同步

- **同步功能**：把整个 `utils/markdown/` 目录复制到其它仓库即可（零项目耦合）。
- 各仓库仅维护：绑定文件、组件实现、`markdown.css`、瘦壳 `MarkdownRender.vue`。
- **新增特性**：写一个 `plugins/xxx.ts` → 复制目录 → 各仓库绑定文件加入列表、按契约提供组件（若有）。
- **依赖**：math / 行内插件需 `katex`，toc 需 `slugify` —— 各仓库都需安装。

## 9. 已知约束 / 坑

- **MDC 内联组件 `:name[...]` 在词中间不渲染** → 行内特性一律走哨兵 + 装饰器，勿用内联组件语法。
- **GFM 删除线 `~~..~~`** → 下标正则用 `(?<!~)~(?!~)` 守卫，避免误伤。
- **响应式组件子树内勿做 DOM 手术**：图片这类由响应式组件（如 ProseImg）渲染的内容，caption 等用「契约组件」而非装饰器，否则会被 Vue patch 覆盖。
- **块级公式走 `::katex` 组件**（块级 MDC 组件不受词中间限制）；行内公式走哨兵装饰器。
- **哨兵 payload 编码**：`encodeURIComponent` 后再转义残留的 `* _ ~ ! ( )`，确保 markdown 惰性。
