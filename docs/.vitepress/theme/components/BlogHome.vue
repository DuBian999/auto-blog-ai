<script setup lang="ts">
import { computed } from "vue";
import { usePosts } from "../composables/usePosts";
import { useData, useRoute, withBase } from "vitepress";

const { posts } = usePosts();
const { theme } = useData();
const route = useRoute();

const PAGE_SIZE = 10;

const currentPage = computed(() => {
  const p = parseInt((route as any).query?.page, 10);
  return p > 0 ? p : 1;
});

const totalPages = computed(() => Math.ceil(posts.length / PAGE_SIZE));

const pagedPosts = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return posts.slice(start, start + PAGE_SIZE);
});

const pageUrl = (page: number) => {
  const q = new URLSearchParams((route as any).query ?? {});
  if (page <= 1) {
    q.delete("page");
  } else {
    q.set("page", String(page));
  }
  const qs = q.toString();
  return withBase(route.path + (qs ? "?" + qs : ""));
};

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;
  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4);
    else start = Math.max(1, end - 4);
  }
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const categoryLabel = (cat: string) => {
  const map: Record<string, string> = { frontend: "前端", movies: "电影", "ai-news": "AI" };
  return map[cat?.toLowerCase()] ?? cat;
};

const categoryBadgeClass = (cat: string) => {
  const map: Record<string, string> = { frontend: "cat-frontend", movies: "cat-movies", "ai-news": "cat-ai" };
  return map[cat?.toLowerCase()] ?? "";
};

const stripHtml = (html: string | undefined) => {
  return html?.replace(/<[^>]*>/g, "") ?? "";
};
</script>

<template>
  <div class="blog-home">
    <header class="blog-home-header">
      <h2>{{ theme.blog?.title ?? "博客" }}</h2>
      <p>{{ theme.blog?.description }}</p>
    </header>

    <div class="blog-home-list">
      <a
        v-for="post of pagedPosts"
        :key="post.url"
        :href="withBase(post.url)"
        class="blog-home-card"
      >
        <span class="bh-date">{{ post.date.formatted }}</span>
        <span :class="['bh-category', categoryBadgeClass(post.category)]">
          {{ categoryLabel(post.category) }}
        </span>
        <h3 class="bh-title">{{ post.title }}</h3>
        <p class="bh-excerpt">{{ stripHtml(post.excerpt) }}</p>
      </a>
    </div>

    <div v-if="posts.length === 0" class="bh-empty">暂无文章</div>

    <nav v-if="totalPages > 1" class="bh-pagination">
      <a
        v-if="currentPage > 1"
        :href="pageUrl(currentPage - 1)"
        class="bh-page-btn"
      >← 上一页</a>
      <span v-else class="bh-page-btn disabled">← 上一页</span>

      <a
        v-for="p of visiblePages"
        :key="p"
        :href="pageUrl(p)"
        :class="['bh-page-num', { active: p === currentPage }]"
      >{{ p }}</a>

      <a
        v-if="currentPage < totalPages"
        :href="pageUrl(currentPage + 1)"
        class="bh-page-btn"
      >下一页 →</a>
      <span v-else class="bh-page-btn disabled">下一页 →</span>
    </nav>
  </div>
</template>

<style scoped>
.blog-home {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.blog-home-header {
  text-align: center;
  margin-bottom: 40px;
}

.blog-home-header h2 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 2px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
  border: none;
}

.blog-home-header p {
  margin: 0;
  font-size: 15px;
  color: var(--vp-c-text-2);
}

.blog-home-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.blog-home-card {
  display: flex;
  flex-direction: column;
  padding: 20px 24px;
  background: var(--vp-c-bg-soft);
  border: 1px solid rgba(0, 255, 255, 0.08);
  border-left: 3px solid rgba(0, 255, 255, 0.25);
  border-radius: 0 8px 8px 0;
  text-decoration: none;
  transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
}

.blog-home-card:hover {
  border-color: rgba(0, 255, 255, 0.4);
  border-left-color: var(--tp-cyan);
  box-shadow:
    0 0 20px rgba(0, 255, 255, 0.08),
    inset 0 0 20px rgba(0, 255, 255, 0.03);
  transform: translateX(4px);
}

.bh-date {
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-3);
  letter-spacing: 1px;
  margin-bottom: 8px;
  transition: color 0.25s ease;
}

.blog-home-card:hover .bh-date {
  color: var(--tp-cyan);
}

.bh-category {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 2px 10px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9999px;
  font-family: var(--vp-font-family-mono);
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.cat-frontend {
  color: var(--tp-cyan);
  background: rgba(0, 255, 255, 0.08);
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.cat-movies {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.cat-ai {
  color: var(--tp-purple);
  background: rgba(139, 92, 246, 0.08);
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.bh-title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
  transition: color 0.25s ease;
}

.blog-home-card:hover .bh-title {
  color: var(--tp-cyan);
}

.bh-excerpt {
  margin: 0;
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bh-empty {
  text-align: center;
  padding: 64px 0;
  color: var(--vp-c-text-2);
}

/* ---- 分页 ---- */
.bh-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 40px;
}

.bh-page-btn,
.bh-page-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 14px;
  font-size: 13px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-2);
  text-decoration: none;
  border: 1px solid rgba(0, 255, 255, 0.12);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  transition: all 0.2s ease;
}

.bh-page-num {
  width: 36px;
  padding: 0;
}

.bh-page-btn:hover,
.bh-page-num:hover {
  color: var(--tp-cyan);
  border-color: var(--tp-cyan);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.15);
}

.bh-page-num.active {
  color: #0a0a0a;
  background: var(--tp-cyan);
  border-color: var(--tp-cyan);
  font-weight: 600;
}

.dark .bh-page-num.active {
  color: #0a0a0a;
}

.bh-page-btn.disabled {
  opacity: 0.35;
  pointer-events: none;
}

@media (max-width: 640px) {
  .blog-home-list {
    grid-template-columns: 1fr;
  }
}
</style>
