/**
 * 每日自动化任务 — 统一入口
 *
 * 执行流程：
 * 1. 抓取前端资讯 → LLM 筛选 → 生成 Markdown
 * 2. 抓取 AI 新闻   → LLM 筛选 → 生成 Markdown
 *
 * 环境变量要求：
 * - LLM_API_KEY  （大模型 API Key）
 * - LLM_BASE_URL （大模型 API 地址，默认 DeepSeek）
 * - LLM_MODEL    （模型名称，默认 deepseek-chat）
 */

import { crawlFrontend } from "./crawlers/frontend";
import { crawlAINews } from "./crawlers/ai-news";

const today = new Date().toISOString().split("T")[0];

interface TaskResult {
  name: string;
  status: "success" | "failed";
  message: string;
}

async function run(): Promise<void> {
  console.log("=".repeat(50));
  console.log(`🚀 TechPulse 每日内容更新 — ${today}`);
  console.log("=".repeat(50));

  const results: TaskResult[] = [];

  // 串行执行（避免对 LLM API 造成并发压力）
  for (const [name, fn] of [
    ["前端资讯", () => crawlFrontend(today)],
    ["AI 新闻", () => crawlAINews(today)],
  ] as const) {
    try {
      await fn();
      results.push({ name, status: "success", message: "已生成" });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`❌ ${name} 失败:`, msg);
      results.push({ name, status: "failed", message: msg });
    }
  }

  // 汇总报告
  console.log("\n" + "=".repeat(50));
  console.log("📊 执行结果汇总:");
  for (const r of results) {
    const icon = r.status === "success" ? "✅" : "❌";
    console.log(`  ${icon} ${r.name}: ${r.message}`);
  }

  const successCount = results.filter((r) => r.status === "success").length;
  console.log(`\n总计: ${successCount}/${results.length} 项成功`);

  if (successCount === 0) {
    console.error("\n⚠️ 所有任务均失败，请检查 API Key 配置和网络连接");
    process.exit(1);
  }

  console.log("\n🎉 每日更新完成！");
}

run();
