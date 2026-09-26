import { Buffer } from "node:buffer";
import { chromium } from "@playwright/test";
import { createServer } from "vite";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

// Liquor-only masks for a film, frame by frame, packed into one WebP atlas.
// Each mask uses the same geometry, camera and timeline as the Remotion film,
// so the game can tint the cup with the tea actually brewed. The brew films
// are ten seconds long, so their masks are stored at half resolution; every
// tea's brew film shares one mask because shots three and four are identical.
const clip =
  process.argv.find((a) => a.startsWith("--clip="))?.split("=")[1] ??
  "complete";
const specs = {
  complete: {
    frames: 180,
    scale: 1,
    atlas: "complete-liquor.webp",
    data: "src/data/teaLiquorFrames.json",
    maxCell: [450, 230],
  },
  brew: {
    frames: 300,
    scale: 2,
    renderScale: 2,
    firstVisibleFrame: 141,
    atlas: "brew-liquor-v1.webp",
    // Fetched with the atlas when a brew film opens, not bundled.
    data: "public/video/tea/brew-liquor-v1.json",
    maxCell: [900, 560],
  },
};
const spec = specs[clip];
if (!spec) throw new Error(`Unknown clip ${clip}`);
const server = await createServer({
  configFile: false,
  root: process.cwd(),
  optimizeDeps: { entries: ["scripts/tea-props/index.html"] },
  server: { host: "127.0.0.1", port: 4176, strictPort: true, hmr: false },
  logLevel: "error",
});
await server.listen();
// The GPU renders the brew film's masks many times faster; elsewhere fall
// back to software rendering.
const browser = await chromium.launch({
  args:
    process.platform === "darwin"
      ? ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"]
      : ["--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:4176/scripts/tea-props/");
  await page.waitForFunction(() => window.renderLiquorFrame);
  const frames = Array(spec.frames).fill(null),
    cells = [];
  for (let i = 0; i < spec.frames; i++) {
    if (i < (spec.firstVisibleFrame ?? 0)) continue;
    if (i % 30 === 0) console.log(`Liquor mask ${i}/${spec.frames}`);
    const uri = await page.evaluate(
      ([t, clip, renderScale]) => window.renderLiquorFrame(t, clip, "osmanthus", renderScale),
      [i / (spec.frames - 1), clip, spec.renderScale ?? 1],
    );
    // null: the film has no cup on screen in this frame.
    const buffer = uri && Buffer.from(uri.split(",")[1], "base64");
    if (!buffer || (await sharp(buffer).stats()).channels[3].max === 0) {
      frames[i] = null;
      continue;
    }
    const { info } = await sharp(buffer)
      .trim({ threshold: 1 })
      .toBuffer({ resolveWithObject: true });
    // Brew masks render at half resolution, which is already the atlas scale.
    const s = spec.renderScale ? 1 : spec.scale;
    const x = Math.floor(-info.trimOffsetLeft / s) * s,
      y = Math.floor(-info.trimOffsetTop / s) * s;
    const width = Math.ceil((-info.trimOffsetLeft + info.width) / s) * s - x,
      height = Math.ceil((-info.trimOffsetTop + info.height) / s) * s - y;
    if (width > spec.maxCell[0] || height > spec.maxCell[1])
      throw new Error(`Unexpected liquor bounds in frame ${i}`);
    const cell = await sharp(buffer)
      .extract({ left: x, top: y, width, height })
      .resize(width / s, height / s, { kernel: "lanczos3" })
      .png()
      .toBuffer();
    const coordinateScale = spec.renderScale ?? 1;
    frames[i] = {
      x: x * coordinateScale,
      y: y * coordinateScale,
      width: width * coordinateScale,
      height: height * coordinateScale,
    };
    cells.push({ index: i, input: cell, width: width / s, height: height / s });
  }
  // One mask serves every tea only if no tea's props or aroma ever cover the
  // cup: sample the tinted frames for all eight and require identical pixels.
  if (clip === "brew") {
    const teas = ["puer", "mint", "jasmine", "black", "chamomile", "lavender", "hojicha"];
    const tinted = frames.flatMap((frame, i) => (frame ? [i] : []));
    for (const i of tinted.filter((_, n) => n % 30 === 0 || n === tinted.length - 1)) {
      const reference = await page.evaluate(
        ([t, clip, renderScale]) => window.renderLiquorFrame(t, clip, "osmanthus", renderScale),
        [i / (spec.frames - 1), clip, spec.renderScale ?? 1],
      );
      for (const tea of teas) {
        const uri = await page.evaluate(
          ([t, clip, tea, renderScale]) => window.renderLiquorFrame(t, clip, tea, renderScale),
          [i / (spec.frames - 1), clip, tea, spec.renderScale ?? 1],
        );
        if (uri !== reference) throw new Error(`Liquor mask differs for ${tea} at frame ${i}`);
      }
    }
    console.log("Liquor masks identical across all eight teas");
  }
  // Shelf packing: fill rows left to right, in frame order.
  const maxWidth = 4096;
  let cx = 0,
    cy = 0,
    row = 0,
    atlasWidth = 0;
  for (const cell of cells) {
    if (cx + cell.width > maxWidth) {
      cx = 0;
      cy += row;
      row = 0;
    }
    Object.assign(frames[cell.index], { sx: cx, sy: cy });
    cell.left = cx;
    cell.top = cy;
    cx += cell.width;
    row = Math.max(row, cell.height);
    atlasWidth = Math.max(atlasWidth, cx);
  }
  const atlasHeight = cy + row;
  const atlas = await sharp({
    create: {
      width: atlasWidth,
      height: atlasHeight,
      channels: 4,
      background: "#00000000",
    },
  })
    .composite(cells.map(({ input, left, top }) => ({ input, left, top })))
    .webp({ quality: 94, alphaQuality: 100 })
    .toBuffer();
  if (atlas.length > 2 * 1024 * 1024)
    throw new Error("Liquor atlas exceeds offline cache limit");
  await mkdir("public/video/tea", { recursive: true });
  await writeFile(`public/video/tea/${spec.atlas}`, atlas);
  await writeFile(
    spec.data,
    JSON.stringify(
      {
        fps: 30,
        width: 1280,
        height: 720,
        scale: spec.scale,
        atlas: {
          file: `/video/tea/${spec.atlas}`,
          width: atlasWidth,
          height: atlasHeight,
        },
        frames,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `Validated ${cells.length}/${frames.length} masks; ${atlasWidth}x${atlasHeight}; ${atlas.length} bytes`,
  );
} finally {
  await browser.close();
  await server.close();
}
