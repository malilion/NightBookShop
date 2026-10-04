import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { StoryBridge } from "../../src/story/storyBridge";
import { newLetter, newTea, snapshotSchema, type GameSnapshot } from "../../src/types/game";
import { prepareLeaves, pour, steepAndServe } from "./tea-helpers";
import { prepareOpening } from "./opening-helpers";

async function advanceUntil(page: Page, target: string, max = 280) {
  for (let step = 0; step < max; step++) {
    if (target.startsWith(".character-portrait") && await page.locator(target).count()) {
      await expect.poll(() => page.locator(target).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      return;
    }
    if (await page.locator(target).isVisible()) return;
    const reveal = page.getByRole("button", { name: "顯示全文" });
    const next = page.getByRole("button", { name: "繼續", exact: true });
    if (await reveal.isVisible()) await reveal.click({ timeout: 2_000 }).catch(() => undefined);
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

function scoreRuoyinSave(): GameSnapshot {
  const story = new StoryBridge(readFileSync("public/story/compiled/ruoyin-chapter-15.json", "utf8"));
  story.next();
  for (let step = 0; step < 320 && story.frame.mode !== "ending"; step++) {
    if (story.frame.mode === "tea") story.finishTea({ teaId: "lavender", quality: 95, emotionalMatch: 100 });
    else if (story.frame.mode === "melody") story.finishMelody(true);
    else if (story.frame.mode === "letter") story.finishLetter({ completion: 100, understood: true });
    else if (story.frame.canContinue) story.next();
    else story.choose((story.frame.choices.find((entry) => entry.text.includes("替普通人的故事寫旋律")) ?? story.frame.choices[0])!.index);
  }
  if (story.frame.endingId !== "ruoyin-score") throw new Error("Ruoyin fixture did not reach the score ending");
  return snapshotSchema.parse({ version: 1, storyVersion: "ruoyin-chapter-15", inkState: story.serialize(), frame: story.frame, tea: newTea(), letter: newLetter() });
}

test("sixth night keeps Haiming's original words and reveals Lincheng's childhood", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.evaluate(async (ruoyinSave) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(["collection", "saves"], "readwrite");
        for (const id of ["moonlight", "boyan-rest", "ruoyin-one", "yenuan-share", "yuhang-today"])
          tx.objectStore("collection").put({ id, unlockedAt: new Date().toISOString() });
        tx.objectStore("saves").put({ id: "chapter-ruoyin", kind: "chapter", updatedAt: new Date().toISOString(), snapshot: ruoyinSave });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, scoreRuoyinSave());
  await page.getByRole("link", { name: "設定" }).click();
  await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
  await page.getByRole("switch", { name: /減少動態效果/ }).check();
  await page.reload();
  await expect(page.getByRole("heading", { name: "閱讀的步調" })).toBeVisible();
  await page.goto("/#/chapters");
  await page.getByRole("button", { name: "翻開第六夜" }).click();
  await prepareOpening(page);
  await expect(page.locator(".scene-caption small")).toHaveText("第六夜 · 顧海明");
  await advanceUntil(page, '.character-portrait[data-expression="searching"]');
  await expect(page.locator('.character-portrait[data-expression="searching"]')).toHaveAttribute("src", "/images/characters/haiming-searching.webp");
  await page.screenshot({ path: `output/sixth-night-searching-${info.project.name}.png`, animations: "disabled" });
  await advanceUntil(page, ".tea-board");
  const touch = info.project.name === "mobile";
  await prepareLeaves(page, touch, 7);
  await page.getByRole("button", { name: "加入一小塊海鹽焦糖" }).click();
  await expect(page.getByRole("button", { name: /已加入海鹽焦糖/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.getByRole("button", { name: /已加入海鹽焦糖/ })).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({ path: `output/sixth-night-caramel-tea-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await pour(page, "kettle", 68, touch);
  await steepAndServe(page, touch, "他");
  await page.getByRole("button", { name: /繼續故事/ }).click();
  await advanceUntil(page, '.character-portrait[data-expression="warm"]');
  await expect(page.locator('.character-portrait[data-expression="warm"]')).toHaveAttribute("src", "/images/characters/haiming-warm.webp");
  await page.screenshot({ path: `output/sixth-night-warm-${info.project.name}.png`, animations: "disabled" });
  await advanceUntil(page, ".lamp-panel");
  await page.getByRole("button", { name: "守住柔和的燈光" }).click();
  await page.getByRole("button", { name: "守住柔和的燈光" }).click();
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator(".lamp-panel")).toContainText("守燈 2/3");
  await page.getByRole("button", { name: "守住柔和的燈光" }).click();
  await page.screenshot({ path: `output/sixth-night-lamp-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "聽他接著說" }).click();
  await (await untilChoice(page, "小提琴手在寫這四個音")).click();
  await advanceUntil(page, '.dialogue-text[data-full-text*="我可以講風向給她聽"]');
  await advanceUntil(page, '.scene-art img[src*="memory-lighthouse.webp"]');
  await expect(page.locator(".scene-art")).toHaveCount(1);
  if (touch) await expect(page.locator('.scene-art source[srcset*="memory-lighthouse-mobile.webp"]')).toHaveCount(1);
  await page.screenshot({ path: `output/sixth-night-lighthouse-${info.project.name}.png`, animations: "disabled" });
  await advanceUntil(page, ".memory-evidence-storm-tower");
  await page.screenshot({ path: `output/sixth-night-lighthouse-objects-${info.project.name}.png`, animations: "disabled" });
  await inspectMemoryObjects(page, "storm-tower", ["救援紀錄", "出生時刻", "潮汐圖"]);
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator(".memory-evidence-storm-tower .memory-object-seen")).toHaveCount(3);
  await page.getByRole("button", { name: "從救援圖旁收起第一角紙船" }).click();
  await untilChoice(page, "問海明，早班船那一格該怎麼寫給顧川");
  await page.screenshot({ path: `output/sixth-night-ferry-question-${info.project.name}.png`, animations: "disabled" });
  await page.reload();
  await (await untilChoice(page, "問海明，早班船那一格該怎麼寫給顧川")).click();
  await advanceUntil(page, '.dialogue-text[data-full-text*="不能用後來的風暴"]');
  await expect(page.locator('.dialogue-text[data-full-text*="不能用後來的風暴"]')).toBeVisible();
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator('.dialogue-text[data-full-text*="不能用後來的風暴"]')).toBeVisible();
  await (await untilChoice(page, "看夏天顧川來訪")).click();
  await advanceUntil(page, '.scene-art img[src*="memory-summer-visit.webp"]');
  await expect(page.locator(".scene-art")).toHaveCount(1);
  await expect.poll(() => page.locator('.scene-art img[src*="memory-summer-visit.webp"]').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  if (touch) await expect(page.locator('.scene-art source[srcset*="memory-summer-visit-mobile.webp"]')).toHaveCount(1);
  await page.screenshot({ path: `output/sixth-night-summer-visit-${info.project.name}.png`, animations: "disabled" });
  await inspectMemoryObjects(page, "summer-visit", ["顧川的風箏", "修燈工具", "午餐紙袋"]);
  await page.getByRole("button", { name: "從風箏尾巴收起第二角紙船" }).click();
  await advanceUntil(page, '.scene-art img[src*="memory-last-watch.webp"]');
  await expect(page.locator(".scene-art")).toHaveCount(1);
  await expect.poll(() => page.locator('.scene-art img[src*="memory-last-watch.webp"]').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  if (touch) await expect(page.locator('.scene-art source[srcset*="memory-last-watch-mobile.webp"]')).toHaveCount(1);
  await page.screenshot({ path: `output/sixth-night-last-watch-${info.project.name}.png`, animations: "disabled" });
  await inspectMemoryObjects(page, "last-watch", ["婚禮邀請", "颱風警報", "婚禮照片"]);
  await page.getByRole("button", { name: "從邀請背面收起第三角紙船" }).click();
  await advanceUntil(page, '.scene-art img[src*="memory-white-room-v2.webp"]');
  await expect(page.locator(".scene-art")).toHaveCount(1);
  await expect.poll(() => page.locator('.scene-art img[src*="memory-white-room-v2.webp"]').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  if (touch) await expect(page.locator('.scene-art source[srcset*="memory-white-room-v2-mobile.webp"]')).toHaveCount(1);
  await page.screenshot({ path: `output/sixth-night-white-room-${info.project.name}.png`, animations: "disabled" });
  await inspectMemoryObjects(page, "white-room", ["住址卡", "沒有海的窗", "壞煤油燈"]);
  await page.getByRole("button", { name: "從煤油燈內取出最後一角紙船" }).click();
  const originalWords = await untilChoice(page, "先問海明今天想保留哪句");
  await expect(page.getByRole("button", { name: "先替他排好年份，再請他核對" })).toBeVisible();
  await page.screenshot({ path: `output/sixth-night-original-words-${info.project.name}.png`, animations: "disabled" });
  await originalWords.click();
  await advanceUntil(page, ".letter-panel");
  await expect(page.locator(".letter-slot")).toHaveCount(4);
  for (const [index, line] of [
    "小川，我總說燈不能滅，",
    "卻沒有看見你也一直在岸上等我。",
    "我救過一些回家的人，卻不知道怎麼回到你身邊。",
    "如果有一天我不記得你，請不要因此懷疑，我曾經想你。",
  ].entries()) {
    await page.getByRole("button", { name: line, exact: true }).click();
    await page.getByRole("button", { name: `信紙第 ${index + 1} 格，空白` }).click();
  }
  await page.getByRole("button", { name: "查看海明的原句" }).click();
  await expect(page.getByRole("checkbox", { name: "修成流暢的英雄敘述" })).not.toBeChecked();
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator(".letter-slot.filled")).toHaveCount(4);
  await page.screenshot({ path: `output/sixth-night-letter-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "把紙船交還給他" }).click();
  await (await untilChoice(page, "不知道怎麼回到你身邊")).click();
  await (await untilChoice(page, "讓他自己念")).click();
  await (await untilChoice(page, "邀請顧川到書店")).click();
  await advanceUntil(page, '.dialogue-text[data-full-text*="顧川等他從頭再念"]');
  await advanceUntil(page, '.dialogue-text[data-full-text*="有人還在寫最後一個音"]');
  await advanceUntil(page, '.character-portrait[data-portrait="child"]');
  await page.screenshot({ path: `output/sixth-night-child-${info.project.name}.png`, animations: "disabled" });
  await advanceUntil(page, '.character-portrait[data-portrait="owner"]');
  await page.screenshot({ path: `output/sixth-night-owner-${info.project.name}.png`, animations: "disabled" });
  await advanceUntil(page, ".ending-panel");
  await expect(page.getByRole("heading", { name: "燈仍然在這裡" })).toBeVisible();
  await page.getByRole("button", { name: /守夜手記/ }).click();
  await expect(page.getByRole("heading", { name: "三十年前的燈塔照片" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "燈塔裡的四個音" })).toBeVisible();
  await page.screenshot({ path: `output/sixth-night-ending-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "關閉手記" }).click();
  await page.goto("/#/collection");
  await expect(page.getByRole("heading", { name: "燈仍然在這裡" })).toBeVisible();
  await expect(page.getByText("海明的海鹽焦糖焙茶")).toBeVisible();
  expect(errors).toEqual([]);
});
