import { VPBTheme, VPBHome, VPBArchives, VPBTags } from "@chunge16/vitepress-blogs-theme";
import Layout from "./Layout.vue";
import CategoryPosts from "./components/CategoryPosts.vue";
import BlogHome from "./components/BlogHome.vue";
import "./styles/neon.css";
import "./styles/custom.css";
const theme = {
    extends: VPBTheme,
    Layout,
    enhanceApp({ app }) {
        app.component("VPBHome", VPBHome);
        app.component("VPBArchives", VPBArchives);
        app.component("VPBTags", VPBTags);
        app.component("CategoryPosts", CategoryPosts);
        app.component("BlogHome", BlogHome);
    },
};
export default theme;
