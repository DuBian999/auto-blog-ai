import type { BlogPost, RawNewsItem } from "../types";
import { fetchHNTopStories } from "../sources/hacker-news";
import { fetchDevToMultiTag } from "../sources/devto";
import { fetchFrontendReddit } from "../sources/reddit";
import { fetchOfficialBlogs } from "../sources/official-blogs";
import { curateNews, isLLMConfigured } from "../utils/llm";
import { writeBlogPost } from "../utils/markdown";

/** 将原始数据去重合并并按热度排序 */
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
    .slice(0, 30); // 取前 30 条发给 LLM 筛选
}

/** 生成一份前端资讯博客文章 */
export async function crawlFrontend(date: string): Promise<BlogPost> {
  console.log("\n📰 开始抓取前端资讯...");

  // 1. 从多个数据源获取原始内容
  const [hnArticles, devtoArticles, redditArticles, officialArticles] = await Promise.all([
    fetchHNTopStories(),
    fetchDevToMultiTag(["frontend", "react", "vue", "javascript", "typescript", "css"]),
    fetchFrontendReddit(),
    fetchOfficialBlogs(),
  ]);

  const allArticles = mergeAndSort(hnArticles, devtoArticles, redditArticles, officialArticles);
  console.log(`  共获取 ${allArticles.length} 篇去重后文章`);

  if (allArticles.length === 0) {
    throw new Error("未能获取到任何前端资讯");
  }

  // 2. 用 LLM 筛选 Top 5 并生成摘要
  let curatedItems: Array<{
    title: string;
    url: string;
    source: string;
    summary: string;
    reason: string;
  }>;

  if (isLLMConfigured()) {
    console.log("  🤖 使用大模型筛选最值得关注的内容...");
    curatedItems = await curateNews(allArticles, "frontend");
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

  // 3. 收集所有出现的标签
  const allTags = new Set<string>();
  const tagKeywords: Record<string, string[]> = {
    react: ["react", "next.js", "nextjs"],
    vue: ["vue", "nuxt"],
    typescript: ["typescript", "ts"],
    javascript: ["javascript", "js", "ecmascript", "node", "deno", "bun"],
    css: ["css", "tailwind", "style", "design"],
    vite: ["vite", "rolldown", "esbuild"],
    webpack: ["webpack", "rspack", "turbopack"],
    AI: ["ai", "copilot", "gpt", "claude", "llm", "人工智能", "编程助手"],
  };

  curatedItems.forEach((item) => {
    const text = `${item.title} ${item.summary}`.toLowerCase();
    Object.entries(tagKeywords).forEach(([tag, keywords]) => {
      if (keywords.some((kw) => text.includes(kw))) {
        allTags.add(tag);
      }
    });
  });

  // 4. 生成 Markdown 内容
  const contentSections = curatedItems.map((item, i) => {
    return `## ${i + 1}. ${item.title}

**来源：** ${item.source} | [原文链接](${item.url})

${item.summary}

> 💡 ${item.reason}
`;
  });

  const content = `# 前端资讯 — ${date}

> 每天 5 条最值得前端开发者关注的技术动态。

${contentSections.join("\n---\n\n")}

---

::: tip 关于本栏目
关于本栏目：每日自动从 React、TypeScript、Vue 等官方博客及 Hacker News、Dev.to 等社区中筛选热门前端技术动态，由 AI 辅助摘要与点评。请注意甄别信息真实性。
:::
`;

  const post: BlogPost = {
    title: `前端资讯 — ${date}`,
    date,
    category: "frontend",
    tags: [...allTags].slice(0, 6),
    author: "tech-bot",
    description: curatedItems
      .slice(0, 3)
      .map((i) => i.title)
      .join("；"),
    content,
  };

  const filePath = writeBlogPost(post);
  console.log(`✅ 前端资讯生成完成: ${filePath}`);
  return post;
}
