import { expect, test } from "@playwright/test";
import { collectPageErrors } from "./page-errors";
import { prepareOpening } from "./opening-helpers";

test("audio starts after interaction and saved controls apply on reload", async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const state = window as Window & { __audioStarts?: number };
    state.__audioStarts = 0;
    const original = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args) {
      if ((this.buffer?.duration ?? 0) > 5)
        state.__audioStarts = (state.__audioStarts ?? 0) + 1;
      return original.apply(this, args);
    };
  });
  await page.goto("/");
  expect(
    await page.evaluate(
      () => (window as Window & { __audioStarts?: number }).__audioStarts,
    ),
  ).toBe(0);
  await page.getByRole("button", { name: "開始故事", exact: true }).click();
  await prepareOpening(page);
  await expect(page.getByRole("region", { name: "故事對話" })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as Window & { __audioStarts?: number }).__audioStarts ?? 0,
      ),
    )
    .toBeGreaterThan(0);
  await page.getByRole("button", { name: "開啟遊戲選單" }).click();
  await page.getByRole("link", { name: "閱讀設定" }).click();
  await page.getByRole("switch", { name: /全部靜音/ }).check();
  const music = page.getByRole("slider", { name: /背景音樂/ });
  await music.click({ position: { x: 125, y: 15 } });
  const savedVolume = await music.inputValue();
  expect(savedVolume).not.toBe("25");
  await expect(music.locator("..").locator("output")).toHaveText(
    `${savedVolume}%`,
  );
  await page.screenshot({
    path: `output/audio-settings-${info.project.name}.png`,
    fullPage: true,
  });
  await page.reload();
  await expect(page.getByRole("switch", { name: /全部靜音/ })).toBeChecked();
  await expect(music).toHaveValue(savedVolume);
});

test("missing audio files do not block the story", async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: "block" });
  const page = await context.newPage();
  const errors: string[] = [];
  collectPageErrors(page, errors);
  await page.route("**/audio/**", (route) => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "開始故事", exact: true }).click();
  await prepareOpening(page);
  await expect(page.getByRole("region", { name: "故事對話" })).toBeVisible();
  await page.getByRole("button", { name: "顯示全文" }).click();
  await page.getByRole("button", { name: "繼續", exact: true }).click();
  await expect(page.locator(".dialogue-text")).toHaveAttribute(
    "data-full-text",
    /林澄/,
  );
  expect(errors).toEqual([]);
  await context.close();
});
