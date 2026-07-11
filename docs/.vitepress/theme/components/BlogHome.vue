<script setup lang="ts">
import { computed, onMounted, onUnmounted, shallowRef } from "vue";
import { usePosts } from "../composables/usePosts";
import { withBase } from "vitepress";
import KeepPaginator from "./KeepPaginator.vue";

const { posts } = usePosts();

const PAGE_SIZE = 10;
// 与 CategoryPosts 保持一致：以空字符串初始化，客户端挂载后同步 URL query，避免 hydration mismatch
const currentSearch = shallowRef("");

const requestedPage = computed(() => {
  const p = parseInt(
    new URLSearchParams(currentSearch.value).get("page") || "",
    10,
  );
  return p > 0 ? p : 1;
});

const totalPages = computed(() => Math.ceil(posts.length / PAGE_SIZE));

const currentPage = computed(() =>
  Math.min(requestedPage.value, Math.max(totalPages.value, 1)),
);

const pagedPosts = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return posts.slice(start, start + PAGE_SIZE);
});

function goPage(page: number) {
  if (typeof window === "undefined") return;
  const q = new URLSearchParams(currentSearch.value);
  if (page <= 1) {
    q.delete("page");
  } else {
    q.set("page", String(page));
  }
  const qs = q.toString();
  const url = new URL(window.location.href);
  url.search = qs;
  window.history.pushState({}, "", url);
  currentSearch.value = url.search;
  window.scrollTo(0, 0);
}

function syncSearchFromURL() {
  currentSearch.value = window.location.search;
}

onMounted(() => {
  syncSearchFromURL();
  window.addEventListener("popstate", syncSearchFromURL);
});

onUnmounted(() => {
  window.removeEventListener("popstate", syncSearchFromURL);
});

const categoryLabel = (cat: string) => {
  const map: Record<string, string> = {
    frontend: "前端",
    movies: "电影",
    "ai-news": "AI",
  };
  return map[cat?.toLowerCase()] ?? cat;
};

const categoryIcon = (cat: string): string => {
  const c = cat?.toLowerCase();
  if (c === "frontend") {
    return `<svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
  }
  if (c === "ai-news") {
    return `<svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`;
  }
  return `<svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`;
};

const stripHtml = (html: string | undefined) => {
  return html?.replace(/<[^>]*>/g, "") ?? "";
};

const categoryKey = (cat: string) => {
  const c = cat?.toLowerCase();
  return ["frontend", "ai-news", "movies"].includes(c) ? c : "default";
};
</script>

<template>
  <div id="content" class="blog-home">
    <div class="blog-home-list">
      <a
        v-for="post of pagedPosts"
        :key="post.url"
        :href="withBase(post.url)"
        class="home-post-item"
      >
        <div :class="['home-post-item-top', 'cat-cover', categoryKey(post.category)]">
          <span class="cat-icon" v-html="categoryIcon(post.category)" />
        </div>
        <div class="home-post-item-bottom">
          <h3 class="home-post-title">{{ post.title }}</h3>
          <p class="home-post-excerpt">{{ stripHtml(post.excerpt) }}</p>
          <div class="home-post-meta">
            <span class="meta-date">{{ post.date.formatted }}</span>
            <span :class="['meta-category', 'cat-badge-' + categoryKey(post.category)]">
              {{ categoryLabel(post.category) }}
            </span>
          </div>
        </div>
      </a>
    </div>

    <div v-if="posts.length === 0" class="bh-empty">暂无文章</div>

    <KeepPaginator
      v-if="totalPages > 1"
      :current="currentPage"
      :total="totalPages"
      @change="goPage"
    />
  </div>
</template>

<style scoped>
.blog-home {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 24px 120px;
}

.blog-home-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.home-post-item {
  display: block;
  background: var(--keep-content-bg);
  border-radius: var(--keep-radius);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  box-shadow: 0 0 8px var(--keep-shadow);
  transition: box-shadow 0.3s ease;
}

.home-post-item:hover {
  box-shadow: 0 0 12px var(--keep-shadow-hover);
}

.home-post-item-top {
  width: 100%;
  height: 10rem;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cat-cover.frontend {
  background: linear-gradient(135deg, #0066cc 0%, #4d94db 100%);
}

.cat-cover.ai-news {
  background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
}

.cat-cover.movies {
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
}

.cat-cover.default {
  background: linear-gradient(135deg, #75757a 0%, #a0a0a8 100%);
}

.cat-icon {
  color: rgba(255, 255, 255, 0.9);
  display: inline-flex;
  transition: transform 0.35s ease;
}

.home-post-item:hover .cat-icon {
  transform: scale(1.03);
}

.home-post-item-bottom {
  padding: 2rem;
}

.home-post-title {
  margin: 0 0 1rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--keep-text-2);
  line-height: 1.5;
  border: none;
}

.home-post-excerpt {
  margin: 0 0 1.5rem;
  font-size: 15px;
  color: var(--keep-text-3);
  line-height: 1.7;
  text-align: justify;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.home-post-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--keep-text-4);
}

.meta-date {
  font-family: var(--vp-font-family-mono);
  letter-spacing: 0.5px;
}

.meta-category {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 9999px;
  letter-spacing: 0.5px;
  color: #ffffff;
}

.cat-badge-frontend {
  background: var(--keep-primary);
}

.cat-badge-ai-news {
  background: #7c3aed;
}

.cat-badge-movies {
  background: #f59e0b;
}

.cat-badge-default {
  background: var(--keep-info);
}

.bh-empty {
  text-align: center;
  padding: 64px 0;
  color: var(--keep-text-3);
}

@media (max-width: 640px) {
  .home-post-item-bottom {
    padding: 1.4rem;
  }
  .home-post-title {
    font-size: 1.2rem;
  }
  .home-post-item-top {
    height: 8rem;
  }
}
</style>
