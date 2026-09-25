import { describe, expect, it } from "vitest";
import { teas } from "../../src/data/catalog";
import { newTea, teaSchema, type TeaId } from "../../src/types/game";
import {
  clearWaterColor,
  rgbChannels,
  teaInfusion,
} from "../../src/services/teaInfusion";
const brew = { ...newTea(), water: 70, leaves: 3 };
const luminance = (color: string) =>
  rgbChannels(color).reduce(
    (sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i]!,
    0,
  );
describe("tea liquor", () => {
  it("begins clear and never extracts from an empty pot or without leaves", () => {
    expect(teaInfusion(brew)).toMatchObject({
      color: clearWaterColor,
      strength: 0,
    });
    for (const missing of [{ water: 0 }, { leaves: 0 }]) {
      expect(teaInfusion({ ...brew, seconds: 80, ...missing }).color).toBe(
        clearWaterColor,
      );
    }
  });
  it.each(Object.keys(teas) as TeaId[])(
    "%s deepens smoothly on its own recipe's clock",
    (teaId) => {
      const recipe = teas[teaId];
      const at = (seconds: number) =>
        teaInfusion({ ...brew, teaId, seconds }).color;
      expect(luminance(at(recipe.seconds * 0.2))).toBeGreaterThan(
        luminance(at(recipe.seconds)),
      );
      expect(luminance(at(recipe.seconds))).toBeGreaterThan(luminance(at(120)));
      for (const boundary of [recipe.seconds * 0.2, recipe.seconds]) {
        const before = rgbChannels(at(boundary - 0.01)),
          after = rgbChannels(at(boundary + 0.01));
        expect(
          Math.max(...before.map((v, i) => Math.abs(v - after[i]!))),
        ).toBeLessThanOrEqual(1);
      }
    },
  );
  it("distinguishes all eight teas and restores a paused brew without new save fields", () => {
    const colors = Object.keys(teas).map(
      (teaId) =>
        teaInfusion({ ...brew, teaId: teaId as TeaId, seconds: 45 }).color,
    );
    expect(new Set(colors).size).toBe(8);
    const paused = {
      ...brew,
      teaId: "puer" as const,
      seconds: 27.42,
      steepRunning: false,
    };
    expect(
      teaInfusion(teaSchema.parse(JSON.parse(JSON.stringify(paused)))),
    ).toEqual(teaInfusion(paused));
    expect(teaInfusion(newTea()).color).toBe(clearWaterColor);
  });
  it("tints mint liquor when measured black tea is mixed in", () => {
    const mint = { ...brew, teaId: "mint" as const, seconds: 30 };
    const plain = teaInfusion(mint);
    const mixed = teaInfusion({ ...mint, blackTea: 20 });
    expect(mixed.color).not.toBe(plain.color);
    expect(mixed.label).toContain("薄荷紅茶");
    expect(teaInfusion({ ...mint, water: 0, blackTea: 20 }).label).toBe("備好的淡紅茶");
    expect(teaInfusion({ ...mint, water: 0, blackTea: 20 }).strength).toBeGreaterThan(0);
    expect(teaInfusion(teaSchema.parse({ ...mint, blackTea: 20 }))).toEqual(mixed);
  });
});
