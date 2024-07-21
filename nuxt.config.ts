// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  css: ["/app.css"],
  modules: ["@nuxt/ui"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  ui: {
    notifications: {
      position: "top-0 right-0", // Position des notifications
      timeout: 3000, // Durée d'affichage des notifications en millisecondes
    },
  },
  plugins: [],
});