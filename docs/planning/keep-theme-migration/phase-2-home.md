# 阶段 2：Keep 风格改造 · 首页 + 打字机 Banner + 卡片列表

> 归档自 Claude Code 会话规划。上一阶段：`phase-1-tokens.md`。

## Context

阶段 1（Token 层）已完成、验证通过：Keep 变量 `--keep-*` 与 `--vp-c-brand-*` 全部对上，主色 `#0066cc`、暗色背景 `#22272e`、字号 15.2px 已生效。但**首页 `docs/index.md` 仍在使用 VitePress 内置的 `layout: home`（hero + features），完全不像 Keep**。同时 `BlogHome.vue` 内部还有大量青色硬编码。

阶段 2 目标：**让首页视觉与 xpoet.cn 一致**——上来就是全屏 Banner + 双行打字机欢迎语，向下滑动才看到卡片式文章列表。

前置决策：
1. **首页布局**：Banner 100vh 全屏 → 下滑看文章列表
2. **卡片顶部封面**：分类色渐变块 + 中央分类图标 SVG（当前 frontmatter 无 cover 字段）
3. **欢迎语**：`AI 与前端的每日切片｜` + `Slices of AI & Frontend, every day.｜`

## 目标

**只改首页布局 + Banner 组件 + BlogHome 卡片样式，不动数据层。**

1. 新建 `KeepBanner.vue`：Keep 风格全屏首屏 + 双行打字机（100ms/char，参照 Keep `home-page.js` L46-90）+ 底部向下弹跳箭头。
2. 重写 `BlogHome.vue`：Keep 风格卡片列表——顶部渐变色块 + 分类图标、底部标题 + 摘要 + meta，阴影 hover 加深，无硬编码青色。
3. 改 `docs/index.md`：`layout: home` → `layout: page`，挂载 `<KeepBanner />` + `<BlogHome />`。
4. `theme/index.ts` 注册 `KeepBanner`。

## 实施要点

### 1. KeepBanner.vue

- 组件外壳 100vh，flex 居中；`ref` 拿到两个 `.desc` 元素，`onMounted` 里记录 `textContent` 后清空，300ms 后开始逐字追加（每 100ms 一字）
- 第一行打完再打第二行；每行完成后隐藏其 `｜` 光标
- 底部 chevron 图标 CSS bounce 动画；点击 `window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })`
- SSR 安全：`onMounted` 只在客户端跑；SSR 阶段两行文案完整存在于 DOM 中（利于首屏 SEO），客户端接管后清空重打
- 光标 blink（1.1s steps(1)）、Banner 入场（fade-in-down 0.8s）、chevron 弹跳（bounce 2s）
- ≤640px 字号从 2rem 降到 1.4rem

### 2. BlogHome.vue

- 移除 `<header>` h2（首页有 Banner 会重复）
- 卡片双区结构：
  - `.home-post-item-top`：10rem 高，分类色渐变，中央绝对定位大 SVG 图标（72px，半透明白色），overflow-hidden + 图标 hover scale(1.03)
  - `.home-post-item-bottom`：padding 2rem，标题 1.4rem 600、摘要 3 行截断、meta 一行（日期 + 分类徽标）
- 单列布局，最大 960px，`gap: 24px`
- 卡片：`background: var(--keep-content-bg)`，`border-radius: var(--keep-radius)`，`box-shadow: 0 0 8px var(--keep-shadow)` → hover 12px `--keep-shadow-hover`
- **无 transform**（Keep 默认 `--home-post-hover-scale: 1`）
- 分页按钮改用 `var(--keep-primary)` / `--keep-border` / `--keep-text-3` / `--keep-bg-1`
- 分类色渐变：frontend 蓝、ai-news 紫、movies 橙、default 灰

### 3. docs/index.md

`layout: home` → `layout: page`，删除 hero/features，`sidebar: false`，挂载 `<KeepBanner /><BlogHome />`。

### 4. theme/index.ts

新增一行 import 与一行 `app.component("KeepBanner", KeepBanner)`。

## 关键文件路径

**新建**：
- `docs/.vitepress/theme/components/KeepBanner.vue`
- `docs/planning/keep-theme-migration/phase-2-home.md`

**修改**：
- `docs/.vitepress/theme/components/BlogHome.vue`
- `docs/index.md`
- `docs/.vitepress/theme/index.ts`

**参考（不改）**：
- `hexo-theme-keep/source/js/page/home-page.js` L46-90
- `hexo-theme-keep/layout/_partial/first-screen.ejs`
- `hexo-theme-keep/layout/_page/home.ejs`
- `hexo-theme-keep/source/css/layout/_page/home.styl`

## 验证

Dev server 保持在跑（`http://localhost:5173/auto-blog-ai/`）。HMR 自动刷新。

1. **首页视觉**（`/auto-blog-ai/`）：Banner 100vh 撑满，中央双行文字**逐字打字**（100ms/char），第一行完成后光标消失、第二行开始；底部 chevron 弹跳
2. **交互**：点击 chevron 平滑滚到第二屏
3. **卡片视觉**：单列大卡，顶部 10rem 分类色渐变块 + 中央白色 SVG 图标，hover 时图标 scale(1.03)、卡片阴影加深，无 translate 抖动
4. **暗色模式**：Banner 背景 `#22272e`、文字 `#adbac5`；卡片背景 `#1e232a`，阴影 `rgba(120,120,120,0.18)`
5. **/blog 路由**：`docs/blog/index.md` 自动应用同款 BlogHome（无 Banner）
6. **/blog/frontend、/blog/ai-news**：CategoryPosts 未动（阶段 3 改），主色跟随 Keep 蓝

## 不做的（阶段 3-4）

- CategoryPosts / BlogArchives / BlogTags 的 Keep 风格改造
- 归档时间线、胶囊标签、Mac 三色代码块、header 缩放、返回顶部
- `custom.css` 中 TOC 与侧边栏残余青色清理
