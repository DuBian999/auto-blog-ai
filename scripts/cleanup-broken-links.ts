/**
 * 清理博客文章中失效的链接
 * 用法: npx tsx scripts/cleanup-broken-links.ts
 */
import * as fs from "fs";
import * as path from "path";
import { checkUrl } from "./utils/link-checker";

const DIRS = ["docs/blog/posts/frontend", "docs/blog/posts/ai-news"];
const TIMEOUT_MS = 12000;

interface Section {
  index: number;
  rawText: string;
  url: string | null;
}

interface FileResult {
  file: string;
  sections: Section[];
  brokenIndices: number[];
}

/** 解析文章的 5 个 section */
function parseSections(content: string): Section[] {
  const sections: Section[] = [];
  // 匹配 ## N. Title\n\n...content...\n\n--- 或 ## N. Title\n\n...content...
  const parts = content.split(/(?=^## \d+\. )/m);
  for (const part of parts) {
    if (!part.startsWith("## ")) continue;
    const idxMatch = part.match(/^## (\d+)\./);
    if (!idxMatch) continue;
    const index = parseInt(idxMatch[1]);
    const urlMatch = part.match(/\[原文链接\]\(([^)]+)\)/);
    sections.push({
      index,
      rawText: part.trim(),
      url: urlMatch ? urlMatch[1] : null,
    });
  }
  return sections.sort((a, b) => a.index - b.index);
}

/** 提取文件头部（# 标题 到 --- 分隔线之前） */
function getHeader(content: string): string {
  const headerEnd = content.indexOf("\n## 1. ");
  if (headerEnd === -1) return "";
  return content.slice(0, headerEnd).trim();
}

/** 提取文件尾部（::: tip 块） */
function getFooter(content: string): string {
  const footerStart = content.lastIndexOf("\n---\n\n:::");
  if (footerStart === -1) return "";
  return content.slice(footerStart + 1).trim();
}

async function processDir(dir: string): Promise<{ dir: string; checked: number; broken: number; deleted: number; modified: number }> {
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  console.log(`\n📂 ${dir} — 共 ${files.length} 个文件`);

  let totalChecked = 0;
  let totalBroken = 0;
  let deletedFiles = 0;
  let modifiedFiles = 0;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, "utf-8");

    const sections = parseSections(content);
    if (sections.length === 0) {
      console.log(`  ⏭️ ${file} — 无 section，跳过`);
      continue;
    }

    const brokenIndices: number[] = [];
    const brokenUrls: string[] = [];

    for (const sec of sections) {
      if (!sec.url) continue;
      totalChecked++;
      process.stdout.write(`\r  检查 ${file} [${sec.index}/5]...`);
      const ok = await checkUrl(sec.url);
      if (!ok) {
        brokenIndices.push(sec.index);
        brokenUrls.push(sec.url);
        totalBroken++;
      }
    }

    if (brokenIndices.length === 0) {
      console.log(`\r  ✅ ${file} — 全部可用`);
      continue;
    }

    console.log(`\r  🔧 ${file} — ${brokenIndices.length}/${sections.length} 失效`);

    if (brokenIndices.length === sections.length) {
      console.log(`     🗑️ 全部失效，删除文件`);
      fs.unlinkSync(filePath);
      deletedFiles++;
      continue;
    }

    const validSections = sections.filter((s) => !brokenIndices.includes(s.index));
    const header = getHeader(content);
    const footer = getFooter(content);

    // 清理每个 section：去除内部的 tip 块和尾部分隔符
    const cleaned = validSections.map((sec) =>
      sec.rawText
        .replace(/^## \d+\./, (_, i) => `## ${i + 1}.`)  // 稍后重新编号
        .replace(/\n*---\s*$/, "")
        .replace(/\n*::: tip[\s\S]*?\n:::\s*/g, "")  // 去除 section 内嵌的 tip 块
    );

    // 重新编号（处理 rawText 中原始编号）
    const renumbered = cleaned.map((sec, i) =>
      sec.replace(/^## \d+\./, `## ${i + 1}.`)
    );

    let body = renumbered.join("\n\n---\n\n");

    const validTitles = validSections
      .map((sec) => {
        const titleMatch = sec.rawText.match(/^## \d+\.\s+(.+)$/m);
        return titleMatch ? titleMatch[1] : "";
      })
      .filter(Boolean);

    const newDesc = validTitles.slice(0, 3).join("；");
    const newHeader = header.replace(
      /^(description:\s*")(.+)(")$/m,
      `$1${newDesc}$3`
    );

    let newContent = newHeader + "\n\n" + body;

    if (footer && !body.includes("::: tip")) {
      newContent += "\n\n---\n\n" + footer;
    }

    newContent = newContent.replace(/\n{3,}$/, "\n");

    fs.writeFileSync(filePath, newContent + "\n", "utf-8");
    modifiedFiles++;

    for (const u of brokenUrls) {
      console.log(`     ❌ ${u}`);
    }
  }

  return { dir, checked: totalChecked, broken: totalBroken, deleted: deletedFiles, modified: modifiedFiles };
}

async function main() {
  const results = [];
  for (const dir of DIRS) {
    results.push(await processDir(dir));
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`📊 总汇总:`);
  for (const r of results) {
    console.log(`  ${r.dir}: 检查 ${r.checked} | 失效 ${r.broken} | 删除 ${r.deleted} 文件 | 修改 ${r.modified} 文件`);
  }
}

main();
