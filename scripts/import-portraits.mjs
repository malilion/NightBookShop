// Imports generated character portraits: art-staging/portraits/<name>.png →
// public/images/characters/<name>.webp at 1024×1536 with the alpha channel
// kept. `--only=jinglan-smile,boyan-tense` imports just those.
import sharp from "sharp";
import { readdirSync, statSync } from "node:fs";

const from = "art-staging/portraits";
const to = "public/images/characters";
const only = process.argv
  .find((arg) => arg.startsWith("--only="))
  ?.slice("--only=".length)
  .split(",");
const names = readdirSync(from)
  .filter((file) => file.endsWith(".png"))
  .map((file) => file.slice(0, -".png".length))
  .filter((name) => !only || only.includes(name));
if (!names.length) throw new Error(`No portraits to import in ${from}`);
for (const name of names) {
  const source = sharp(`${from}/${name}.png`).ensureAlpha();
  const { width, height } = await source.metadata();
  if (Math.abs(width / height - 2 / 3) > 0.02) throw new Error(`${name}: ${width}×${height} is not 2:3`);
  const { data, info } = await source.clone().resize(1024, 1536, { fit: "fill" }).raw().toBuffer({ resolveWithObject: true });
  // The portrait sits over the scene: the corners and most of the frame must be clear.
  const alpha = (x, y) => data[(y * info.width + x) * 4 + 3];
  const corners = [alpha(4, 4), alpha(info.width - 5, 4), alpha(4, info.height - 5), alpha(info.width - 5, info.height - 5)];
  let clear = 0;
  for (let i = 3; i < data.length; i += 4) if (data[i] < 10) clear++;
  const share = clear / (info.width * info.height);
  if (corners.some((value) => value > 10) || share < 0.35)
    throw new Error(`${name}: background is not transparent (${Math.round(share * 100)}% clear)`);
  const file = `${to}/${name}.webp`;
  await source.resize(1024, 1536, { fit: "fill" }).webp({ quality: 84, alphaQuality: 90 }).toFile(file);
  console.log(`${file}: ${(statSync(file).size / 1024).toFixed(1)} KiB, ${Math.round(share * 100)}% clear`);
}
