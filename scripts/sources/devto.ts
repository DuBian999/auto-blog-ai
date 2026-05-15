import type { RawNewsItem } from "../types";

const DEVTO_API = "https://dev.to/api/articles";

/** 从 Dev.to 获取热门前端文章 */
export async function fetchDevToArticles(tag = "frontend"): Promise<RawNewsItem[]> {
  console.log(`  📡 获取 Dev.to 热门文章 (tag: ${tag})...`);
  try {
    const url = `${DEVTO_API}?tag=${tag}&top=1&per_page=15`;
    const res = await fetch(url);
    const articles = (await res.json()) as Array<{
      title: string;
      url: string;
      positive_reactions_count: number;
      comments_count: number;
      published_at: string;
      description: string;
      tag_list: string[];
      user: { name: string };
    }>;

    return articles.map((a) => ({
      title: a.title,
      url: a.url,
      source: `Dev.to`,
      score: a.positive_reactions_count + a.comments_count,
      summary: a.description || `${a.positive_reactions_count} 个赞, ${a.comments_count} 条评论`,
      publishedAt: a.published_at,
    }));
  } catch (error) {
    console.warn("  ⚠️ Dev.to 获取失败:", String(error));
    return [];
  }
}

/** 获取多个标签的文章并合并 */
export async function fetchDevToMultiTag(tags: string[]): Promise<RawNewsItem[]> {
  const results = await Promise.all(tags.map((tag) => fetchDevToArticles(tag)));
  const seen = new Set<string>();
  return results.flat().filter((item) => {
    const key = item.url;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
