import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { StoryBridge } from "../../src/story/storyBridge";
import { scoreLamp } from "../../src/services/lampScoring";
import { newLetter, newTea, snapshotSchema, type GameSnapshot } from "../../src/types/game";
import { prepareLeaves, pour, steepAndServe } from "./tea-helpers";
import { prepareOpening } from "./opening-helpers";

function completedJinglanSave(): GameSnapshot {
  const story = new StoryBridge(readFileSync("public/story/compiled/main.json", "utf8"));
  story.next();
  for (let step = 0; step < 360 && story.frame.mode !== "ending"; step++) {
    if (story.frame.mode === "tea") story.finishTea({ teaId: "osmanthus", quality: 100, emotionalMatch: 100 });
    else if (story.frame.mode === "letter") story.finishLetter({ completion: 100, understood: true });
    else if (story.frame.canContinue) story.next();
    else {
      const choice = story.frame.choices.find((entry) => entry.text.includes("陪她寫一封信")) ?? story.frame.choices[0];
      if (!choice) throw new Error("Jinglan fixture stopped before its ending");
      story.choose(choice.index);
    }
  }
  if (story.frame.endingId !== "moonlight") throw new Error("Jinglan fixture did not reach her self-letter ending");
  return snapshotSchema.parse({
    version: 1,
    storyVersion: "jinglan-chapter-7",
    inkState: story.serialize(),
    frame: story.frame,
    tea: newTea(),
    letter: newLetter(),
  });
}

function completedHaimingSave(): GameSnapshot {
  const story = new StoryBridge(readFileSync("public/story/compiled/haiming-chapter-14.json", "utf8"));
  story.next();
  for (let step = 0; step < 320 && story.frame.mode !== "ending"; step++) {
    if (story.frame.mode === "tea") story.finishTea({ teaId: "hojicha", quality: 100, emotionalMatch: 100 });
    else if (story.frame.mode === "lamp") story.finishLamp(scoreLamp({ turns: ["steady", "steady", "steady"] }));
    else if (story.frame.mode === "letter") story.finishLetter({ completion: 100, understood: true });
    else if (story.frame.canContinue) story.next();
    else story.choose(story.frame.choices[0]!.index);
  }
  if (story.frame.endingId !== "haiming-light") throw new Error("Haiming fixture did not reach the shared-letter ending");
  return snapshotSchema.parse({
    version: 1,
    storyVersion: "haiming-chapter-14",
    inkState: story.serialize(),
    frame: story.frame,
    tea: newTea(),
    letter: newLetter(),
  });
}

async function advanceUntil(page: Page, target: string, max = 280) {
  for (let step = 0; step < max; step++) {
    if (await page.locator(target).isVisible()) return;
    const reveal = page.getByRole("button", { name: "顯示全文" });
    const next = page.getByRole("button", { name: "繼續", exact: true });
    if (await reveal.isVisible()) await reveal.click();
    else if (await next.isVisible()) await next.click();
    else if (await page.locator(".dialogue-choices button").first().isVisible())
      await page.locator(".dialogue-choices button").first().click();
    else throw new Error(`Cannot advance to ${target}`);
  }
  throw new Error(`Story did not reach ${target}`);
}
async function untilChoice(page: Page, name: string) {
  const target = page.getByRole("button", { name, exact: false });
  for (let step = 0; step < 40; step++) {
    if (await target.isVisible()) return target;
    const next = page.getByRole("button", { name: "繼續", exact: true });
    if (await next.isVisible()) await next.click();
    else throw new Error(`Choice not found: ${name}`);
  }
  throw new Error(`Choice not found: ${name}`);
}
async function inspectMemoryObjects(page: Page, section: string, labels: string[]) {
  const overlay = `.memory-evidence-${section}`;
  await advanceUntil(page, overlay);
  for (const label of labels) {
    await page.getByRole("button", { name: `探索物件：${label}` }).click();
    await advanceUntil(page, overlay);
    await expect(page.getByRole("button", { name: `探索物件：${label}` })).toHaveCount(0);
  }
  await expect(page.locator(`${overlay} .memory-object-seen`)).toHaveCount(3);
}

test("finale lets Lincheng brew for herself, restore six clues, and leave at dawn", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.evaluate(async ({ chapterSave, jinglanSave }) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(["collection", "saves"], "readwrite");
        for (const id of ["moonlight", "boyan-rest", "ruoyin-one", "yenuan-share", "yuhang-today", "haiming-light"])
          tx.objectStore("collection").put({ id, unlockedAt: new Date().toISOString() });
        tx.objectStore("saves").put({ id: "chapter-haiming", kind: "chapter", updatedAt: new Date().toISOString(), snapshot: chapterSave });
        tx.objectStore("saves").put({ id: "chapter-jinglan", kind: "chapter", updatedAt: new Date().toISOString(), snapshot: jinglanSave });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, { chapterSave: completedHaimingSave(), jinglanSave: completedJinglanSave() });
  await page.getByRole("link", { name: "設定" }).click();
  await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
  await page.getByRole("switch", { name: /減少動態效果/ }).check();
  await page.reload();
  await expect(page.getByRole("heading", { name: "閱讀的步調" })).toBeVisible();
  await page.goto("/#/chapters");
  await page.getByRole("button", { name: "翻開終章" }).click();
  await prepareOpening(page);
  await expect(page.locator(".scene-caption small")).toHaveText("終章 · 林澄");
  await advanceUntil(page, '.character-portrait[data-portrait="owner"]');
  await expect.poll(() => page.locator('.character-portrait[data-portrait="owner"]').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.screenshot({ path: `output/finale-owner-${info.project.name}.png`, animations: "disabled" });
  await (await untilChoice(page, "先坐到訪客席")).click();
  await advanceUntil(page, ".tea-board");
  const touch = info.project.name === "mobile";
  await prepareLeaves(page, touch, 0);
  await pour(page, "kettle", 68, touch);
  await steepAndServe(page, touch, "自己");
  await page.getByRole("button", { name: /繼續故事/ }).click();
  await advanceUntil(page, ".archive-panel");
  await expect(page.getByRole("img", { name: /六張紙背的摺痕拼成城市地圖/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "走進地圖中心" })).toBeDisabled();
  await page.getByRole("button", { name: /靜蘭 · 舊信/ }).click();
  await page.getByRole("button", { name: /柏言 · 草稿/ }).click();
  await page.getByRole("button", { name: /若音 · 樂譜/ }).click();
  await page.getByRole("button", { name: /靜蘭 · 舊信/ }).click();
  await page.getByRole("button", { name: /柏言 · 草稿/ }).click();
  await expect(page.locator(".archive-connections")).toContainText("柏言母親保存了靜蘭的舊校刊");
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator(".archive-panel")).toContainText("已查看 3/6 張，接上 1/5 段");
  await page.getByRole("button", { name: /葉暖 · 食譜/ }).click();
  await page.getByRole("button", { name: /雨航 · 郵戳/ }).click();
  await page.getByRole("button", { name: /海明 · 照片/ }).click();
  await page.getByRole("button", { name: /靜蘭 · 舊信/ }).click();
  await page.getByRole("button", { name: /海明 · 照片/ }).click();
  await expect(page.locator(".archive-feedback")).toContainText("還接不起來");
  await expect(page.getByRole("button", { name: "走進地圖中心" })).toBeDisabled();
  for (const [first, second] of [
    ["柏言 · 草稿", "若音 · 樂譜"],
    ["若音 · 樂譜", "海明 · 照片"],
    ["海明 · 照片", "雨航 · 郵戳"],
    ["雨航 · 郵戳", "葉暖 · 食譜"],
  ]) {
    await page.getByRole("button", { name: new RegExp(first) }).click();
    await page.getByRole("button", { name: new RegExp(second) }).click();
  }
  await expect(page.locator(".archive-connections li")).toHaveCount(5);
  await expect(page.getByRole("img", { name: /六張紙背的摺痕拼成城市地圖/ })).toBeVisible();
  await page.screenshot({ path: `output/finale-map-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "走進地圖中心" }).click();
  await advanceUntil(page, '.scene-art img[src*="memory-hidden-room.webp"]');
  await expect(page.locator(".scene-art")).toHaveCount(1);
  if (touch) await expect(page.locator('.scene-art source[srcset*="memory-hidden-room-mobile.webp"]')).toHaveCount(1);
  await page.screenshot({ path: `output/finale-hidden-room-${info.project.name}.png`, animations: "disabled" });
  await advanceUntil(page, ".memory-evidence-hidden-room");
  await page.screenshot({ path: `output/finale-hidden-room-objects-${info.project.name}.png`, animations: "disabled" });
  await page.getByRole("button", { name: "探索物件：六格信櫃" }).click();
  await advanceUntil(page, '.dialogue-text[data-full-text*="第一格書籤旁"]');
  await expect(page.locator(".dialogue-text")).toHaveAttribute("data-full-text", /靜蘭寫給年輕自己的信的抄頁/);
  await advanceUntil(page, '.dialogue-text[data-full-text*="兩種筆跡都留在桌上"]');
  await page.screenshot({ path: `output/finale-haiming-letter-${info.project.name}.png`, animations: "disabled" });
  await inspectMemoryObjects(page, "hidden-room", ["門框身高線", "停住的時鐘"]);
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator(".memory-evidence-hidden-room .memory-object-seen")).toHaveCount(3);
  await page.getByRole("button", { name: "帶著看到的線索回到櫃台" }).click();
  await untilChoice(page, "問童年的保管請求，為何變成成年後推不開的門");
  await page.screenshot({ path: `output/finale-owner-consent-${info.project.name}.png`, animations: "disabled" });
  await page.reload();
  await (await untilChoice(page, "問童年的保管請求，為何變成成年後推不開的門")).click();
  await advanceUntil(page, '.scene-art img[src*="memory-child-home.webp"]');
  await expect(page.locator('.character-portrait[data-portrait="child"]')).toBeVisible();
  await expect.poll(() => page.locator('.character-portrait[data-portrait="child"]').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(page.locator(".scene-art")).toHaveCount(1);
  await expect(page.locator(".scene-art")).toHaveCSS("opacity", "1");
  await expect.poll(() => page.locator('.scene-art img[src*="memory-child-home.webp"]').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  if (touch) await expect(page.locator('.scene-art source[srcset*="memory-child-home-mobile.webp"]')).toHaveCount(1);
  await page.screenshot({ path: `output/finale-child-home-${info.project.name}.png`, animations: "disabled" });
  await inspectMemoryObjects(page, "child-home", ["父親的信", "母親便條", "兒時外套"]);
  await page.getByRole("button", { name: "從兒時外套裡收起第一片信紙" }).click();
  await advanceUntil(page, '.scene-art img[src*="memory-child-bookshop.webp"]');
  await expect(page.locator(".scene-art")).toHaveCount(1);
  if (touch) await expect(page.locator('.scene-art source[srcset*="memory-child-bookshop-mobile.webp"]')).toHaveCount(1);
  await page.screenshot({ path: `output/finale-child-bookshop-${info.project.name}.png`, animations: "disabled" });
  await inspectMemoryObjects(page, "hidden-envelope", ["兩個願望", "童年身高線", "黑貓腳印"]);
  await page.getByRole("button", { name: "從高高的櫃台下收起另外兩片信紙" }).click();
  await advanceUntil(page, ".letter-panel");
  await expect(page.locator(".letter-slot")).toHaveCount(4);
  for (const [index, line] of [
    "我把那封信藏起來，",
    "因為我怕他們分開，也怕自己成為原因。",
    "我想讓他留下，也想讓媽媽走到安全的地方。",
    "長大後，請不要只記得我藏了信；那晚我也想有人抱抱我。",
  ].entries()) {
    await page.getByRole("button", { name: line, exact: true }).click();
    await page.getByRole("button", { name: `信紙第 ${index + 1} 格，空白` }).click();
  }
  await page.getByRole("button", { name: "查看童年的筆跡" }).click();
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator(".letter-slot.filled")).toHaveCount(4);
  await page.screenshot({ path: `output/finale-letter-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "把信放在自己面前" }).click();
  await advanceUntil(page, '.dialogue-text[data-full-text*="這一次不需要替店主的決定辯護"]');
  await page.screenshot({ path: `output/finale-choice-boundary-${info.project.name}.png`, animations: "disabled" });
  const dawnChoice = await untilChoice(page, "取回記憶");
  await expect(page.getByRole("button", { name: /把信合起來，回到櫃台/ })).toHaveCount(0);
  await dawnChoice.click();
  await advanceUntil(page, ".ending-panel");
  await expect(page.getByRole("heading", { name: "天亮以後" })).toBeVisible();
  await page.getByRole("button", { name: /守夜手記/ }).click();
  await expect(page.getByRole("heading", { name: "童年的林澄留下的字" })).toBeVisible();
  await page.screenshot({ path: `output/finale-ending-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "關閉手記" }).click();
  await page.goto("/#/collection");
  await expect(page.getByRole("heading", { name: "天亮以後" })).toBeVisible();
  await expect(page.getByText("林澄寫給自己的信")).toBeVisible();
  expect(errors).toEqual([]);
});

test("refusing the visitor seat reaches the endless midnight ending", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("collection", "readwrite");
        for (const id of ["moonlight", "boyan-rest", "ruoyin-one", "yenuan-share", "yuhang-today", "haiming-light"])
          tx.objectStore("collection").put({ id, unlockedAt: new Date().toISOString() });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  });
  await page.getByRole("link", { name: "設定" }).click();
  await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
  await page.reload();
  await page.goto("/#/chapters");
  await page.getByRole("button", { name: "翻開終章" }).click();
  await prepareOpening(page);
  await (await untilChoice(page, "拒絕坐下，繼續替別人")).click();
  await (await untilChoice(page, "試試它能不能打開")).click();
  await expect(page.locator(".dialogue-text")).toHaveAttribute("data-full-text", /門就開了一道縫/);
  await page.reload();
  await (await untilChoice(page, "仍然拒絕坐下")).click();
  await advanceUntil(page, ".ending-panel");
  await expect(page.getByRole("heading", { name: "不會天亮的書店" })).toBeVisible();
  await page.screenshot({ path: `output/finale-midnight-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await page.goto("/#/collection");
  await expect(page.getByRole("heading", { name: "不會天亮的書店" })).toBeVisible();
  expect(errors).toEqual([]);
});
