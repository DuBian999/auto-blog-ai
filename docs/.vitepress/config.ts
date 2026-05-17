import { defineConfig } from "vitepress";
import { processData } from "@chunge16/vitepress-blogs-theme/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  title: "BLEACH-X-AI-BLOG",
  description: "科技咨询 · 洞察未来",
  lang: "zh-CN",
  base: "/auto-blog-ai/",

  // TailwindCSS v4 Vite 插件
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ["@chunge16/vitepress-blogs-theme"],
    },
    ssr: {
      noExternal: ["@chunge16/vitepress-blogs-theme"],
    },
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

  // 处理博客文章数据
  async transformPageData(pageData: Record<string, unknown>, ctx: Record<string, unknown>): Promise<void> {
    await processData(pageData, ctx);
  },

  // 搜索配置
  search: {
    provider: "local",
  },

  // Sitemap
  sitemap: {
    hostname: "https://DuBian999.github.io",
  },

  // 最后更新时间
  lastUpdated: true,
});
