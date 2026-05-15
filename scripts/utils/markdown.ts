import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { BlogPost, Category } from "../types";
import { CATEGORY_META } from "../types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = join(__dirname, "..", "..", "docs", "blog", "posts");

function ensureDir(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

/** 生成 YAML frontmatter 字符串 */
export function generateFrontmatter(post: BlogPost): string {
  const lines = [
    "---",
    `title: "${post.title.replace(/"/g, '\\"')}"`,
    `date: ${post.date}`,
    `category: ${post.category}`,
    `tags: [${post.tags.join(", ")}]`,
    `author: ${post.author}`,
    `description: "${post.description.replace(/"/g, '\\"')}"`,
    "---",
    "",
  ];
  return lines.join("\n");
}

/** 将博客文章写入文件 */
export function writeBlogPost(post: BlogPost): string {
  const categoryDir = CATEGORY_META[post.category].dir;
  const targetDir = join(POSTS_DIR, categoryDir);
  ensureDir(targetDir);

  const fileName = `${post.date}.md`;
  const filePath = join(targetDir, fileName);

  const frontmatter = generateFrontmatter(post);
  const fullContent = frontmatter + post.content;

  writeFileSync(filePath, fullContent, "utf-8");
  console.log(`📄 已生成: blog/posts/${categoryDir}/${fileName}`);

  return filePath;
}

/** 获取文章的目标路径（用于预览，不实际写入） */
export function getPostPath(category: Category, date: string): string {
  return join(POSTS_DIR, CATEGORY_META[category].dir, `${date}.md`);
}
