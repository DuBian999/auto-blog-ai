/**
 * 链接可达性检查 — 共享工具
 * 用于 crawler（策展后验证）和 cleanup（批量清理）脚本
 */

export interface CuratedItem {
  title: string;
  url: string;
  source: string;
  summary: string;
  reason: string;
}

const DEFAULT_TIMEOUT_MS = 12000;

/** 检查单个 URL 是否可达（HEAD 优先，405/403 时回退 GET） */
export async function checkUrl(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: { "User-Agent": "BLEACH-X-LinkChecker/1.0" },
    });
    clearTimeout(timer);
    if (res.ok) return true;
    if (res.status === 405 || res.status === 403) {
      const c2 = new AbortController();
      const t2 = setTimeout(() => c2.abort(), timeoutMs);
      try {
        const r2 = await fetch(url, {
          method: "GET",
          signal: c2.signal,
          headers: { "User-Agent": "BLEACH-X-LinkChecker/1.0" },
        });
        clearTimeout(t2);
        return r2.ok;
      } catch {
        clearTimeout(t2);
        return false;
      }
    }
    return false;
  } catch {
    clearTimeout(timer);
    return false;
  }
}

/** 并发验证策展条目中的链接，返回有效/失效分组 */
export async function verifyCuratedUrls(
  items: CuratedItem[],
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<{ valid: CuratedItem[]; broken: CuratedItem[] }> {
  const results = await Promise.all(
    items.map(async (item) => {
      const ok = await checkUrl(item.url, timeoutMs);
      return { item, ok };
    }),
  );

  return {
    valid: results.filter((r) => r.ok).map((r) => r.item),
    broken: results.filter((r) => !r.ok).map((r) => r.item),
  };
}
