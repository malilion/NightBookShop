/* global window */
// 逐幀渲染 stage.html，直接以管線送進 ffmpeg 編碼。
// node trailer/render.mjs                     → build/trailer-16x9.mp4
// node trailer/render.mjs --vertical          → build/trailer-9x16.mp4
// node trailer/render.mjs --stills 3,22,48    → build/still-*.png（檢查畫面用）
import { chromium } from "playwright";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const vertical = args.includes("--vertical");
const stillsArg = args[args.indexOf("--stills") + 1];
const stills = args.includes("--stills") ? stillsArg.split(",").map(Number) : null;
const FPS = 30;
const DURATION = 80;
const [W, H] = vertical ? [1080, 1920] : [1920, 1080];
const tag = vertical ? "9x16" : "16x9";

const browser = await chromium.launch({ args: ["--allow-file-access-from-files", "--force-color-profile=srgb"] });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto(`file://${HERE}/stage.html${vertical ? "?v=1" : ""}`);
await page.evaluate(() => window.ready);

async function frameAt(t, n) {
  await page.evaluate(([t, n]) => window.renderAt(t, n), [t, n]);
  return page.screenshot({ type: "png", clip: { x: 0, y: 0, width: W, height: H } });
}

if (stills) {
  const fs = await import("node:fs/promises");
  for (const t of stills) {
    await fs.writeFile(`${HERE}/build/still-${tag}-${t}.png`, await frameAt(t, Math.round(t * FPS)));
  }
  await browser.close();
  process.exit(0);
}

const out = `${HERE}/build/trailer-${tag}.mp4`;
const ff = spawn("ffmpeg", [
  "-y", "-v", "error",
  "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
  "-i", `${HERE}/build/score.wav`,
  "-map", "0:v", "-map", "1:a",
  "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-tune", "film",
  "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
  "-profile:v", "high", "-level", "4.2", "-g", String(FPS * 2), "-bf", "2",
  "-c:a", "aac", "-b:a", "320k", "-ar", "48000",
  "-movflags", "+faststart", "-shortest", out,
], { stdio: ["pipe", "inherit", "inherit"] });

const total = DURATION * FPS;
const started = Date.now();
for (let n = 0; n < total; n++) {
  const buf = await frameAt(n / FPS, n);
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (n % 150 === 0) {
    const s = (Date.now() - started) / 1000;
    console.log(`${tag} frame ${n}/${total}  ${s.toFixed(0)}s`);
  }
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));
await browser.close();
console.log("done", out);
