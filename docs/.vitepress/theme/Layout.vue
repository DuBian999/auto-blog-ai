<script setup lang="ts">
import { useData, inBrowser } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { watchEffect } from "vue";
import {
  VPBLayoutPostTop,
  VPBLayoutPostAsideTop,
  VPBLayoutAuthorTop,
  VPBLayoutAuthorAsideBottom,
} from "@chunge16/vitepress-blogs-theme";
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
      <VPBLayoutPostTop v-if="frontmatter.blog === 'post'" />
      <VPBLayoutAuthorTop v-if="frontmatter.blog === 'author'" />
    </template>
    <template #aside-top>
      <VPBLayoutPostAsideTop v-if="frontmatter.blog === 'post'" />
    </template>
    <template #aside-bottom>
      <AsidePostBottom v-if="frontmatter.blog === 'post'" />
      <VPBLayoutAuthorAsideBottom v-if="frontmatter.blog === 'author'" />
    </template>
  </Layout>
</template>
