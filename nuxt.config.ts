import { createResolver } from 'nuxt/kit'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-07-05',
  future: {
    compatibilityVersion: 4,
  },
  modules: [
    [
      '@azoom/nuxt-zof',
      {
        validation: {
          request: true,
          response: true,
        },
      },
    ],
  ],
})
