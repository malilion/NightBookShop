import { bundle } from "@remotion/bundler";
import {
  openBrowser,
  selectComposition,
  renderMedia,
  renderStill,
} from "@remotion/renderer";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { mkdir, writeFile, copyFile, stat } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const out = path.join(root, "output/remotion");
const option = (name) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
// pour / complete are the approved shared clips; brew is one film per tea.
const clip = option("clip") ?? "pour";
const compositionId = { pour: "TeaPour", complete: "TeaComplete", brew: "TeaBrew" }[clip];
if (!compositionId) throw new Error(`Unknown clip ${clip}`);
const preview = process.argv.includes("--preview");
const publish = process.argv.includes("--publish");
// Re-encode and validate an earlier brew render without rendering it again.
const encodeOnly = process.argv.includes("--encode-only");
if (encodeOnly && clip !== "brew") throw new Error("--encode-only needs --clip=brew");
const allTeas = ["osmanthus", "puer", "mint", "jasmine", "black", "chamomile", "lavender", "hojicha"];
const teaArg = option("tea") || "osmanthus";
// Brew films take one tea, a comma-separated list or "all".
const teas = clip !== "brew" ? [teaArg] : teaArg === "all" ? allTeas : teaArg.split(",");
for (const tea of teas)
  if (!(clip === "brew" ? allTeas : ["osmanthus", "puer", "mint"]).includes(tea))
    throw new Error(`Unknown tea ${tea}`);
if (publish && clip !== "brew" && teaArg !== "osmanthus")
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
const published = [];
try {
  for (const tea of teas) {
    const inputProps = { tea, clip };
    // Building a tea's set and hands takes a while on the first frame,
    // longer still on a busy machine.
    const timeoutInMilliseconds = 120000;
    const composition = await selectComposition({
      serveUrl,
      id: compositionId,
      inputProps,
      puppeteerInstance: browser,
      timeoutInMilliseconds,
    });
    const frames = composition.durationInFrames;
    const seconds = frames / composition.fps;
    const common = {
      serveUrl,
      composition,
      inputProps,
      puppeteerInstance: browser,
      timeoutInMilliseconds,
    };
    // The brew film is checked at the middle of each of its four shots.
    const stills =
      clip === "brew" ? [0, 37, 108, 178, 258, frames - 1] : [0, 90, frames - 1];
    for (const frame of encodeOnly ? [] : stills) {
      await renderStill({
        ...common,
        frame,
        output: path.join(out, `${clip}-${tea}-${frame}.png`),
        imageFormat: "png",
      });
    }
    if (preview) {
      console.log(`Preview frames for ${tea}: ${stills.join(", ")}`);
      continue;
    }
    const base = path.join(out, `${clip}-${tea}`);
    const limit = 2 * 1024 * 1024;
    // Remotion's render is kept as the master; both delivery files encode from it.
    const master = clip === "brew" ? `${base}-master.mp4` : `${base}.mp4`;
    let reported = -1;
    if (!encodeOnly) await renderMedia({
      ...common,
      outputLocation: master,
      codec: "h264",
      crf: clip === "brew" ? 22 : 18,
      x264Preset: clip === "brew" ? "slow" : undefined,
      pixelFormat: "yuv420p",
      imageFormat: "png",
      concurrency: clip === "brew" ? 4 : 2,
      onProgress: ({ progress }) => {
        const tenth = Math.floor(progress * 10);
        if (tenth > reported) {
          reported = tenth;
          console.log(`Rendering ${tea} ${tenth * 10}%`);
        }
      },
    });
    if (clip === "brew") {
      await copyFile(master, `${base}.mp4`);
      // A busy tea can push its film past the offline cache limit: step the
      // rate factor up from the master until the MP4 fits.
      for (let crf = 24; (await stat(`${base}.mp4`)).size > limit && crf <= 30; crf += 2) {
        console.log(`Re-encoding ${tea} MP4 at CRF ${crf} to fit the cache limit`);
        execFileSync("ffmpeg", [
          "-y",
          "-v",
          "error",
          "-i",
          master,
          "-an",
          "-c:v",
          "libx264",
          "-preset",
          "slow",
          "-crf",
          String(crf),
          "-pix_fmt",
          "yuv420p",
          "-movflags",
          "+faststart",
          `${base}.mp4`,
        ]);
      }
    }
    const webm = (crf) =>
      execFileSync("ffmpeg", [
        "-y",
        "-v",
        "error",
        "-i",
        master,
        "-an",
        "-c:v",
        "libvpx-vp9",
        "-b:v",
        "0",
        "-crf",
        String(crf),
        "-row-mt",
        "1",
        `${base}.webm`,
      ]);
    webm(clip === "brew" ? 33 : 30);
    for (let crf = 35; clip === "brew" && (await stat(`${base}.webm`)).size > limit && crf <= 41; crf += 2) {
      console.log(`Re-encoding ${tea} WebM at CRF ${crf} to fit the cache limit`);
      webm(crf);
    }
    await sharp(path.join(out, `${clip}-${tea}-0.png`))
      .webp({ quality: 88 })
      .toFile(`${base}-poster.webp`);
    // Reduced motion shows the served cup, the film's last frame.
    await sharp(path.join(out, `${clip}-${tea}-${frames - 1}.png`))
      .webp({ quality: 86 })
      .toFile(`${base}-still.webp`);
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
        Math.abs(Number(info.format.duration) - seconds) > 0.05
      )
        throw new Error(`Unexpected media format: ${tea} ${ext}`);
      if (Number(info.format.size) > limit)
        throw new Error(`Film exceeds offline cache limit: ${tea} ${ext}`);
      execFileSync("ffmpeg", ["-v", "error", "-i", file, "-f", "null", "-"]);
      files.push({ file: path.basename(file), ...info });
    }
    await writeFile(
      `${base}-validation.json`,
      JSON.stringify(
        {
          composition: compositionId,
          remotion: "4.0.526",
          tea,
          frames,
          files,
        },
        null,
        2,
      ),
    );
    if (publish) {
      const dest = path.join(root, "public/video/tea");
      const name = clip === "brew" ? `brew-${tea}-v1` : `${clip}-remotion-v1`;
      // Publish only after every output passes metadata and full decode validation.
      for (const ext of ["mp4", "webm"])
        await copyFile(`${base}.${ext}`, path.join(dest, `${name}.${ext}`));
      await copyFile(`${base}-poster.webp`, path.join(dest, `${name}-poster.webp`));
      if (clip === "brew")
        await copyFile(`${base}-still.webp`, path.join(dest, `${name}-still.webp`));
      published.push(name);
      console.log(`Validated film published as ${name}`);
    }
  }
} finally {
  await browser.close({ silent: true });
}
// The liquor tint follows the film frame by frame; brew films share a mask.
if (publish && (clip === "complete" || clip === "brew")) {
  execFileSync(
    process.execPath,
    [path.join(root, "scripts/render-tea-liquor.mjs"), `--clip=${clip}`],
    { cwd: root, stdio: "inherit" },
  );
}
