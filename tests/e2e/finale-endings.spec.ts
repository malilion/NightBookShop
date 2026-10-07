import { readFileSync } from "node:fs";
import { collectPageErrors } from "./page-errors";
import { expect, test } from "@playwright/test";
import { StoryBridge } from "../../src/story/storyBridge";
import {
  newHearth,
  newLamp,
  newLetter,
  newMelody,
  newOpening,
  newRoute,
  newTea,
  snapshotSchema,
  type GameSnapshot,
} from "../../src/types/game";

const storyJson = readFileSync("public/story/compiled/lincheng-chapter-21.json", "utf8");
const endings = [
  { id: "lincheng-keeper", choice: "自願成為下一任守夜人", title: "下一任守夜人", fullLetter: true },
  { id: "lincheng-shelf", choice: "讓信暫留書架", title: "留在書架上的信", fullLetter: false },
] as const;

function beforeFinalChoice(choice: string, fullLetter: boolean): GameSnapshot {
  const story = new StoryBridge(storyJson);
  story.next();
  for (let step = 0; step < 320; step++) {
    const frame = story.frame;
    if (frame.mode === "dialogue" && frame.choices.some((item) => item.text.includes(choice))) {
      return snapshotSchema.parse({
        version: 1,
        storyVersion: "lincheng-chapter-21",
        inkState: story.serialize(),
        frame,
        tea: { ...newTea(), step: "serve", leaves: 3, water: 70, seconds: 45 },
        letter: { ...newLetter(), slots: fullLetter ? ["kept", "afraid", "two-wishes", "embrace"] : ["kept", "afraid", null, null], angles: [0, 0, 0, 0], flipped: [false, false, false, false], inspected: true },
        melody: newMelody(),
        hearth: newHearth(),
        route: newRoute(),
        lamp: newLamp(),
        archive: { inspected: ["jinglan", "boyan", "ruoyin", "yenuan", "yuhang", "haiming"] },
        opening: { ...newOpening(), complete: true },
      });
    }
    if (frame.mode === "tea") story.finishTea({ teaId: "osmanthus", quality: 90, emotionalMatch: 100 });
    else if (frame.mode === "archive") story.finishArchive({ complete: true, count: 6 });
    else if (frame.mode === "letter") story.finishLetter({ completion: fullLetter ? 100 : 50, understood: fullLetter });
    else if (frame.canContinue) story.next();
    else story.choose(frame.choices[0]!.index);
  }
  throw new Error(`Finale choice was not reached: ${choice}`);
}

for (const ending of endings) {
  test(`${ending.id} appears in the browser and collection`, async ({ page }, info) => {
    const errors: string[] = [];
    collectPageErrors(page, errors);
    await page.goto("/");
    await page.getByRole("link", { name: "設定" }).click();
    await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
    await page.getByRole("switch", { name: /減少動態效果/ }).check();
    const snapshot = beforeFinalChoice(ending.choice, ending.fullLetter);
    await page.evaluate(async (data) => {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("night-bookshop");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction("saves", "readwrite");
          transaction.objectStore("saves").put({ id: "auto-1", kind: "auto", updatedAt: new Date().toISOString(), snapshot: data });
          transaction.oncomplete = () => { db.close(); resolve(); };
          transaction.onerror = () => reject(transaction.error);
        };
      });
    }, snapshot);
    await page.goto("/");
    await page.getByRole("button", { name: "繼續故事" }).click();
    const choice = page.getByRole("button", { name: new RegExp(ending.choice) });
    await expect(choice).toBeVisible();
    await choice.click();
    for (let step = 0; step < 30; step++) {
      if (await page.locator(".ending-panel").isVisible()) break;
      const reveal = page.getByRole("button", { name: "顯示全文" });
      const next = page.getByRole("button", { name: "繼續", exact: true });
      const followup = page.locator(".dialogue-choices button").first();
      if (await reveal.isVisible()) await reveal.click({ timeout: 2_000 }).catch(() => undefined);
      else if (await next.isVisible()) await next.click();
      else if (await followup.isVisible()) await followup.click();
      else throw new Error(`${ending.id} stalled after final choice`);
    }
    await expect(page.locator(".ending-panel")).toBeVisible();
    await expect(page.getByRole("heading", { name: ending.title })).toBeVisible();
    await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
    await page.screenshot({ path: `output/${ending.id}-ending-${info.project.name}.png`, fullPage: true, animations: "disabled" });
    await page.goto("/#/collection");
    await expect(page.getByRole("heading", { name: ending.title })).toBeVisible();
    expect(errors).toEqual([]);
  });
}
