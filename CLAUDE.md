# CLAUDE.md — BLEACH-X 科技博客

## 项目概述

基于 VitePress + `@chunge16/vitepress-blogs-theme` 的自动化科技博客。每日定时从多个平台抓取前端/AI 资讯，经 LLM 策展后生成 Markdown 文章，自动部署到 GitHub Pages。

## 核心命令

```bash
pnpm docs:dev          # 本地启动开发服务器 (http://localhost:5173)
pnpm docs:build        # 构建生产版本
pnpm crawl             # 运行每日抓取任务（frontend + ai-news 串行）
pnpm crawl:frontend    # 仅抓取前端资讯
pnpm crawl:ai-news     # 仅抓取 AI 新闻

# 手动诊断/清理链接
npx tsx scripts/check-links.ts           # 扫描所有文章的原文链接可用性
npx tsx scripts/cleanup-broken-links.ts  # 扫描并自动删除失效链接
```

## 架构

```
数据源 (sources/)        抓取器 (crawlers/)        LLM 策展         输出
────────────────────────────────────────────────────────────────────────────
Hacker News ─┐
Dev.to ──────┤
Reddit ──────┼──→ frontend.ts ──→ curateNews() ──→ docs/blog/posts/frontend/
官方 RSS ────┘                    (筛选 Top 5 + 摘要)

Hacker News ─┐
Reddit ──────┼──→ ai-news.ts ────→ curateNews() ──→ docs/blog/posts/ai-news/
ArXiv ───────┘
```

### 关键数据流

1. `sources/*.ts` 从各平台获取 `RawNewsItem[]`
2. `crawlers/*.ts` 合并去重、按热度排序取 Top 30
3. `utils/llm.ts` 调用 LLM API 策展 → 返回 5 条 `CuratedNewsItem`
4. **链接验证**：`utils/link-checker.ts` 并发验证策展结果中的 URL，剔除失效项
5. `utils/markdown.ts` 写入 `docs/blog/posts/{category}/{YYYY-MM-DD}.md`

### 目录结构

```
scripts/
├── types.ts                 # RawNewsItem, BlogPost, Category 等类型定义
├── daily-task.ts            # 每日任务入口（串行执行两个 crawler）
├── check-links.ts           # 诊断脚本：扫描所有原文链接可用性
├── cleanup-broken-links.ts  # 清理脚本：删除失效链接/章节
├── sources/                 # 数据源适配器
│   ├── hacker-news.ts       #   Hacker News API
│   ├── devto.ts             #   Dev.to API
│   ├── reddit.ts            #   Reddit JSON
│   ├── arxiv.ts             #   ArXiv Atom XML
│   └── official-blogs.ts    #   官方博客 RSS (React/Vue/TS/Tailwind/Astro/Svelte)
├── crawlers/
│   ├── frontend.ts          # 前端资讯抓取器
│   └── ai-news.ts           # AI 新闻抓取器
└── utils/
    ├── llm.ts               # LLM 调用封装（OpenAI 兼容 API）
    ├── markdown.ts          # 文章文件写入
    └── link-checker.ts      # URL 可达性检查（HEAD → GET 回退）
```

## 自动化流水线

- **触发时间**：每天 UTC 00:00（北京时间 08:00）
- **工作流**：`.github/workflows/daily-crawl.yml` → `pnpm crawl` → commit & push → 触发 `.github/workflows/deploy.yml` → GitHub Pages
- **LLM 配置**：通过 GitHub Secrets 传入 `LLM_API_KEY`、`LLM_BASE_URL`、`LLM_MODEL`

## 重要约定

- **Node 版本**：20（GitHub Actions runner 中指定）
- **包管理器**：pnpm 10.x，`type: "module"`
- **运行器**：`tsx`（直接执行 TypeScript，无需编译）
- **Markdown 格式**：每篇文章 5 个 section，`## N. 标题` 格式，`---` 分隔，结尾 `::: tip 关于本栏目` 块
- **frontmatter**：`title`、`date`、`category`、`tags`、`author`、`description`
- **链接验证**：HEAD 优先，405/403 时回退 GET，12s 超时；存放在文章中的链接使用 `[原文链接](url)` 格式
- **base 路径**：`/auto-blog-ai/`（GitHub Pages 部署路径）

## VitePress 注意事项

- `search.provider: "local"` 必须放在 `themeConfig` 内，不能放在顶层
- `backdrop-filter` 不能放在 `.VPNav` 上（会创建 containing block 导致移动端导航无法展开），应放在 `.VPNavBar` 上
- 自定义样式在 `docs/.vitepress/theme/styles/custom.css`
