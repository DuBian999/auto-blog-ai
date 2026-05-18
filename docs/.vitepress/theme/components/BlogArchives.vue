<script setup lang="ts">
import { computed } from "vue";
import { usePosts } from "../composables/usePosts";
import { withBase, useData } from "vitepress";

const { posts: allPosts } = usePosts();
const { theme } = useData();

const postsByYear = computed(() => {
  const groups: { year: string; posts: typeof allPosts }[] = [];
  for (const post of allPosts) {
    const year = post.date.raw.split("-")[0];
    const last = groups[groups.length - 1];
    if (last && last.year === year) {
      last.posts.push(post);
    } else {
      groups.push({ year, posts: [post] });
    }
  }
  return groups;
});

function monthDay(raw: string) {
  const parts = raw.split("-");
  return `${parts[1]}/${parts[2]}`;
}
</script>

<template>
  <div class="blog-archives">
    <header class="ba-header">
      <h2>{{ theme.blog?.title ?? "博客" }} 归档</h2>
      <p>{{ theme.blog?.description }}</p>
    </header>

    <div v-if="postsByYear.length === 0" class="ba-empty">暂无文章</div>

    <section v-for="group of postsByYear" :key="group.year" class="ba-year">
      <h3 class="ba-year-heading">{{ group.year }}</h3>
      <div class="ba-year-list">
        <a
          v-for="post of group.posts"
          :key="post.url"
          :href="withBase(post.url)"
          class="ba-post-link"
        >
          <span class="ba-post-date">{{ monthDay(post.date.raw) }}</span>
          <span class="ba-post-title">{{ post.title }}</span>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.blog-archives {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.ba-header {
  text-align: center;
  margin-bottom: 40px;
}

.ba-header h2 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 2px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
  border: none;
}

.ba-header p {
  margin: 0;
  font-size: 15px;
  color: var(--vp-c-text-2);
}

.ba-empty {
  text-align: center;
  padding: 64px 0;
  color: var(--vp-c-text-2);
}

.ba-year {
  margin-bottom: 32px;
}

.ba-year-heading {
  font-size: 22px;
  font-weight: 700;
  color: var(--tp-cyan);
  margin: 0 0 12px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(0, 255, 255, 0.15);
}

.ba-year-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ba-post-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 12px;
  border-radius: 6px;
  text-decoration: none;
  transition: background 0.2s ease;
}

.ba-post-link:hover {
  background: rgba(0, 255, 255, 0.05);
}

.ba-post-date {
  font-size: 13px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-3);
  min-width: 48px;
  letter-spacing: 1px;
}

.ba-post-title {
  font-size: 15px;
  color: var(--vp-c-text-1);
  font-weight: 500;
  transition: color 0.2s ease;
}

.ba-post-link:hover .ba-post-title {
  color: var(--tp-cyan);
}
</style>
