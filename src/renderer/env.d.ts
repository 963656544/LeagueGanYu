/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'i18next-vue' {
  import type { i18n } from 'i18next'
  import type { Plugin } from 'vue'

  interface VueI18NextOptions {
    i18next: i18n
    rerenderOn?: ('languageChanged' | 'loaded' | 'added' | 'removed')[]
    slotStart?: string
    slotEnd?: string
  }

  export function useTranslation(ns?: string, options?: Record<string, unknown>): {
    i18next: i18n
    t: (key: string, params?: Record<string, unknown> | string) => string
  }

  const _default: Plugin<[VueI18NextOptions]>
  export default _default
}
