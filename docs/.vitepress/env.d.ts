/// <reference types="vitepress/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

declare module "@chunge16/vitepress-blogs-theme" {
  import type { Component } from "vue";
  interface VPBLooseTheme {
    extends?: VPBLooseTheme;
    Layout?: Component;
    enhanceApp?: (ctx: { app: { component: (name: string, component: unknown) => void } }) => void;
  }
  export const VPBTheme: VPBLooseTheme;
  export const VPBHome: Component;
  export const VPBArchives: Component;
  export const VPBTags: Component;
}

declare module "@chunge16/vitepress-blogs-theme/config" {
  export function processData(pageData: Record<string, unknown>, ctx: Record<string, unknown>): Promise<void>;
}

declare module "vitepress" {
  // TS 6.0 兼容：补全 VitePress 中 declare function 未正确重导出的类型
  // 使用宽松类型避免循环引用
  export function defineConfig(config: Record<string, unknown>): Record<string, unknown>;
  export type { Theme } from "vitepress/client";
}
