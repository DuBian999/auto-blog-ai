<script setup lang="ts">
import { useData, inBrowser } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { watchEffect } from "vue";
import PostAsideTop from "./components/PostAsideTop.vue";
import AuthorHeader from "./components/AuthorHeader.vue";
import AuthorAsideBottom from "./components/AuthorAsideBottom.vue";
import AsidePostBottom from "./components/AsidePostBottom.vue";

const { Layout } = DefaultTheme;
const { lang, frontmatter } = useData();

watchEffect(() => {
  if (inBrowser) {
    document.cookie = `nf_lang=${lang.value}; expires=Mon, 1 Jan 2030 00:00:00 UTC; path=/`;
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
</template>
