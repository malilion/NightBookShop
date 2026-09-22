import { bundle } from "@remotion/bundler";
import {
  openBrowser,
  selectComposition,
  renderMedia,
  renderStill,
} from "@remotion/renderer";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const out = path.join(root, "output/remotion");
const clip = process.argv.includes("--clip=complete") ? "complete" : "pour";
const compositionId = clip === "complete" ? "TeaComplete" : "TeaPour";
const preview = process.argv.includes("--preview");
const publish = process.argv.includes("--publish");
const teaArg =
  process.argv.find((a) => a.startsWith("--tea="))?.split("=")[1] ||
  "osmanthus";
if (!["osmanthus", "puer", "mint"].includes(teaArg))
  throw new Error("Unknown tea");
if (publish && teaArg !== "osmanthus")
  throw new Error(
    "Only the approved osmanthus sample can replace the game asset",
  );
if (publish && preview) throw new Error("Preview mode cannot publish assets");
await mkdir(out, { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.join(root, "video/src/index.tsx"),
  outDir: path.join(out, "bundle"),
});
const browser = await openBrowser("chrome", {
  browserExecutable: chromium.executablePath(),
  chromiumOptions: { gl: "angle" },
});
try {
  const inputProps = { tea: teaArg, clip };
  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps,
    puppeteerInstance: browser,
  });
  const common = {
    serveUrl,
    composition,
    inputProps,
    puppeteerInstance: browser,
  };
  for (const frame of [0, 90, 179]) {
    await renderStill({
      ...common,
      frame,
      output: path.join(out, `${clip}-${teaArg}-${frame}.png`),
      imageFormat: "png",
    });
  }
  if (preview) {
    console.log("Preview frames: 0, 90, 179");
  } else {
    const base = path.join(out, `${clip}-${teaArg}`);
    let reported = -1;
    await renderMedia({
      ...common,
      outputLocation: `${base}.mp4`,
      codec: "h264",
      crf: 18,
      pixelFormat: "yuv420p",
      imageFormat: "png",
      concurrency: 2,
      onProgress: ({ progress }) => {
        const tenth = Math.floor(progress * 10);
        if (tenth > reported) {
          reported = tenth;
          console.log(`Rendering ${tenth * 10}%`);
        }
      },
    });
    execFileSync("ffmpeg", [
      "-y",
      "-v",
      "error",
      "-i",
      `${base}.mp4`,
      "-an",
      "-c:v",
      "libvpx-vp9",
      "-b:v",
      "0",
      "-crf",
      "30",
      "-row-mt",
      "1",
      `${base}.webm`,
    ]);
    await sharp(path.join(out, `${clip}-${teaArg}-0.png`))
      .webp({ quality: 88 })
      .toFile(`${base}-poster.webp`);
    const files = [];
    for (const ext of ["mp4", "webm"]) {
      const file = `${base}.${ext}`;
      const info = JSON.parse(
        execFileSync(
          "ffprobe",
          [
            "-v",
            "error",
            "-show_entries",
            "stream=codec_name,width,height,r_frame_rate:format=duration,size",
            "-of",
            "json",
            file,
          ],
          { encoding: "utf8" },
        ),
      );
      const stream = info.streams[0];
      if (
        stream.width !== 1280 ||
        stream.height !== 720 ||
        stream.r_frame_rate !== "30/1" ||
        Math.abs(Number(info.format.duration) - 6) > 0.05
      )
        throw new Error(`Unexpected media format: ${ext}`);
      if (Number(info.format.size) > 2 * 1024 * 1024)
        throw new Error("Film exceeds offline cache limit");
      execFileSync("ffmpeg", ["-v", "error", "-i", file, "-f", "null", "-"]);
      files.push({ file: path.basename(file), ...info });
    }
    await writeFile(
      `${base}-validation.json`,
      JSON.stringify(
        {
          composition: compositionId,
          remotion: "4.0.526",
          tea: teaArg,
          frames: 180,
          files,
        },
        null,
        2,
      ),
    );
    if (publish) {
      const dest = path.join(root, "public/video/tea");
      // Publish only after every output passes metadata and full decode validation.
      for (const ext of ["mp4", "webm"])
        await copyFile(
          `${base}.${ext}`,
          path.join(dest, `${clip}-remotion-v1.${ext}`),
        );
      await copyFile(
        `${base}-poster.webp`,
        path.join(dest, `${clip}-remotion-v1-poster.webp`),
      );
      console.log(`Validated sample published as ${clip}-remotion-v1`);
    }
  }
} finally {
  await browser.close({ silent: true });
}
