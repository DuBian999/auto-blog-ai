<script setup lang="ts">
import { computed, onMounted, onUnmounted, shallowRef } from "vue";
import { usePosts } from "../composables/usePosts";
import { withBase } from "vitepress";
import KeepPaginator from "./KeepPaginator.vue";

const props = defineProps<{
  category: string;
}>();

const { posts: allPosts } = usePosts();

const PAGE_SIZE = 10;
// 必须以空字符串初始化，保证 SSG 产物与客户端首次渲染一致，避免 hydration mismatch
const currentSearch = shallowRef("");

const posts = computed(() =>
  allPosts.filter((p) => p.category === props.category),
);

const requestedPage = computed(() => {
  const p = parseInt(
    new URLSearchParams(currentSearch.value).get("page") || "",
    10,
  );
  return p > 0 ? p : 1;
});

const totalPages = computed(() => Math.ceil(posts.value.length / PAGE_SIZE));

const currentPage = computed(() =>
  Math.min(requestedPage.value, Math.max(totalPages.value, 1)),
);

const pagedPosts = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return posts.value.slice(start, start + PAGE_SIZE);
});

const pagedByYear = computed(() => {
  const groups: { year: string; posts: typeof allPosts }[] = [];
  for (const post of pagedPosts.value) {
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

const categoryLabel = computed(() => {
  const map: Record<string, string> = {
    frontend: "前端资讯",
    "ai-news": "AI 新闻",
    movies: "电影",
  };
  return map[props.category] ?? props.category;
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
</script>

<template>
  <div class="keep-timeline">
    <header class="timeline-header">
      <h2>{{ categoryLabel }} · {{ posts.length }} 篇</h2>
    </header>

    <div v-if="posts.length === 0" class="timeline-empty">暂无文章</div>

    <section
      v-for="group of pagedByYear"
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

    <KeepPaginator
      v-if="totalPages > 1"
      :current="currentPage"
      :total="totalPages"
      @change="goPage"
    />
  </div>
</template>
