import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { StoryBridge } from "../../src/story/storyBridge";
import { newLetter, newTea, snapshotSchema } from "../../src/types/game";
import { appReady } from "./app-ready";

// 第一夜存在 main.json；走到指定小遊戲後存成自動存檔，再從首頁接續。
function firstNightAt(target: "tea" | "letter") {
  const story = new StoryBridge(readFileSync("public/story/compiled/main.json", "utf8"));
  story.next();
  for (let step = 0; step < 900; step++) {
    const frame = story.frame;
    if (frame.mode === target)
      return snapshotSchema.parse({
        version: 1,
        storyVersion: "jinglan-chapter-14",
        inkState: story.serialize(),
        frame,
        tea: newTea(),
        letter: newLetter(),
      });
    if (frame.mode === "tea") story.finishTea({ teaId: "osmanthus", quality: 90, emotionalMatch: 100 });
    else if (frame.mode === "letter") story.finishLetter({ completion: 100, understood: true });
    else if (frame.canContinue) story.next();
    else story.choose(frame.choices[0]!.index);
  }
  throw new Error(`first night did not reach ${target}`);
}

async function resumeAt(page: Page, target: "tea" | "letter") {
  await page.goto("/");
  await appReady(page);
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
  }, firstNightAt(target));
  await page.goto("/");
  await page.getByRole("button", { name: "繼續故事" }).click();
}

test("letter hints put a piece back in place, survive a reload and run out after three", async ({ page }) => {
  await resumeAt(page, "letter");
  await expect(page.locator(".letter-clue")).toBeVisible();
  await expect(page.locator(".letter-clue-cell")).toHaveCount(3);

  await page.getByRole("button", { name: "提示（剩 3 次）" }).click();
  await expect(page.getByRole("button", { name: "信紙第 1 格：岳川，我不是不願意跟你走。" })).toBeVisible();
  await expect(page.locator(".letter-panel")).toContainText("還剩 2 次提示");
  await expect(page.locator(".letter-clue-cell.placed")).toHaveCount(1);

  await page.reload();
  await expect(page.getByRole("button", { name: "提示（剩 2 次）" })).toBeEnabled();
  await expect(page.getByRole("button", { name: "信紙第 1 格：岳川，我不是不願意跟你走。" })).toBeVisible();

  await page.getByRole("button", { name: "重置" }).click();
  await expect(page.locator(".letter-slot.filled")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "重置" })).toBeDisabled();

  await page.getByRole("button", { name: "提示（剩 2 次）" }).click();
  await page.getByRole("button", { name: "提示（剩 1 次）" }).click();
  await expect(page.getByRole("button", { name: "提示（剩 0 次）" })).toBeDisabled();
  await expect(page.locator(".letter-slot.filled")).toHaveCount(2);
  await expect(page.getByRole("button", { name: "信紙第 2 格：只是那一晚，我也有不能離開的人。" })).toBeVisible();
});

test("the tea table shows water, steep, flavour, recipe and completion cards", async ({ page }) => {
  await resumeAt(page, "tea");
  await expect(page.locator(".tea-board")).toBeVisible();
  for (const title of ["水溫", "浸泡", "風味", "配方", "完成度"])
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  await expect(page.getByRole("slider", { name: "水溫" })).toHaveValue("90");
  await expect(page.getByRole("meter", { name: "完成度" })).toHaveAttribute("aria-valuenow", "0");
  await expect(page.locator(".tea-steep-clock")).toContainText("0:00");
  await expect(page.getByRole("img", { name: /風味雷達/ })).toBeVisible();
});
