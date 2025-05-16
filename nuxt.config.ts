// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/ui',
    '@nuxthub/core',
  ],
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4,
  },
  compatibilityDate: '2024-04-03',
})