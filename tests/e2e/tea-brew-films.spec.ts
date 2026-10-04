import { readFileSync } from "node:fs";
import { collectPageErrors } from "./page-errors";
import { expect, test, type Page } from "@playwright/test";
import { teaInfusion } from "../../src/services/teaInfusion";
import { StoryBridge } from "../../src/story/storyBridge";
import {
  newLetter,
  newOpening,
  newTea,
  snapshotSchema,
  STORY_VERSION,
  type TeaDraft,
} from "../../src/types/game";

// A first-night save that stops at the tea table with a cup already poured.
function atTea(tea: Partial<TeaDraft>) {
  const story = new StoryBridge(readFileSync("public/story/compiled/main.json", "utf8"));
  story.next();
  for (let step = 0; step < 600; step++) {
    if (story.frame.mode === "tea") {
      const draft = { ...newTea(), leaves: 3, water: 70, temperature: 90, seconds: 45, step: "serve" as const, cupWater: 60, ...tea };
      return {
        draft,
        snapshot: snapshotSchema.parse({
          version: 1,
          storyVersion: STORY_VERSION,
          inkState: story.serialize(),
          frame: story.frame,
          tea: draft,
          letter: newLetter(),
          opening: { ...newOpening(), complete: true },
        }),
      };
    }
    if (story.frame.canContinue) story.next();
    else story.choose(story.frame.choices[0]!.index);
  }
  throw new Error("The first-night tea was not reached");
}

async function serve(page: Page, snapshot: unknown, reducedMotion = false) {
  await page.goto("/");
  await page.getByRole("link", { name: "設定" }).click();
  await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
  if (reducedMotion) await page.getByRole("switch", { name: /減少動態效果/ }).check();
  await page.evaluate(async (saved) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("saves", "readwrite");
        tx.objectStore("saves").put({ id: "auto-1", kind: "auto", updatedAt: new Date().toISOString(), snapshot: saved });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, snapshot);
  await page.goto("/");
  await page.getByRole("button", { name: "繼續故事" }).click();
  await page.getByRole("button", { name: "將茶遞給她", exact: true }).click();
  const completion = page.getByRole("dialog", { name: "把這一杯，放到她面前。" });
  await expect(completion).toBeVisible();
  return completion;
}

test("the brew film follows the tea that leads the cup, tinted by this brew", async ({ page }, info) => {
  const errors: string[] = [];
  collectPageErrors(page, errors);
  // One spoon of osmanthus and two of pu'er: the story and the film follow pu'er.
  const { draft, snapshot } = atTea({ teaId: "osmanthus", leaves: 1, blendTeaId: "puer", blendLeaves: 2 });
  const completion = await serve(page, snapshot);
  const film = completion.locator(".tea-film");
  await expect(film).toHaveAttribute("data-tea", "puer");
  const video = completion.locator("video");
  // Prevent mobile software decoding from finishing the short clip while the
  // browser assertions inspect dimensions, duration and per-frame tinting.
  await video.evaluate((v) => (v as HTMLVideoElement).pause());
  await expect(video).toHaveJSProperty("videoWidth", 1280);
  await expect(video).toHaveJSProperty("loop", false);
  expect(await video.evaluate((v) => Math.round((v as HTMLVideoElement).duration))).toBe(10);
  await completion.getByRole("button", { name: "暫停動畫" }).click();
  const tint = completion.locator(".film-liquor-layer [data-liquor-color]");
  await expect(tint).toHaveAttribute("data-liquor-color", teaInfusion(draft).color);
  const layer = completion.locator(".film-liquor-layer");
  const current = completion.locator('.film-shots [aria-current="step"]');
  // Scoop and infuse have no cup on screen; pour and serve are tinted.
  for (const [seconds, frame, shot, tinted] of [
    [3, 90, "注水", 0],
    [6, 180, "倒茶", 1],
    [9, 270, "奉茶", 1],
  ] as const) {
    await video.evaluate((v, time) => {
      (v as HTMLVideoElement).currentTime = time;
    }, seconds);
    await expect.poll(async () => Math.abs(Number(await layer.getAttribute("data-frame")) - frame)).toBeLessThanOrEqual(1);
    await expect(current).toHaveText(shot);
    await expect(layer.locator("svg")).toHaveCount(tinted);
  }
  await page.screenshot({ path: `output/tea-brew-film-${info.project.name}.png`, animations: "disabled" });
  await completion.getByRole("button", { name: "略過動畫，繼續故事" }).click();
  await expect(completion).not.toBeVisible();
  await expect(page.getByRole("region", { name: "故事對話" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("the brew film's soundtrack plays in step with the film", async ({ page }) => {
  // Record the long buffers Howler starts and stops: the 10-second soundtrack.
  await page.addInitScript(() => {
    const state = window as Window & { __film?: { starts: number[]; stops: number } };
    state.__film = { starts: [], stops: 0 };
    const start = AudioBufferSourceNode.prototype.start;
    const stop = AudioBufferSourceNode.prototype.stop;
    AudioBufferSourceNode.prototype.start = function (when?: number, offset?: number, duration?: number) {
      if (Math.round(this.buffer?.duration ?? 0) === 10) state.__film!.starts.push(offset ?? 0);
      return start.call(this, when, offset, duration);
    };
    AudioBufferSourceNode.prototype.stop = function (when?: number) {
      if (Math.round(this.buffer?.duration ?? 0) === 10) state.__film!.stops++;
      return stop.call(this, when);
    };
  });
  const soundtrack = page.waitForRequest(/\/video\/tea\/brew-jasmine-v1\.(ogg|mp3)$/);
  const { snapshot } = atTea({ teaId: "jasmine" });
  const completion = await serve(page, snapshot);
  await soundtrack;
  const film = () => page.evaluate(() => (window as Window & { __film?: { starts: number[]; stops: number } }).__film!);
  await expect.poll(async () => (await film()).starts.length).toBeGreaterThan(0);
  // The track starts where the picture is, not from its own beginning each time.
  const video = completion.locator("video");
  await completion.getByRole("button", { name: "暫停動畫" }).click();
  await expect.poll(async () => (await film()).stops).toBeGreaterThan(0);
  const paused = await video.evaluate((v) => (v as HTMLVideoElement).currentTime);
  const startsBefore = (await film()).starts.length;
  await completion.getByRole("button", { name: "播放動畫" }).click();
  await expect.poll(async () => (await film()).starts.length).toBeGreaterThan(startsBefore);
  expect(Math.abs((await film()).starts.at(-1)! - paused)).toBeLessThan(0.35);
  await completion.getByRole("button", { name: "略過動畫，繼續故事" }).click();
  await expect(completion).not.toBeVisible();
});

test("reduced motion shows the same tea's served cup, still tinted", async ({ page }, info) => {
  const { draft, snapshot } = atTea({ teaId: "chamomile", seconds: 30 });
  const soundtracks: string[] = [];
  page.on("request", (request) => {
    if (/\/video\/tea\/.*\.(ogg|mp3)$/.test(request.url())) soundtracks.push(request.url());
  });
  const completion = await serve(page, snapshot, true);
  await expect(completion.locator("video")).toHaveCount(0);
  // The still has no soundtrack to load.
  expect(soundtracks).toEqual([]);
  await expect(completion.locator(".tea-film img")).toHaveAttribute("src", "/video/tea/brew-chamomile-v1-still.webp");
  await expect(completion.getByText("靜態製茶畫面")).toBeVisible();
  const layer = completion.locator(".film-liquor-layer");
  await expect(layer).toHaveAttribute("data-frame", "299");
  await expect(layer.locator("[data-liquor-color]")).toHaveAttribute("data-liquor-color", teaInfusion(draft).color);
  await expect(layer.locator("svg")).toHaveCount(1);
  await page.screenshot({ path: `output/tea-brew-still-${info.project.name}.png`, animations: "disabled" });
  await completion.getByRole("button", { name: "繼續故事", exact: true }).click();
  await expect(page.getByRole("region", { name: "故事對話" })).toBeVisible();
});

// Each garnish the story counts has its own film; its still shows it on the saucer.
for (const { tea, garnish } of [
  { tea: "hojicha", garnish: "apple" },
  { tea: "hojicha", garnish: "caramel" },
  { tea: "mint", garnish: "lemon" },
  { tea: "chamomile", garnish: "honey" },
] as const) {
  test(`serving ${tea} with ${garnish} selects its garnish film and still`, async ({ page }) => {
    const { snapshot } = atTea({ teaId: tea, garnish });
    const completion = await serve(page, snapshot, true);
    await expect(completion.locator(".tea-film")).toHaveAttribute("data-garnish", garnish);
    await expect(completion.locator(".tea-film img")).toHaveAttribute("src", `/video/tea/brew-${tea}-${garnish}-v1-still.webp`);
    await expect(completion.locator(".film-liquor-layer")).toHaveAttribute("data-frame", "299");
    await completion.getByRole("button", { name: "繼續故事", exact: true }).click();
    await expect(page.getByRole("region", { name: "故事對話" })).toBeVisible();
  });
}

test("a garnish that a blend outweighs plays the leading tea's own film", async ({ page }) => {
  // Lemon in mint, but two spoons of black tea lead the cup: the story drops the lemon.
  const { snapshot } = atTea({ teaId: "mint", leaves: 1, garnish: "lemon", blendTeaId: "black", blendLeaves: 2 });
  const completion = await serve(page, snapshot, true);
  await expect(completion.locator(".tea-film")).toHaveAttribute("data-garnish", "none");
  await expect(completion.locator(".tea-film img")).toHaveAttribute("src", "/video/tea/brew-black-v1-still.webp");
});

test.describe("without a service worker", () => {
  // page.route 攔不到 Service Worker 從預快取送出的影片；不封鎖時，影片是否「載入失敗」取決於 SW 何時接管頁面。
  test.use({ serviceWorkers: "block" });
  test("a film that cannot load never holds the story back", async ({ page }) => {
    await page.route("**/video/**", (route) => route.abort());
    const { snapshot } = atTea({ teaId: "jasmine", temperature: 80, seconds: 30 });
    const completion = await serve(page, snapshot);
    await expect(completion.getByText("影片暫時無法播放，仍可繼續故事。")).toBeVisible();
    await completion.getByRole("button", { name: "略過動畫，繼續故事" }).click();
    await expect(page.getByRole("region", { name: "故事對話" })).toBeVisible();
  });
});
