# 阶段 1：Keep 风格改造 · 设计 Token 层

> 归档自 Claude Code 会话规划。后续阶段的 plan 将追加为 `phase-2-*.md` 等。

## Context

将当前 VitePress 博客的视觉风格由现有的"霓虹科技风"（青紫 + 毛玻璃 + 扫描线）**完全复刻**为 hexo-theme-keep 风格（参考站 https://xpoet.cn ，源码位于同事本地 `d:/Ai-Project/hexo-theme-keep`）。

前置决策：
1. **视觉风格**：完全复刻 Keep 原版（主色 `#0066cc`、字号 15.2px、圆角 8px、GitHub 风暗色 `#22272e` 等）
2. **Banner 文案**：由 Claude 提供默认欢迎语（阶段 2 使用）
3. **改造节奏**：分阶段逐个 PR，本次仅做**阶段 1 · 设计 Token 层**

改造分四个阶段：
- **阶段 1 · Token 层**（本文档）：抽取 Keep 完整的 CSS 变量体系，替换 `neon.css` 的品牌色 / 背景色 / 文字色 / 阴影
- **阶段 2 · 首页 + Banner**：新建打字机 Banner、重写 `BlogHome` 卡片列表
- **阶段 3 · 列表 + 归档**：`CategoryPosts` 卡片化、`BlogArchives` 时间线布局、`BlogTags` 胶囊
- **阶段 4 · 文章页 + 细节**：Mac 风代码块、TOC 高亮、header 滚动缩放、返回顶部

阶段 1 完成后的可见变化：VitePress 品牌色由霓虹青变为 Keep 蓝、链接/按钮/hero 换色、暗色背景由 `#0a0a0a` → `#22272e`、正文字号 15.2px、圆角 8px。文章列表、导航栏结构不变。

## 目标

**只改样式变量层，不动组件结构。**

1. 新建 `keep-tokens.css`：把 Keep 的 Stylus 变量精确翻译为 CSS 变量（浅色 + 暗色两套完整色板 + 阴影 + 字号 + 圆角 + header 尺寸 + 5 类 keep-block）。
2. 新建 `keep-base.css`：把 Keep 变量**映射到 VitePress 原生变量**（`--vp-c-brand-*`、`--vp-c-bg*`、`--vp-c-text-*`），让默认组件自动吃到新配色。
3. **精简** `neon.css`：删除与新 Token 冲突的品牌色/hero/按钮变量定义，保留独立 utility class。
4. **保留** `custom.css` 不改（阶段 2-3 逐段清理其中的青色硬编码）。
5. 更新 `theme/index.ts` 的 CSS 引入顺序。
6. 归档本文件到 `docs/planning/keep-theme-migration/`。
7. `config.ts` 加 `srcExclude: ["planning/**"]` 防止 planning 被 build。

## 实施步骤

### 1. 新建 `docs/.vitepress/theme/styles/keep-tokens.css`

完整翻译自 `hexo-theme-keep/source/css/common/stylus-variables.styl` 和 `css-variables.styl`。Stylus 的 `lighten()` / `darken()` / `alpha()` 已手工换算为十六进制 / rgba 写死。

包含变量组：
- 主色 5 档（primary / light-1 / light-2 / dark-1 / dark-2）
- 浅色背景 3 级 + content 背景
- 浅色文字 6 级 + badge
- 边框 / 阴影（normal + hover）/ 选中色 / 滚动条
- Header 透明背景（scroll 前后 2 档）
- 5 类 Keep Block：info / primary / success / warning / danger（各 3 变量：color/bg/border）
- 字号 15.2px、行高 22px、Optima 字体族
- 页面宽度（PC/tablet/mobile）、最大宽度 960px、组件间距 36px
- 圆角 8px、header 高度 70/50.4px

`.dark` 类下重写：暗色背景 `#22272e` 系、暗色文字 `#adbac5` 系、暗色主色 `#268bef`、暗色阴影 `rgba(120,120,120,0.18)`。

### 2. 新建 `docs/.vitepress/theme/styles/keep-base.css`

把 Keep 变量映射到 VitePress 原生变量，让 VitePress 内置组件（导航、按钮、hero、代码块、徽标、侧边栏）自动生效。

覆盖的 VitePress 变量：
- `--vp-c-brand-1/2/3`、`--vp-c-brand-soft` → 指向 `--keep-primary` 系列
- `--vp-c-bg`、`--vp-c-bg-alt`、`--vp-c-bg-soft`、`--vp-c-bg-mute` → Keep 背景
- `--vp-c-text-1/2/3` → Keep 文字
- `--vp-c-border`、`--vp-c-divider`、`--vp-c-gutter` → Keep 边框
- `--vp-button-brand-*` 全套 → Keep 主色按钮
- `--vp-home-hero-name-color` → Keep 蓝纯色（取消原青紫渐变）
- `--vp-home-hero-name-background: initial` / `image: none` / `filter: none` → 关闭原渐变与模糊
- `--vp-font-family-base` → Optima 字体族
- `font-size` → 15.2px

`::selection` 使用 `--keep-selection`。

### 3. 修改 `docs/.vitepress/theme/styles/neon.css`

**删除**：
- 第 8-60 行 `:root` 中的 `--vp-c-brand-*`、`--vp-home-hero-*`、`--vp-button-brand-*`（保留 `--tp-cyan/purple/magenta`）
- 第 65-119 行 `.dark` 中所有 `--vp-c-*` 覆盖（保留 `--tp-*` 三色）

**保留**：`.neon-glow`、`.glass-card`、`.gradient-text`、`.pulse-border`、`.neon-divider`、`.tech-tag`、`.scanlines` 等 utility class。

### 4. 修改 `docs/.vitepress/theme/index.ts`

新增两行 import，顺序：`keep-tokens` → `keep-base` → `neon`（已瘦身） → `custom`（待阶段 2 清理）。

### 5. 归档 plan 到 `docs/planning/keep-theme-migration/phase-1-tokens.md`

即本文件。后续 phase-2/3/4 追加进同目录。

### 6. 修改 `docs/.vitepress/config.ts`

在顶层选项新增：

```ts
srcExclude: ["planning/**"],
```

放置在 `base: "/auto-blog-ai/"` 附近。防止 VitePress 把 planning 页面 build 进最终站点。

### 7. 不改的部分

- 所有 Vue 组件
- `docs/index.md`
- 所有博客 Markdown
- 抓取脚本 `scripts/**`
- `posts.data.ts`、`usePosts.ts`
- `custom.css` 中的 VitePress 组件覆盖（阶段 2-3 清理）

## 关键文件路径

**新建**：
- `docs/.vitepress/theme/styles/keep-tokens.css`
- `docs/.vitepress/theme/styles/keep-base.css`
- `docs/planning/keep-theme-migration/phase-1-tokens.md`

**修改**：
- `docs/.vitepress/theme/styles/neon.css`
- `docs/.vitepress/theme/index.ts`
- `docs/.vitepress/config.ts`

**参考（不改）**：
- `hexo-theme-keep/source/css/common/stylus-variables.styl`
- `hexo-theme-keep/source/css/common/css-variables.styl`

## 验证

1. `pnpm docs:dev` 启动开发服务器（http://localhost:5173）。
2. **浅色模式肉眼确认**：
   - 首页 hero 主标题颜色由青紫渐变 → **Keep 蓝 `#0066cc`**
   - "开始阅读"按钮背景变为 Keep 蓝
   - 正文字号明显变小（15.2px）、字体变为 Optima
   - 页面主背景由深黑 → 纯白
3. **暗色模式（右上角切换）**：
   - 主背景由 `#0a0a0a` → **`#22272e`**
   - 正文文字变为 `#adbac5` 柔和灰
   - hero 主标题变为亮蓝 `#268bef`
4. **回归检查**（应保持不变）：
   - 导航栏毛玻璃、文章侧栏结构、TOC 位置、代码块布局
   - 抓取产出的现有文章正常渲染，链接跳转正常
5. **planning 排除验证**：访问 `/auto-blog-ai/planning/keep-theme-migration/phase-1-tokens` 应 404。
6. `custom.css` 仍会带来一些残余青色（TOC 边框、侧边栏 hover、代码块边框），这是**预期**——阶段 2 起逐段清理。

**不需要在阶段 1 里做**：Banner 打字机、卡片列表、时间线归档、Mac 风代码块、header 缩放。
