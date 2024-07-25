// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-07-05',
  modules: ["nuxt-vuefire"],
  vuefire: {
    auth: {
      enabled: true,
      sessionCookie: true
    },
    config: {
      projectId: "nuxt-firebase",
      storageBucket: "nuxt-firebase.appspot.com",
      apiKey: 'dummy-api-key',
      authDomain: 'nuxt-firebase.firebaseapp.com',
    },
    emulators: {
      enabled: true,
    }
  }
})
