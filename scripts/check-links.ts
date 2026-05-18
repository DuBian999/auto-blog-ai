/**
 * 批量检测 frontend 文章中的原文链接可用性
 * 用法: npx tsx scripts/check-links.ts
 */
import * as fs from "fs";
import * as path from "path";

const TIMEOUT_MS = 12000;
const CONCURRENCY = 8;

interface LinkEntry {
  file: string;
  url: string;
}

interface CheckResult extends LinkEntry {
  status: number | string;
  ok: boolean;
}

/** 提取所有 frontend 文章中的原文链接 */
function extractLinks(): LinkEntry[] {
  const dir = "docs/blog/posts/frontend";
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const entries: LinkEntry[] = [];
  for (const f of files) {
    const content = fs.readFileSync(path.join(dir, f), "utf-8");
    const matches = content.matchAll(/\[原文链接\]\(([^)]+)\)/g);
    for (const m of matches) {
      entries.push({ file: f, url: m[1] });
    }
  }
  return entries;
}

/** 检测单个 URL */
async function checkUrl(url: string): Promise<{ status: number | string; ok: boolean }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // 先尝试 HEAD
    let res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: { "User-Agent": "BLEACH-X-LinkChecker/1.0" },
    });
    clearTimeout(timer);

    if (res.ok) return { status: res.status, ok: true };
    if (res.status === 405 || res.status === 403) {
      // HEAD 不被允许，尝试 GET
      const c2 = new AbortController();
      const t2 = setTimeout(() => c2.abort(), TIMEOUT_MS);
      try {
        res = await fetch(url, {
          method: "GET",
          signal: c2.signal,
          headers: { "User-Agent": "BLEACH-X-LinkChecker/1.0" },
        });
        clearTimeout(t2);
        return { status: res.status, ok: res.ok };
      } catch {
        clearTimeout(t2);
        return { status: "timeout", ok: false };
      }
    }
    return { status: res.status, ok: false };
  } catch (err) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort")) return { status: "timeout", ok: false };
    return { status: msg.slice(0, 40), ok: false };
  }
}

/** 并发检测 */
async function checkAll(entries: LinkEntry[]): Promise<CheckResult[]> {
  const results: CheckResult[] = [];
  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const batch = entries.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async (e) => {
        const r = await checkUrl(e.url);
        return { ...e, ...r } as CheckResult;
      })
    );
    results.push(...batchResults);
    // 显示进度
    const done = Math.min(i + CONCURRENCY, entries.length);
    process.stdout.write(`\r  检测中... ${done}/${entries.length}`);
  }
  console.log("");
  return results;
}

async function main() {
  console.log("📋 提取 frontend 文章中的原文链接...");
  const entries = extractLinks();
  console.log(`  共 ${entries.length} 个链接\n`);

  console.log("🔍 批量检测链接可用性...");
  const results = await checkAll(entries);

  const broken = results.filter((r) => !r.ok);
  const ok = results.filter((r) => r.ok);

  console.log(`\n✅ 可用: ${ok.length} 个`);
  console.log(`❌ 失效: ${broken.length} 个\n`);

  if (broken.length > 0) {
    console.log("失效链接详情:\n");
    const byFile = new Map<string, CheckResult[]>();
    for (const r of broken) {
      const list = byFile.get(r.file) || [];
      list.push(r);
      byFile.set(r.file, list);
    }

    for (const [file, items] of byFile) {
      console.log(`📄 ${file} (${items.length} 个失效)`);
      for (const item of items) {
        console.log(`   [${item.status}] ${item.url}`);
      }
      console.log("");
    }

    // 输出需要处理的文件列表
    console.log("需要处理的文件:");
    for (const f of byFile.keys()) {
      console.log(`  docs/blog/posts/frontend/${f}`);
    }
  }
}

main();
