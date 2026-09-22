import { Buffer } from "node:buffer";
import { chromium } from "@playwright/test";
import { createServer } from "vite";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

// Tight RGBA crops keep the decoded atlas small enough for mobile. Each frame
// uses the same geometry, camera and timeline as Remotion's completion film.
const server = await createServer({
  configFile: false,
  root: process.cwd(),
  optimizeDeps: { entries: ["scripts/tea-props/index.html"] },
  server: { host: "127.0.0.1", port: 4176, strictPort: true, hmr: false },
  logLevel: "error",
});
await server.listen();
const browser = await chromium.launch({
  args: ["--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:4176/scripts/tea-props/");
  await page.waitForFunction(() => window.renderLiquorFrame);
  const frames = [],
    crops = [];
  let cellWidth = 0,
    cellHeight = 0;
  for (let i = 0; i < 180; i++) {
    const uri = await page.evaluate(
      (t) => window.renderLiquorFrame(t),
      i / 179,
    );
    const buffer = Buffer.from(uri.split(",")[1], "base64");
    const { data, info } = await sharp(buffer)
      .trim({ threshold: 1 })
      .png()
      .toBuffer({ resolveWithObject: true });
    if (info.width > 450 || info.height > 230)
      throw new Error(`Unexpected liquor bounds in frame ${i}`);
    cellWidth = Math.max(cellWidth, info.width);
    cellHeight = Math.max(cellHeight, info.height);
    frames.push({
      x: -info.trimOffsetLeft,
      y: -info.trimOffsetTop,
      width: info.width,
      height: info.height,
    });
    crops.push(data);
    if (i % 30 === 0) console.log(`Liquor mask ${i}/180`);
  }
  const columns = 12,
    rows = 15;
  const atlas = await sharp({
    create: {
      width: cellWidth * columns,
      height: cellHeight * rows,
      channels: 4,
      background: "#00000000",
    },
  })
    .composite(
      crops.map((input, i) => ({
        input,
        left: (i % columns) * cellWidth,
        top: Math.floor(i / columns) * cellHeight,
      })),
    )
    .webp({ quality: 94, alphaQuality: 100 })
    .toBuffer();
  if (atlas.length > 2 * 1024 * 1024)
    throw new Error("Liquor atlas exceeds offline cache limit");
  await mkdir("public/video/tea", { recursive: true });
  await writeFile("public/video/tea/complete-liquor.webp", atlas);
  await writeFile(
    "src/data/teaLiquorFrames.json",
    JSON.stringify(
      { fps: 30, columns, cellWidth, cellHeight, frames },
      null,
      2,
    ) + "\n",
  );
  console.log(
    `Validated ${frames.length} masks; ${cellWidth * columns}x${cellHeight * rows}; ${atlas.length} bytes`,
  );
} finally {
  await browser.close();
  await server.close();
}
