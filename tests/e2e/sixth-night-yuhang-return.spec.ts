import { readFileSync } from "node:fs";
import { collectPageErrors } from "./page-errors";
import { expect, test, type Page } from "@playwright/test";
import { StoryBridge } from "../../src/story/storyBridge";
import { newLetter, newTea, snapshotSchema, type GameSnapshot } from "../../src/types/game";
import { prepareOpening } from "./opening-helpers";

const fifthNight = readFileSync("public/story/compiled/yuhang-chapter-19.json", "utf8");

function futureEndingSave(): GameSnapshot {
  const story = new StoryBridge(fifthNight);
  story.next();
  for (let step = 0; step < 320 && story.frame.mode !== "ending"; step++) {
    const frame = story.frame;
    if (frame.mode === "tea") story.finishTea({ teaId: "mint", garnish: "lemon", blackTea: 20, quality: 100, emotionalMatch: 100 });
    else if (frame.mode === "route") story.finishRoute({ correct: 3, detours: 0 });
    else if (frame.mode === "letter") story.finishLetter({ completion: 100, understood: true, stamp: "future" });
    else if (frame.canContinue) story.next();
    else story.choose((frame.choices.find((choice) => choice.text.includes("寄往七年後，寫下")) ?? frame.choices[0])!.index);
  }
  if (story.frame.endingId !== "yuhang-future") throw new Error("Future-stamp fixture did not finish fifth night");
  return snapshotSchema.parse({
    version: 1,
    storyVersion: "yuhang-chapter-19",
    inkState: story.serialize(),
    frame: story.frame,
    tea: newTea(),
    letter: newLetter(),
  });
}

async function reachChoice(page: Page) {
  for (let step = 0; step < 12; step++) {
    if (await page.locator(".dialogue-choices button").count()) return;
    await page.getByRole("button", { name: "繼續", exact: true }).click();
  }
  throw new Error("Yuhang reunion choice did not appear");
}

for (const branch of [
  { choice: "問他第一箱書", response: "箱子還在床下", image: "plan" },
  { choice: "保留日期，也保留改變方法", response: "不是另一張不能改的派送表", image: "flex" },
] as const) {
  test(`future-stamp Yuhang returns before Haiming and chooses ${branch.image}`, async ({ page }, info) => {
    const errors: string[] = [];
    collectPageErrors(page, errors);
    await page.goto("/");
    await page.evaluate(async (snapshot) => {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("night-bookshop");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction(["collection", "saves"], "readwrite");
          for (const id of ["moonlight", "boyan-rest", "ruoyin-one", "yenuan-share", "yuhang-future"])
            tx.objectStore("collection").put({ id, unlockedAt: new Date().toISOString() });
          tx.objectStore("saves").put({ id: "chapter-yuhang", kind: "chapter", updatedAt: new Date().toISOString(), snapshot });
          tx.oncomplete = () => { db.close(); resolve(); };
          tx.onerror = () => reject(tx.error);
        };
      });
    }, futureEndingSave());
    await page.getByRole("link", { name: "設定" }).click();
    await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
    await page.getByRole("switch", { name: /減少動態效果/ }).check();
    await page.reload();
    await expect(page.getByRole("heading", { name: "閱讀的步調" })).toBeVisible();
    await page.goto("/#/chapters");
    await expect(page.getByRole("heading", { name: "今夜的訪客與最後一封信" })).toBeVisible();
    const start = page.getByRole("button", { name: "翻開第六夜" });
    await expect(start).toBeVisible();
    await start.click();
    await prepareOpening(page);
    await expect(page.locator(".dialogue-text")).toContainText("一點五十六分，雨航");
    await expect(page.locator('.character-portrait[src*="yuhang.webp"]')).toBeVisible();
    await reachChoice(page);
    await expect(page.locator(".dialogue-choices button")).toHaveCount(2);
    await page.screenshot({ path: `output/sixth-night-yuhang-return-${branch.image}-${info.project.name}.png`, animations: "disabled" });
    await page.getByRole("button", { name: new RegExp(branch.choice) }).click();
    await expect(page.locator(".dialogue-text")).toContainText(branch.response);
    await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
    await page.reload();
    await expect(page.locator(".dialogue-text")).toContainText(branch.response);
    for (let step = 0; step < 12; step++) {
      if (await page.locator(".dialogue-text").getByText("兩點二十三分，一位老人", { exact: false }).count()) break;
      await page.getByRole("button", { name: "繼續", exact: true }).click();
    }
    await expect(page.locator(".dialogue-text")).toContainText("兩點二十三分，一位老人");
    await expect(page.locator('.character-portrait[src*="haiming.webp"]')).toBeVisible();
    expect(errors).toEqual([]);
  });
}
