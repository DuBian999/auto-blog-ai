<script setup lang="ts">
import { computed } from "vue";
import { usePosts } from "../composables/usePosts";
import { withBase, useData } from "vitepress";

const { post } = usePosts();
const { theme } = useData();

const categoryIcons = computed(() => (theme as any).blog?.categoryIcons ?? {});
const tagIcons = computed(() => (theme as any).blog?.tagIcons ?? {});
const tagsPath = computed(() => (theme as any).blog?.tagsPath ?? "/blog/tags");

const categoryLabel = computed(() => {
  const map: Record<string, string> = { frontend: "前端", "ai-news": "AI" };
  return map[post.value?.category ?? ""] ?? post.value?.category ?? "";
});
</script>

<template>
  <div v-if="post" class="post-aside-top">
    <!-- category -->
    <div class="pat-section">
      <span :class="['pat-category', categoryIcons[post.category]]">
        {{ categoryLabel }}
      </span>
    </div>

    <!-- tags -->
    <div v-if="post.tags.length" class="pat-section">
      <a
        v-for="tag in post.tags"
        :key="tag"
        :href="withBase(`${tagsPath}?init=${encodeURIComponent(tag)}`)"
        class="pat-tag"
      >
        <span v-if="tagIcons[tag]" :class="[tagIcons[tag], 'pat-tag-icon']" />
        {{ tag }}
      </a>
    </div>

    <!-- author -->
    <div class="pat-section">
      <span class="pat-author-label">作者</span>
      <span class="pat-author-name">{{ post.author }}</span>
    </div>
  </div>
</template>

<style scoped>
.post-aside-top {
  padding-bottom: 16px;
}

.pat-section {
  margin-bottom: 14px;
}

.pat-category {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  background: var(--keep-primary);
  border: 1px solid var(--keep-primary);
  border-radius: 9999px;
}

.pat-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 0 6px 6px 0;
  padding: 3px 10px;
  font-size: 12px;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 9999px;
  text-decoration: none;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.pat-tag:hover {
  color: var(--keep-primary);
  border-color: var(--keep-primary);
}

.pat-tag-icon {
  font-size: 14px;
}

.pat-author-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--vp-c-text-3);
  display: block;
  margin-bottom: 4px;
}

.pat-author-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
}
</style>
