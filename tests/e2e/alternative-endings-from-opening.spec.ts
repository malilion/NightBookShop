import { test, expect, type Page } from "@playwright/test";
import { prepareLeaves, pour, steepAndServe } from "./tea-helpers";
import { prepareOpening } from "./opening-helpers";

const nights = ["第一夜", "第二夜", "第三夜", "第四夜", "第五夜", "第六夜", "終章"] as const;
const firstEndings = ["moonlight", "boyan-rest", "ruoyin-one", "yenuan-share", "yuhang-today", "haiming-light"] as const;
const teas = [0, 5, 6, 7, 2, 7, 0] as const;
const recipients = ["她", "他", "她", "她", "他", "他", "自己"] as const;
const finaleLetter = [
  "我把那封信藏起來，",
  "因為我怕他們分開，也怕自己成為原因。",
  "我想讓他留下，也想讓媽媽走到安全的地方。",
  "長大後，請不要只記得我藏了信；那晚我也想有人抱抱我。",
] as const;

type Ending = { night: number; id: string; title: string; prefer: string[]; stamp?: "過去" | "未來"; fullLetter?: boolean };
// 各夜的首選結局已有從開場起的完整路線；〈不會天亮的書店〉由 finale.spec 從開場拒坐驗證。
const endings: Ending[] = [
  { night: 0, id: "recipient", title: "遲來的收件人", prefer: ["陪她寫一張詢問收信意願的短箋", "寄到岳川的舊址"] },
  { night: 0, id: "unfinished", title: "再等一個夜晚", prefer: ["把信交還給她，今晚"] },
  { night: 0, id: "intervention", title: "替她決定的人", prefer: ["仍替她封口", "替她把信寄出"] },
  { night: 1, id: "boyan-leave", title: "空白履歷的第一行", prefer: ["先盤點離職後的生活"] },
  { night: 1, id: "boyan-boundary", title: "被聽見的界線", prefer: ["工作負荷說明"] },
  { night: 1, id: "boyan-overwork", title: "再撐一下就好", prefer: ["先把報告做完"] },
  { night: 2, id: "ruoyin-stage", title: "寄往有光的舞台", prefer: ["給季晴的信寄出"] },
  { night: 2, id: "ruoyin-score", title: "另一種樂章", prefer: ["替普通人的故事寫旋律"] },
  { night: 2, id: "ruoyin-echo", title: "掌聲的回音", prefer: ["帶著舊傷重新參賽"] },
  { night: 3, id: "yenuan-reopen", title: "明天仍會出爐", prefer: ["照媽媽的配方", "讓原配方重新上架"] },
  { night: 3, id: "yenuan-rest", title: "休息中的晨麥", prefer: ["讓晨麥休息一週"] },
  { night: 3, id: "yenuan-copy", title: "永遠相同的味道", prefer: ["完全複製母親的麵包"] },
  { night: 4, id: "yuhang-future", title: "寄往七年後", prefer: ["寄往七年後，寫下"], stamp: "未來" },
  { night: 4, id: "yuhang-past", title: "退回過去", prefer: ["妹妹的紀念盒"], stamp: "過去" },
  { night: 4, id: "yuhang-unknown", title: "查無此人", prefer: ["拒絕簽收"] },
  { night: 5, id: "haiming-voice", title: "替記憶留一盞燈", prefer: ["做一份聲音航海誌"] },
  { night: 5, id: "haiming-boat", title: "讓紙船出海", prefer: ["帶紙船去海邊"] },
  { night: 5, id: "haiming-hero", title: "完美的守塔人", prefer: ["只寄流暢的英雄故事"] },
  { night: 6, id: "lincheng-keeper", title: "下一任守夜人", prefer: ["自願成為下一任守夜人"], fullLetter: true },
  { night: 6, id: "lincheng-shelf", title: "留在書架上的信", prefer: ["讓信暫留書架"] },
];

async function fillLetter(page: Page, ending: Ending) {
  if (ending.stamp) await page.locator(".letter-stamps label", { hasText: ending.stamp }).click();
  if (ending.fullLetter) {
    for (const [index, line] of finaleLetter.entries()) {
      await page.getByRole("button", { name: line, exact: true }).click();
      await page.getByRole("button", { name: `信紙第 ${index + 1} 格，空白` }).click();
    }
    await page.getByRole("button", { name: "查看童年的筆跡" }).click();
  }
  await page.locator(".letter-panel .panel-footer button").click();
}

async function choose(page: Page, ending: Ending) {
  const choices = page.locator(".dialogue-choices button");
  const texts = await choices.allTextContents();
  for (const wanted of ending.prefer) {
    const index = texts.findIndex((text) => text.includes(wanted));
    if (index >= 0) return choices.nth(index).click();
  }
  return choices.first().click();
}

async function playToEnding(page: Page, ending: Ending, touch: boolean) {
  const night = ending.night;
  await prepareOpening(page);
  if (night === 0) {
    for (let step = 0; step < 40; step++) {
      const firstPage = page.getByRole("button", { name: /翻開今晚的第一頁/ });
      if (await firstPage.isVisible()) {
        await firstPage.click();
        break;
      }
      await page.getByRole("button", { name: "繼續", exact: true }).click();
    }
  }
  for (let step = 0; step < 900; step++) {
    if (await page.locator(".ending-panel").isVisible()) return;
    if (await page.locator(".tea-board").isVisible()) {
      await prepareLeaves(page, touch, teas[night]);
      await pour(page, "kettle", 68, touch);
      await steepAndServe(page, touch, recipients[night]);
      await page.getByRole("button", { name: /繼續故事/ }).click();
      continue;
    }
    if (await page.locator(".melody-panel").isVisible()) {
      await page.getByRole("button", { name: "先聽她說下去" }).click();
      continue;
    }
    if (await page.locator(".hearth-panel").isVisible()) {
      for (const choice of ["陪她等一口氣", "問她願不願意接著說", "陪她等一口氣"])
        await page.getByRole("button", { name: choice }).click();
      await page.getByRole("button", { name: "讓她繼續說" }).click();
      continue;
    }
    if (await page.locator(".route-panel").isVisible()) {
      for (const stop of ["已拆除的老郵局", "末班公車站", "鎖住的空店面"])
        await page.getByRole("button", { name: stop }).click();
      await page.getByRole("button", { name: "帶著信回到書店" }).click();
      continue;
    }
    if (await page.locator(".lamp-panel").isVisible()) {
      for (let index = 0; index < 3; index++)
        await page.getByRole("button", { name: "守住柔和的燈光" }).click();
      await page.getByRole("button", { name: "聽他接著說" }).click();
      continue;
    }
    if (await page.locator(".notification-panel").isVisible()) {
      for (const action of ["暫停主管提醒", "暫停同事訊息", "暫停系統通知"])
        await page.getByRole("button", { name: action }).click();
      await page.getByRole("button", { name: "收起手機，看向車窗" }).click();
      continue;
    }
    if (await page.locator(".archive-panel").isVisible()) {
      for (const visitor of ["靜蘭 · 舊信", "柏言 · 草稿", "若音 · 樂譜", "葉暖 · 食譜", "雨航 · 郵戳", "海明 · 照片"])
        await page.getByRole("button", { name: new RegExp(visitor) }).click();
      for (const [first, second] of [
        ["靜蘭 · 舊信", "柏言 · 草稿"],
        ["柏言 · 草稿", "若音 · 樂譜"],
        ["若音 · 樂譜", "海明 · 照片"],
        ["海明 · 照片", "雨航 · 郵戳"],
        ["雨航 · 郵戳", "葉暖 · 食譜"],
      ]) {
        await page.getByRole("button", { name: new RegExp(first) }).click();
        await page.getByRole("button", { name: new RegExp(second) }).click();
      }
      await page.getByRole("button", { name: "走進地圖中心" }).click();
      continue;
    }
    if (await page.locator(".letter-panel").isVisible()) {
      await fillLetter(page, ending);
      continue;
    }
    const reveal = page.getByRole("button", { name: "顯示全文" });
    const next = page.getByRole("button", { name: "繼續", exact: true });
    if (await reveal.isVisible()) await reveal.click({ timeout: 2_000 }).catch(() => undefined);
    else if (await next.isVisible()) await next.click();
    else if (await page.locator(".dialogue-choices button").first().isVisible()) await choose(page, ending);
    else throw new Error(`${nights[night]} stalled at step ${step}`);
  }
  throw new Error(`${nights[night]} did not reach ${ending.id}`);
}

for (const ending of endings) {
  test(`${nights[ending.night]} plays from its opening to ${ending.id}`, async ({ page }, info) => {
    test.setTimeout(420_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.evaluate(async (ids) => {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("night-bookshop");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction("collection", "readwrite");
          for (const id of ids) tx.objectStore("collection").put({ id, unlockedAt: new Date().toISOString() });
          tx.oncomplete = () => { db.close(); resolve(); };
          tx.onerror = () => reject(tx.error);
        };
      });
    }, firstEndings.slice(0, ending.night));
    await page.reload();
    await page.getByRole("link", { name: "設定" }).click();
    await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
    await page.getByRole("switch", { name: /減少動態效果/ }).check();
    if (ending.night === 0) {
      await page.goto("/");
      await page.getByRole("button", { name: "開始故事", exact: true }).click();
    } else {
      await page.goto("/#/chapters");
      await page.getByRole("button", { name: `翻開${nights[ending.night]}` }).click();
    }
    await playToEnding(page, ending, info.project.name === "mobile");
    await expect(page.locator(".ending-panel").getByRole("heading", { name: ending.title })).toBeVisible();
    await page.goto("/#/collection");
    await expect(page.getByRole("heading", { name: ending.title })).toBeVisible();
    expect(errors).toEqual([]);
  });
}
