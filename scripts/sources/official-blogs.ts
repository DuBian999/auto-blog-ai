import type { RawNewsItem } from "../types";

/** RSS 源配置 */
interface RSSSource {
  name: string; // source 标识
  url: string; // RSS feed URL
}

const OFFICIAL_SOURCES: RSSSource[] = [
  { name: "React Official", url: "https://react.dev/rss.xml" },
  { name: "TypeScript Official", url: "https://devblogs.microsoft.com/typescript/feed/" },
  { name: "Vue Official", url: "https://blog.vuejs.org/feed.rss" },
  { name: "Tailwind CSS Official", url: "https://tailwindcss.com/feeds/feed.xml" },
  { name: "Astro Official", url: "https://astro.build/rss.xml" },
  { name: "Svelte Official", url: "https://svelte.dev/blog/rss.xml" },
];

/** 从单个 RSS feed 获取文章 */
async function fetchRSS(source: RSSSource): Promise<RawNewsItem[]> {
  try {
    const res = await fetch(source.url);
    if (!res.ok) {
      console.warn(`  ⚠️ ${source.name} 返回 ${res.status}`);
      return [];
    }

    const text = await res.text();
    const items = text.split("<item>").slice(1);

    return items.map((item) => {
      const title = extractTag(item, "title");
      const link = extractTag(item, "link");
      const description = extractTag(item, "description");
      const pubDate = extractTag(item, "pubDate");

      // 基于发布日期计算热度分：越新分数越高
      let score = 10; // 默认基础分
      if (pubDate) {
        const time = new Date(pubDate).getTime();
        if (!isNaN(time)) {
          // 转换为距今的天数，越新越高（最高 ~100）
          const daysAgo = (Date.now() - time) / (1000 * 60 * 60 * 24);
          score = Math.max(1, Math.round(100 - daysAgo));
        }
      }

      return {
        title,
        url: link,
        source: source.name,
        score,
        summary: stripHtml(description).slice(0, 200),
        publishedAt: pubDate || new Date().toISOString(),
      };
    });
  } catch (error) {
    console.warn(`  ⚠️ ${source.name} 获取失败:`, String(error));
    return [];
  }
}

/** 获取所有官方博客的最新文章 */
export async function fetchOfficialBlogs(): Promise<RawNewsItem[]> {
  console.log("  📡 获取官方博客资讯...");

  const results = await Promise.all(OFFICIAL_SOURCES.map(fetchRSS));

  // 按 URL 去重合并
  const seen = new Set<string>();
  return results
    .flat()
    .filter((item) => {
      const key = item.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.score - a.score);
}

/** 提取 XML 标签内容（处理 CDATA 和命名空间前缀） */
function extractTag(xml: string, tag: string): string {
  // 匹配 <tag>content</tag> 或 <prefix:tag>content</prefix:tag>
  const match = xml.match(
    new RegExp(`<[^>]*${tag}[^>]*>\\s*(?:<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>|([\\s\\S]*?))\\s*</[^>]*${tag}>`, "i")
  );
  if (match) {
    return (match[1] || match[2] || "").trim();
  }
  return "";
}

/** 移除 HTML 标签 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
