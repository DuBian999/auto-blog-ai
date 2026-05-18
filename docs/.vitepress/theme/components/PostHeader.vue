<script setup lang="ts">
import { usePosts } from "../composables/usePosts";

const { post } = usePosts();
</script>

<template>
  <div v-if="post" class="post-header">
    <time :datetime="post.date.raw" class="ph-date">
      {{ post.date.formatted }}
    </time>
    <h1 class="ph-title">{{ post.title }}</h1>
  </div>
</template>

<style scoped>
.post-header {
  margin-bottom: 24px;
}

.ph-date {
  display: block;
  font-size: 14px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-3);
  letter-spacing: 1px;
  margin-bottom: 8px;
}

.ph-title {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--vp-c-text-1);
  margin: 0;
  border: none;
}
</style>
