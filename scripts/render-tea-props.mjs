import { Buffer } from "node:buffer";
import { chromium } from "@playwright/test";
import { createServer } from "vite";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
const specs = {
  jar: { x: -44, y: -61, width: 88, height: 124 },
  jarLid: { x: -39, y: -15, width: 78, height: 30 },
  kettle: { x: -60, y: -105, width: 150, height: 170 },
  pot: { x: -96, y: -61, width: 200, height: 126 },
  potLid: { x: -45, y: -29, width: 90, height: 49 },
  cup: { x: -61, y: -34, width: 122, height: 89 },
  spoon: { x: -64, y: -25, width: 132, height: 48 },
};
const glazes = {
  osmanthus: "#294c42",
  puer: "#63352a",
  mint: "#527a71",
  jasmine: "#828960",
  black: "#9d512e",
  chamomile: "#bead82",
  lavender: "#655978",
  hojicha: "#534536",
};
const preview = process.argv.includes("--preview");
const server = await createServer({
  configFile: false,
  optimizeDeps: { entries: ["scripts/tea-props/index.html"] },
  root: process.cwd(),
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
  await page.waitForFunction(() => window.renderProp && window.teaCatalog);
  const catalog = await page.evaluate(() => window.teaCatalog);
  const dest = preview ? "output/tea-props-preview" : "public/images/tea-props";
  await mkdir(dest, { recursive: true });
  const manifest = {};
  async function render(id, kind, props = {}) {
    const spec = { ...specs[kind], kind, ...props };
    const result = await page.evaluate((spec) => window.renderProp(spec), spec);
    const buffer = Buffer.from(result.image.split(",")[1], "base64");
    const file = `${dest}/${id}.webp`;
    await sharp(buffer).webp({ quality: 92, alphaQuality: 100 }).toFile(file);
    const stats = await sharp(buffer).stats();
    if (stats.channels[3]?.min !== 0 || stats.channels[3]?.max !== 255)
      throw new Error(`Missing alpha: ${id}`);
    manifest[id] = { ...specs[kind], file: `/images/tea-props/${id}.webp` };
    if (result.spout)
      manifest[id].spout = {
        x: spec.x + result.spout.x * spec.width,
        y: spec.y + result.spout.y * spec.height,
      };
    console.log(id);
  }
  if (preview) {
    const tea = catalog.osmanthus;
    const props = {
      color: tea.color,
      label: tea.name,
      glaze: glazes.osmanthus,
    };
    await render("kettle", "kettle");
    await render("pot", "pot", { ...props, state: "full" });
    await render("cup", "cup", { ...props, state: "full" });
    await render("jar", "jar", { ...props, state: "open" });
    await render("spoon", "spoon", { state: "full" });
  } else {
    for (const [id, tea] of Object.entries(catalog)) {
      const props = { color: tea.color, label: tea.name, glaze: glazes[id] };
      for (const state of ["open", "closed"])
        await render(`jar-${id}-${state}`, "jar", { ...props, state });
      await render(`cup-${id}`, "cup", { ...props, state: "full" });
      await render(`pot-${id}`, "pot", { ...props, state: "full" });
    }
    for (const kind of ["jarLid", "kettle", "potLid", "spoon", "cup", "pot"])
      await render(kind, kind);
    await render("pot-leaves", "pot", { state: "leaves" });
    await render("spoon-full", "spoon", { state: "full" });
    await writeFile(
      "src/data/teaPropAssets.json",
      JSON.stringify(manifest, null, 2) + "\n",
    );
  }
} finally {
  await browser.close();
  await server.close();
}
