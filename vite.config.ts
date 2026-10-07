import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { securityHeaders } from "./deploy/headers.mjs";
const { version } = JSON.parse(readFileSync(new URL("package.json", import.meta.url), "utf8"));
function commit() {
  try {
    return process.env.GITHUB_SHA?.slice(0, 7) || execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "local";
  }
}
export default defineConfig({
  // 版本資訊顯示在「關於」頁；完整清單另由 scripts/release-manifest.mjs 寫進 dist/version.json。
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __APP_COMMIT__: JSON.stringify(commit()),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  // 本機 preview（E2E 使用）套用正式站的安全標頭，CSP 擋到的資源會在測試中出錯。
  preview: { headers: securityHeaders },
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
          "audio/music/theme.{ogg,mp3}",
          "images/tea-props/*.webp",
          "images/tea-ingredients/*.webp",
          "images/title-street*.webp",
          "images/tea-table-scene.webp",
          "images/letter-desk-scene.webp",
          "images/hand-*.webp",
          "images/letter-reader.webp",
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
    // 各章完整路線測試每一步都還原比對，章節加長後在機器忙碌時會超過 15 秒；60 秒只影響真正卡住的測試多久才判失敗。
    testTimeout: 60000,
  },
});
