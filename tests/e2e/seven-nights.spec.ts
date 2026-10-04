import { test, expect, type Page } from "@playwright/test";
import { collectPageErrors } from "./page-errors";
import { prepareLeaves, pour, steepAndServe } from "./tea-helpers";
import { prepareOpening } from "./opening-helpers";

const nights = ["第一夜", "第二夜", "第三夜", "第四夜", "第五夜", "第六夜", "終章"] as const;
const teas = [0, 5, 6, 7, 2, 7, 0] as const;
const recipients = ["她", "他", "她", "她", "他", "他", "自己"] as const;

async function playNight(page: Page, night: number, touch: boolean) {
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
      await page.locator(".letter-panel .panel-footer button").click();
      continue;
    }
    const reveal = page.getByRole("button", { name: "顯示全文" });
    const next = page.getByRole("button", { name: "繼續", exact: true });
    const choice = page.locator(".dialogue-choices button").first();
    if (await reveal.isVisible()) await reveal.click({ timeout: 2_000 }).catch(() => undefined);
    else if (await next.isVisible()) await next.click();
    else if (await choice.isVisible()) await choice.click();
    else throw new Error(`${nights[night]} stalled at step ${step}`);
  }
  throw new Error(`${nights[night]} did not reach an ending`);
}

test("plays seven nights in order without seeding chapter unlocks", async ({ page }, info) => {
  // WebKit's test browser plays the same seven nights about twice as slowly.
  test.setTimeout(info.project.name.startsWith("webkit") ? 2_400_000 : 900_000);
  const errors: string[] = [];
  collectPageErrors(page, errors);
  await page.goto("/");
  await page.getByRole("link", { name: "設定" }).click();
  await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
  await page.getByRole("switch", { name: /減少動態效果/ }).check();
  await page.goto("/");
  await page.getByRole("button", { name: "開始故事", exact: true }).click();
  const touch = info.project.name.endsWith("mobile");
  for (let night = 0; night < nights.length; night++) {
    await playNight(page, night, touch);
    await expect(page.locator(".ending-panel")).toBeVisible();
    if (night < nights.length - 1)
      await page.getByRole("button", { name: `翻開${nights[night + 1]}` }).click();
  }
  await page.goto("/#/collection");
  await expect(page.locator(".collection-page")).toBeVisible();
  await expect(page.locator(".bookmark-entry")).toHaveCount(7);
  expect(errors).toEqual([]);
});
