import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { StoryBridge } from "../../src/story/storyBridge";
import { newLetter, newTea, snapshotSchema } from "../../src/types/game";
import { appReady } from "./app-ready";

test("chapter-eight finale save resumes with its archived Ink", async ({ page }) => {
  const archived = readFileSync("public/story/compiled/lincheng-chapter-8.json", "utf8");
  const story = new StoryBridge(archived, "haiming-light");
  story.next();
  const snapshot = snapshotSchema.parse({
    version: 1,
    storyVersion: "lincheng-chapter-8",
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
  await expect(page.locator(".dialogue-text")).toHaveAttribute("data-full-text", /六夜的書籤排在櫃台上/);
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
});
