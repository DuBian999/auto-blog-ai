<script setup lang="ts">
import { withBase, useData } from "vitepress";

const { theme } = useData();
const blogPath = theme.blog?.path ?? "/blog/";
</script>

<template>
  <div class="author-aside-bottom">
    <a :href="withBase(blogPath)">← 返回博客</a>
  </div>
</template>

<style scoped>
.author-aside-bottom {
  margin-top: 24px;
  padding: 16px 0 0;
  border-top: 1px solid var(--vp-c-divider);
}

.author-aside-bottom a {
  font-size: 13px;
  color: var(--vp-c-brand-1);
  text-decoration: none;
  transition: color 0.2s ease;
}

.author-aside-bottom a:hover {
  color: var(--tp-cyan);
  text-shadow: 0 0 8px rgba(0, 255, 255, 0.3);
}
</style>
