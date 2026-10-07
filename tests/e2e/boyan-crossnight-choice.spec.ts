import { readFileSync } from "node:fs";
import { collectPageErrors } from "./page-errors";
import { expect, test } from "@playwright/test";
import { StoryBridge } from "../../src/story/storyBridge";
import { newLetter, newTea, snapshotSchema } from "../../src/types/game";
import { appReady } from "./app-ready";

function officeQuestionSnapshot() {
  const story = new StoryBridge(readFileSync("public/story/compiled/boyan-chapter-21.json", "utf8"), "recipient");
  story.next();
  for (let step = 0; step < 280; step++) {
    const frame = story.frame;
    const objects = frame.choices.find((choice) => [
      "查看識別證背面的便條",
      "查看第一版信上重複的道歉",
      "核對排程上重疊的三份工作",
    ].includes(choice.text));
    if (frame.section === "office" && frame.choices.some((choice) => choice.text === "問柏言這封信該先讓誰讀") && !objects)
      return snapshotSchema.parse({
        version: 1,
        storyVersion: "boyan-chapter-21",
        inkState: story.serialize(),
        frame,
        tea: newTea(),
        letter: newLetter(),
      });
    if (frame.mode === "tea") story.finishTea({ teaId: "chamomile", quality: 90, emotionalMatch: 90 });
    else if (frame.canContinue) story.next();
    else story.choose((objects ?? frame.choices[0])!.index);
  }
  throw new Error("Boyan's office question was not reached");
}

test("second-night crossnight question can be chosen and resumed on both layouts", async ({ page }) => {
  const errors: string[] = [];
  collectPageErrors(page, errors);
  await page.goto("/");
  await page.getByRole("link", { name: "設定" }).click();
  await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
  await page.evaluate(async (snapshot) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("saves", "readwrite");
        transaction.objectStore("saves").put({ id: "auto-1", kind: "auto", updatedAt: new Date().toISOString(), snapshot });
        transaction.oncomplete = () => { db.close(); resolve(); };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }, officeQuestionSnapshot());
  await page.goto("/");
  await page.getByRole("button", { name: "繼續故事" }).click();
  await expect(page.locator(".memory-evidence-office .memory-object-seen")).toHaveCount(3);
  await page.getByRole("button", { name: "問柏言這封信該先讓誰讀" }).click();
  await expect(page.locator(".dialogue-text")).toHaveAttribute("data-full-text", /可以不回/);
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator(".dialogue-text")).toHaveAttribute("data-full-text", /可以不回/);
  for (let step = 0; step < 6 && !(await page.locator(".memory-evidence-office").isVisible()); step++)
    await page.getByRole("button", { name: "繼續", exact: true }).click();
  await expect(page.locator(".memory-evidence-office")).toBeVisible();
  await expect(page.getByRole("button", { name: "問柏言這封信該先讓誰讀" })).toHaveCount(0);
  expect(errors).toEqual([]);
});

function openingHubSnapshot() {
  const story = new StoryBridge(readFileSync("public/story/compiled/boyan-chapter-21.json", "utf8"));
  story.next();
  for (let step = 0; step < 40; step++) {
    const frame = story.frame;
    if (frame.choices.some((choice) => choice.text === "問袖口那圈冷掉的咖啡"))
      return snapshotSchema.parse({
        version: 1,
        storyVersion: "boyan-chapter-21",
        inkState: story.serialize(),
        frame,
        tea: newTea(),
        letter: newLetter(),
      });
    if (frame.canContinue) story.next();
    else story.choose(frame.choices[0]!.index);
  }
  throw new Error("Boyan's opening observations were not reached");
}

test("second-night opening observations can be asked, skipped and resumed on both layouts", async ({ page }) => {
  const errors: string[] = [];
  collectPageErrors(page, errors);
  await page.goto("/");
  await page.getByRole("link", { name: "設定" }).click();
  await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
  await page.evaluate(async (snapshot) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("saves", "readwrite");
        transaction.objectStore("saves").put({ id: "auto-1", kind: "auto", updatedAt: new Date().toISOString(), snapshot });
        transaction.oncomplete = () => { db.close(); resolve(); };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }, openingHubSnapshot());
  await page.goto("/");
  await page.getByRole("button", { name: "繼續故事" }).click();
  await page.getByRole("button", { name: "問袖口那圈冷掉的咖啡" }).click();
  for (let step = 0; step < 6; step++) {
    const text = await page.locator(".dialogue-text").getAttribute("data-full-text");
    if (text?.includes("我記得價錢，不記得味道")) break;
    await page.getByRole("button", { name: "繼續", exact: true }).click();
  }
  await expect(page.locator(".dialogue-text")).toHaveAttribute("data-full-text", /我記得價錢，不記得味道/);
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator(".dialogue-text")).toHaveAttribute("data-full-text", /我記得價錢，不記得味道/);
  for (let step = 0; step < 6 && !(await page.getByRole("button", { name: "看公事包裡的胃藥和三張日期不同的紙" }).isVisible()); step++)
    await page.getByRole("button", { name: "繼續", exact: true }).click();
  await expect(page.getByRole("button", { name: "問袖口那圈冷掉的咖啡" })).toHaveCount(0);
  await page.getByRole("button", { name: "看公事包裡的胃藥和三張日期不同的紙" }).click();
  for (let step = 0; step < 6; step++) {
    const text = await page.locator(".dialogue-text").getAttribute("data-full-text");
    if (text?.includes("都是辭職信")) break;
    await page.getByRole("button", { name: "繼續", exact: true }).click();
  }
  await expect(page.locator(".dialogue-text")).toHaveAttribute("data-full-text", /都是辭職信/);
  await expect(page.locator(".character-portrait")).toHaveAttribute("src", /boyan-soft/);
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator(".character-portrait")).toHaveAttribute("src", /boyan-soft/);
  for (let step = 0; step < 8 && !(await page.getByRole("button", { name: "先替他燒水" }).isVisible()); step++)
    await page.getByRole("button", { name: "繼續", exact: true }).click();
  await page.getByRole("button", { name: "先替他燒水" }).click();
  for (let step = 0; step < 6 && !(await page.locator(".tea-board").isVisible()); step++) {
    const cont = page.getByRole("button", { name: "繼續", exact: true });
    if (await cont.isVisible()) await cont.click();
  }
  await expect(page.locator(".tea-board")).toBeVisible();
  expect(errors).toEqual([]);
});

test("chapter-ten Boyan save still opens its archived story", async ({ page }) => {
  const story = new StoryBridge(readFileSync("public/story/compiled/boyan-chapter-10.json", "utf8"), "recipient");
  story.next();
  story.next();
  const snapshot = snapshotSchema.parse({
    version: 1,
    storyVersion: "boyan-chapter-10",
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
        transaction.objectStore("saves").put({ id: "auto-1", kind: "auto", updatedAt: new Date().toISOString(), snapshot: data });
        transaction.oncomplete = () => { db.close(); resolve(); };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }, snapshot);
  await page.reload();
  await page.getByRole("button", { name: "繼續故事" }).click();
  await expect(page.locator(".dialogue-text")).toHaveAttribute("data-full-text", /靜蘭.*短箋副本/);
});
