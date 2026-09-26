import { readdirSync, readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";

const dist = new URL("../dist/", import.meta.url);
const sw = readFileSync(new URL("sw.js", dist), "utf8");
const precached = [...new Set([
  ...[...sw.matchAll(/\{url:"([^"]+)",revision:(?:"[^"]+"|null)\}/g)].map((match) => match[1]),
  ...[...sw.matchAll(/\{"revision":(?:"[^"]+"|null),"url":"([^"]+)"\}/g)].map((match) => match[1]),
])];
if (precached.length < 30) throw new Error("無法讀取 PWA 預快取清單。請檢查 Workbox 輸出格式。");

const size = (url) => statSync(new URL(url, dist)).size;
const precacheBytes = precached.reduce((sum, url) => sum + size(url), 0);
const imageBytes = size("images/rain-street.webp");
// The story plays one brew film per tea when a cup is served.
const teaIds = ["osmanthus", "puer", "mint", "jasmine", "black", "chamomile", "lavender", "hojicha"];
const activeTeaClips = teaIds.map((id) => `brew-${id}-v1`);
const teaClipBytes = activeTeaClips.flatMap((clip) =>
  ["mp4", "webm"].map((extension) => ({
    file: `video/tea/${clip}.${extension}`,
    bytes: size(`video/tea/${clip}.${extension}`),
  })),
);
const jsBytes = readdirSync(new URL("assets/", dist))
  .filter((file) => file.endsWith(".js"))
  .reduce((sum, file) => sum + gzipSync(readFileSync(new URL(`assets/${file}`, dist))).length, 0);

const mustPrecache = [
  "index.html",
  "story/compiled/main.json",
  "images/rain-street.webp",
  "images/counter.webp",
  "images/jinglan-room.webp",
  "images/jinglan-room-mobile.webp",
  "images/memory-school.webp",
  "images/memory-school-mobile.webp",
  "images/memory-hospital.webp",
  "images/memory-hospital-mobile.webp",
  "images/memory-platform.webp",
  "images/memory-platform-mobile.webp",
  "images/bookmarks/moonlight.webp",
  "images/bookmarks/recipient.webp",
  "images/bookmarks/unfinished.webp",
  "images/bookmarks/intervention.webp",
  "images/characters/jinglan.webp",
];
for (const url of mustPrecache) {
  if (!precached.includes(url)) throw new Error(`第一夜離線資源未預快取：${url}`);
}
if (!precached.some((url) => url.startsWith("audio/"))) throw new Error("音效未預快取。");
if (precached.some((url) => url.startsWith("story/compiled/") && url !== "story/compiled/main.json"))
  throw new Error("後期章節故事應在章節啟動時下載。");
if (precached.some((url) => url.startsWith("video/tea/") && /\.(mp4|webm)$/.test(url)))
  throw new Error("完整製茶影片不應進入安裝預快取。");
for (const url of [...teaIds.map((id) => `video/tea/brew-${id}-v1-still.webp`), "video/tea/brew-liquor-v1.webp", "video/tea/brew-liquor-v1.json"])
  if (!precached.includes(url)) throw new Error(`減少動態的奉茶畫面未預快取：${url}`);
if (precached.some((url) => url.startsWith("images/memory-white-room")))
  throw new Error("後期章節圖片應在章節啟動時下載。");

const budget = (label, bytes, limit) => {
  console.log(`${label}: ${(bytes / 1024).toFixed(1)} KiB / ${(limit / 1024).toFixed(1)} KiB`);
  if (bytes > limit) throw new Error(`${label} 超過 PRD 預算。`);
};
budget("全部遊戲 JS gzip（初次載入的保守上限）", jsBytes, 300 * 1024);
budget("首頁必要圖片", imageBytes, 1.5 * 1024 * 1024);
budget("PWA 安裝預快取（單章首批資源的保守上限）", precacheBytes, 8 * 1024 * 1024);
const largestTeaClip = teaClipBytes.reduce((largest, clip) =>
  clip.bytes > largest.bytes ? clip : largest,
);
budget(`單段製茶動畫最大檔案（${largestTeaClip.file}）`, largestTeaClip.bytes, 4 * 1024 * 1024);
console.log(`PWA 預快取 ${precached.length} 項；第一夜資源完整，後期圖片與影片按需快取。`);
