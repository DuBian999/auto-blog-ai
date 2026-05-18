import { createContentLoader, type ContentData } from "vitepress";

export interface Post {
  url: string;
  title: string;
  excerpt?: string;
  author: string;
  category: string;
  tags: string[];
  date: {
    raw: string;
    time: number;
    formatted: string;
    since: string;
  };
  top?: boolean;
  sticky?: number;
}
export const data: Post[] = [];

function formatDate(raw: string): Post["date"] {
  const d = new Date(raw);
  const time = d.getTime();

  const y = d.getFullYear();

  
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const formatted = `${y}/${m}/${day}`;

  const diffMs = Date.now() - time;
  const diffDays = Math.floor(diffMs / 86400000);
  let since: string;
  if (diffDays < 1) {
    since = "今天";
  } else if (diffDays < 30) {
    since = `${diffDays} 天前`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    since = `${months} 个月前`;
  } else {
    const years = Math.floor(diffDays / 365);
    since = `${years} 年前`;
  }

  return { raw, time, formatted, since };
}

function normalizeTags(
  tags: unknown,
): string[] {
  if (Array.isArray(tags)) return tags.map((t) => String(t).trim());
  if (typeof tags === "string") return tags.split(",").map((t) => t.trim());
  return [];
}

export default createContentLoader("blog/posts/**/*.md", {
  excerpt: true,
  transform(raw): Post[] {
    return raw
      .map((item) => ({
        url: item.url,
        title: item.frontmatter.title ?? "",
        excerpt: item.excerpt,
        author: item.frontmatter.author ?? "tech-bot",
        category: item.frontmatter.category ?? "Article",
        tags: normalizeTags(item.frontmatter.tags),
        date: formatDate(item.frontmatter.date ?? ""),
        top: item.frontmatter.top ?? false,
        sticky: item.frontmatter.sticky ?? 0,
      }))
      .sort((a, b) => {
        if (a.top && !b.top) return -1;
        if (!a.top && b.top) return 1;
        if (a.top && b.top && a.sticky !== b.sticky) {
          return b.sticky - a.sticky;
        }
        return b.date.time - a.date.time;
      });
  },
});
