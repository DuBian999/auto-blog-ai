import type { BlogPost, RawNewsItem } from "../types";
import { fetchHNByKeyword } from "../sources/hacker-news";
import { fetchAIReddit } from "../sources/reddit";
import { fetchArxivPapers } from "../sources/arxiv";
import { curateNews, isLLMConfigured } from "../utils/llm";
import { writeBlogPost } from "../utils/markdown";

const AI_KEYWORDS = [
  "ai", "llm", "gpt", "claude", "openai", "anthropic", "deepseek",
  "machine learning", "deep learning", "transformer", "diffusion",
  "gemini", "llama", "mistral", "copilot", "agent",
  "大型语言模型", "大模型", "人工智能",
];

function mergeAndSort(...sources: RawNewsItem[][]): RawNewsItem[] {
  const seen = new Set<string>();
  return sources
    .flat()
    .filter((item) => {
      const key = item.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 30);
}

export async function crawlAINews(date: string): Promise<BlogPost> {
  console.log("\n🤖 开始抓取 AI 新闻...");

  // 1. 从多个数据源获取 AI 相关内容
  const [hnArticles, redditArticles, arxivPapers] = await Promise.all([
    fetchHNByKeyword(AI_KEYWORDS),
    fetchAIReddit(),
    fetchArxivPapers("cs.AI", 10),
  ]);

  const allArticles = mergeAndSort(hnArticles, redditArticles, arxivPapers);
  console.log(`  共获取 ${allArticles.length} 篇 AI 相关文章`);

  if (allArticles.length === 0) {
    throw new Error("未能获取到任何 AI 新闻");
  }

  // 2. LLM 筛选 Top 5
  let curatedItems: Array<{
    title: string;
    url: string;
    source: string;
    summary: string;
    reason: string;
  }>;

  if (isLLMConfigured()) {
    console.log("  🤖 使用大模型筛选最值得关注的 AI 内容...");
    curatedItems = await curateNews(allArticles, "ai-news");
  } else {
    console.log("  ⚠️ 未配置 LLM，使用热度排序取 Top 5");
    curatedItems = allArticles.slice(0, 5).map((item) => ({
      title: item.title,
      url: item.url,
      source: item.source,
      summary: item.summary,
      reason: "热度最高",
    }));
  }

  // 3. 提取标签
  const allTags = new Set<string>();
  const tagKeywords: Record<string, string[]> = {
    OpenAI: ["openai", "gpt", "chatgpt"],
    Claude: ["claude", "anthropic"],
    DeepSeek: ["deepseek", "深度求索"],
    Gemini: ["gemini", "google"],
    LLM: ["llm", "大模型", "large language model"],
    Agent: ["agent", "智能体"],
    OpenSource: ["open source", "开源"],
    论文: ["paper", "论文", "arxiv"],
  };

  curatedItems.forEach((item) => {
    const text = `${item.title} ${item.summary}`.toLowerCase();
    Object.entries(tagKeywords).forEach(([tag, keywords]) => {
      if (keywords.some((kw) => text.includes(kw))) {
        allTags.add(tag);
      }
    });
  });

  // 4. 生成 Markdown
  const contentSections = curatedItems.map((item, i) => {
    return `## ${i + 1}. ${item.title}

**来源：** ${item.source} | [原文链接](${item.url})

${item.summary}

> 💡 ${item.reason}
`;
  });

  const content = `# AI 新闻速览 — ${date}

> 每天 5 条最值得 AI 从业者关注的前沿动态。

${contentSections.join("\n---\n\n")}

---

::: tip 关于本栏目
关于本栏目：每日自动从 Hacker News、Reddit、ArXiv 等平台中筛选热门 AI 前沿动态，由 AI 辅助摘要与点评。请注意甄别信息真实性。
:::
`;

  const post: BlogPost = {
    title: `AI 新闻速览 — ${date}`,
    date,
    category: "ai-news",
    tags: [...allTags].slice(0, 6),
    author: "tech-bot",
    description: curatedItems
      .slice(0, 3)
      .map((i) => i.title)
      .join("；"),
    content,
  };

  const filePath = writeBlogPost(post);
  console.log(`✅ AI 新闻生成完成: ${filePath}`);
  return post;
}
