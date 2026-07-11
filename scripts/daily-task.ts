/**
 * 每日自动化任务 — 统一入口
 *
 * 执行流程：
 * 1. 抓取前端资讯 → LLM 筛选 → 生成 Markdown（每 15 天一次）
 * 2. 抓取 AI 新闻   → LLM 筛选 → 生成 Markdown（每日）
 *
 * 环境变量要求：
 * - LLM_API_KEY  （大模型 API Key）
 * - LLM_BASE_URL （大模型 API 地址，默认 DeepSeek）
 * - LLM_MODEL    （模型名称，默认 deepseek-chat）
 */

import { readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { crawlFrontend } from "./crawlers/frontend";
import { crawlAINews } from "./crawlers/ai-news";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND_POSTS_DIR = join(__dirname, "..", "docs", "blog", "posts", "frontend");
const FRONTEND_INTERVAL_DAYS = 15;

const today = new Date().toISOString().split("T")[0];

interface TaskResult {
  name: string;
  status: "success" | "skipped" | "failed";
  message: string;
}

/**
 * 判断今天是否应生成前端资讯：
 * 若最近一篇前端资讯距今不足 15 天则跳过，避免重复内容。
 */
function shouldRunFrontend(todayStr: string): { run: boolean; reason: string } {
  if (!existsSync(FRONTEND_POSTS_DIR)) {
    return { run: true, reason: "尚无历史文章，首次生成" };
  }

  const dates = readdirSync(FRONTEND_POSTS_DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
    .map((f) => f.replace(/\.md$/, ""))
    .sort();

  if (dates.length === 0) {
    return { run: true, reason: "尚无历史文章，首次生成" };
  }

  const latest = dates[dates.length - 1];
  const diffDays = Math.floor(
    (Date.parse(todayStr) - Date.parse(latest)) / (1000 * 60 * 60 * 24)
  );

  if (diffDays >= FRONTEND_INTERVAL_DAYS) {
    return { run: true, reason: `距上次 (${latest}) 已 ${diffDays} 天` };
  }
  return {
    run: false,
    reason: `距上次 (${latest}) 仅 ${diffDays} 天，未到 ${FRONTEND_INTERVAL_DAYS} 天间隔`,
  };
}

async function run(): Promise<void> {
  console.log("=".repeat(50));
  console.log(`🚀 BLEACH-X 每日内容更新 — ${today}`);
  console.log("=".repeat(50));

  const results: TaskResult[] = [];

  // 1. 前端资讯 — 每 15 天生成一次
  const frontendDecision = shouldRunFrontend(today);
  if (frontendDecision.run) {
    console.log(`\n▶️ 前端资讯：${frontendDecision.reason}`);
    try {
      await crawlFrontend(today);
      results.push({ name: "前端资讯", status: "success", message: "已生成" });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`❌ 前端资讯 失败:`, msg);
      results.push({ name: "前端资讯", status: "failed", message: msg });
    }
  } else {
    console.log(`\n⏭️ 前端资讯：${frontendDecision.reason}，跳过`);
    results.push({ name: "前端资讯", status: "skipped", message: frontendDecision.reason });
  }

  // 2. AI 新闻 — 每日生成
  try {
    await crawlAINews(today);
    results.push({ name: "AI 新闻", status: "success", message: "已生成" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`❌ AI 新闻 失败:`, msg);
    results.push({ name: "AI 新闻", status: "failed", message: msg });
  }

  // 汇总报告
  console.log("\n" + "=".repeat(50));
  console.log("📊 执行结果汇总:");
  for (const r of results) {
    const icon = r.status === "success" ? "✅" : r.status === "skipped" ? "⏭️" : "❌";
    console.log(`  ${icon} ${r.name}: ${r.message}`);
  }

  const successCount = results.filter((r) => r.status === "success").length;
  const failedCount = results.filter((r) => r.status === "failed").length;
  console.log(`\n总计: ${successCount} 项成功，${failedCount} 项失败`);

  // 只有在有任务执行但全部失败时才退出非零
  const attempted = results.filter((r) => r.status !== "skipped").length;
  if (attempted > 0 && successCount === 0) {
    console.error("\n⚠️ 所有已执行的任务均失败，请检查 API Key 配置和网络连接");
    process.exit(1);
  }

  console.log("\n🎉 每日更新完成！");
}

run();
