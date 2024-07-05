// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-07-05',
  modules: ['nuxt-zod-i18n', '@nuxtjs/i18n'],
  zodI18n: {
    useModuleLocale: false,
  },
})
