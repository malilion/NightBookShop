import { expect, test } from "@playwright/test";
import { prepareOpening } from "./opening-helpers";
import { prepareLeaves, pour, steepAndServe } from "./tea-helpers";
import { smallTargets } from "./touch-target-helpers";

test("reading and tea controls keep usable hit areas", async ({ page }, info) => {
  const mobile = info.project.name === "mobile";
  const origin = process.env.PLAYWRIGHT_BASE_URL ?? "";
  await page.goto(`${origin}/`);
  await expect(page.getByRole("heading", { name: "夜行書店", exact: true })).toBeVisible();
  expect(await smallTargets(page), "首頁").toEqual([]);
  await page.goto(`${origin}/#/settings`);
  await expect(page.getByRole("heading", { name: "閱讀的步調" })).toBeVisible();
  expect(await smallTargets(page), "設定").toEqual([]);
  await page.goto(`${origin}/`);
  await page.getByRole("link", { name: "今夜的訪客" }).click();
  await expect(page.getByRole("button", { name: "翻開第一夜" })).toBeVisible();
  expect(await smallTargets(page), "章節選單").toEqual([]);
  await page.getByRole("button", { name: "翻開第一夜" }).click({ timeout: 10000 });
  await prepareOpening(page);
  await expect(page.locator(".dialogue-text")).toBeVisible();
  expect(await smallTargets(page), "對話").toEqual([]);
  for (let step = 0; step < 240; step++) {
    if (await page.locator(".tea-board").isVisible()) break;
    const reveal = page.getByRole("button", { name: "顯示全文" });
    const next = page.locator(".dialogue-panel button").first();
    await expect(next).toBeVisible();
    await next.click();
    if (await reveal.isVisible()) await reveal.click({ timeout: 2_000 }).catch(() => undefined);
  }
  await expect(page.locator(".tea-board")).toBeVisible();
  expect(await smallTargets(page), "第一夜茶席").toEqual([]);
  if (mobile) {
    const jarRowGap = await page.locator(".tea-board").evaluate((board) => {
      const jars = [...board.querySelectorAll(".shelf-jar")];
      const firstCaption = jars[0]?.querySelector(".jar-caption")?.getBoundingClientRect();
      const secondRowJar = jars[4]?.querySelector("rect")?.getBoundingClientRect();
      if (!firstCaption || !secondRowJar) throw new Error("Tea shelf rows are incomplete");
      return secondRowJar.top - firstCaption.bottom;
    });
    expect(jarRowGap, "第一排茶名與第二排茶罐的間距").toBeGreaterThanOrEqual(8);
  }
  await page.screenshot({ path: `output/touch-tea-${info.project.name}.png`, animations: "disabled" });
  await prepareLeaves(page, mobile);
  await pour(page, "kettle", 68, mobile);
  await steepAndServe(page, mobile, "她");
  await expect(page.locator(".film-caption")).toBeVisible();
  expect(await smallTargets(page), "製茶動畫").toEqual([]);
  await page.screenshot({ path: `output/touch-film-${info.project.name}.png`, animations: "disabled" });
});
