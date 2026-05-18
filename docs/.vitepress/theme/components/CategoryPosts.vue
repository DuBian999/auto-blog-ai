<script setup lang="ts">
import { computed } from "vue";
import { usePosts } from "../composables/usePosts";
import { withBase } from "vitepress";

const props = defineProps({
  category: { type: String, required: true },
});

const { posts: allPosts } = usePosts();

const PAGE_SIZE = 10;

const posts = computed(() =>
  allPosts.filter((p) => p.category === props.category)
);

function getPageFromURL() {
  if (typeof window === "undefined") return 1;
  const p = parseInt(
    new URLSearchParams(window.location.search).get("page") || "",
    10
  );
  return p > 0 ? p : 1;
}

const currentPage = computed(() => getPageFromURL());

const totalPages = computed(() => Math.ceil(posts.value.length / PAGE_SIZE));

const pagedPosts = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return posts.value.slice(start, start + PAGE_SIZE);
});

function goPage(page: number) {
  const q = new URLSearchParams(window.location.search);
  if (page <= 1) {
    q.delete("page");
  } else {
    q.set("page", String(page));
  }
  const qs = q.toString();
  window.location.search = qs ? "?" + qs : "";
}

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
</script>

<template>
  <div class="tech-post-list">
    <a
      v-for="post of pagedPosts"
      :key="post.url"
      :href="withBase(post.url)"
      class="tech-post-card"
    >
      <span class="tech-post-date">{{ post.date.formatted }}</span>
      <span class="tech-post-title">{{ post.title }}</span>
      <span class="tech-post-arrow" />
    </a>
    <div
      v-if="posts.length === 0"
      class="text-center py-16 text-[color:var(--vp-c-text-2)]"
    >
      暂无文章
    </div>

    <nav v-if="totalPages > 1" class="cp-pagination">
      <a
        v-if="currentPage > 1"
        @click.prevent="goPage(currentPage - 1)"
        class="cp-page-btn"
        >← 上一页</a
      >
      <span v-else class="cp-page-btn disabled">← 上一页</span>

      <a
        v-for="p of visiblePages"
        :key="p"
        @click.prevent="goPage(p)"
        :class="['cp-page-num', { active: p === currentPage }]"
        >{{ p }}</a
      >

      <a
        v-if="currentPage < totalPages"
        @click.prevent="goPage(currentPage + 1)"
        class="cp-page-btn"
        >下一页 →</a
      >
      <span v-else class="cp-page-btn disabled">下一页 →</span>
    </nav>
  </div>
</template>

<style scoped>
.tech-post-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.tech-post-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 76px;
  padding: 0 20px 0 16px;
  background: var(--vp-c-bg-soft);
  border: 1px solid rgba(0, 255, 255, 0.08);
  border-left: 3px solid rgba(0, 255, 255, 0.25);
  border-radius: 0 6px 6px 0;
  text-decoration: none;
  overflow: hidden;
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
}

.tech-post-card::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0;
  background: linear-gradient(
    90deg,
    rgba(0, 255, 255, 0.04) 0%,
    transparent 60%
  );
  transition: opacity 0.25s ease;
}

.tech-post-card:hover {
  border-color: rgba(0, 255, 255, 0.4);
  border-left-color: var(--tp-cyan);
  box-shadow:
    0 0 20px rgba(0, 255, 255, 0.08),
    inset 0 0 20px rgba(0, 255, 255, 0.03);
  transform: translateX(4px);
}

.tech-post-card:hover::before {
  opacity: 1;
}

.tech-post-date {
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-3);
  letter-spacing: 1px;
  margin-bottom: 4px;
  transition: color 0.25s ease;
}

.tech-post-card:hover .tech-post-date {
  color: var(--tp-cyan);
}

.tech-post-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.25s ease;
}

.tech-post-card:hover .tech-post-title {
  color: var(--tp-cyan);
}

.tech-post-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-right: 1.5px solid rgba(0, 255, 255, 0.2);
  border-top: 1.5px solid rgba(0, 255, 255, 0.2);
  rotate: 45deg;
  opacity: 0;
  transition:
    opacity 0.25s ease,
    border-color 0.25s ease;
}

.tech-post-card:hover .tech-post-arrow {
  opacity: 1;
  border-color: var(--tp-cyan);
}

.dark .tech-post-card {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(0, 255, 255, 0.06);
}

.dark .tech-post-card:hover {
  background: rgba(0, 255, 255, 0.04);
  border-color: rgba(0, 255, 255, 0.35);
}

/* ---- 分页 ---- */
.cp-pagination {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}

.cp-page-btn,
.cp-page-num {
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

.cp-page-num {
  width: 36px;
  padding: 0;
}

.cp-page-btn:hover,
.cp-page-num:hover {
  color: var(--tp-cyan);
  border-color: var(--tp-cyan);
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.15);
}

.cp-page-num.active {
  color: #0a0a0a;
  background: var(--tp-cyan);
  border-color: var(--tp-cyan);
  font-weight: 600;
}

.dark .cp-page-num.active {
  color: #0a0a0a;
}

.cp-page-btn.disabled {
  opacity: 0.35;
  pointer-events: none;
}

@media (max-width: 640px) {
  .tech-post-list {
    grid-template-columns: 1fr;
  }
}
</style>
