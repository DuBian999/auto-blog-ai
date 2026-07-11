# 阶段 3：Keep 风格改造 · 时间线列表 + 胶囊标签 + 清理 custom.css 青色

> 归档自 Claude Code 会话规划。上一阶段：`phase-2-home.md`。

## Context

阶段 1（Token）与阶段 2（首页 Banner + BlogHome 卡片）已完成。当前站点：
- 首页 & `/blog`：Keep 蓝主色 + 全屏 Banner + 渐变卡片 ✅
- `/blog/frontend` & `/blog/ai-news`：仍是双列青色小卡片
- `/blog/archives`：无时间线视觉，青色年份
- `/blog/tags`：胶囊 + count，青色系
- 文章详情页：TOC、侧边栏、代码块外框仍有青色（来自 `custom.css`）

阶段 3 目标：
1. CategoryPosts + BlogArchives 统一改为时间线（虚线 + 圆点 marker）
2. BlogTags 保留胶囊单段结构，仅换 Keep 配色
3. 一并清理 custom.css 中的青色残留

完成后：全站列表页视觉与 xpoet.cn 对齐；文章详情页除侧栏组件内部（`PostAsideTop.vue` 等）仍带青色外，其余 VitePress 部分完全 Keep 蓝。

## 目标

**只改三个列表组件 + custom.css，不动数据层与文章页组件。**

1. 新建 `docs/.vitepress/theme/styles/keep-timeline.css`：共享时间线样式，供 `BlogArchives` 与 `CategoryPosts` 用 class 引用
2. 重写 `BlogArchives.vue`：使用 `keep-timeline` 结构，按年份分组
3. 重写 `CategoryPosts.vue`：`keep-timeline` 结构 + 按年份分组 + 保留分页 + 顶部"分类名 · N 篇"
4. 重写 `BlogTags.vue`：胶囊 + count 单段，Keep 配色；下方筛选文章列表用 `keep-timeline` 简化版
5. 清理 `custom.css`：所有 `rgba(0, 255, 255, ...)` 与 `var(--tp-cyan)` 引用改为 Keep 变量。删除已废弃的 `.post-grid`、`.category-badge.*`、重复的 `::selection`
6. `theme/index.ts` 引入 `keep-timeline.css`

## 实施要点

### 1. keep-timeline.css

复刻 Keep `archive-list.styl` 的时间线，全部用 `--keep-*` 变量：
- 容器 `.keep-timeline` 最大 960px 居中
- 头部 `.timeline-header`（h2 + 副标题）
- `.timeline-year` 分组、`.timeline-year-heading` 1.6rem 600
- `.timeline-body` padding-left 1.2rem
- `.timeline-post` flex row + 相对定位
  - `::after` 竖向虚线（`border-left: 1px dashed var(--keep-text-5)`）
  - `::before` 圆点 marker（0.5rem，居中左侧，hover 变 0.6rem 且颜色加深）
- `.timeline-post-date` 3.6rem 等宽字体
- `.timeline-post-title` flex:1，hover 变 `--keep-primary`
- `.timeline-pagination` / `.timeline-page-btn` / `.timeline-page-num`

### 2. BlogArchives.vue

保留 `postsByYear` 分组与 `monthDay` 函数。模板改用 `keep-timeline` class 结构。`<style scoped>` 全部删除。

### 3. CategoryPosts.vue

保留所有分页脚本逻辑（`PAGE_SIZE`、`currentPage`、`goPage`、`syncSearchFromURL`、`popstate` 监听）。

新增：
- `pagedByYear` computed：把 `pagedPosts` 再按年份分组
- `categoryLabel` computed：`frontend → 前端资讯`、`ai-news → AI 新闻`

模板：`.timeline-header` 显示 `{{ categoryLabel }} · {{ posts.length }} 篇`，其余同 BlogArchives；分页控件 class 从 `cp-*` 改为 `timeline-*`。`<style scoped>` 全部删除。

### 4. BlogTags.vue

保留脚本的 `postsByTag`、`sortedTags`、`filteredPosts`、`selectTag`、URL 同步逻辑不动。

模板保持胶囊 + count 单段结构（class 名 `bt-tag` / `bt-count` 保留）。下方筛选出的文章列表改用 `timeline-body` + `timeline-post` 简化版（无年份分组）。

`<style scoped>` 改造：胶囊背景 `var(--keep-bg-2)`，边框 `var(--keep-border)`，hover 变 `--keep-primary`，active 变 `--keep-primary` 底 + 白字。

### 5. custom.css 清理

**替换**：
- `rgba(0, 255, 255, 0.xx)` 边框 → `var(--keep-border)`
- `var(--tp-cyan)` 主色 → `var(--keep-primary)`
- `rgba(0, 255, 255, 0.xx)` 背景 tint → `rgba(0, 102, 204, 0.06)`
- 滚动条 thumb 青色 → `rgba(0, 102, 204, 0.22)`
- `.dark .VPNav` 背景 `rgba(34, 39, 46, 0.9)`（跟随 `--keep-bg-1` 但带毛玻璃）
- `.vp-doc .custom-block.tip`：`var(--keep-primary)`

**删除**：
- `.vp-doc a` / `.vp-doc a:hover`（text-shadow 青色发光）——keep-base 已覆盖链接色
- `.post-grid`（BlogHome 已改单列）
- `.category-badge.frontend/movies/ai-news`（BlogHome 已改用 `.meta-category`）
- `::selection`（keep-base 已用 `--keep-selection` 覆盖）

### 6. theme/index.ts

新增 `import "./styles/keep-timeline.css"`（放在 `keep-base.css` 之后、`neon.css` 之前）。

## 关键文件路径

**新建**：
- `docs/.vitepress/theme/styles/keep-timeline.css`
- `docs/planning/keep-theme-migration/phase-3-lists.md`

**修改**：
- `docs/.vitepress/theme/components/BlogArchives.vue`
- `docs/.vitepress/theme/components/CategoryPosts.vue`
- `docs/.vitepress/theme/components/BlogTags.vue`
- `docs/.vitepress/theme/styles/custom.css`
- `docs/.vitepress/theme/index.ts`

**不改**：
- `PostAsideTop.vue` / `AsidePostBottom.vue` / `AuthorHeader.vue` / `AuthorAsideBottom.vue`（阶段 4）
- `neon.css`（仅剩 utility class）
- `posts.data.ts`、`usePosts.ts`、`config.ts`、抓取脚本、文章 Markdown

## 验证

Dev server 已在跑（`http://localhost:5173/auto-blog-ai/`），HMR 自动刷新。

1. `/blog/archives`：每年大标题 1.6rem 深灰，每篇左侧虚线竖线穿过 + 圆点 marker（0.5rem）；hover 圆点 0.6rem 深色、标题变 Keep 蓝
2. `/blog/frontend`、`/blog/ai-news`：顶部 `前端资讯 · N 篇` / `AI 新闻 · N 篇`；同款时间线；底部分页 Keep 蓝，active 蓝底白字
3. `/blog/tags`：胶囊灰底 → hover Keep 蓝边框 + 蓝字 → active Keep 蓝底白字；点击胶囊出现筛选列表（简化时间线）
4. 文章详情页：TOC 边框 Keep 蓝调；outline-link 高亮 Keep 蓝；链接 hover 无发光只色变；代码块外框中性；`::selection` Keep 蓝
5. 暗色模式：时间线圆点 `#4a5459` → hover `#6b787f`；胶囊背景 `#2a2f37`
6. 回归：首页 Banner + BlogHome 卡片保持阶段 2 效果
7. grep：`custom.css` 中不再有 `rgba(0, 255, 255` 或 `var(--tp-cyan)`

## 不做的（阶段 4）

- `PostAsideTop.vue` / `AsidePostBottom.vue` / `AuthorHeader.vue` / `AuthorAsideBottom.vue` 的青色清理
- 代码块 Mac 三色圆点
- Header 滚动缩放（70px → 50.4px）
- 返回顶部按钮
- 字数统计、阅读时长等文章 meta
