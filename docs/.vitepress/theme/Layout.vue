<script setup lang="ts">
import { useData, inBrowser } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { watchEffect, onMounted, onUnmounted } from "vue";
import PostAsideTop from "./components/PostAsideTop.vue";
import AuthorHeader from "./components/AuthorHeader.vue";
import AuthorAsideBottom from "./components/AuthorAsideBottom.vue";
import AsidePostBottom from "./components/AsidePostBottom.vue";
import KeepBack2Top from "./components/KeepBack2Top.vue";

const { Layout } = DefaultTheme;
const { lang, frontmatter } = useData();

watchEffect(() => {
  if (inBrowser) {
    document.cookie = `nf_lang=${lang.value}; expires=Mon, 1 Jan 2030 00:00:00 UTC; path=/`;
  }
});

let scrollHandler: (() => void) | null = null;

onMounted(() => {
  if (!inBrowser) return;
  let pending = false;
  const check = () => {
    document.body.classList.toggle("header-shrink", window.scrollY > 64);
    pending = false;
  };
  scrollHandler = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(check);
  };
  window.addEventListener("scroll", scrollHandler, { passive: true });
  check();
});

onUnmounted(() => {
  if (inBrowser && scrollHandler) {
    window.removeEventListener("scroll", scrollHandler);
    document.body.classList.remove("header-shrink");
  }
});
</script>

<template>
  <Layout>
    <template #doc-before>
      <AuthorHeader v-if="frontmatter.blog === 'author'" />
    </template>
    <template #aside-top>
      <PostAsideTop v-if="frontmatter.blog === 'post'" />
    </template>
    <template #aside-bottom>
      <AsidePostBottom v-if="frontmatter.blog === 'post'" />
      <AuthorAsideBottom v-if="frontmatter.blog === 'author'" />
    </template>
  </Layout>
  <KeepBack2Top />
</template>
