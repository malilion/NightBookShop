import { test, expect, type Page } from "@playwright/test";
import {
  prepareLeaves,
  pour,
  steepAndServe,
  geometry,
  drag,
} from "./tea-helpers";
async function until(page: Page, text: string) {
  const target = page.getByRole("button", { name: text, exact: false });
  for (let i = 0; i < 240; i++) {
    await expect(
      target.or(page.locator(".dialogue-panel button")).first(),
    ).toBeVisible();
    if (await target.isVisible()) return;
    await page.locator(".dialogue-panel button").first().click();
  }
  throw new Error("Target not reached: " + text);
}
async function flush(page: Page) {
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText(
    "進度自動保存在此瀏覽器",
  );
}
test("complete first-night loop, reload minigames, collect and restore a manual save", async ({
  page,
  context,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "夜行書店", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `output/title-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "開始故事", exact: true }).click();
  await until(page, "翻開今晚的第一頁");
  await page.getByRole("button", { name: /翻開今晚的第一頁/ }).click();
  await until(page, "先替她拉開椅子");
  await page.screenshot({
    path: `output/dialogue-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: /先替她拉開椅子/ }).click();
  await until(page, "茶罐：桂花烏龍");
  await expect(page.locator(".shelf-jar .tea-prop-3d")).toHaveCount(8);
  await prepareLeaves(page, info.project.name === "mobile");
  await pour(page, "kettle", 68, info.project.name === "mobile");
  await expect(page.locator(".tea-board")).toHaveAttribute(
    "data-liquor-color",
    "#dae1d8",
  );
  await flush(page);
  const water = await page.locator(".tea-board").getAttribute("data-water");
  await page.evaluate(() =>
    navigator.serviceWorker.ready.then(() => undefined),
  );
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".tea-board")).toHaveAttribute(
    "data-water",
    water!,
  );
  await page.screenshot({
    path: `output/tea-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await steepAndServe(page, info.project.name === "mobile");
  const completion = page.getByRole("dialog", {
    name: "把這一杯，放到她面前。",
  });
  await expect(completion).toBeVisible();
  const brewedColor = await page
    .locator(".tea-board")
    .getAttribute("data-liquor-color");
  expect(brewedColor).not.toBe("#dae1d8");
  await expect(
    page.locator('[data-tool="pot"] [data-liquor-color]'),
  ).toHaveAttribute("data-liquor-color", brewedColor!);
  await expect(
    page.locator('[data-prop-asset="cup-water"] [data-liquor-color]'),
  ).toHaveAttribute("data-liquor-color", brewedColor!);
  await expect(
    completion.locator(".film-liquor-layer [data-liquor-color]"),
  ).toHaveAttribute("data-liquor-color", brewedColor!);
  const film = completion.locator("video");
  await expect(film).toHaveJSProperty("videoWidth", 1280);
  await expect(film).toHaveJSProperty("loop", false);
  await completion.getByRole("button", { name: "暫停動畫" }).click();
  const pausedAt = await film.evaluate(
    (v) => (v as HTMLVideoElement).currentTime,
  );
  await page.waitForTimeout(250);
  expect(await film.evaluate((v) => (v as HTMLVideoElement).currentTime)).toBe(
    pausedAt,
  );
  const mask = completion.locator(".film-liquor-layer");
  const pausedFrame = await mask.getAttribute("data-frame");
  await page.waitForTimeout(150);
  await expect(mask).toHaveAttribute("data-frame", pausedFrame!);
  await film.evaluate((v) => {
    (v as HTMLVideoElement).currentTime = 3;
  });
  await expect
    .poll(async () =>
      Math.abs(Number(await mask.getAttribute("data-frame")) - 90),
    )
    .toBeLessThanOrEqual(1);
  await page.screenshot({
    path: `output/tea-completion-mid-${info.project.name}.png`,
    animations: "disabled",
  });
  await flush(page);
  await page.reload();
  await page.getByRole("button", { name: "將茶遞給她", exact: true }).click();
  await expect
    .poll(() => film.evaluate((v) => (v as HTMLVideoElement).currentTime))
    .toBeGreaterThan(0.2);
  await page.screenshot({
    path: `output/tea-completion-${info.project.name}.png`,
    animations: "disabled",
  });
  await expect(completion).not.toBeVisible({ timeout: 12000 });
  await context.setOffline(false);
  await until(page, "聽她說，那一晚");
  await page.getByRole("button", { name: /聽她說，那一晚/ }).click();
  await until(page, "查看不同的墨跡");
  await page
    .getByRole("button", { name: "岳川，我不是不願意跟你走。", exact: true })
    .click();
  await page.getByRole("button", { name: "信紙第 1 格，空白" }).click();
  await flush(page);
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "信紙第 1 格：岳川，我不是不願意跟你走。",
    }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "只是那一晚，我也有不能離開的人。",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "信紙第 2 格，空白" }).click();
  await page.getByRole("button", { name: "請不要等我。", exact: true }).click();
  await page.getByRole("button", { name: "信紙第 3 格，空白" }).click();
  await page.getByRole("button", { name: "查看不同的墨跡" }).click();
  await page.screenshot({
    path: `output/letter-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "把信交還給她" }).click();
  await until(page, "陪她寫一封信");
  await page.getByRole("button", { name: "開啟遊戲選單" }).click();
  await page.getByRole("link", { name: "存檔與讀檔" }).click();
  await page.getByRole("button", { name: "儲存", exact: true }).first().click();
  await expect(page.getByRole("status")).toHaveText("已存入第 1 格。");
  await page.getByRole("link", { name: "回到書店" }).click();
  await page.getByRole("button", { name: /陪她寫一封信/ }).click();
  for (
    let i = 0;
    i < 100 &&
    !(await page.getByRole("heading", { name: "月光抵達之處" }).isVisible());
    i++
  ) {
    const next = page.getByRole("button", { name: "繼續", exact: true });
    if (await next.isVisible()) await next.click();
    else await page.locator(".dialogue-choices button").first().click();
  }
  await expect(
    page.getByRole("heading", { name: "月光抵達之處" }),
  ).toBeVisible();
  await flush(page);
  await page.getByRole("link", { name: "翻開故事收藏" }).click();
  await expect(page).toHaveURL(/#\/collection$/);
  await expect(
    page.getByRole("heading", { name: "故事收藏", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "月光抵達之處" }),
  ).toBeVisible();
  await page.screenshot({
    path: `output/collection-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.goto("/#/saves");
  await page.getByRole("button", { name: "讀取", exact: true }).first().click();
  if (await page.getByRole("button", { name: "讀取這一頁" }).isVisible())
    await page.getByRole("button", { name: "讀取這一頁" }).click();
  await expect(
    page.getByRole("button", { name: /陪她寫一封信/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("settings persist, locked chapters stay unavailable, empty collection and keyboard work", async ({
  page,
}) => {
  await page.goto("/#/collection");
  await expect(
    page.getByRole("heading", { name: "第一頁，還留著空白。" }),
  ).toBeVisible();
  await page.goto("/#/settings");
  await page.getByRole("switch", { name: /放大故事文字/ }).check();
  await page.getByRole("switch", { name: /減少動態效果/ }).check();
  await expect(page.locator(".app")).toHaveClass(/large-text/);
  await page.reload();
  await expect(
    page.getByRole("switch", { name: /放大故事文字/ }),
  ).toBeChecked();
  await page.goto("/#/chapters");
  await expect(page.getByText("故事尚在書寫")).toHaveCount(5);
  await page.getByRole("button", { name: "翻開第一夜" }).click();
  await expect(page.getByRole("region", { name: "故事對話" })).toBeVisible();
  await flush(page);
  await page.locator("#main").click({ position: { x: 10, y: 150 } });
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("「林澄，暫代店員。」", { exact: false }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "暫停在這一頁" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("cached shell and first-night story resume offline", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "開始故事", exact: true }).click();
  await expect(page.getByRole("region", { name: "故事對話" })).toBeVisible();
  await flush(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(page.getByRole("region", { name: "故事對話" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  const before = await page.locator(".dialogue-text").textContent();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator(".dialogue-text")).toHaveText(before!);
  await page.getByRole("button", { name: "繼續", exact: true }).click();
  await expect(page.locator(".dialogue-text")).not.toHaveText(before!);
  await context.setOffline(false);
});

test("tea is playable without films, keyboard spills stop, and mistakes can be repaired", async ({
  page,
}) => {
  await page.route("**/video/**", (route) => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "開始故事", exact: true }).click();
  await until(page, "茶罐：桂花烏龍");
  const board = page.locator(".tea-board");
  const { layout: l } = await geometry(page);
  // Select the fourth jar using only the keyboard, then remove its lid.
  const jar = page.getByRole("button", { name: "茶罐：茉莉綠茶" });
  await jar.focus();
  await page.keyboard.press("Enter");
  const initial = l.jarSlot(3);
  for (let i = 0; i < Math.round((initial.x - l.jar.x) / 20); i++)
    await page.keyboard.press("ArrowLeft");
  for (let i = 0; i < Math.round((l.jar.y - initial.y) / 20); i++)
    await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "茉莉綠茶", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "茶罐蓋", exact: true }).focus();
  await page.keyboard.press("Enter");
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "茶罐蓋", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "重新整理茶席" }).click();
  await prepareLeaves(page);
  // Return one spoonful to the jar, then add it back.
  await drag(page, l.spoon, l.pot);
  await expect(board).toHaveAttribute("data-leaves", "2");
  await drag(page, l.spoon, l.jar);
  await drag(page, l.spoon, l.jar);
  await drag(page, l.spoon, l.pot);
  await expect(board).toHaveAttribute("data-leaves", "3");
  await page.getByRole("button", { name: "提起銅水壺" }).focus();
  await page.keyboard.press("Enter");
  for (let i = 0; i < 6; i++) await page.keyboard.press("e");
  await expect
    .poll(async () => Number(await board.getAttribute("data-spilled")))
    .toBeGreaterThan(1);
  await expect(board).toHaveAttribute("data-water", "0");
  await page.keyboard.press("Escape");
  const spilled = await board.getAttribute("data-spilled");
  await page.waitForTimeout(300);
  await expect(board).toHaveAttribute("data-spilled", spilled!);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  // A spill does not block refilling or handing the cup back to the story.
  await pour(page, "kettle", 68);
  await steepAndServe(page);
  await expect(
    page.getByText("影片暫時無法播放，仍可繼續故事。"),
  ).toBeVisible();
  await page.getByRole("button", { name: "略過動畫，繼續故事" }).click();
  await expect(page.getByRole("region", { name: "故事對話" })).toBeVisible();
});

test("tea pauses under the menu and can be restarted after a mistake", async ({
  page,
}) => {
  await page.goto("/#/settings");
  await page.getByRole("switch", { name: /減少動態效果/ }).check();
  await expect(page.locator(".app")).toHaveClass(/reduce-motion/);
  await page.getByRole("link", { name: "回到門前" }).click();
  await page.getByRole("button", { name: "開始故事", exact: true }).click();
  await until(page, "茶罐：桂花烏龍");
  await prepareLeaves(page);
  await pour(page, "kettle", 35);
  await pour(page, "kettle", 68);
  const { layout: l } = await geometry(page);
  await drag(page, l.lid, l.pot);
  const board = page.locator(".tea-board");
  await expect(page.locator(".table-steam")).toHaveCount(0);
  await expect
    .poll(async () => Number(await board.getAttribute("data-seconds")))
    .toBeGreaterThan(1);
  await page.getByRole("button", { name: "沙漏：開始或暫停浸泡" }).click();
  const paused = await board.getAttribute("data-seconds");
  await page.waitForTimeout(300);
  await expect(board).toHaveAttribute("data-seconds", paused!);
  await page.getByRole("button", { name: "沙漏：開始或暫停浸泡" }).click();
  await page.getByRole("button", { name: "開啟遊戲選單" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const menuTime = await board.getAttribute("data-seconds");
  await page.waitForTimeout(400);
  await expect(board).toHaveAttribute("data-seconds", menuTime!);
  await page.keyboard.press("Escape");
  await expect
    .poll(async () => Number(await board.getAttribute("data-seconds")))
    .toBeGreaterThan(Number(menuTime));
  await page.getByRole("button", { name: "重新整理茶席" }).click();
  for (const field of ["water", "leaves", "seconds", "spilled", "cup"])
    await expect(board).toHaveAttribute(`data-${field}`, "0");
  await expect(board).toHaveAttribute("data-step", "select");
  await prepareLeaves(page);
  await pour(page, "kettle", 68);
  await drag(page, l.lid, l.pot);
  await pour(page, "pot", 28);
  await page.getByRole("button", { name: "將茶遞給她", exact: true }).click();
  const completion = page.getByRole("dialog", {
    name: "把這一杯，放到她面前。",
  });
  await expect(completion.locator("video")).toHaveCount(0);
  await expect(completion.getByText("靜態製茶畫面")).toBeVisible();
  await expect(
    completion.getByRole("button", { name: "繼續故事", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("region", { name: "故事對話" })).toBeVisible();
});

test("infusion changes with time and survives a paused offline reload", async ({
  page,
  context,
}, info) => {
  await page.goto("/");
  await page.getByRole("button", { name: "開始故事", exact: true }).click();
  await until(page, "翻開今晚的第一頁");
  await page.getByRole("button", { name: /翻開今晚的第一頁/ }).click();
  await until(page, "先替她拉開椅子");
  await page.getByRole("button", { name: /先替她拉開椅子/ }).click();
  await until(page, "茶罐：桂花烏龍");
  await prepareLeaves(page, info.project.name === "mobile", 1);
  await pour(page, "kettle", 68, info.project.name === "mobile");
  const { layout } = await geometry(page);
  await drag(page, layout.lid, layout.pot, info.project.name === "mobile");
  const board = page.locator(".tea-board");
  await expect
    .poll(async () => Number(await board.getAttribute("data-seconds")))
    .toBeGreaterThan(9);
  await page.getByRole("button", { name: "沙漏：開始或暫停浸泡" }).click();
  const before = await board.getAttribute("data-liquor-color");
  const seconds = await board.getAttribute("data-seconds");
  await page.waitForTimeout(300);
  await expect(board).toHaveAttribute("data-liquor-color", before!);
  await flush(page);
  await page.evaluate(() =>
    navigator.serviceWorker.ready.then(() => undefined),
  );
  await context.setOffline(true);
  await page.reload();
  await expect(board).toHaveAttribute("data-seconds", seconds!);
  await expect(board).toHaveAttribute("data-liquor-color", before!);
  await page.getByRole("button", { name: "沙漏：開始或暫停浸泡" }).click();
  await expect
    .poll(async () => Number(await board.getAttribute("data-seconds")))
    .toBeGreaterThan(Number(seconds) + 10);
  await page.getByRole("button", { name: "沙漏：開始或暫停浸泡" }).click();
  expect(await board.getAttribute("data-liquor-color")).not.toBe(before);
  await page.screenshot({
    path: `output/tea-infusion-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "重新整理茶席" }).click();
  await expect(board).toHaveAttribute("data-liquor-color", "#dae1d8");
});
