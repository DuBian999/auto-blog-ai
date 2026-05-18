import { defineConfigWithTheme, type DefaultTheme, type PageData } from "vitepress";
import tailwindcss from "@tailwindcss/vite";
import type { BlogConfig } from "./theme/types";

interface ThemeConfig extends DefaultTheme.Config {
  blog?: BlogConfig
}

export default defineConfigWithTheme<ThemeConfig>({
  title: "BLEACH-X-AI-BLOG",
  description: "科技咨询 · 洞察未来",
  lang: "zh-CN",
  base: "/auto-blog-ai/",

  // TailwindCSS v4 Vite 插件
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {},
    ssr: {},
  },

  themeConfig: {
    nav: [
      { text: "首页", link: "/" },
      { text: "前端资讯", link: "/blog/frontend" },
      { text: "AI 新闻", link: "/blog/ai-news" },
      { text: "关于", link: "/about" },
    ],

    sidebar: {
      "/blog/frontend": [
        {
          text: "前端资讯",
          link: "/blog/frontend",
        },
      ],
      "/blog/ai-news": [
        {
          text: "AI 新闻",
          link: "/blog/ai-news",
        },
      ],
    },

    // 搜索配置
    search: {
      provider: "local",
    },

    // 博客主题配置
    blog: {
      path: "/blog",
      postsPath: "blog/posts",
      authorsPath: "blog/authors",
      title: "博客",
      description: "前端资讯 · AI 前沿",
      defaultAuthor: "tech-bot",
      categoryIcons: {
        frontend: "i-[carbon--code]",
        "ai-news": "i-[carbon--machine-learning-model]",
      },
      tagIcons: {
        react: "i-[carbon--logo-react]",
        vue: "i-[carbon--logo-vue]",
        typescript: "i-[logos--typescript-icon]",
        javascript: "i-[logos--javascript]",
        ai: "i-[carbon--machine-learning-model]",
      },
      dateConfig: {
        format: "yyyy/MM/dd",
      },
    },

    // 社交链接
    socialLinks: [
      { icon: "github", link: "https://github.com/" },
    ],

    editLink: {
      pattern: "https://github.com/DuBian999/auto-blog-ai/edit/main/docs/:path",
      text: "在 GitHub 上编辑此页",
    },

    footer: {
      message: "基于 VitePress 构建",
      copyright: "Copyright 2026 BLEACH-X",
    },

    docFooter: {
      prev: "上一篇",
      next: "下一篇",
    },

    outline: {
      label: "本页目录",
    },

    lastUpdated: {
      text: "最后更新于",
    },

    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
  },

  // 标记博客文章/作者页面的 frontmatter
  transformPageData(pageData: PageData): void {
    const path = pageData.relativePath as string;
    const postsPath = "blog/posts";
    const authorsPath = "blog/authors";
    if (path.includes(postsPath)) {
      (pageData.frontmatter as Record<string, unknown>).blog = "post";
      (pageData.frontmatter as Record<string, unknown>).aside = "left";
      (pageData.frontmatter as Record<string, unknown>).sidebar = false;
    } else if (path.includes(authorsPath)) {
      (pageData.frontmatter as Record<string, unknown>).blog = "author";
      (pageData.frontmatter as Record<string, unknown>).aside = "left";
      (pageData.frontmatter as Record<string, unknown>).sidebar = false;
    }
  },

  // Sitemap
  sitemap: {
    hostname: "https://DuBian999.github.io",
  },

  // 最后更新时间
  lastUpdated: true,
});
