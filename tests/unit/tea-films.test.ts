import { existsSync, readFileSync, statSync } from "node:fs";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { teaLiquorColors, teas } from "../../src/data/catalog";
import completeLiquor from "../../src/data/teaLiquorFrames.json";
import { brewFilmPath, brewFilmShots, type LiquorFrames } from "../../src/data/teaFilms";
import type { TeaId } from "../../src/types/game";
import { brewFilm, brewFilmTeas } from "../../video/src/tea-varieties.js";

const teaIds = Object.keys(teas) as TeaId[];
const publicFile = (url: string) => new URL(`../../public${url}`, import.meta.url);
const brewLiquor = JSON.parse(
  readFileSync(publicFile("/video/tea/brew-liquor-v1.json"), "utf8"),
) as LiquorFrames;

async function checkAtlas(liquor: LiquorFrames, frameCount: number) {
  expect(liquor.frames).toHaveLength(frameCount);
  const atlas = await sharp(publicFile(liquor.atlas.file).pathname).metadata();
  expect([atlas.width, atlas.height]).toEqual([liquor.atlas.width, liquor.atlas.height]);
  for (const frame of liquor.frames) {
    if (!frame) continue;
    // Crops stay inside the 1280×720 film and map to whole atlas pixels.
    expect(frame.x).toBeGreaterThanOrEqual(0);
    expect(frame.y).toBeGreaterThanOrEqual(0);
    expect(frame.x + frame.width).toBeLessThanOrEqual(liquor.width);
    expect(frame.y + frame.height).toBeLessThanOrEqual(liquor.height);
    expect(Number.isInteger(frame.width / liquor.scale)).toBe(true);
    expect(Number.isInteger(frame.height / liquor.scale)).toBe(true);
    expect(frame.sx + frame.width / liquor.scale).toBeLessThanOrEqual(liquor.atlas.width);
    expect(frame.sy + frame.height / liquor.scale).toBeLessThanOrEqual(liquor.atlas.height);
  }
}

describe("per-tea brew films", () => {
  it("covers every tea in the catalogue with its own liquor and label", () => {
    expect(Object.keys(brewFilmTeas).sort()).toEqual([...teaIds].sort());
    for (const id of teaIds) {
      expect(brewFilmTeas[id].name).toBe(teas[id].name);
      expect(brewFilmTeas[id].liquor).toBe(teaLiquorColors[id]);
    }
    // Each tea looks different in the caddy, the pot and the rising aroma.
    const looks = teaIds.map((id) => {
      const tea = brewFilmTeas[id];
      return [tea.glaze, tea.leaf + tea.leafColors.join(), tea.dish, tea.aroma.kind].join("|");
    });
    expect(new Set(looks).size).toBe(teaIds.length);
  });

  it("keeps the game's shot list in step with the film", () => {
    expect(brewFilmShots.map(({ id, label, from, to }) => ({ id, label, from, to }))).toEqual(
      brewFilm.shots,
    );
    expect(brewFilmShots.at(-1)!.to).toBe(brewFilm.frames);
    brewFilmShots.slice(1).forEach((shot, i) => expect(shot.from).toBe(brewFilmShots[i]!.to));
  });

  it.each(teaIds)("publishes the %s film, poster and served-cup still", (id) => {
    for (const suffix of [".mp4", ".webm", "-poster.webp", "-still.webp"]) {
      const file = publicFile(`${brewFilmPath(id)}${suffix}`);
      expect(existsSync(file), `${id}${suffix}`).toBe(true);
      // Every film fits the offline cache's per-file limit.
      expect(statSync(file).size).toBeLessThanOrEqual(2 * 1024 * 1024);
    }
  });

  it("shares one liquor mask that covers only the pour and serve shots", async () => {
    await checkAtlas(brewLiquor, brewFilm.frames);
    const pourStart = brewFilmShots.find((shot) => shot.id === "pour")!.from;
    expect(brewLiquor.frames.slice(0, pourStart).every((frame) => frame === null)).toBe(true);
    // Reduced motion shows the served cup, so the last frame must be tinted.
    expect(brewLiquor.frames.at(-1)).not.toBeNull();
    expect(brewLiquor.frames.slice(brewFilmShots.at(-1)!.from).every(Boolean)).toBe(true);
  });

  it("keeps the older completion clip's mask in the same format", async () => {
    await checkAtlas(completeLiquor as LiquorFrames, 180);
  });
});
