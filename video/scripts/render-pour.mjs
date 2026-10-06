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
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { brewFilm, brewFilmGarnishes } from "../src/tea-varieties.js";
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
const teaArg = option("tea");
const garnishArg = option("garnish");
if (garnishArg && clip !== "brew") throw new Error("--garnish needs --clip=brew");
// Brew films take one tea, a comma-separated list or "all". With --garnish
// (one garnish or "all") they are the authored garnish films instead; --tea
// then narrows them.
const teas =
  clip !== "brew" ? [teaArg || "osmanthus"] : teaArg === "all" || (garnishArg && !teaArg) ? allTeas : (teaArg || "osmanthus").split(",");
for (const tea of teas)
  if (!(clip === "brew" ? allTeas : ["osmanthus", "puer", "mint"]).includes(tea))
    throw new Error(`Unknown tea ${tea}`);
if (garnishArg && garnishArg !== "all" && !brewFilmGarnishes[garnishArg])
  throw new Error(`Unknown garnish ${garnishArg}`);
const films = !garnishArg
  ? teas.map((tea) => ({ tea, garnish: "none" }))
  : Object.entries(brewFilmGarnishes)
      .filter(([garnish]) => garnishArg === "all" || garnish === garnishArg)
      .flatMap(([garnish, { teas: authored }]) =>
        authored.filter((tea) => teas.includes(tea)).map((tea) => ({ tea, garnish })),
      );
if (!films.length) throw new Error("No authored film matches --tea and --garnish");
if (publish && clip !== "brew" && teas[0] !== "osmanthus")
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
// On a busy machine the browser occasionally captures a frame at the wrong
// buffer size, a tiled picture that still decodes cleanly. Inside a shot,
// consecutive frames change little, so flag any frame far from its
// predecessor, ignoring the film's planned cuts.
function misCaptured(file) {
  const W = 160,
    H = 90;
  const { stdout } = spawnSync(
    "ffmpeg",
    ["-v", "error", "-i", file, "-vf", `scale=${W}:${H}`, "-pix_fmt", "gray", "-f", "rawvideo", "-"],
    { maxBuffer: 64 * 1024 * 1024 },
  );
  const cuts = new Set(brewFilm.shots.map((shot) => shot.from));
  const flagged = [];
  for (let f = 1; f < stdout.length / (W * H); f++) {
    if (cuts.has(f)) continue;
    let change = 0;
    for (let i = 0; i < W * H; i++)
      change += Math.abs(stdout[f * W * H + i] - stdout[(f - 1) * W * H + i]);
    if (change / (W * H) > 24) flagged.push(f);
  }
  return flagged;
}
// One exact frame of a video, decoded in order rather than seeked.
function extractFrame(file, index, output) {
  execFileSync("ffmpeg", ["-v", "error", "-i", file, "-vf", `select=eq(n\\,${index})`, "-vsync", "0", "-frames:v", "1", "-pix_fmt", "rgb24", "-y", output]);
}
const published = [];
try {
  for (const { tea, garnish } of films) {
    const inputProps = { tea, clip, garnish };
    // A garnish film is named for both: brew-hojicha-apple.
    const film = garnish === "none" ? tea : `${tea}-${garnish}`;
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
    const stills = option("frames")
      ? option("frames").split(",").map(Number)
      : clip === "brew"
        ? [0, 37, 108, 178, 258, frames - 1]
        : [0, 90, frames - 1];
    for (const frame of encodeOnly ? [] : stills) {
      await renderStill({
        ...common,
        frame,
        output: path.join(out, `${clip}-${film}-${frame}.png`),
        imageFormat: "png",
      });
    }
    if (preview) {
      console.log(`Preview frames for ${film}: ${stills.join(", ")}`);
      continue;
    }
    const base = path.join(out, `${clip}-${film}`);
    const limit = 2 * 1024 * 1024;
    // Remotion's render is kept as the master; both delivery files encode from it.
    const master = clip === "brew" ? `${base}-master.mp4` : `${base}.mp4`;
    for (let attempt = 1; ; attempt++) {
      let reported = -1;
      if (!encodeOnly)
        await renderMedia({
          ...common,
          outputLocation: master,
          codec: "h264",
          crf: clip === "brew" ? 22 : 18,
          x264Preset: clip === "brew" ? "slow" : undefined,
          pixelFormat: "yuv420p",
          imageFormat: "png",
          // Fewer WebGL pages at once keeps the GPU from dropping frames.
          // 機器負載高時第二個渲染分頁可能開不起來；可用 FILM_CONCURRENCY=1 改成單分頁。
          concurrency: Number(process.env.FILM_CONCURRENCY ?? 2),
          onProgress: ({ progress }) => {
            const tenth = Math.floor(progress * 10);
            if (tenth > reported) {
              reported = tenth;
              console.log(`Rendering ${film} ${tenth * 10}%`);
            }
          },
        });
      const bad = clip === "brew" ? misCaptured(master) : [];
      if (!bad.length) break;
      if (encodeOnly || attempt === 3)
        throw new Error(`Mis-captured frames in ${film}: ${bad.join(", ")}`);
      console.log(`Re-rendering ${film}; mis-captured frames ${bad.join(", ")}`);
    }
    if (clip === "brew") {
      await copyFile(master, `${base}.mp4`);
      // A busy tea can push its film past the offline cache limit: step the
      // rate factor up from the master until the MP4 fits.
      for (let crf = 24; (await stat(`${base}.mp4`)).size > limit && crf <= 30; crf += 2) {
        console.log(`Re-encoding ${film} MP4 at CRF ${crf} to fit the cache limit`);
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
      console.log(`Re-encoding ${film} WebM at CRF ${crf} to fit the cache limit`);
      webm(crf);
    }
    // Poster and served-cup still come from the checked master itself, so
    // they always match the film's first and last frames.
    const first = clip === "brew" ? `${base}-first.png` : path.join(out, `${clip}-${film}-0.png`);
    const last = clip === "brew" ? `${base}-last.png` : path.join(out, `${clip}-${film}-${frames - 1}.png`);
    if (clip === "brew") {
      extractFrame(master, 0, first);
      extractFrame(master, frames - 1, last);
    }
    await sharp(first).webp({ quality: 88 }).toFile(`${base}-poster.webp`);
    // Reduced motion shows the served cup, the film's last frame.
    // 杯碟改成青花瓷後細節多，品質 86 的定格約大一倍；定格在 PWA 預快取裡，用 70 守住預算。
    await sharp(last).webp({ quality: 70 }).toFile(`${base}-still.webp`);
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
        throw new Error(`Unexpected media format: ${film} ${ext}`);
      if (Number(info.format.size) > limit)
        throw new Error(`Film exceeds offline cache limit: ${film} ${ext}`);
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
          garnish,
          frames,
          files,
        },
        null,
        2,
      ),
    );
    if (publish) {
      const dest = path.join(root, "public/video/tea");
      const name = clip === "brew" ? `brew-${film}-v1` : `${clip}-remotion-v1`;
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
