<script setup lang="ts">
import { computed, ref } from "vue";
import { usePosts } from "../composables/usePosts";
import { withBase, useData, inBrowser } from "vitepress";

const { posts: allPosts } = usePosts();
const { theme } = useData();

const selectedTag = ref("");

const postsByTag = computed(() => {
  const map: Record<string, typeof allPosts> = {};
  for (const post of allPosts) {
    for (const tag of post.tags) {
      if (!map[tag]) map[tag] = [];
      map[tag].push(post);
    }
  }
  return map;
});

const sortedTags = computed(() =>
  Object.entries(postsByTag.value).sort(([, a], [, b]) => b.length - a.length),
);

const filteredPosts = computed(() =>
  selectedTag.value ? postsByTag.value[selectedTag.value] ?? [] : [],
);

const tagIcons = computed(() => (theme as any).blog?.tagIcons ?? {});

function selectTag(tag: string) {
  selectedTag.value = tag;
  if (inBrowser) {
    const url = new URL(window.location.href);
    url.searchParams.set("init", tag);
    window.history.replaceState({}, "", url.toString());
  }
}

if (inBrowser) {
  const init = new URLSearchParams(window.location.search).get("init");
  if (init) selectedTag.value = init;
}
</script>

<template>
  <div class="blog-tags">
    <header class="bt-header">
      <h2>{{ theme.blog?.title ?? "博客" }} 标签</h2>
      <p>{{ theme.blog?.description }}</p>
    </header>

    <div class="bt-cloud">
      <button
        v-for="[tag, posts] in sortedTags"
        :key="tag"
        :class="['bt-tag', { active: selectedTag === tag }]"
        @click="selectTag(tag)"
      >
        <span v-if="tagIcons[tag]" :class="[tagIcons[tag], 'bt-tag-icon']" />
        {{ tag }}
        <span class="bt-count">{{ posts.length }}</span>
      </button>
    </div>

    <div v-if="selectedTag && filteredPosts.length" class="bt-posts">
      <h3 class="bt-posts-heading">
        {{ filteredPosts.length }} 篇「{{ selectedTag }}」标签的文章
      </h3>
      <div class="timeline-body">
        <a
          v-for="post of filteredPosts"
          :key="post.url"
          :href="withBase(post.url)"
          class="timeline-post"
        >
          <span class="timeline-post-title">{{ post.title }}</span>
        </a>
      </div>
    </div>

    <div v-else-if="selectedTag && filteredPosts.length === 0" class="bt-empty">
      该标签下暂无文章
    </div>
  </div>
</template>

<style scoped>
.blog-tags {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.bt-header {
  text-align: center;
  margin-bottom: 40px;
}

.bt-header h2 {
  margin: 0 0 8px;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--keep-text-2);
  border: none;
}

.bt-header p {
  margin: 0;
  font-size: 15px;
  color: var(--keep-text-4);
}

.bt-cloud {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 40px;
}

.bt-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  font-size: 13px;
  font-family: var(--vp-font-family-mono);
  color: var(--keep-text-3);
  background: var(--keep-bg-2);
  border: 1px solid var(--keep-border);
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bt-tag:hover {
  color: var(--keep-primary);
  border-color: var(--keep-primary);
}

.bt-tag.active {
  color: #ffffff;
  background: var(--keep-primary);
  border-color: var(--keep-primary);
  font-weight: 600;
}

.bt-tag-icon {
  font-size: 15px;
}

.bt-count {
  font-size: 11px;
  opacity: 0.7;
}

.bt-posts {
  border-top: 1px solid var(--keep-border);
  padding-top: 24px;
}

.bt-posts-heading {
  font-size: 16px;
  font-weight: 600;
  color: var(--keep-text-2);
  margin: 0 0 16px;
}

.bt-empty {
  text-align: center;
  padding: 48px 0;
  color: var(--keep-text-3);
}
</style>
