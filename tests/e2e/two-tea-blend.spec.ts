import { readFileSync } from "node:fs";
import { collectPageErrors } from "./page-errors";
import { expect, test } from "@playwright/test";
import { StoryBridge } from "../../src/story/storyBridge";
import { newLetter, newOpening, newTea, snapshotSchema, STORY_VERSION } from "../../src/types/game";
import { drag, geometry, pour, steepAndServe } from "./tea-helpers";

function atTea() {
  const story = new StoryBridge(readFileSync("public/story/compiled/main.json", "utf8"));
  story.next();
  for (let step = 0; step < 100; step++) {
    if (story.frame.mode === "tea") return snapshotSchema.parse({
      version: 1, storyVersion: STORY_VERSION, inkState: story.serialize(), frame: story.frame,
      tea: newTea(), letter: newLetter(), opening: { ...newOpening(), complete: true },
    });
    if (story.frame.canContinue) story.next();
    else story.choose(story.frame.choices[0]!.index);
  }
  throw new Error("Tea scene was not reached");
}

test("two teas can be measured, saved, poured, and acknowledged", async ({ page }, info) => {
  const touch = info.project.name.endsWith("mobile");
  const errors: string[] = [];
  collectPageErrors(page, errors);
  await page.goto("/");
  await page.getByRole("link", { name: "設定" }).click();
  await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
  await page.getByRole("switch", { name: /減少動態效果/ }).check();
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
  }, atTea());
  await page.goto("/");
  await page.getByRole("button", { name: "繼續故事" }).click();
  const { layout: l } = await geometry(page);
  await drag(page, l.jarSlot(0), l.jar, touch);
  await drag(page, { x: l.jar.x, y: l.jar.y - 43 }, { x: l.jar.x + 100, y: l.jar.y + 10 }, touch);
  await expect(page.locator(".tea-board")).toHaveAttribute("data-jar-open", "true");
  for (let i = 0; i < 2; i++) {
    await drag(page, l.spoon, l.jar, touch);
    await drag(page, l.spoon, l.pot, touch);
  }
  await expect(page.locator(".tea-board")).toHaveAttribute("data-leaves", "2");
  await drag(page, l.jarSlot(1), l.blendJar, touch);
  await expect(page.locator(".tea-board")).toHaveAttribute("data-blend-tea", "puer");
  await drag(page, { x: l.blendJar.x, y: l.blendJar.y - 43 }, { x: l.blendJar.x + 100, y: l.blendJar.y + 10 }, touch);
  await expect(page.locator(".tea-board")).toHaveAttribute("data-blend-jar-open", "true");
  await drag(page, l.spoon, l.blendJar, touch);
  await drag(page, l.spoon, l.pot, touch);
  await expect(page.locator(".tea-board")).toHaveAttribute("data-leaves", "2");
  await expect(page.locator(".tea-board")).toHaveAttribute("data-blend-leaves", "1");
  await expect(page.getByText("桂花烏龍 2，熟普洱 1")).toBeVisible();
  await expect.poll(() => page.evaluate(async () => {
    return await new Promise<boolean>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("saves", "readonly");
        const rows = tx.objectStore("saves").getAll();
        rows.onsuccess = () => { db.close(); resolve(rows.result.some((row) => row.snapshot?.tea?.blendTeaId === "puer" && row.snapshot?.tea?.blendLeaves === 1)); };
        rows.onerror = () => reject(rows.error);
      };
    });
  })).toBe(true);
  await page.screenshot({ path: `output/two-tea-blend-${info.project.name}.png`, animations: "disabled", fullPage: true });
  await page.reload();
  await expect(page.locator(".tea-board")).toHaveAttribute("data-blend-leaves", "1");
  await pour(page, "kettle", 68, touch);
  await steepAndServe(page, touch);
  await page.screenshot({ path: `output/two-tea-completion-${info.project.name}.png`, animations: "disabled" });
  await page.getByRole("button", { name: "繼續故事" }).click();
  await expect(page.locator(".brew-summary")).toContainText("2 匙桂花烏龍與 1 匙熟普洱");
  await expect(page.locator(".dialogue-text")).not.toBeEmpty();
  await page.screenshot({ path: `output/two-tea-response-${info.project.name}.png`, animations: "disabled" });
  expect(errors).toEqual([]);
});
