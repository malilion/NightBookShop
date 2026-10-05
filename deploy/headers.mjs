// 正式站的 HTTP 標頭，單一來源：
// - vite.config.ts 的 preview 套用同一組，E2E 因此在正式的 CSP 下執行；
// - scripts/release-manifest.mjs 寫成 dist/_headers（Cloudflare Pages、Netlify 格式）；
// - vercel.json 為 Vercel 靜態設定，tests/unit/deploy-headers.test.ts 檢查兩者一致。
export const securityHeaders = {
  // Vue 的 :style 綁定需要 style 屬性；Howler 解鎖手機音訊會用 data: 音檔；製茶影片以 blob: 播放。
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "media-src 'self' data: blob:",
    "connect-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
};

// 快取：帶雜湊的程式長期快取；入口頁、Service Worker 與故事 JSON 每次確認新版；
// 圖片、聲音與影片以檔名版本號（-v1、-v2）更新，快取一天並允許背景更新。
export const cacheRules = [
  { source: "/assets/(.*)", pattern: "/assets/*", value: "public, max-age=31536000, immutable" },
  { source: "/sw.js", pattern: "/sw.js", value: "no-cache" },
  { source: "/(index|tea).html", pattern: "/*.html", value: "no-cache" },
  { source: "/story/(.*)", pattern: "/story/*", value: "no-cache" },
  { source: "/(images|audio|video)/(.*)", pattern: "/images/*", value: "public, max-age=86400, stale-while-revalidate=604800" },
];

export function netlifyHeaders() {
  const lines = ["/*", ...Object.entries(securityHeaders).map(([key, value]) => `  ${key}: ${value}`), ""];
  for (const rule of cacheRules) {
    const patterns = rule.pattern === "/images/*" ? ["/images/*", "/audio/*", "/video/*"] : [rule.pattern];
    for (const pattern of patterns) lines.push(pattern, `  Cache-Control: ${rule.value}`, "");
  }
  return lines.join("\n");
}

export function vercelHeaders() {
  return [
    { source: "/(.*)", headers: Object.entries(securityHeaders).map(([key, value]) => ({ key, value })) },
    ...cacheRules.map((rule) => ({ source: rule.source, headers: [{ key: "Cache-Control", value: rule.value }] })),
  ];
}
