import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { StoryBridge } from "../../src/story/storyBridge";
import {
  newArchive,
  newHearth,
  newLamp,
  newLetter,
  newMelody,
  newOpening,
  newRoute,
  newTea,
  snapshotSchema,
  type GameSnapshot,
} from "../../src/types/game";

const storyJson = readFileSync("public/story/compiled/yuhang-chapter-9.json", "utf8");
const endings = [
  { id: "yuhang-today", stamp: "present", choice: "今天自己簽收", title: "今日簽收" },
  { id: "yuhang-future", stamp: "future", choice: "寄往七年後，寫下", title: "寄往七年後" },
  { id: "yuhang-past", stamp: "past", choice: "妹妹的紀念盒", title: "退回過去" },
  { id: "yuhang-unknown", stamp: "none", choice: "拒絕簽收", title: "查無此人" },
] as const;

function beforeFinalChoice(stamp: (typeof endings)[number]["stamp"], choice: string): GameSnapshot {
  const story = new StoryBridge(storyJson);
  story.next();
  for (let step = 0; step < 300; step++) {
    const frame = story.frame;
    if (frame.mode === "dialogue" && frame.choices.some((item) => item.text.includes(choice))) {
      return snapshotSchema.parse({
        version: 1,
        storyVersion: "yuhang-chapter-9",
        inkState: story.serialize(),
        frame,
        tea: { ...newTea(), teaId: "mint", garnish: "lemon", blackTea: 20, step: "serve", leaves: 3, water: 70, seconds: 30 },
        letter: { ...newLetter(), slots: ["tomorrow", "admit", "without-her", "begin"], angles: [0, 0, 0, 0], flipped: [false, false, false, false], stamp, inspected: true },
        melody: newMelody(),
        hearth: newHearth(),
        route: { ...newRoute(), stops: ["post-office", "last-bus", "empty-shop"] },
        lamp: newLamp(),
        archive: newArchive(),
        opening: { ...newOpening(), complete: true },
      });
    }
    if (frame.mode === "tea") story.finishTea({ teaId: "mint", garnish: "lemon", blackTea: 20, quality: 100, emotionalMatch: 100 });
    else if (frame.mode === "route") story.finishRoute({ correct: 3, detours: 0 });
    else if (frame.mode === "letter") story.finishLetter({ completion: 100, understood: true, stamp });
    else if (frame.canContinue) story.next();
    else story.choose(frame.choices[0]!.index);
  }
  throw new Error(`Final choice was not reached: ${choice}`);
}

for (const ending of endings) {
  test(`${ending.id} can finish and enter the browser collection`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.getByRole("link", { name: "設定" }).click();
    await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
    await page.getByRole("switch", { name: /減少動態效果/ }).check();
    const snapshot = beforeFinalChoice(ending.stamp, ending.choice);
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
    await page.goto("/");
    await page.getByRole("button", { name: "繼續故事" }).click();
    await expect(page.getByRole("button", { name: new RegExp(ending.choice) })).toBeVisible();
    await page.getByRole("button", { name: new RegExp(ending.choice) }).click();
    for (let step = 0; step < 20; step++) {
      if (await page.locator(".ending-panel").isVisible()) break;
      const reveal = page.getByRole("button", { name: "顯示全文" });
      if (await reveal.isVisible()) await reveal.click();
      else await page.getByRole("button", { name: "繼續", exact: true }).click();
    }
    await expect(page.locator(".ending-panel")).toBeVisible();
    await expect(page.getByRole("heading", { name: ending.title })).toBeVisible();
    await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
    await page.screenshot({ path: `output/${ending.id}-ending-${info.project.name}.png`, fullPage: true, animations: "disabled" });
    await page.goto("/#/collection");
    await expect(page.getByRole("heading", { name: ending.title })).toBeVisible();
    expect(errors).toEqual([]);
  });
}
