import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { StoryBridge } from "../../src/story/storyBridge";
import { newLetter, newTea, snapshotSchema, type StoryVersion } from "../../src/types/game";
import { smallTargets } from "./touch-target-helpers";

const cases = [
  { name: "通知", version: "boyan-chapter-16", mode: "notifications", selector: ".notification-panel", action: ".notification-card button" },
  { name: "旋律", version: "ruoyin-chapter-15", mode: "melody", selector: ".melody-panel", action: ".melody-key" },
  { name: "爐火", version: "yenuan-chapter-13", mode: "hearth", selector: ".hearth-panel", action: ".hearth-actions button" },
  { name: "投遞", version: "yuhang-chapter-15", mode: "route", selector: ".route-panel", action: ".route-actions button" },
  { name: "守燈", version: "haiming-chapter-20", mode: "lamp", selector: ".lamp-panel", action: ".lamp-actions button" },
  { name: "地圖", version: "lincheng-chapter-16", mode: "archive", selector: ".archive-panel", action: ".archive-record" },
] as const;

function atMode(version: StoryVersion, target: (typeof cases)[number]["mode"]) {
  const story = new StoryBridge(readFileSync(`public/story/compiled/${version}.json`, "utf8"));
  story.next();
  for (let step = 0; step < 650; step++) {
    const frame = story.frame;
    if (frame.mode === target)
      return snapshotSchema.parse({
        version: 1,
        storyVersion: version,
        inkState: story.serialize(),
        frame,
        tea: { ...newTea(), teaId: "osmanthus", step: "serve", leaves: 3, water: 70, temperature: 90, seconds: 45 },
        letter: newLetter(),
      });
    if (frame.mode === "tea") story.finishTea({ teaId: "osmanthus", quality: 90, emotionalMatch: 100 });
    else if (frame.mode === "letter") story.finishLetter({ completion: 100, understood: true });
    else if (frame.mode === "melody") story.finishMelody(true);
    else if (frame.mode === "hearth") story.finishHearth({ heat: 50, care: 3, balanced: true });
    else if (frame.mode === "route") story.finishRoute({ correct: 3, detours: 0 });
    else if (frame.mode === "lamp") story.finishLamp({ brightness: 50, steady: 3, balanced: true });
    else if (frame.mode === "archive") story.finishArchive({ count: 6, complete: true });
    else if (frame.mode === "notifications") story.finishNotifications({ allPaused: true, repliedMother: true });
    else if (frame.canContinue) story.next();
    else story.choose(frame.choices[0]!.index);
  }
  throw new Error(`${version} did not reach ${target}`);
}

for (const scenario of cases) {
  test(`mobile ${scenario.name} controls meet the target size`, async ({ page }, info) => {
    test.skip(info.project.name !== "mobile");
    const origin = process.env.PLAYWRIGHT_BASE_URL ?? "";
    await page.goto(`${origin}/`);
    await page.evaluate(async (snapshot) => {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("night-bookshop");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction("saves", "readwrite");
          tx.objectStore("saves").put({ id: "auto-1", kind: "auto", updatedAt: new Date().toISOString(), snapshot });
          tx.oncomplete = () => { db.close(); resolve(); };
          tx.onerror = () => reject(tx.error);
        };
      });
    }, atMode(scenario.version, scenario.mode));
    await page.goto(`${origin}/`);
    await page.getByRole("button", { name: "繼續故事" }).click();
    await expect(page.locator(scenario.selector)).toBeVisible();
    expect(await smallTargets(page), `${scenario.name} initial controls`).toEqual([]);
    await page.locator(scenario.action).first().click();
    expect(await smallTargets(page), `${scenario.name} active controls`).toEqual([]);
    await page.screenshot({ path: `output/touch-${scenario.mode}-mobile.png`, animations: "disabled", fullPage: true });
  });
}
