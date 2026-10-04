import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  build: {
    rolldownOptions: {
      // The tea house also ships as its own page, without the story engine.
      input: { main: "index.html", tea: "tea.html" },
    },
  },
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      registerType: "prompt",
      injectRegister: false,
      manifest: {
        name: "夜行書店",
        short_name: "夜行書店",
        lang: "zh-Hant",
        description: "在黎明以前，聽見未完的故事。",
        theme_color: "#101722",
        background_color: "#101722",
        display: "standalone",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
      injectManifest: {
        globPatterns: [
          "**/*.{js,css,html,svg,png,webmanifest}",
          "story/compiled/main.json",
          "audio/*.{ogg,mp3}",
          "images/tea-props/*.webp",
          "images/tea-ingredients/*.webp",
          "images/rain-street.webp",
          "images/counter.webp",
          "images/jinglan-room*.webp",
          "images/memory.webp",
          "images/memory-school.webp",
          "images/memory-school-mobile.webp",
          "images/memory-hospital.webp",
          "images/memory-hospital-mobile.webp",
          "images/memory-platform.webp",
          "images/memory-platform-mobile.webp",
          "images/moon-sea.webp",
          "images/bookmarks/moonlight.webp",
          "images/bookmarks/recipient.webp",
          "images/bookmarks/unfinished.webp",
          "images/bookmarks/intervention.webp",
          "images/characters/jinglan.webp",
          "images/characters/jinglan-tearful.webp",
          "images/characters/jinglan-smile.webp",
          // The served-cup stills and the shared liquor mask keep the brew
          // films' reduced-motion view offline; films and posters load on demand.
          "video/tea/brew-*-still.webp",
          "video/tea/brew-liquor-v1.{webp,json}",
        ],
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
      },
    }),
  ],
  test: {
    include: ["tests/unit/**/*.test.ts"],
    setupFiles: ["tests/unit/setup.ts"],
    testTimeout: 15000,
  },
});
