# 阶段 4：Keep 风格改造 · Mac 代码块 + Header 缩放 + 返回顶部 + 侧栏组件清理

> 归档自 Claude Code 会话规划。上一阶段：`phase-3-lists.md`。收尾阶段。

## Context

阶段 1-3 已完成：Token 层、首页 Banner+卡片、列表页时间线+胶囊。阶段 4 收尾：文章页细节 + 全局交互 + 剩余青色清理。

前置决策：
1. **代码块**：完整 Mac 风（三色圆点 + 大阴影）
2. **Header 缩放**：滚过 64px 后高度 → 48px + 阴影
3. **返回顶部**：右下角 40x40 圆形按钮，滚 400px 后淡入

## 目标

**处理文章页细节 + 全局交互，不动数据层与列表页。**

1. 新建 `keep-code-block.css`：Mac 风代码块
2. 新建 `keep-scroll.css`：Header 缩放
3. 新建 `KeepBack2Top.vue`：右下角浮动返回顶部按钮
4. 修改 `Layout.vue`：scroll 监听切 `body.header-shrink` + 挂载 `<KeepBack2Top />`
5. 清理 4 个侧栏组件的青色：`PostAsideTop`、`AsidePostBottom`、`AuthorHeader`、`AuthorAsideBottom`
6. `theme/index.ts` 引入 2 个新 CSS

## 实施要点

### 1. keep-code-block.css

VitePress 代码块 DOM：`.language-xxx > button.copy + span.lang + pre.shiki`。

- 容器 `padding-top: 34px` 让出 Mac 头空间
- `::after` 画 Mac 头背景条（浅色 `--keep-bg-3`，暗色 `#1a1e24`）
- `::before` 画三色圆点：主圆点 `#fc625d`（12px），`box-shadow: 20px 0 #fdbc40, 40px 0 #35cd4b` 一次画黄绿
- `.lang` 移到 Mac 头右上，`opacity: 1 !important`
- `.copy` `top: 44px !important` 下移到 Mac 头下方
- 阴影 `0 8px 32px rgba(0, 0, 0, 0.15)`（暗色 0.35）

### 2. keep-scroll.css

- `.VPNavBar` transition 平滑
- `body.header-shrink { --vp-nav-height: 48px !important; }`
- shrink 时 `.VPNavBar` 加淡阴影（浅/暗色不同）

### 3. KeepBack2Top.vue

- `onMounted` addEventListener('scroll', { passive: true })
- rAF 节流，`window.scrollY > 400` 时 `visible = true`
- 点击 `window.scrollTo({ top: 0, behavior: 'smooth' })`
- `<Transition name="kb2t">` fade + slide
- 40x40 圆形，Keep 蓝底 → hover 深蓝 + 微上抬
- 响应式：≤640px 位置调整

### 4. Layout.vue

新增：`onMounted` + `onUnmounted` 一对 scroll 监听（rAF 节流），滚过 64px 切 `body.header-shrink` class；模板末尾挂 `<KeepBack2Top />`（放在 `<Layout>` 之外，独立于内部滚动容器）。

保留：`watchEffect` 设置 cookie；三个插槽 `doc-before`/`aside-top`/`aside-bottom`。

### 5. 4 个侧栏组件青色 → Keep

- `PostAsideTop.vue`：
  - `.pat-category` 青色三行 → `color: #fff; background: var(--keep-primary); border: 1px solid var(--keep-primary);`
  - `.pat-tag:hover` → `color/border: var(--keep-primary)`
- `AsidePostBottom.vue`：
  - `.aside-post-link a:hover` → `var(--keep-primary)`
  - `.aside-post-back a:hover` 青色 + text-shadow → 仅 `var(--keep-primary-dark-1)`
- `AuthorHeader.vue`：`.ah-avatar` 边框 `rgba(0,255,255,0.2)` → `var(--keep-border)`
- `AuthorAsideBottom.vue`：a:hover 同 `AsidePostBottom.aside-post-back`

### 6. theme/index.ts

CSS import 序列新增 2 行：`keep-code-block.css` 与 `keep-scroll.css`（在 `keep-timeline.css` 之后、`neon.css` 之前）。

## 关键文件路径

**新建**：
- `docs/.vitepress/theme/styles/keep-code-block.css`
- `docs/.vitepress/theme/styles/keep-scroll.css`
- `docs/.vitepress/theme/components/KeepBack2Top.vue`
- `docs/planning/keep-theme-migration/phase-4-details.md`

**修改**：
- `docs/.vitepress/theme/Layout.vue`
- `docs/.vitepress/theme/components/PostAsideTop.vue`
- `docs/.vitepress/theme/components/AsidePostBottom.vue`
- `docs/.vitepress/theme/components/AuthorHeader.vue`
- `docs/.vitepress/theme/components/AuthorAsideBottom.vue`
- `docs/.vitepress/theme/index.ts`

**不改**：`neon.css`（`--tp-*` utility 保留）、`custom.css`、`keep-tokens.css`、`keep-base.css`、`keep-timeline.css`、所有列表组件、数据层、配置、抓取脚本。

## 验证

Dev server 保持运行。HMR 自动刷新。

1. 文章详情页：代码块左上三色圆点、右上语言标签；hover 出 copy 按钮；容器阴影明显
2. 任意页面滚动 > 64px：导航栏收缩到 48px + 淡阴影；回顶部恢复
3. 滚动 > 400px：右下角 Keep 蓝圆按钮淡入；点击平滑回顶
4. 文章侧栏：分类徽标 Keep 蓝底白字；标签胶囊 hover Keep 蓝；上下篇/返回博客 hover 无发光
5. 作者页头像边框 Keep 中性灰；返回博客 hover 深蓝
6. 回归：首页 Banner + BlogHome + 时间线 + 胶囊标签保持前几阶段
7. grep：`docs/.vitepress/theme/components/*.vue` 无 `rgba(0, 255, 255` / `var(--tp-cyan)` / 青色 `text-shadow`

## 未来（可选）

- 阅读时长 / 字数统计
- 图片懒加载
- TOC 高亮的更精细动画
- 站点访客计数、评论区
- 从 `neon.css` 完全移除 `--tp-*`（若确认无组件在用）
