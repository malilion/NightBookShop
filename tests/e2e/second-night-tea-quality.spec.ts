import { readFileSync } from "node:fs";
import { collectPageErrors } from "./page-errors";
import { expect, test } from "@playwright/test";
import { StoryBridge } from "../../src/story/storyBridge";
import { scoreTea } from "../../src/services/teaScoring";
import { newLetter, newTea, snapshotSchema, type GameSnapshot } from "../../src/types/game";

const storyJson = readFileSync("public/story/compiled/boyan-chapter-22.json", "utf8");
const legacyStoryJson = readFileSync("public/story/compiled/boyan-chapter-9.json", "utf8");

function beforeTeaFollowup(): GameSnapshot {
  const tea = { ...newTea(), teaId: "chamomile" as const, leaves: 1, water: 40, temperature: 75, seconds: 10, step: "serve" as const, cupWater: 30 };
  const result = scoreTea(tea, "boyan");
  if (result.quality < 50 || result.quality >= 70) throw new Error(`Expected ordinary tea, got ${result.quality}`);
  const story = new StoryBridge(storyJson);
  story.next();
  for (let step = 0; step < 160; step++) {
    const frame = story.frame;
    if (frame.choices.some((choice) => choice.text.includes("今晚最怕哪件事停下來")))
      return snapshotSchema.parse({
        version: 1,
        storyVersion: "boyan-chapter-22",
        inkState: story.serialize(),
        frame,
        tea,
        letter: newLetter(),
      });
    if (frame.mode === "tea") story.finishTea(result);
    else if (frame.canContinue) story.next();
    else story.choose(frame.choices[0]!.index);
  }
  throw new Error("Ordinary-tea follow-up was not reached");
}

function beforeTeaChoice(teaId: "black" | "mint"): GameSnapshot {
  const story = new StoryBridge(storyJson);
  const tea = { ...newTea(), teaId, step: "serve" as const };
  story.next();
  for (let step = 0; step < 160; step++) {
    const frame = story.frame;
    if (frame.choices.some((choice) => choice.text.includes(teaId === "black" ? "明早那三頁" : "報告和回診")))
      return snapshotSchema.parse({ version: 1, storyVersion: "boyan-chapter-22", inkState: story.serialize(), frame, tea, letter: newLetter() });
    if (frame.mode === "tea") story.finishTea({ teaId, quality: 80, emotionalMatch: 70 });
    else if (frame.canContinue) story.next();
    else story.choose(frame.choices[0]!.index);
  }
  throw new Error(`${teaId} follow-up was not reached`);
}

function legacyBlackTea(): GameSnapshot {
  const story = new StoryBridge(legacyStoryJson);
  const tea = { ...newTea(), teaId: "black" as const, step: "serve" as const };
  story.next();
  for (let step = 0; step < 160; step++) {
    const frame = story.frame;
    if (frame.text.includes("他把紅茶喝得很快"))
      return snapshotSchema.parse({ version: 1, storyVersion: "boyan-chapter-9", inkState: story.serialize(), frame, tea, letter: newLetter() });
    if (frame.mode === "tea") story.finishTea({ teaId: "black", quality: 80, emotionalMatch: 70 });
    else if (frame.canContinue) story.next();
    else story.choose(frame.choices[0]!.index);
  }
  throw new Error("Legacy black-tea response was not reached");
}

test("chapter-nine Boyan save resumes with its archived tea response", async ({ page }) => {
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
        const tx = db.transaction("saves", "readwrite");
        tx.objectStore("saves").put({ id: "auto-1", kind: "auto", updatedAt: new Date().toISOString(), snapshot });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, legacyBlackTea());
  await page.goto("/");
  await page.getByRole("button", { name: "繼續故事" }).click();
  await expect(page.locator(".dialogue-text")).toContainText("他把紅茶喝得很快");
  await page.reload();
  await expect(page.locator(".dialogue-text")).toContainText("他把紅茶喝得很快");
  expect(errors).toEqual([]);
});

for (const branch of [
  { teaId: "black", choice: "問他明早那三頁，哪一頁真的只能由他完成", response: "不能讓對方提早回覆" },
  { teaId: "mint", choice: "陪他把報告和回診分到不同欄", response: "把報告放在「明早」" },
] as const) {
  test(`${branch.teaId} tea opens its own pause and restores Boyan's answer`, async ({ page }, info) => {
    const errors: string[] = [];
    collectPageErrors(page, errors);
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
    }, beforeTeaChoice(branch.teaId));
    await page.goto("/");
    await page.getByRole("button", { name: "繼續故事" }).click();
    await expect(page.locator(".dialogue-choices button")).toHaveCount(2);
    await page.screenshot({ path: `output/second-night-${branch.teaId}-pause-${info.project.name}.png`, animations: "disabled" });
    await page.getByRole("button", { name: branch.choice }).click();
    await expect(page.locator(".dialogue-text")).toContainText(branch.response);
    await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
    await page.reload();
    await expect(page.locator(".dialogue-text")).toContainText(branch.response);
    expect(errors).toEqual([]);
  });
}

for (const branch of [
  { choice: "問他今晚最怕哪件事停下來", response: "我怕明早有人找不到我" },
  { choice: "先讓杯子和手機都留在桌上", response: "想先弄清楚身體現在是否還撐得住" },
] as const) {
  test(`ordinary tea lets Boyan choose ${branch.choice} and restores the response`, async ({ page }, info) => {
    const errors: string[] = [];
    collectPageErrors(page, errors);
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
    }, beforeTeaFollowup());
    await page.goto("/");
    await page.getByRole("button", { name: "繼續故事" }).click();
    await expect(page.locator(".dialogue-text")).toContainText("茶沒有完全合他現在的節奏");
    await expect(page.locator(".dialogue-choices button")).toHaveCount(2);
    await page.screenshot({ path: `output/second-night-tea-followup-${info.project.name}-${branch.choice.startsWith("問") ? "ask" : "wait"}.png`, animations: "disabled" });
    await page.getByRole("button", { name: branch.choice }).click();
    await expect(page.locator(".dialogue-text")).toContainText(branch.response);
    await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
    await page.reload();
    await expect(page.locator(".dialogue-text")).toContainText(branch.response);
    await page.getByRole("button", { name: "繼續", exact: true }).click();
    await expect(page.locator(".dialogue-text")).toContainText("妳確認他此刻能平穩說話");
    expect(errors).toEqual([]);
  });
}
