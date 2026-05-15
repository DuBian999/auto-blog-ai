# 博客自动化方案可行性分析与设计

## 一、现有项目状态

### 已有的基础设施 ✅

| 组件 | 状态 | 说明 |
|------|------|------|
| VitePress 博客 | ✅ 已就绪 | 基于 `@chunge16/vitepress-blogs-theme` 主题 |
| 分类页面 | ✅ 已就绪 | 前端资讯 / AI 新闻 两个分类 |
| 文章格式 | ✅ 已定义 | Markdown + YAML frontmatter，按 `posts/{category}/{date}.md` 存放 |
| GitHub Actions 定时任务 | ✅ 配置完成 | 每日 UTC 00:00 (北京时间 08:00) 自动执行 |
| GitHub Pages 部署 | ✅ 配置完成 | Push 到 main 时自动构建部署 |
| npm scripts | ✅ 已声明 | `crawl` / `crawl:frontend` / `crawl:ai-news` |

### 缺失的部分 ❌

- **`scripts/` 目录不存在** — 所有爬虫/生成脚本需要从零创建
- 大模型 API Key 未配置

---

## 二、内容获取方案分析

### 2.1 前端资讯（每日 5 条）

| 数据源 | 方式 | 可行性 | 成本 |
|--------|------|--------|------|
| **Hacker News API** | 免费 REST API (`hacker-news.firebaseio.com`) | ⭐⭐⭐⭐⭐ | 免费 |
| **Dev.to API** | 免费 REST API (`dev.to/api/articles`) | ⭐⭐⭐⭐⭐ | 免费 |
| **GitHub Trending** | 网页抓取 / 非官方 API | ⭐⭐⭐ | 免费 |
| **Reddit (r/javascript, r/reactjs)** | Reddit JSON API (无需 Key) | ⭐⭐⭐⭐ | 免费 |
| **RSS 聚合** | CSS-Tricks, Smashing Magazine, Node Weekly 等 | ⭐⭐⭐ | 免费 |

**推荐方案**：**多源聚合 + AI 筛选**
1. 从 Hacker News API + Dev.to API + Reddit 获取原始文章列表
2. 通过大模型 API 按"最值得关注"标准筛选 Top 5
3. AI 生成中文摘要和点评

### 2.2 AI 新闻（每日 5 条）

| 数据源 | 方式 | 可行性 | 成本 |
|--------|------|--------|------|
| **Hacker News (AI 相关)** | 同上，过滤 AI/ML 主题 | ⭐⭐⭐⭐⭐ | 免费 |
| **Reddit (r/MachineLearning, r/OpenAI, r/ClaudeAI)** | Reddit JSON API | ⭐⭐⭐⭐ | 免费 |
| **ArXiv (cs.AI)** | 免费 API | ⭐⭐⭐⭐ | 免费 |
| **TechCrunch / The Verge AI 板块** | RSS 订阅 | ⭐⭐⭐ | 免费 |

**推荐方案**：**Hacker News + Reddit + ArXiv 聚合 + AI 筛选**

---

## 三、MCP 服务的可用性分析

当前已配置的 MCP 服务：

| MCP 服务 | 能力 | 在 CI/CD 中可用？ |
|----------|------|-------------------|
| **Exa** (`web_search_exa`, `web_fetch_exa`) | 互联网搜索 + 网页内容抓取 | ❌ 不可用（仅 Claude Code 会话中可用） |

**关键发现**：虽然 Exa MCP 无法在 GitHub Actions 中使用，但它可以在 **Claude Code 本地会话**中直接搜索和抓取互联网内容。这为方案 B（半自动化）提供了坚实基础。

---

## 四、大模型 API 选型（国内可用）

由于无法使用 Anthropic API，以下国内大模型均提供 **OpenAI 兼容接口**，代码可无缝切换：

### 4.1 推荐选项

| 模型 | 提供商 | API 格式 | 价格（输入/输出） | 推荐度 |
|------|--------|----------|-------------------|--------|
| **DeepSeek V3** | DeepSeek | OpenAI 兼容 | ¥1/ ¥2 (百万 token) | ⭐⭐⭐⭐⭐ |
| **通义千问 Qwen3** | 阿里云 (DashScope) | OpenAI 兼容 | ¥2/ ¥6 (百万 token) | ⭐⭐⭐⭐ |
| **Moonshot/Kimi K2** | Moonshot AI | OpenAI 兼容 | 注册赠送额度 | ⭐⭐⭐⭐ |
| **GLM-4** | 智谱 AI | OpenAI 兼容 | ¥1/ ¥1 (百万 token) | ⭐⭐⭐⭐ |
| **DeepSeek V3** | SiliconFlow (第三方) | OpenAI 兼容 | ¥1.33/ ¥5.32 (百万 token) | ⭐⭐⭐ |

### 4.2 推荐选择：DeepSeek API

- 性价比最高，价格仅为 GPT-5.5 的 **1/15**
- 完全兼容 OpenAI SDK，一行代码切换
- 中文能力强，适合生成中文博客内容
- 注册地址：platform.deepseek.com

### 4.3 代码中的统一调用方式

```typescript
// 所有国内大模型都兼容 OpenAI SDK，只需改 baseURL 和 apiKey
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.deepseek.com",  // 切换其他模型只需改这里
  apiKey: process.env.LLM_API_KEY,
});

const response = await client.chat.completions.create({
  model: "deepseek-chat",
  messages: [{ role: "user", content: "筛选今日最值得关注的5条前端新闻..." }],
});
```

---

## 五、整体架构设计

### 方案 A：完全自动化（推荐）

```
┌─────────────────────────────────────────────────────────┐
│                 GitHub Actions (daily-crawl)             │
│                 每天 UTC 00:00 自动触发                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  frontend.ts │  │  ai-news.ts  │                    │
│  │  前端资讯爬取  │  │  AI新闻爬取   │                    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │           │
│         ▼                 ▼                 ▼           │
│  ┌──────────────────────────────────────────────────┐   │
│  │          daily-task.ts (统一调度入口)               │   │
│  │  1. 调用各爬虫获取原始数据                           │   │
│  │  2. 通过国内大模型 API 筛选/润色/生成摘要             │   │
│  │  3. 写入 markdown 文件到 docs/blog/posts/          │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │          git add → commit → push                  │   │
│  │  Push 触发 deploy.yml → GitHub Pages 自动部署      │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**优点**：完全自动化，无需人工介入
**缺点**：需要大模型 API Key，内容质量依赖 AI 判断

### 方案 B：半自动化（利用 Claude Code + Exa MCP）

```
┌─────────────────────────────────────────────────────────┐
│              本地 Claude Code 会话（每天手动/定时触发）     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Claude Code + Exa MCP（搜索 & 抓取互联网内容）     │   │
│  │  1. web_search_exa → 搜索最新前端/AI 新闻           │   │
│  │  2. web_fetch_exa  → 抓取文章详情页                  │   │
│  │  3. Claude 筛选 + 生成中文摘要                       │   │
│  │  4. (电影推荐已移除)                                │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                               │
│                         ▼                               │
│  ┌──────────────────────────────────────────────────┐   │
│  │  写入 Markdown 到 docs/blog/posts/                 │   │
│  │  → git commit → git push                          │   │
│  └──────────────────────┬───────────────────────────┘   │
│                         │                               │
└─────────────────────────┼───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│       GitHub Actions (deploy.yml)                       │
│       Push 触发 → 构建 → 部署到 GitHub Pages             │
└─────────────────────────────────────────────────────────┘
```

**优点**：无需额外 API Key（利用现有的 Claude Code + Exa MCP），内容质量更高（Claude 直接参与筛选）
**缺点**：需要每天手动运行一次，或通过 Windows 计划任务 + Claude Code CLI 定时触发

---

## 六、文件结构设计

```
tech-blog/
├── scripts/
│   ├── daily-task.ts          # 统一入口，编排所有爬虫
│   ├── crawlers/
│   │   ├── frontend.ts        # 前端资讯爬虫
│   │   └── ai-news.ts         # AI 新闻爬虫
│   ├── sources/
│   │   ├── hacker-news.ts     # Hacker News API 封装
│   │   ├── devto.ts           # Dev.to API 封装
│   │   ├── reddit.ts          # Reddit JSON API 封装
│   │   └── arxiv.ts           # ArXiv API 封装
│   ├── utils/
│   │   ├── markdown.ts        # Markdown 文件生成工具
│   │   └── llm.ts             # 国内大模型 API 调用封装（OpenAI 兼容）
│   └── types.ts               # 类型定义
├── docs/
│   └── blog/
│       └── posts/
│           ├── frontend/      # 前端资讯文章
│           └── ai-news/       # AI 新闻文章
└── .github/
    └── workflows/
        ├── daily-crawl.yml    # 每日定时抓取
        └── deploy.yml         # GitHub Pages 部署
```

---

## 七、关键技术细节

### 7.1 数据流

```
外部 API → 原始数据(JSON) → 按标题+URL 去重 → 大模型 API 筛选/摘要 → Markdown → 写入文件
```

### 7.2 去重策略

新闻按文章标题 + URL 去重，每日生成独立文件天然避免跨日重复。

### 7.3 大模型 API 的职责

负责"智能编辑"而非"数据获取"：
- 从多条原始新闻中筛选最值得关注的 5 条
- 为每条新闻生成中文摘要和点评
- 格式化输出为符合博客规范的 Markdown
### 7.4 需要的 Secrets（GitHub Actions 用）

| Key | 用途 | 获取方式 |
|-----|------|----------|
| `LLM_API_KEY` | AI 筛选/润色 | platform.deepseek.com 或其他国内平台 |
| `LLM_BASE_URL` | API 端点 | 如 `https://api.deepseek.com` |
| `LLM_MODEL` | 模型名称 | 如 `deepseek-chat` |

Hacker News / Reddit / Dev.to / ArXiv 的 API 均为公开免费，无需 Key。

---

## 八、实施计划

### Phase 1：基础框架

1. 创建 `scripts/` 目录结构
2. 实现 `types.ts` 类型定义
3. 实现 `utils/markdown.ts`（Markdown 生成工具）
4. 实现 `utils/llm.ts`（国内大模型 API 封装）
5. 实现 `daily-task.ts` 入口骨架

### Phase 2：数据源对接

1. 实现 `sources/hacker-news.ts`
2. 实现 `sources/devto.ts`
3. 实现 `sources/reddit.ts`
4. 实现 `sources/arxiv.ts`

### Phase 3：内容生成器

1. 实现 `crawlers/frontend.ts`
2. 实现 `crawlers/ai-news.ts`

### Phase 4：集成与测试

1. 本地测试所有爬虫脚本
2. 在 GitHub Actions 中测试定时任务（需配置 Secrets）
3. 验证 GitHub Pages 自动部署

### Phase 5：优化

1. 添加错误处理和重试机制
2. 添加通知（企业微信/飞书）当抓取失败时
3. 根据内容质量调整 AI 提示词

---

## 九、风险与应对

| 风险 | 影响 | 应对策略 |
|------|------|----------|
| 国内大模型 API 限流/故障 | 内容无法生成 | 多模型备选（DeepSeek → Qwen → GLM 自动切换） |
| API 余额不足 | 生成中断 | 设置用量告警，预估每日消耗约 ¥0.01-0.05 |
| 新闻源改版 | 爬取失败 | 多源冗余设计，单个源失效不影响整体 |
| GitHub Actions 执行超时 | 任务中断 | 单次执行控制在 5 分钟内，分步执行 |

---

## 十、方案对比与推荐

| 维度 | 方案 A：完全自动化 | 方案 B：半自动化 (Claude Code) |
|------|-------------------|------------------------------|
| **自动化程度** | ⭐⭐⭐⭐⭐ 完全自动 | ⭐⭐ 需每天手动或定时触发 |
| **内容质量** | ⭐⭐⭐⭐ 依赖大模型 | ⭐⭐⭐⭐⭐ Claude + Exa 直接搜索 |
| **额外成本** | 国内大模型 API（极低） | 无额外成本（已有 Claude Code） |
| **国内可访问性** | ✅ 完全可用 | ✅ 完全可用 |
| **运维复杂度** | 低，配置一次即可 | 中，需保持电脑开机 |
| **推荐场景** | 追求省心，设置后不管 | 追求高质量，可接受每日操作 |

### 最终推荐：先实现方案 B，平滑过渡到方案 A

1. **立即可用**：用 Claude Code + Exa MCP 现在就能生成内容，无需任何额外配置
2. **逐步自动化**：后续实现方案 A 的脚本，配置 DeepSeek API Key 后即可全自动运行
3. **互为备份**：两套方案并存，方案 A 挂了就手动跑方案 B

---

## 十一、总结

**结论：完全可行，且有两套互补方案。**

### 最小启动成本（方案 B）

无需任何额外 API Key，今天就可用 Claude Code + Exa MCP 搜索互联网、生成内容、写入 Markdown、提交推送。

### 长期运行方案（方案 A）

申请 DeepSeek API Key（platform.deepseek.com，国内手机号即可注册，费用极低），配置到 GitHub Secrets，实现每日全自动更新。

### 成本估算

| 项目 | 月成本 |
|------|--------|
| DeepSeek API（每日 ~5000 token） | ≈ ¥0.5-1 |
| GitHub Actions | 免费（公开仓库） |
| GitHub Pages | 免费 |
| **合计** | **≈ ¥1/月** |
