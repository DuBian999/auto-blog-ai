/// <reference types="vitepress/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module "vitepress" {
  export function defineConfig(config: Record<string, unknown>): Record<string, unknown>;
  export function useRoute(): import("vue-router").RouteLocationNormalizedLoaded;
  export function withBase(path: string): string;
  export type { Theme } from "vitepress/client";
}
