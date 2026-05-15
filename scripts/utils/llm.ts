import OpenAI from "openai";
import type { RawNewsItem, CuratedNewsItem } from "../types";

const client = new OpenAI({
  baseURL: process.env.LLM_BASE_URL || "https://api.deepseek.com",
  apiKey: process.env.LLM_API_KEY || "sk-placeholder",
});

const MODEL = process.env.LLM_MODEL || "deepseek-chat";

function checkConfig(): void {
  if (!process.env.LLM_API_KEY || process.env.LLM_API_KEY === "sk-placeholder") {
    throw new Error("未配置 LLM_API_KEY 环境变量，请在 GitHub Secrets 或本地 .env 中设置");
  }
}

/**
 * 用大模型从原始新闻中筛选 top 5 并生成摘要
 */
export async function curateNews(
  rawItems: RawNewsItem[],
  category: "frontend" | "ai-news"
): Promise<CuratedNewsItem[]> {
  checkConfig();

  const categoryLabel = category === "frontend" ? "前端开发" : "AI/人工智能";

  const itemsText = rawItems
    .map(
      (item, i) =>
        `[${i + 1}] 标题: ${item.title}\n    来源: ${item.source}\n    链接: ${item.url}\n    简介: ${item.summary}\n    热度: ${item.score}`
    )
    .join("\n\n");

  const prompt = `你是一位资深的${categoryLabel}领域技术编辑。请从以下今日资讯列表中，筛选出 **5条最值得${categoryLabel}开发者/从业者关注的内容**。

## 筛选标准
1. 对从业者有实际影响（新工具发布、重大版本更新、行业趋势变化）
2. 话题覆盖面广，不重复
3. 优先选择热度高且有实质内容的条目

## 输出要求
为每条选中的资讯生成：
- **title**: 中文标题（可意译，保留关键英文名词如 React、Vite、GPT 等）
- **url**: 原文链接（保持原样）
- **source**: 来源
- **summary**: 2-3句中文摘要，讲清楚「是什么」和「为什么重要」
- **reason**: 1句话说明推荐理由

请严格以 JSON 数组格式返回（不要包含其他文字），每个元素包含 title/url/source/summary/reason 字段：

\`\`\`json
[
  {
    "title": "...",
    "url": "...",
    "source": "...",
    "summary": "...",
    "reason": "..."
  }
]
\`\`\`

以下是今日资讯列表：

${itemsText}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content: `你是一位专业的技术编辑，擅长筛选和解读${categoryLabel}领域的重要资讯。你只返回 JSON，不返回其他内容。`,
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content?.trim() || "[]";

  // 提取 JSON（处理模型可能包裹的 markdown 代码块）
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
  const jsonStr = jsonMatch[1] || content;

  try {
    const items: CuratedNewsItem[] = JSON.parse(jsonStr);
    return items.slice(0, 5);
  } catch {
    // 解析失败时返回原始 top 5
    console.warn("LLM 返回格式异常，使用原始热度排序");
    return rawItems.slice(0, 5).map((item) => ({
      title: item.title,
      url: item.url,
      source: item.source,
      summary: item.summary,
      reason: "热度较高",
    }));
  }
}

/** 检查 LLM 配置是否就绪 */
export function isLLMConfigured(): boolean {
  return !!process.env.LLM_API_KEY && process.env.LLM_API_KEY !== "sk-placeholder";
}
