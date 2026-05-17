/// <reference types="vitepress/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module "@chunge16/vitepress-blogs-theme" {
  interface Post {
    url: string;
    title: string;
    excerpt?: string;
    author: string;
    category: string;
    tags: string[];
    date: {
      raw: string;
      time: number;
      formatted: string;
      since: string;
    };
    top?: boolean;
    sticky?: number;
  }

  export function usePosts(): {
    posts: Post[];
    post: import("vue").Ref<Post | null>;
    nextPost: import("vue").Ref<Post | null>;
    prevPost: import("vue").Ref<Post | null>;
    path: import("vue").Ref<string>;
  };

  const VPBTheme: Record<string, unknown>;
  const VPBHome: import("vue").Component;
  const VPBArchives: import("vue").Component;
  const VPBTags: import("vue").Component;
  export { VPBTheme, VPBHome, VPBArchives, VPBTags };
}

declare module "@chunge16/vitepress-blogs-theme/config" {
  export function processData(
    pageData: Record<string, unknown>,
    ctx: Record<string, unknown>
  ): Promise<void>;
}

declare module "vitepress" {
  export function defineConfig(config: Record<string, unknown>): Record<string, unknown>;
  export function useRoute(): import("vue-router").RouteLocationNormalizedLoaded;
  export function withBase(path: string): string;
  export type { Theme } from "vitepress/client";
}
