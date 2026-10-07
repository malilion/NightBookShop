import { test, expect, type Page } from "@playwright/test";
import { collectPageErrors } from "./page-errors";
import { readFileSync } from "node:fs";
import { StoryBridge } from "../../src/story/storyBridge";
import { newLetter, newTea, snapshotSchema, type GameSnapshot } from "../../src/types/game";
import { prepareLeaves, pour, steepAndServe } from "./tea-helpers";
import { prepareOpening } from "./opening-helpers";
import { appReady } from "./app-ready";

async function advanceUntil(page: Page, target: string, max = 220) {
  for (let step = 0; step < max; step++) {
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
    const next = page.getByRole("button", { name: "繼續", exact: true });
    // Choices appear a moment after the line finishes; wait for either.
    await target.or(next).first().waitFor({ timeout: 10_000 }).catch(() => undefined);
    if (await target.isVisible()) return target;
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
async function expectMemoryBackground(page: Page, scene: string, project: string) {
  await advanceUntil(page, `.scene-art img[src*="memory-${scene}.webp"]`);
  await expect(page.locator(".scene-art")).toHaveCount(1);
  await expect.poll(() => page.locator(`.scene-art img[src*="memory-${scene}.webp"]`).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  if (project.endsWith("mobile"))
    await expect(page.locator(`.scene-art source[srcset*="memory-${scene}-mobile.webp"]`)).toHaveCount(1);
  await page.screenshot({ path: `output/third-night-${scene}-${project}.png`, animations: "disabled" });
}

function unfinishedJinglanSave(): GameSnapshot {
  const story = new StoryBridge(readFileSync("public/story/compiled/main.json", "utf8"));
  story.next();
  for (let step = 0; step < 360 && story.frame.mode !== "ending"; step++) {
    if (story.frame.mode === "tea") story.finishTea({ teaId: "osmanthus", quality: 100, emotionalMatch: 100 });
    else if (story.frame.mode === "letter") story.finishLetter({ completion: 100, understood: true });
    else if (story.frame.canContinue) story.next();
    else story.choose((story.frame.choices.find((entry) => entry.text.includes("把信交還給她，今晚")) ?? story.frame.choices[0])!.index);
  }
  if (story.frame.endingId !== "unfinished") throw new Error("Jinglan fixture did not reach the unfinished ending");
  return snapshotSchema.parse({ version: 1, storyVersion: "jinglan-chapter-15", inkState: story.serialize(), frame: story.frame, tea: newTea(), letter: newLetter() });
}

test("third night saves the cup motif and both sides of the letter", async ({
  page,
}, info) => {
  const errors: string[] = [];
  collectPageErrors(page, errors);
  await page.goto("/");
  await appReady(page);
  await page.evaluate(async (jinglanSave) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(["collection", "saves"], "readwrite");
        tx.objectStore("saves").put({ id: "chapter-jinglan", kind: "chapter", updatedAt: new Date().toISOString(), snapshot: jinglanSave });
        for (const id of ["moonlight", "boyan-rest"])
          tx.objectStore("collection").put({
            id,
            unlockedAt: new Date().toISOString(),
          });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, unfinishedJinglanSave());
  await page.getByRole("link", { name: "設定" }).click();
  await page
    .getByRole("combobox", { name: /對話文字速度/ })
    .selectOption("instant");
  await page.getByRole("switch", { name: /減少動態效果/ }).check();
  await page.reload();
  await expect(page.getByRole("heading", { name: "閱讀的步調" })).toBeVisible();
  await page.goto("/#/chapters");
  await page.getByRole("button", { name: "翻開第三夜" }).click();
  await prepareOpening(page);
  await expect(page.locator(".scene-caption small")).toHaveText(
    "第三夜 · 沈若音",
  );
  await advanceUntil(page, ".tea-board");
  const touch = info.project.name.endsWith("mobile");
  await prepareLeaves(page, touch, 6);
  await pour(page, "kettle", 68, touch);
  await steepAndServe(page, touch, "她");
  await page.getByRole("button", { name: /繼續故事/ }).click();
  await advanceUntil(page, ".melody-panel");
  await page.getByRole("button", { name: "音符：雨" }).click();
  await page.getByRole("button", { name: "音符：步" }).click();
  await expect(page.locator(".melody-sequence")).toContainText("雨");
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText(
    "進度自動保存在此瀏覽器",
  );
  await page.reload();
  await expect(page.locator(".melody-sequence")).toContainText("步");
  await page.getByRole("button", { name: "音符：歸" }).click();
  await page.getByRole("button", { name: "音符：燈" }).click();
  await page.getByRole("button", { name: "回應這段旋律" }).click();
  await advanceUntil(page, '.scene-art img[src*="memory-practice-room.webp"]');
  await expect(page.locator(".scene-art")).toHaveCount(1);
  if (touch) await expect(page.locator('.scene-art source[srcset*="memory-practice-room-mobile.webp"]')).toHaveCount(1);
  await page.screenshot({ path: `output/third-night-practice-room-${info.project.name}.png`, animations: "disabled" });
  await advanceUntil(page, ".memory-evidence-childhood");
  await page.screenshot({ path: `output/third-night-childhood-objects-${info.project.name}.png`, animations: "disabled" });
  await inspectMemoryObjects(page, "childhood", ["雨聲與空拍", "隔年的獎狀", "第一頁樂譜"]);
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator(".memory-evidence-childhood .memory-object-seen")).toHaveCount(3);
  await page.getByRole("button", { name: "從譜架下拾起第一片信紙" }).click();
  const childhoodReflection = await untilChoice(page, "問她願不願意說");
  await page.screenshot({ path: `output/third-night-childhood-reflection-${info.project.name}.png`, animations: "disabled" });
  await childhoodReflection.click();
  await expectMemoryBackground(page, "backstage", info.project.name);
  await inspectMemoryObjects(page, "backstage", ["評審講評", "季晴的舊票", "護手繃帶"]);
  await page.getByRole("button", { name: "從鏡框背後收起第二片信紙" }).click();
  await (await untilChoice(page, "問她想補給季晴")).click();
  await expectMemoryBackground(page, "banquet", info.project.name);
  await advanceUntil(page, ".memory-evidence-banquet");
  await page.getByRole("button", { name: "探索物件：企業節目單" }).click();
  for (let step = 0; step < 5; step++) {
    if ((await page.locator(".dialogue-text").innerText()).includes("節目單沒有寫他後來的生活")) break;
    await page.getByRole("button", { name: "繼續", exact: true }).click();
  }
  await expect(page.locator(".dialogue-text")).toContainText("節目單沒有寫他後來的生活");
  await page.screenshot({ path: `output/third-night-program-${info.project.name}.png`, animations: "disabled" });
  await inspectMemoryObjects(page, "banquet", ["門邊的聽眾", "演出時程"]);
  await page.getByRole("button", { name: "把節目單背面的第三片信紙收好" }).click();
  await (await untilChoice(page, "問那三分鐘")).click();
  await expectMemoryBackground(page, "grandstage", info.project.name);
  await inspectMemoryObjects(page, "grandstage", ["第一排空椅", "最後一頁樂譜", "側門的燈光"]);
  await page.getByRole("button", { name: "帶著琴盒回書店，拼起信的兩面" }).click();
  const stageReflection = await untilChoice(page, "問她若能把掌聲停下");
  await page.screenshot({ path: `output/third-night-stage-reflection-${info.project.name}.png`, animations: "disabled" });
  await stageReflection.click();
  await advanceUntil(page, ".letter-panel");
  await expect(page.locator(".letter-slot")).toHaveCount(3);
  for (const [index, line] of [
    "季晴，我以為我恨妳走得比我遠。",
    "後來才知道，我怕看見沒有成為的自己。",
    "我還想聽妳把那首曲子拉完。",
  ].entries()) {
    await page.getByRole("button", { name: line, exact: true }).click();
    await page
      .getByRole("button", { name: `信紙第 ${index + 1} 格，空白` })
      .click();
  }
  await page.screenshot({
    path: `output/third-night-front-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: /翻到背面 · 給年輕的自己/ }).click();
  for (const [index, line] of [
    "給十歲的若音：妳在雨裡拉琴，沒有一個觀眾。",
    "妳想要的，也許從來不只是最大的舞台。",
    "妳想讓孤單的人，在三分鐘裡覺得有人理解。",
  ].entries()) {
    await page.getByRole("button", { name: line, exact: true }).click();
    await page
      .getByRole("button", { name: `信紙第 ${index + 1} 格，空白` })
      .click();
  }
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText(
    "進度自動保存在此瀏覽器",
  );
  await page.reload();
  await expect(page.locator(".letter-side-buttons")).toContainText(
    "正面 3/3 · 背面 3/3",
  );
  await page.screenshot({
    path: `output/third-night-back-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "把兩面的信交還給她" }).click();
  await (await untilChoice(page, "請她說說最初四個音裡的停頓")).click();
  await (await untilChoice(page, "問她新的旋律想先給誰聽")).click();
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.getByRole("button", { name: "請她說說最初四個音裡的停頓" })).toHaveCount(0);
  await (await untilChoice(page, "問她手累時能不能把休止符留下")).click();
  await page.screenshot({ path: `output/third-night-score-table-${info.project.name}.png`, animations: "disabled" });
  await (await untilChoice(page, "第一晚有位老師也聽過這四個音")).click();
  await advanceUntil(page, '.dialogue-text[data-full-text*="最後一個音晚一點落下，也沒關係"]');
  await (await untilChoice(page, "把鉛筆交回若音")).click();
  await (await untilChoice(page, "回到最初的四個音")).click();
  await (await untilChoice(page, "陪她只為一個人拉完")).click();
  await advanceUntil(page, '.dialogue-text[data-full-text*="給第一晚也聽見的人"]');
  await advanceUntil(page, ".ending-panel");
  await expect(
    page.getByRole("heading", { name: "只為一個人演奏" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /守夜手記/ }).click();
  await expect(
    page.getByRole("heading", { name: "手冊的第一頁" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "尾牙的節目單" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "拉給雨聽的那一天" })).toBeVisible();
  await page.screenshot({
    path: `output/third-night-ending-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "關閉手記" }).click();
  await page.goto("/#/collection");
  await expect(
    page.getByRole("heading", { name: "只為一個人演奏" }),
  ).toBeVisible();
  await expect(page.getByText("若音的薰衣草伯爵")).toBeVisible();
  expect(errors).toEqual([]);
});
