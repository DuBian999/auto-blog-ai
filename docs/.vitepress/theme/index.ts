import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import Layout from "./Layout.vue";
import KeepBanner from "./components/KeepBanner.vue";
import BlogHome from "./components/BlogHome.vue";
import CategoryPosts from "./components/CategoryPosts.vue";
import BlogArchives from "./components/BlogArchives.vue";
import BlogTags from "./components/BlogTags.vue";
import "./styles/keep-tokens.css";
import "./styles/keep-base.css";
import "./styles/keep-timeline.css";
import "./styles/keep-code-block.css";
import "./styles/keep-scroll.css";
import "./styles/neon.css";
import "./styles/custom.css";

const theme: Theme = {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component("KeepBanner", KeepBanner);
    app.component("BlogHome", BlogHome);
    app.component("CategoryPosts", CategoryPosts);
    app.component("BlogArchives", BlogArchives);
    app.component("BlogTags", BlogTags);
  },
};

export default theme;
