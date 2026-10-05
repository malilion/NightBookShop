// 建置後產生發行資訊，寫進 dist/：
// - version.json：版本、提交、建置時間與目前各章故事版本，供部署回報與回退比對。
// - asset-manifest.json：每個發行檔案的大小與 SHA-256，比較兩次發行差了什麼。
// - THIRD_PARTY_LICENSES.txt：打包進遊戲的第三方套件授權全文（遊戲內「關於」頁連到這裡）。
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { netlifyHeaders } from "../deploy/headers.mjs";

const root = new URL("..", import.meta.url).pathname;
const dist = join(root, "dist");
if (!existsSync(dist)) throw new Error("找不到 dist/，請先執行 vite build。");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

function git(command, fallback) {
  try {
    return execSync(`git ${command}`, { cwd: root, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return fallback;
  }
}
const commit = process.env.GITHUB_SHA?.slice(0, 7) || git("rev-parse --short HEAD", "local");
const dirty = git("status --porcelain -- src story public", "") !== "";

// 各章目前的故事版本，直接從 gameStore 開新章的版本與 STORY_VERSION 讀出。
const gameTypes = readFileSync(join(root, "src/types/game.ts"), "utf8");
const store = readFileSync(join(root, "src/stores/gameStore.ts"), "utf8");
const storyVersions = [
  gameTypes.match(/STORY_VERSION = "([^"]+)"/)?.[1],
  ...[...store.matchAll(/\? "([a-z]+-chapter-\d+)"/g)].map((match) => match[1]),
  store.match(/: "(lincheng-chapter-\d+)"/)?.[1],
].filter(Boolean);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
writeFileSync(join(dist, "_headers"), netlifyHeaders());
const generated = new Set(["version.json", "asset-manifest.json", "THIRD_PARTY_LICENSES.txt", "_headers"]);
const files = walk(dist)
  .map((path) => relative(dist, path))
  .filter((path) => !generated.has(path))
  .sort();
const assets = files.map((path) => {
  const data = readFileSync(join(dist, path));
  return { path, bytes: data.length, sha256: createHash("sha256").update(data).digest("hex") };
});
const totalBytes = assets.reduce((sum, asset) => sum + asset.bytes, 0);

const version = {
  name: pkg.name,
  version: pkg.version,
  commit: dirty ? `${commit}-dirty` : commit,
  builtAt: new Date().toISOString(),
  storyVersions,
  files: assets.length,
  totalBytes,
};
writeFileSync(join(dist, "version.json"), `${JSON.stringify(version, null, 2)}\n`);
writeFileSync(join(dist, "asset-manifest.json"), `${JSON.stringify({ ...version, assets }, null, 1)}\n`);

// 第三方授權：正式相依（不含開發工具）加上 Service Worker 打包的 Workbox 模組。
const production = JSON.parse(execSync("npm ls --omit=dev --all --json", { cwd: root, maxBuffer: 1 << 26 }).toString());
const packages = new Map();
function collect(dependencies = {}) {
  for (const [name, info] of Object.entries(dependencies)) {
    if (!info.version || packages.has(`${name}@${info.version}`)) continue;
    packages.set(`${name}@${info.version}`, name);
    collect(info.dependencies);
  }
}
collect(production.dependencies);
for (const name of ["workbox-core", "workbox-precaching", "workbox-routing", "workbox-strategies", "workbox-expiration", "workbox-window"]) {
  const manifest = join(root, "node_modules", name, "package.json");
  if (existsSync(manifest)) packages.set(`${name}@${JSON.parse(readFileSync(manifest, "utf8")).version}`, name);
}
const licenseFile = (dir) =>
  readdirSync(dir).find((name) => /^(licen[cs]e|copying)(\.(md|txt))?$/i.test(name));
const sections = [...packages.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([id, name]) => {
    const dir = join(root, "node_modules", name);
    if (!existsSync(dir)) return `${id}\n授權：未安裝，無法讀取\n`;
    const meta = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    const license = typeof meta.license === "string" ? meta.license : meta.license?.type ?? "未標示";
    const file = licenseFile(dir);
    const text = file ? readFileSync(join(dir, file), "utf8").trim() : "（套件未附授權全文，依 package.json 標示的授權條款使用。）";
    return `${id}\n授權：${license}\n${meta.homepage ? `網址：${meta.homepage}\n` : ""}\n${text}\n`;
  });
writeFileSync(
  join(dist, "THIRD_PARTY_LICENSES.txt"),
  `《夜行書店》${pkg.version} 使用的第三方開放原始碼套件\n共 ${packages.size} 個套件。\n\n${sections.join(`\n${"-".repeat(72)}\n\n`)}`,
);
console.log(`發行資訊：${version.version}（${version.commit}），${assets.length} 個檔案 ${(totalBytes / 1048576).toFixed(1)} MiB，第三方套件 ${packages.size} 個。`);
