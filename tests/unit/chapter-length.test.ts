import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { TeaId } from "../../src/types/game";
import { measure, readingModel } from "../chapterLength";

// The PRD asks 35–60 minutes a chapter. Under the brisk model in
// tests/chapterLength.ts (400 characters a minute), the fixed first-choice
// route must reach 40 minutes, so a reader at 300 a minute takes about 50.
const chapters: [string, string, TeaId][] = [
  ["jinglan", "main.json", "osmanthus"],
  ["boyan", "boyan-chapter-20.json", "chamomile"],
  ["ruoyin", "ruoyin-chapter-19.json", "lavender"],
  ["yenuan", "yenuan-chapter-17.json", "hojicha"],
  ["yuhang", "yuhang-chapter-19.json", "mint"],
  ["haiming", "haiming-chapter-23.json", "hojicha"],
  ["lincheng", "lincheng-chapter-19.json", "osmanthus"],
];

describe("chapter length", () => {
  it.each(chapters)("plays %s for 40–60 minutes on the first-choice route", (_id, file, tea) => {
    const route = measure(readFileSync(`public/story/compiled/${file}`, "utf8"), tea, "first");
    expect(route.ending).not.toBe("");
    expect(route.minutes).toBeGreaterThanOrEqual(40);
    // Even a slow reader (250 a minute) should finish within the PRD's hour.
    const slow = route.minutes + route.chars / 250 - route.chars / readingModel.charsPerMinute;
    expect(slow).toBeLessThanOrEqual(60);
  });
});
