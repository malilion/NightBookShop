import { readFileSync } from "node:fs";
import { collectPageErrors } from "./page-errors";
import { expect, test, type Page } from "@playwright/test";
import { newLetter, newTea, snapshotSchema, STORY_VERSION, type TeaId } from "../../src/types/game";
import { playUntil } from "../storyWalk";

// A save stopped on the line an expression portrait was drawn for.
function saveAt(file: string, storyVersion: string, teaId: TeaId, hints: string[], line: string) {
  const story = playUntil(readFileSync(`public/story/compiled/${file}`, "utf8"), teaId, hints, line);
  if (!story) throw new Error(`${line} was not reached`);
  return snapshotSchema.parse({
    version: 1,
    storyVersion,
    inkState: story.serialize(),
    frame: story.frame,
    tea: newTea(),
    letter: newLetter(),
  });
}

async function resume(page: Page, snapshot: unknown) {
  await page.goto("/");
  await page.getByRole("link", { name: "設定" }).click();
  await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
  await page.evaluate(async (saved) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("saves", "readwrite");
        transaction.objectStore("saves").put({ id: "auto-1", kind: "auto", updatedAt: new Date().toISOString(), snapshot: saved });
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }, snapshot);
  await page.goto("/");
  await page.getByRole("button", { name: "繼續故事" }).click();
}

for (const { cue, kind, file, version, teaId, hints, line } of [
  { cue: "jinglan-tearful", kind: "visitor", file: "main.json", version: STORY_VERSION, teaId: "osmanthus", hints: ["聽她說一件和先生在一起的日常"], line: "眼睛卻紅了" },
  { cue: "boyan-tense", kind: "visitor", file: "boyan-chapter-22.json", version: "boyan-chapter-22", teaId: "mint", hints: ["問他哪件事暫時不必填進今晚"], line: "工作群組的新訊息" },
  { cue: "lincheng", kind: "self", file: "lincheng-chapter-19.json", version: "lincheng-chapter-19", teaId: "osmanthus", hints: ["先坐到訪客席"], line: "第一次，妳不用替下一位客人安排座位" },
  { cue: "lincheng-tearful", kind: "self", file: "lincheng-chapter-19.json", version: "lincheng-chapter-19", teaId: "osmanthus", hints: ["先坐到訪客席"], line: "藏信是真的" },
] as const) {
  test(`shows the ${cue} portrait on its line`, async ({ page }, info) => {
    const errors: string[] = [];
    collectPageErrors(page, errors);
    await resume(page, saveAt(file, version, teaId, [...hints], line));
    await expect(page.locator(".dialogue-text")).toHaveAttribute("data-full-text", new RegExp(line));
    const portrait = page.locator(".character-portrait");
    await expect(portrait).toHaveAttribute("src", `/images/characters/${cue}.webp`);
    await expect(portrait).toHaveAttribute("data-portrait", kind);
    await expect.poll(() => portrait.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBe(1024);
    await page.screenshot({ path: `output/portrait-${cue}-${info.project.name}.png`, animations: "disabled" });
    expect(errors).toEqual([]);
  });
}
