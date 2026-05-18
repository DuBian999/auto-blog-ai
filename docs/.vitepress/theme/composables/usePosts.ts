import { data as posts } from "../posts.data";
import { computed } from "vue";
import { useRoute } from "vitepress";
import type { Post } from "../posts.data";

export function usePosts() {
  const route = useRoute();

  const post = computed(() => {
    const p = decodeURI(route.path).replace(/\/$/, "");
    return (
      posts.find((entry) => p.includes(entry.url.replace(/\/(?:index)?$/, ""))) ??
      null
    );
  });
  

  const currentIndex = computed(() =>
    post.value
      ? posts.findIndex((entry) => entry.url === post.value!.url)
      : -1,
  );

  const nextPost = computed<Post | null>(() =>
    currentIndex.value > 0 ? posts[currentIndex.value - 1] : null,
  );

  const prevPost = computed<Post | null>(() =>
    currentIndex.value < posts.length - 1
      ? posts[currentIndex.value + 1]
      : null,
  );

  const path = computed(() => route.path);

  return { posts, post, nextPost, prevPost, path };
}
