/** 原始新闻条目（从各数据源获取） */
export interface RawNewsItem {
  title: string;
  url: string;
  source: string;
  score: number;
  summary: string;
  publishedAt: string;
}

/** LLM 筛选后的新闻条目 */
export interface CuratedNewsItem {
  title: string;
  url: string;
  source: string;
  summary: string;
  reason: string;
}

/** 博客文章 */
export interface BlogPost {
  title: string;
  date: string;
  category: "frontend" | "ai-news";
  tags: string[];
  author: string;
  description: string;
  content: string;
}

/** 知识分类 */
export type Category = "frontend" | "ai-news";

/** 分类元数据 */
export const CATEGORY_META: Record<
  Category,
  { label: string; dir: string; icon: string }
> = {
  frontend: {
    label: "前端资讯",
    dir: "frontend",
    icon: "carbon--code",
  },
  "ai-news": {
    label: "AI 新闻",
    dir: "ai-news",
    icon: "carbon--machine-learning-model",
  },
};
