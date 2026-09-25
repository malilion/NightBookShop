import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
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
      workbox: {
        globPatterns: [
          "**/*.{js,css,html,svg,png,webmanifest}",
          "story/compiled/*.json",
          "audio/*.{ogg,mp3}",
          "images/tea-props/*.webp",
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
          "images/characters/jinglan.webp",
          "video/tea/*-poster.webp",
          "video/tea/complete-liquor.webp",
        ],
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: /\/images\/.*\.webp$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "night-bookshop-chapter-images-v1",
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\/video\/tea\/.*\.(?:mp4|webm)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "night-bookshop-tea-films-v1",
              expiration: { maxEntries: 24, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    include: ["tests/unit/**/*.test.ts"],
    setupFiles: ["tests/unit/setup.ts"],
  },
});
