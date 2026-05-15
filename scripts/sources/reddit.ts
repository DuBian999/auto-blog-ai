import type { RawNewsItem } from "../types";

/** Reddit 子版块的 JSON 接口（无需认证） */
async function fetchSubreddit(
  subreddit: string,
  sort: "hot" | "new" = "hot"
): Promise<RawNewsItem[]> {
  const url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=15`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "TechPulse-Blog/1.0 (automated content curation)" },
    });
    if (!res.ok) {
      console.warn(`  ⚠️ r/${subreddit} 返回 ${res.status}`);
      return [];
    }
    const data = (await res.json()) as {
      data: {
        children: Array<{
          data: {
            title: string;
            url: string;
            permalink: string;
            score: number;
            num_comments: number;
            created_utc: number;
            selftext: string;
            is_self: boolean;
            domain: string;
          };
        }>;
      };
    };

    return data.data.children
      .filter((c) => {
        const d = c.data;
        // 过滤掉纯文本贴（self post），保留有外部链接的
        return !d.is_self || d.selftext.length > 200;
      })
      .map((c) => {
        const d = c.data;
        const redditUrl = `https://www.reddit.com${d.permalink}`;
        return {
          title: d.title,
          url: d.is_self ? redditUrl : d.url || redditUrl,
          source: `r/${subreddit}`,
          score: d.score + d.num_comments,
          summary: d.is_self ? d.selftext.slice(0, 200) : `${d.score} 票, ${d.num_comments} 评论`,
          publishedAt: new Date(d.created_utc * 1000).toISOString(),
        };
      });
  } catch (error) {
    console.warn(`  ⚠️ r/${subreddit} 获取失败:`, String(error));
    return [];
  }
}

/** 前端相关子版块 */
const FRONTEND_SUBREDDITS = ["javascript", "reactjs", "vuejs", "webdev", "typescript"];

/** AI 相关子版块 */
const AI_SUBREDDITS = ["MachineLearning", "OpenAI", "ClaudeAI", "artificial", "LocalLLaMA"];

/** 获取前端相关 Reddit 文章 */
export async function fetchFrontendReddit(): Promise<RawNewsItem[]> {
  console.log("  📡 获取 Reddit 前端相关文章...");
  const results = await Promise.all(
    FRONTEND_SUBREDDITS.map((sub) => fetchSubreddit(sub, "hot"))
  );
  return dedupAndMerge(results.flat());
}

/** 获取 AI 相关 Reddit 文章 */
export async function fetchAIReddit(): Promise<RawNewsItem[]> {
  console.log("  📡 获取 Reddit AI 相关文章...");
  const results = await Promise.all(AI_SUBREDDITS.map((sub) => fetchSubreddit(sub, "hot")));
  return dedupAndMerge(results.flat());
}

function dedupAndMerge(items: RawNewsItem[]): RawNewsItem[] {
  const seen = new Set<string>();
  return items
    .filter((item) => {
      const key = item.url;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.score - a.score);
}
