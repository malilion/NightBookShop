import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { StoryBridge } from "../../src/story/storyBridge";
import { endings } from "../../src/data/catalog";
import { newLetter, newOpening, newTea, snapshotSchema, STORY_VERSION } from "../../src/types/game";
import { smallTargets } from "./touch-target-helpers";

function atFirstLetter() {
  const story = new StoryBridge(readFileSync("public/story/compiled/main.json", "utf8"));
  story.next();
  for (let step = 0; step < 600; step++) {
    if (story.frame.mode === "letter")
      return snapshotSchema.parse({
        version: 1,
        storyVersion: STORY_VERSION,
        inkState: story.serialize(),
        frame: story.frame,
        tea: { ...newTea(), teaId: "osmanthus", step: "serve", leaves: 3, water: 70, temperature: 90, seconds: 45 },
        letter: newLetter(),
        opening: { ...newOpening(), complete: true },
      });
    if (story.frame.mode === "tea") story.finishTea({ teaId: "osmanthus", quality: 100, emotionalMatch: 100 }, "jinglan");
    else if (story.frame.canContinue) story.next();
    else story.choose(story.frame.choices[0]!.index);
  }
  throw new Error("First-night letter was not reached");
}

test("mobile letter and collection touch targets", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile");
  const origin = process.env.PLAYWRIGHT_BASE_URL ?? "";
  await page.goto(`${origin}/`);
  await page.getByRole("link", { name: "故事收藏" }).click();
  await expect(page.getByRole("heading", { name: "書籤書架" })).toBeVisible();
  expect(await smallTargets(page), "empty collection controls").toEqual([]);
  await page.evaluate(async (endingIds) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("collection", "readwrite");
        for (const id of endingIds)
          tx.objectStore("collection").put({ id, unlockedAt: new Date().toISOString() });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, Object.keys(endings));
  await page.reload();
  await expect(page.locator(".archive-afterword")).toHaveCount(7);
  expect(await smallTargets(page), "unlocked collection controls").toEqual([]);
  await page.goto(`${origin}/`);
  await page.evaluate(async (snapshot) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("saves", "readwrite");
        tx.objectStore("saves").put({ id: "auto-1", kind: "auto", updatedAt: new Date().toISOString(), snapshot });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, atFirstLetter());
  await page.goto(`${origin}/`);
  await page.getByRole("button", { name: "繼續故事" }).click();
  await expect(page.locator(".letter-panel")).toBeVisible();
  expect(await smallTargets(page), "initial letter controls").toEqual([]);
  await page.getByRole("button", { name: "放大拼信工作區" }).click();
  await page.locator(".fragment").first().click();
  await page.getByRole("button", { name: "旋轉 90°" }).click();
  await page.locator(".inspect-ink").click();
  expect(await smallTargets(page), "selected fragment and ink controls").toEqual([]);
  await page.screenshot({ path: "output/mobile-letter-touch.png", animations: "disabled", fullPage: true });
});
