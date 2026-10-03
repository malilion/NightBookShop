import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { StoryBridge } from "../../src/story/storyBridge";
import { newLetter, newOpening, newTea, snapshotSchema, STORY_VERSION } from "../../src/types/game";

function beforeLetter() {
  const story = new StoryBridge(readFileSync("public/story/compiled/main.json", "utf8"));
  story.next();
  for (let step = 0; step < 600; step++) {
    if (story.frame.mode === "letter") {
      expect(story.frame.resonanceFragment).toBe("jinglan");
      return snapshotSchema.parse({
        version: 1,
        storyVersion: STORY_VERSION,
        inkState: story.serialize(),
        frame: story.frame,
        tea: { ...newTea(), teaId: "osmanthus", step: "serve", leaves: 3, water: 70, temperature: 90, seconds: 45 },
        letter: newLetter(),
        opening: { ...newOpening(), complete: true },
      });
    }
    if (story.frame.mode === "tea") story.finishTea({ teaId: "osmanthus", quality: 100, emotionalMatch: 100 }, "jinglan");
    else if (story.frame.canContinue) story.next();
    else story.choose(story.frame.choices[0]!.index);
  }
  throw new Error("Jinglan letter was not reached");
}

test("resonant letter fragment and gold bookmark survive reload", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("link", { name: "設定" }).click();
  await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
  await page.getByRole("switch", { name: /減少動態效果/ }).check();
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
  }, beforeLetter());
  await page.goto("/");
  await page.getByRole("button", { name: "繼續故事" }).click();
  await expect(page.getByText("共鳴之茶 · 特殊信件碎片")).toBeVisible();
  await page.getByRole("button", { name: "展開校刊室的紙角" }).click();
  await expect(page.getByText("等我們把話說清楚", { exact: false })).toBeVisible();
  await expect.poll(() => page.evaluate(async () => {
    return await new Promise<boolean>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("saves", "readonly");
        const rows = tx.objectStore("saves").getAll();
        rows.onsuccess = () => { db.close(); resolve(rows.result.some((row) => row.snapshot?.letter?.resonanceInspected)); };
        rows.onerror = () => reject(rows.error);
      };
    });
  })).toBe(true);
  await page.reload();
  await expect(page.getByRole("button", { name: "摺起校刊室的紙角" })).toBeVisible();
  await page.screenshot({ path: `output/resonance-letter-${info.project.name}.png`, animations: "disabled", fullPage: true });
  await page.getByRole("button", { name: "先保留這些空白" }).click();
  for (let step = 0; step < 100; step++) {
    if (await page.locator(".ending-panel").isVisible()) break;
    const reveal = page.getByRole("button", { name: "顯示全文" });
    const next = page.getByRole("button", { name: "繼續", exact: true });
    const choice = page.locator(".dialogue-choices button").first();
    if (await reveal.isVisible()) await reveal.click({ timeout: 2_000 }).catch(() => undefined);
    else if (await next.isVisible()) await next.click();
    else if (await choice.isVisible()) await choice.click();
    else throw new Error(`Story stalled after letter at step ${step}`);
  }
  await expect(page.locator(".ending-panel")).toBeVisible();
  await expect(page.getByText("獲得金色書籤 · 共鳴之茶")).toBeVisible();
  await page.getByRole("link", { name: "翻開故事收藏" }).click();
  await expect(page.locator(".bookmark-entry-golden")).toHaveCount(1);
  await expect(page.getByText("共鳴之茶 · 金色書籤")).toBeVisible();
  await page.reload();
  await expect(page.locator(".bookmark-entry-golden")).toHaveCount(1);
  await page.screenshot({ path: `output/resonance-bookmark-${info.project.name}.png`, animations: "disabled", fullPage: true });
  expect(errors).toEqual([]);
});
