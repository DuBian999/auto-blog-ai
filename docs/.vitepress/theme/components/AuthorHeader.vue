<script setup lang="ts">
import { useData, withBase } from "vitepress";

const { frontmatter } = useData();
</script>

<template>
  <div class="author-header">
    <img
      v-if="frontmatter.avatar"
      :src="withBase(frontmatter.avatar)"
      :alt="frontmatter.name"
      class="ah-avatar"
    />
    <h1 class="ah-name">{{ frontmatter.name }}</h1>
    <p v-if="frontmatter.description" class="ah-desc">
      {{ frontmatter.description }}
    </p>
  </div>
</template>

<style scoped>
.author-header {
  text-align: center;
  padding: 32px 0 16px;
}

.ah-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 16px;
  display: block;
  border: 2px solid rgba(0, 255, 255, 0.2);
}

.ah-name {
  font-size: 24px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 8px;
  border: none;
}

.ah-desc {
  font-size: 14px;
  color: var(--vp-c-text-2);
  margin: 0;
}
</style>
