import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import Layout from "./Layout.vue";
import BlogHome from "./components/BlogHome.vue";
import CategoryPosts from "./components/CategoryPosts.vue";
import BlogArchives from "./components/BlogArchives.vue";
import BlogTags from "./components/BlogTags.vue";
import "./styles/neon.css";
import "./styles/custom.css";

const theme: Theme = {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("BlogHome", BlogHome);
    app.component("CategoryPosts", CategoryPosts);
    app.component("BlogArchives", BlogArchives);
    app.component("BlogTags", BlogTags);
  },
};

export default theme;
