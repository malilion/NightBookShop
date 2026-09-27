import { expect, test, type Page } from "@playwright/test";
import { writeFileSync } from "node:fs";
import { lowContrastText } from "./contrast-helpers";
import { prepareOpening } from "./opening-helpers";
import { pour, prepareLeaves, steepAndServe } from "./tea-helpers";

async function advanceUntil(page: Page, target: string) {
  for (let step = 0; step < 280; step++) {
    if (await page.locator(target).first().isVisible()) return;
    const reveal = page.getByRole("button", { name: "顯示全文" });
    if (await reveal.isVisible()) await reveal.click();
    else await page.locator(".dialogue-panel button").first().click();
  }
  throw new Error(`Story did not reach ${target}`);
}

test("text stays readable over every first-night screen", async ({ page }, info) => {
  test.setTimeout(300_000);
  const touch = info.project.name === "mobile";
  const low: Record<string, unknown> = {};
  const check = async (screen: string) => {
    const found = await lowContrastText(page);
    if (found.length) low[screen] = found;
  };
  await page.goto("/#/settings");
  await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
  await check("設定");
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "夜行書店", exact: true })).toBeVisible();
  await check("首頁");
  await page.goto("/#/chapters");
  await expect(page.getByRole("button", { name: "翻開第一夜" })).toBeVisible();
  await check("章節選單");
  await page.goto("/#/collection");
  await check("收藏");
  await page.goto("/");
  await page.getByRole("button", { name: "開始故事", exact: true }).click();
  await prepareOpening(page);
  await expect(page.locator(".dialogue-text")).toBeVisible();
  await check("對話");
  await page.screenshot({ path: `output/text-contrast-dialogue-${info.project.name}.png`, animations: "disabled" });
  await advanceUntil(page, ".tea-board");
  await check("茶席");
  await prepareLeaves(page, touch);
  await pour(page, "kettle", 68, touch);
  await steepAndServe(page, touch, "她");
  await expect(page.locator(".film-caption")).toBeVisible();
  await check("製茶影片");
  await page.getByRole("button", { name: /繼續故事/ }).click();
  await advanceUntil(page, ".memory-evidence");
  await check("記憶場景");
  await advanceUntil(page, ".letter-paper");
  await check("拼信");
  await page.screenshot({ path: `output/text-contrast-letter-${info.project.name}.png`, animations: "disabled" });
  writeFileSync(`output/text-contrast-${info.project.name}.json`, JSON.stringify(low, null, 1));
  expect(low).toEqual({});
});
