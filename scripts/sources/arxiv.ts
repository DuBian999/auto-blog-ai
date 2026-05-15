import type { RawNewsItem } from "../types";

const ARXIV_API = "http://export.arxiv.org/api/query";

/** 从 ArXiv 获取最新 AI/ML 论文 */
export async function fetchArxivPapers(
  category: string = "cs.AI",
  maxResults: number = 15
): Promise<RawNewsItem[]> {
  console.log(`  📡 获取 ArXiv 最新论文 (${category})...`);
  try {
    const url = `${ARXIV_API}?search_query=cat:${category}&sortBy=submittedDate&sortOrder=descending&max_results=${maxResults}`;
    const res = await fetch(url);

    // ArXiv 有时会返回 403 如果 User-Agent 不对
    if (!res.ok) {
      console.warn(`  ⚠️ ArXiv 返回 ${res.status}`);
      return [];
    }

    const text = await res.text();

    // 解析 Atom XML 响应（简单正则解析，避免引入 XML 库）
    const entries = text.split("<entry>").slice(1);

    return entries.map((entry) => {
      const title = extractTag(entry, "title")?.replace(/\s+/g, " ")?.trim() || "";
      const id = extractTag(entry, "id") || "";
      const summary = extractTag(entry, "summary")?.replace(/\s+/g, " ")?.trim() || "";
      const published = extractTag(entry, "published") || "";
      const authors = extractAuthors(entry);

      return {
        title: title,
        url: id,
        source: `ArXiv (${category})`,
        score: 50, // 默认分数，论文无热度数据
        summary: `${authors} — ${summary.slice(0, 150)}`,
        publishedAt: published,
      };
    });
  } catch (error) {
    console.warn("  ⚠️ ArXiv 获取失败:", String(error));
    return [];
  }
}

function extractTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i"));
  return match ? match[1] : null;
}

function extractAuthors(entry: string): string {
  const matches = entry.match(/<name>([^<]*)<\/name>/g);
  if (!matches) return "";
  const names = matches
    .map((m) => m.replace(/<\/?name>/g, ""))
    .slice(0, 3);
  return names.join(", ") + (matches.length > 3 ? " et al." : "");
}
