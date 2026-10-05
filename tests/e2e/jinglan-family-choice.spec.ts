import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { StoryBridge } from "../../src/story/storyBridge";
import { newLetter, newTea, snapshotSchema, STORY_VERSION } from "../../src/types/game";
import { appReady } from "./app-ready";

test("Jinglan's family question is visible in the hospital memory and survives reload", async ({ page }) => {
  const story = new StoryBridge(readFileSync("public/story/compiled/main.json", "utf8"));
  story.next();
  for (let step = 0; step < 200; step++) {
    const frame = story.frame;
    if (frame.choices.some((choice) => choice.text === "問靜蘭，家人原本怎麼看她去外地")) break;
    if (frame.mode === "tea") {
      story.finishTea({ quality: 90, emotionalMatch: 100, teaId: "osmanthus" });
    } else if (frame.canContinue) {
      story.next();
    } else {
      const choice = frame.choices.find((entry) =>
        entry.text === "把茶具備好，讓她慢慢說" ||
        entry.text === "翻到夾著月亮圖案的那一頁",
      ) ?? frame.choices[0];
      if (!choice) throw new Error("Story stopped before the hospital memory");
      story.choose(choice.index);
    }
  }
  expect(story.frame.choices.some((choice) => choice.text === "問靜蘭，家人原本怎麼看她去外地")).toBe(true);
  const snapshot = snapshotSchema.parse({
    version: 1,
    storyVersion: STORY_VERSION,
    inkState: story.serialize(),
    frame: story.frame,
    tea: newTea(),
    letter: newLetter(),
  });
  await page.goto("/");
  await appReady(page);
  await page.evaluate(async (data) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("saves", "readwrite");
        transaction.objectStore("saves").put({
          id: "auto-1", kind: "auto", updatedAt: new Date().toISOString(), snapshot: data,
        });
        transaction.oncomplete = () => { db.close(); resolve(); };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }, snapshot);
  await page.reload();
  await page.getByRole("button", { name: "繼續故事" }).click();
  const familyQuestion = page.getByRole("button", { name: "問靜蘭，家人原本怎麼看她去外地" });
  await expect(page.getByRole("group", { name: "記憶中的物件" })).toBeVisible();
  await expect(familyQuestion).toBeVisible();
  await expect(page.getByRole("button", { name: "探索物件：公用電話" })).toBeVisible();
  await familyQuestion.click();
  await expect(page.locator(".dialogue-text")).toHaveAttribute("data-full-text", /外地沒有人照應/);
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  for (let step = 0; step < 20; step++) {
    if (await page.getByRole("group", { name: "記憶中的物件" }).isVisible()) break;
    const reveal = page.getByRole("button", { name: "顯示全文" });
    if (await reveal.isVisible()) await reveal.click({ timeout: 2_000 }).catch(() => undefined);
    else await page.getByRole("button", { name: "繼續", exact: true }).click();
  }
  await expect(page.getByRole("group", { name: "記憶中的物件" })).toBeVisible();
  await expect(familyQuestion).toHaveCount(0);
  await expect(page.getByRole("button", { name: "探索物件：公用電話" })).toBeVisible();
});
