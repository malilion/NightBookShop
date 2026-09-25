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
        globPatterns: ["**/*.{js,css,html,webp,json,svg,png,mp4,webm,ogg,mp3}"],
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
        navigateFallback: "/index.html",
      },
    }),
  ],
  test: {
    include: ["tests/unit/**/*.test.ts"],
    setupFiles: ["tests/unit/setup.ts"],
  },
});
