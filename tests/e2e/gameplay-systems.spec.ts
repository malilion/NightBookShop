import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { letterPieces } from "../../src/data/catalog";
import { newLetter, newOpening, newTea, snapshotSchema, STORY_VERSION, type StoryFrame } from "../../src/types/game";
import { playTo } from "../storyWalk";

// 存檔管理（遊玩時間、刪除、章節快照）、音效字幕與拼信墨光。
function snapshotAt(reached: (frame: StoryFrame) => boolean, playTimeSeconds = 0) {
  const story = playTo(readFileSync("public/story/compiled/main.json", "utf8"), "osmanthus", [], reached);
  if (!story) throw new Error("沒有走到指定畫面");
  return snapshotSchema.parse({
    version: 2,
    playTimeSeconds,
    storyVersion: STORY_VERSION,
    inkState: story.serialize(),
    frame: story.frame,
    tea: { ...newTea(), teaId: "osmanthus", step: "serve", leaves: 3, water: 70, temperature: 90, seconds: 45 },
    letter: newLetter(),
    opening: { ...newOpening(), complete: true },
  });
}

async function putSave(page: Page, row: { id: string; kind: string; snapshot: unknown }) {
  await page.evaluate(async (saved) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("saves", "readwrite");
        tx.objectStore("saves").put({ ...saved, updatedAt: new Date().toISOString() });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, row);
}

test("letter slots glow when the held piece nears its place, and sounds are captioned", async ({ page }) => {
  await page.goto("/#/settings");
  await page.getByRole("switch", { name: /音效字幕/ }).check();
  // 偏好寫入 IndexedDB 是非同步的；確認已保存再離開設定頁。
  await expect.poll(() => page.evaluate(() => new Promise<boolean>((resolve) => {
    const request = indexedDB.open("night-bookshop");
    request.onsuccess = () => {
      const db = request.result;
      const get = db.transaction("preferences").objectStore("preferences").get("settings");
      get.onsuccess = () => { db.close(); resolve(get.result?.value?.captions === true); };
    };
  }))).toBe(true);
  await page.goto("/");
  await putSave(page, { id: "auto-1", kind: "auto", snapshot: snapshotAt((frame) => frame.mode === "letter") });
  await page.goto("/");
  await page.getByRole("button", { name: "繼續故事" }).click();
  await expect(page.locator(".letter-panel")).toBeVisible();
  await expect(page.locator(".sound-captions")).toContainText(/［(窗外下著雨|雨聲遠去，屋裡很靜)］/);

  const first = letterPieces[0]!;
  await page.getByRole("button", { name: first.text, exact: true }).click();
  await page.locator('[data-letter-slot="1"]').hover();
  await expect(page.locator(".ink-glow")).toHaveCount(0);
  await page.locator('[data-letter-slot="0"]').hover();
  await expect(page.locator('[data-letter-slot="0"]')).toHaveClass(/ink-glow/);
  await expect(page.locator(".letter-panel")).toContainText("墨跡在第 1 格微微發亮。");
  await page.locator('[data-letter-slot="0"]').click();
  await expect(page.locator(".ink-glow")).toHaveCount(0);
  await expect(page.locator(".sound-captions")).toContainText("［紙張翻動］");
});

test("saves show play time, manual saves can be deleted, and chapter snapshots reopen the ending", async ({ page }) => {
  await page.goto("/");
  await putSave(page, { id: "auto-1", kind: "auto", snapshot: snapshotAt((frame) => frame.mode === "dialogue" && frame.choices.length > 1, 754) });
  await page.goto("/");
  await page.getByRole("button", { name: "繼續故事" }).click();
  await expect(page.locator(".game-page")).toBeVisible();

  await page.goto("/#/saves");
  await page.getByRole("button", { name: "儲存", exact: true }).first().click();
  const slot = page.locator(".save-slot").first();
  await expect(slot).toContainText("本夜遊玩 12 分鐘");
  await expect(slot.locator(".save-thumb")).toBeVisible();
  await page.getByRole("button", { name: "刪除第 1 格" }).click();
  await expect(page.getByRole("heading", { name: "刪除第 1 格？" })).toBeVisible();
  await page.getByRole("button", { name: "確定刪除" }).click();
  await expect(slot).toContainText("尚未寫下的頁面");
  await expect(page.getByRole("button", { name: /^刪除第/ })).toHaveCount(0);

  await page.getByRole("button", { name: "自動存檔" }).click();
  await expect(page.getByRole("button", { name: /^刪除第/ })).toHaveCount(0);

  await putSave(page, { id: "chapter-jinglan", kind: "chapter", snapshot: snapshotAt((frame) => frame.mode === "ending", 2460) });
  await page.goto("/");
  await page.goto("/#/saves");
  await page.getByRole("button", { name: "章節快照" }).click();
  const chapter = page.locator(".save-slot").first();
  await expect(chapter).toContainText("首次完成於");
  await expect(chapter).toContainText("本夜遊玩 41 分鐘");
  await chapter.getByRole("button", { name: "重讀結局" }).click();
  await expect(page.locator(".game-page.mode-ending")).toBeVisible();
});
