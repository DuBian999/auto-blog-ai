# BLEACH-X 科技博客

> 基于 VitePress 自定义主题的**全自动科技博客**。每日定时从 Hacker News、Dev.to、Reddit、ArXiv、官方 RSS 等平台抓取前端与 AI 资讯，经 LLM 策展后生成 Markdown 文章，并自动部署到 GitHub Pages。

<p>
  <img src="https://img.shields.io/badge/VitePress-1.6-42b883?logo=vue.js" alt="VitePress">
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178c6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/pnpm-10.x-f69220?logo=pnpm" alt="pnpm">
  <img src="https://img.shields.io/badge/Node-20-339933?logo=node.js" alt="Node">
  <img src="https://img.shields.io/badge/TailwindCSS-4.3-38bdf8?logo=tailwindcss" alt="TailwindCSS">
</p>

在线预览：<https://dubian999.github.io/auto-blog-ai/>

---

## ✨ 特性

- 🕒 **每日自动更新** — GitHub Actions 定时任务（北京时间 08:00）串行抓取两大栏目
- 🧠 **LLM 智能策展** — 从 30+ 条候选中筛选 Top 5，生成中文标题、摘要与推荐理由
- 🔗 **链接可用性验证** — 并发 HEAD/GET 探测，剔除失效原文链接，避免产出死链文章
- 🎨 **VitePress 自定义主题** — TailwindCSS v4 + 深色/浅色双主题 + 本地搜索
- 🚀 **零运维部署** — commit → GitHub Pages 全流程自动化
- 🧩 **多源聚合** — Hacker News · Dev.to · Reddit · ArXiv · React/Vue/TS/Tailwind/Astro/Svelte 官方博客

---

## 🏗️ 架构总览

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

1. **拉取原始数据**：[scripts/sources/](scripts/sources/) 下的适配器分别调用各平台 API，返回统一的 `RawNewsItem[]`
2. **合并去重与排序**：[scripts/crawlers/](scripts/crawlers/) 按热度取 Top 30
3. **LLM 策展**：[scripts/utils/llm.ts](scripts/utils/llm.ts) 调用 OpenAI 兼容 API，产出 5 条 `CuratedNewsItem`
4. **链接验证**：[scripts/utils/link-checker.ts](scripts/utils/link-checker.ts) HEAD 优先、405/403 回退 GET，12s 超时
5. **写入文件**：[scripts/utils/markdown.ts](scripts/utils/markdown.ts) 生成 `docs/blog/posts/{category}/{YYYY-MM-DD}.md`

---

## 🚀 快速开始

### 环境要求

- Node.js **20.x**
- pnpm **10.x**（`corepack enable` 或 `npm i -g pnpm`）

### 安装依赖

```bash
pnpm install
```

### 本地预览站点

```bash
pnpm docs:dev          # 启动 http://localhost:5173
pnpm docs:build        # 构建生产版本到 docs/.vitepress/dist
pnpm docs:preview      # 本地预览 build 产物
```

### 手动跑一次抓取

在项目根目录创建 `.env` 并填入 LLM 凭据：

```env
LLM_API_KEY=sk-xxxxxx
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-chat
```

> 兼容任何 **OpenAI 格式**的 API（DeepSeek / 通义千问 / Kimi / OpenRouter / 本地 Ollama 等）。默认 base URL 为 `https://api.deepseek.com`，模型 `deepseek-chat`。

然后运行：

```bash
pnpm crawl             # 串行执行 frontend + ai-news
pnpm crawl:frontend    # 仅抓取前端资讯
pnpm crawl:ai-news     # 仅抓取 AI 新闻
```

生成的文章会出现在 [docs/blog/posts/frontend/](docs/blog/posts/frontend/) 或 [docs/blog/posts/ai-news/](docs/blog/posts/ai-news/) 下。

### 链接维护

```bash
npx tsx scripts/check-links.ts           # 扫描所有文章的原文链接可用性（只报告）
npx tsx scripts/cleanup-broken-links.ts  # 扫描并自动删除失效链接/章节
```

---

## 📁 目录结构

```
auto-blog-ai/
├── .github/workflows/
│   ├── daily-crawl.yml         # 每日抓取 + commit + 触发部署
│   └── deploy.yml              # VitePress 构建 & 发布到 GitHub Pages
├── docs/
│   ├── .vitepress/
│   │   ├── config.ts           # 站点配置（nav / sidebar / 搜索 / base 路径）
│   │   └── theme/              # 自定义主题（组件 + 样式）
│   ├── blog/
│   │   ├── frontend.md         # 前端栏目索引页
│   │   ├── ai-news.md          # AI 栏目索引页
│   │   └── posts/{category}/   # 自动生成的每日文章
│   ├── about.md
│   └── index.md                # 首页
└── scripts/
    ├── types.ts                # RawNewsItem / CuratedNewsItem / BlogPost 类型
    ├── daily-task.ts           # 每日任务入口
    ├── check-links.ts          # 链接体检脚本
    ├── cleanup-broken-links.ts # 失效链接清理脚本
    ├── sources/                # 数据源适配器
    │   ├── hacker-news.ts
    │   ├── devto.ts
    │   ├── reddit.ts
    │   ├── arxiv.ts
    │   └── official-blogs.ts   # React/Vue/TS/Tailwind/Astro/Svelte 官方 RSS
    ├── crawlers/
    │   ├── frontend.ts
    │   └── ai-news.ts
    └── utils/
        ├── llm.ts              # LLM 调用封装
        ├── markdown.ts         # 文章文件写入
        └── link-checker.ts     # URL 可达性检查
```

---

## ⚙️ 自动化流水线

| 环节 | 文件 | 说明 |
| :--- | :--- | :--- |
| 定时触发 | [.github/workflows/daily-crawl.yml](.github/workflows/daily-crawl.yml) | `cron: "0 0 * * *"`，UTC 00:00 / 北京时间 08:00 |
| 抓取生成 | `pnpm crawl` | 生成当日 Markdown，写入 `docs/blog/posts/` |
| 提交推送 | GitHub Actions Bot | `📰 Daily content update - YYYY-MM-DD` |
| 部署站点 | [.github/workflows/deploy.yml](.github/workflows/deploy.yml) | VitePress build → GitHub Pages |

在仓库的 **Settings → Secrets and variables → Actions** 配置以下 Secrets：

- `LLM_API_KEY` — LLM API 密钥
- `LLM_BASE_URL` — OpenAI 兼容 API 地址
- `LLM_MODEL` — 模型名（如 `deepseek-chat`）

---

## 📐 项目约定

- **Markdown 格式**：每篇 5 个 section，`## N. 标题` + `---` 分隔，末尾附 `::: tip 关于本栏目` 块
- **frontmatter 字段**：`title` / `date` / `category` / `tags` / `author` / `description`
- **原文链接**：以 `[原文链接](url)` 形式内嵌
- **base 路径**：`/auto-blog-ai/`（GitHub Pages 部署路径，本地开发亦生效）
- **运行器**：直接使用 [tsx](https://github.com/privatenumber/tsx) 执行 TypeScript，无需预编译

### VitePress 踩坑记录

- `search.provider: "local"` 必须放在 `themeConfig` 内，**不能**放在顶层
- `backdrop-filter` 只能放在 `.VPNavBar` 上；放在 `.VPNav` 会创建 containing block，导致移动端导航无法展开
- 自定义样式统一集中在 [docs/.vitepress/theme/styles/custom.css](docs/.vitepress/theme/styles/custom.css)

---

## 🛠️ 常见扩展

### 增加一个新的数据源

1. 在 [scripts/sources/](scripts/sources/) 新建 `xxx.ts`，导出 `fetchXxx(): Promise<RawNewsItem[]>`
2. 在对应 `crawlers/frontend.ts` 或 `crawlers/ai-news.ts` 中并入合并数组

### 新增一个内容栏目

1. 在 [scripts/crawlers/](scripts/crawlers/) 新建栏目 crawler，`curateNews()` 的 `category` 参数扩展类型
2. 在 [scripts/daily-task.ts](scripts/daily-task.ts) 中追加串行调用
3. 在 [docs/.vitepress/config.ts](docs/.vitepress/config.ts) 的 `nav` / `sidebar` 中添加入口
4. 在 [docs/blog/](docs/blog/) 添加对应索引页

### 更换 LLM 供应商

只需修改 GitHub Secrets 的 `LLM_BASE_URL` 与 `LLM_MODEL`。代码使用 `openai` SDK 调用 chat completions，任何遵循 OpenAI 格式的服务均可即插即用。

---

## 📜 License

ISC
