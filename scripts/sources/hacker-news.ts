import type { RawNewsItem } from "../types";

const HN_API = "https://hacker-news.firebaseio.com/v0";
const MAX_STORIES = 30;
const MAX_CONCURRENT = 10;

interface HNItem {
  id: number;
  title: string;
  url?: string;
  score: number;
  time: number;
  descendants: number;
  type: string;
}

/** 获取热门文章 ID 列表 */
async function fetchTopStories(): Promise<number[]> {
  const res = await fetch(`${HN_API}/topstories.json`);
  const ids = (await res.json()) as number[];
  return ids.slice(0, MAX_STORIES);
}

/** 批量获取文章详情（并发控制） */
async function fetchItems(ids: number[]): Promise<HNItem[]> {
  const results: HNItem[] = [];

  for (let i = 0; i < ids.length; i += MAX_CONCURRENT) {
    const batch = ids.slice(i, i + MAX_CONCURRENT);
    const batchResults = await Promise.all(
      batch.map(async (id) => {
        try {
          const res = await fetch(`${HN_API}/item/${id}.json`);
          return (await res.json()) as HNItem;
        } catch {
          return null;
        }
      })
    );
    results.push(
      ...batchResults.filter(
        (item): item is HNItem => item !== null && item.type === "story" && !!item.url
      )
    );
  }

  return results;
}

/** 从 Hacker News 获取热门文章 */
export async function fetchHNTopStories(): Promise<RawNewsItem[]> {
  console.log("  📡 获取 Hacker News 热门文章...");
  try {
    const ids = await fetchTopStories();
    const items = await fetchItems(ids);

    return items.map((item) => ({
      title: item.title,
      url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
      source: "Hacker News",
      score: item.score + item.descendants,
      summary: `${item.score} 分, ${item.descendants} 条评论`,
      publishedAt: new Date(item.time * 1000).toISOString(),
    }));
  } catch (error) {
    console.warn("  ⚠️ Hacker News 获取失败:", String(error));
    return [];
  }
}

/** 获取 Hacker News 中匹配关键词的文章 */
export async function fetchHNByKeyword(keywords: string[]): Promise<RawNewsItem[]> {
  const allStories = await fetchHNTopStories();
  if (allStories.length === 0) return [];

  const lowerKeywords = keywords.map((k) => k.toLowerCase());
  return allStories.filter((item) => {
    const text = `${item.title} ${item.summary}`.toLowerCase();
    return lowerKeywords.some((kw) => text.includes(kw));
  });
}
