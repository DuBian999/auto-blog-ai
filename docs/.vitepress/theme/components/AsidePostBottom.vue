<script setup>
import { useData, withBase } from "vitepress";
import { usePosts } from "@chunge16/vitepress-blogs-theme";

const { site } = useData();
const { nextPost, prevPost } = usePosts();
const theme = site.value.themeConfig;
const blogPath = theme.blog?.path ?? "/blog/";
</script>

<template>
  <nav class="aside-post-nav">
    <div v-if="nextPost" class="aside-post-link">
      <span class="aside-post-label">下一篇</span>
      <a :href="withBase(nextPost.url)">{{ nextPost.title }}</a>
    </div>
    <div v-if="prevPost" class="aside-post-link">
      <span class="aside-post-label">上一篇</span>
      <a :href="withBase(prevPost.url)">{{ prevPost.title }}</a>
    </div>
    <div class="aside-post-back">
      <a :href="withBase(blogPath)">← 返回博客</a>
    </div>
  </nav>
</template>

<style scoped>
.aside-post-nav {
  margin-top: 24px;
  padding: 16px 0 0;
  border-top: 1px solid var(--vp-c-divider);
}

.aside-post-link {
  padding: 8px 0;
}

.aside-post-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--vp-c-text-3);
  margin-bottom: 6px;
}

.aside-post-link a {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  text-decoration: none;
  line-height: 1.5;
  transition: color 0.2s ease;
}

.aside-post-link a:hover {
  color: var(--tp-cyan);
}

.aside-post-back {
  margin-top: 4px;
  padding-top: 12px;
  border-top: 1px solid var(--vp-c-divider);
}

.aside-post-back a {
  font-size: 13px;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: color 0.2s ease;
}

.aside-post-back a:hover {
  color: var(--tp-cyan);
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}
</style>
