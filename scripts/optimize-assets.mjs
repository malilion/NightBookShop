import sharp from "sharp";
import { mkdir } from "node:fs/promises";
const files = {
  "rain-street": "15a7bd59-347d-40ae-9d41-74e2b81bae92.png",
  counter: "9aefd074-650e-401d-8677-3247cbde19fd.png",
  jinglan: "55978925-2eb4-42ae-8cfd-f445b828a330.png",
  memory: "96437db7-69f7-43db-bf6e-d41005957dbf.png",
  "moon-sea": "3b436259-35e8-4fa0-993b-6834adb455ec.png",
};
await mkdir("public/images", { recursive: true });
for (const [name, file] of Object.entries(files)) {
  await sharp(file)
    .resize({ width: 1672, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toFile(`public/images/${name}.webp`);
}
for (const size of [192, 512])
  await sharp("public/favicon.svg")
    .resize(size, size)
    .png()
    .toFile(`public/icon-${size}.png`);
console.log("Optimized 5 reference scenes and 2 PWA icons.");
