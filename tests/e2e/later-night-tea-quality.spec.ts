import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { teas } from "../../src/data/catalog";
import { scoreTea } from "../../src/services/teaScoring";
import { StoryBridge } from "../../src/story/storyBridge";
import { newLetter, newTea, snapshotSchema, type GameSnapshot, type TeaDraft, type TeaId } from "../../src/types/game";

const chapters = [
  { id: "ruoyin", version: 6, tea: "lavender", garnish: "none", blackTea: 0, ask: "問她今晚最怕錯過哪個時刻", wait: "先陪她聽完杯緣的餘音", askResponse: "沒有演出要趕", waitResponse: "我可以先聽", mismatch: "tea-score", lowText: "茶有些澀" },
  { id: "yenuan", version: 6, tea: "hojicha", garnish: "apple", blackTea: 0, ask: "問她烤箱一安靜下來會想起什麼", wait: "先讓她把杯子握暖", askResponse: "我會想起媽媽說", waitResponse: "我們不用趕在茶涼之前", mismatch: "tea-cleanup", lowText: "茶太濃" },
  { id: "yuhang", version: 7, tea: "mint", garnish: "lemon", blackTea: 20, ask: "問他若寄給自己會寫哪個住址", wait: "讓他先看清信的收件欄", askResponse: "我記得每個人的門牌", waitResponse: "地址等我想好再填", mismatch: "delivery-reflex", lowText: "雨航只喝一口" },
  { id: "haiming", version: 8, tea: "hojicha", garnish: "caramel", blackTea: 0, ask: "請他指出想保留的原句", wait: "先等他選好頁碼", askResponse: "今天風很大，我也害怕", waitResponse: "這一頁可以先看", mismatch: "tea-date", lowText: "茶涼得快" },
] as const;

function ordinaryTea(chapter: (typeof chapters)[number]): TeaDraft {
  const teaId = chapter.tea as TeaId;
  const base = { ...newTea(), teaId, garnish: chapter.garnish, blackTea: chapter.blackTea, step: "serve" as const, cupWater: 30 };
  for (const leaves of [0, 1, 2])
    for (const water of [20, 40, 70])
      for (const temperature of [60, 70, 80, 90, teas[teaId].temperature])
        for (const seconds of [0, 10, 20, 30]) {
          const tea = { ...base, leaves, water, temperature, seconds };
          const quality = scoreTea(tea, chapter.id).quality;
          if (quality >= 50 && quality < 70) return tea;
        }
  throw new Error(`No ordinary tea recipe for ${chapter.id}`);
}

function beforeFollowup(chapter: (typeof chapters)[number]): GameSnapshot {
  const tea = ordinaryTea(chapter);
  const result = scoreTea(tea, chapter.id);
  const storyVersion = `${chapter.id}-chapter-${chapter.version}`;
  const story = new StoryBridge(readFileSync(`public/story/compiled/${storyVersion}.json`, "utf8"));
  story.next();
  for (let step = 0; step < 100; step++) {
    const frame = story.frame;
    if (frame.choices.some((choice) => choice.text === chapter.ask))
      return snapshotSchema.parse({ version: 1, storyVersion, inkState: story.serialize(), frame, tea, letter: newLetter() });
    if (frame.mode === "tea") story.finishTea(result);
    else if (frame.canContinue) story.next();
    else story.choose(frame.choices[0]!.index);
  }
  throw new Error(`Tea follow-up was not reached in ${chapter.id}`);
}

function mismatchedTeaResponse(chapter: (typeof chapters)[number]): GameSnapshot {
  const tea = { ...newTea(), teaId: "black" as const, leaves: 0, water: 0, temperature: 60, seconds: 0, step: "serve" as const, cupWater: 30 };
  const result = scoreTea(tea, chapter.id);
  if (result.quality >= 50) throw new Error(`Expected mismatched tea in ${chapter.id}, got ${result.quality}`);
  const storyVersion = `${chapter.id}-chapter-${chapter.version}`;
  const story = new StoryBridge(readFileSync(`public/story/compiled/${storyVersion}.json`, "utf8"));
  story.next();
  for (let step = 0; step < 100; step++) {
    const frame = story.frame;
    if (frame.clues.includes(chapter.mismatch))
      return snapshotSchema.parse({ version: 1, storyVersion, inkState: story.serialize(), frame, tea, letter: newLetter() });
    if (frame.mode === "tea") story.finishTea(result);
    else if (frame.canContinue) story.next();
    else story.choose(frame.choices[0]!.index);
  }
  throw new Error(`Mismatched tea response was not reached in ${chapter.id}`);
}

async function loadSnapshot(page: Page, snapshot: GameSnapshot) {
  await page.goto("/");
  await page.getByRole("link", { name: "設定" }).click();
  await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
  await page.getByRole("switch", { name: /減少動態效果/ }).check();
  await page.evaluate(async (saved) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("saves", "readwrite");
        tx.objectStore("saves").put({ id: "auto-1", kind: "auto", updatedAt: new Date().toISOString(), snapshot: saved });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, snapshot);
  await page.goto("/");
  await page.getByRole("button", { name: "繼續故事" }).click();
}

for (const chapter of chapters)
  for (const response of ["ask", "wait"] as const)
    test(`${chapter.id} ordinary tea ${response} response survives reload`, async ({ page }, info) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await loadSnapshot(page, beforeFollowup(chapter));
      const choice = response === "ask" ? chapter.ask : chapter.wait;
      const reply = response === "ask" ? chapter.askResponse : chapter.waitResponse;
      await expect(page.locator(".dialogue-choices button")).toHaveCount(2);
      const choiceButton = page.locator(".dialogue-choices button").filter({ hasText: choice });
      await expect(choiceButton).toBeVisible();
      await page.screenshot({ path: `output/${chapter.id}-tea-followup-${info.project.name}-${response}.png`, animations: "disabled" });
      await choiceButton.click();
      await expect(page.locator(".dialogue-text")).toContainText(reply);
      await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
      await page.reload();
      await expect(page.locator(".dialogue-text")).toContainText(reply);
      expect(errors).toEqual([]);
    });

for (const chapter of chapters)
  test(`${chapter.id} mismatched tea clue survives reload`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await loadSnapshot(page, mismatchedTeaResponse(chapter));
    await expect(page.locator(".dialogue-text")).toContainText(chapter.lowText);
    await page.screenshot({ path: `output/${chapter.id}-tea-mismatch-${info.project.name}.png`, animations: "disabled" });
    await page.reload();
    await expect(page.locator(".dialogue-text")).toContainText(chapter.lowText);
    expect(errors).toEqual([]);
  });
