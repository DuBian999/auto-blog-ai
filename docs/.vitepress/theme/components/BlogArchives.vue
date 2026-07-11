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
</script>

<template>
  <div class="keep-timeline">
    <header class="timeline-header">
      <h2>{{ theme.blog?.title ?? "博客" }} 归档</h2>
      <p>{{ theme.blog?.description }}</p>
    </header>

    <div v-if="postsByYear.length === 0" class="timeline-empty">暂无文章</div>

    <section
      v-for="group of postsByYear"
      :key="group.year"
      class="timeline-year"
    >
      <h3 class="timeline-year-heading">{{ group.year }}</h3>
      <div class="timeline-body">
        <a
          v-for="post of group.posts"
          :key="post.url"
          :href="withBase(post.url)"
          class="timeline-post"
        >
          <span class="timeline-post-title">{{ post.title }}</span>
        </a>
      </div>
    </section>
  </div>
</template>
