import sharp from "sharp";
import { chromium } from "@playwright/test";
import { createServer } from "vite";
import { mkdir, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { once } from "node:events";
const clips = [
  { id: "idle", seconds: 4 },
  { id: "scoop", seconds: 3 },
  { id: "pour", seconds: 4 },
  { id: "steep", seconds: 5 },
  { id: "serve", seconds: 4 },
  { id: "complete", seconds: 4 },
];
const preview = process.argv.includes("--preview");
const fps = 24;
const server = await createServer({
  configFile: false,
  optimizeDeps: { entries: ["scripts/tea-film/index.html"] },
  server: { host: "127.0.0.1", port: 4175 },
  root: process.cwd(),
  logLevel: "error",
});
await server.listen();
const browser = await chromium.launch({
  args: ["--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage({
    viewport: { width: 960, height: 540 },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (e) => console.error(e.message));
  await page.goto("http://127.0.0.1:4175/scripts/tea-film/");
  await page.waitForFunction(() => window.filmReady);
  await mkdir("public/video/tea", { recursive: true });
  await mkdir("output/tea-film", { recursive: true });
  if (preview) {
    for (const clip of clips) {
      await page.evaluate(({ id }) => window.setTeaFrame(id, 0.5), clip);
      await page.screenshot({ path: `output/tea-film/${clip.id}-preview.png` });
    }
  } else {
    for (const clip of clips) {
      const encoder = spawn(
        "ffmpeg",
        [
          "-y",
          "-loglevel",
          "error",
          "-f",
          "image2pipe",
          "-vcodec",
          "png",
          "-r",
          String(fps),
          "-i",
          "-",
          "-an",
          "-c:v",
          "libx264",
          "-preset",
          "fast",
          "-crf",
          "20",
          "-pix_fmt",
          "yuv420p",
          "-movflags",
          "+faststart",
          `public/video/tea/${clip.id}.mp4`,
        ],
        { stdio: ["pipe", "inherit", "inherit"] },
      );
      let encoderFailure;
      encoder.on("error", (e) => (encoderFailure = e));
      const done = once(encoder, "close");
      for (let i = 0; i < clip.seconds * fps; i++) {
        await page.evaluate(({ id, t }) => window.setTeaFrame(id, t), {
          id: clip.id,
          t: i / (clip.seconds * fps - 1),
        });
        const buffer = await page.screenshot({ type: "png" });
        if (i === 0)
          await sharp(buffer)
            .webp({ quality: 86 })
            .toFile(`public/video/tea/${clip.id}-poster.webp`);
        if (i === Math.floor((clip.seconds * fps) / 2))
          await writeFile(`output/tea-film/${clip.id}-preview.png`, buffer);
        if (encoderFailure) throw encoderFailure;
        if (!encoder.stdin.write(buffer)) await once(encoder.stdin, "drain");
      }
      encoder.stdin.end();
      if ((await done)[0] !== 0) throw new Error(`encode failed: ${clip.id}`);
      const webm = spawn(
        "ffmpeg",
        [
          "-y",
          "-loglevel",
          "error",
          "-i",
          `public/video/tea/${clip.id}.mp4`,
          "-an",
          "-c:v",
          "libvpx-vp9",
          "-b:v",
          "0",
          "-crf",
          "33",
          "-row-mt",
          "1",
          `public/video/tea/${clip.id}.webm`,
        ],
        { stdio: "inherit" },
      );
      if ((await once(webm, "close"))[0] !== 0)
        throw new Error(`WebM encode failed: ${clip.id}`);
      console.log(
        `Rendered ${clip.id}: 960x540, ${fps} fps, ${clip.seconds}s, MP4 + WebM`,
      );
    }
  }
} finally {
  await browser.close();
  await server.close();
}
