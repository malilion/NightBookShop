import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { StoryBridge } from "../../src/story/storyBridge";
import {
  newArchive,
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

const storyJson = readFileSync("public/story/compiled/yuhang-chapter-18.json", "utf8");

function beforeRoute(): GameSnapshot {
  const story = new StoryBridge(storyJson);
  story.next();
  for (let step = 0; step < 100; step++) {
    const frame = story.frame;
    if (frame.mode === "route")
      return snapshotSchema.parse({
        version: 1,
        storyVersion: "yuhang-chapter-18",
        inkState: story.serialize(),
        frame,
        tea: { ...newTea(), teaId: "mint", garnish: "lemon", blackTea: 20, step: "serve", leaves: 3, water: 70, seconds: 30 },
        letter: newLetter(),
        melody: newMelody(),
        hearth: newHearth(),
        route: newRoute(),
        lamp: newLamp(),
        archive: newArchive(),
        opening: { ...newOpening(), complete: true },
      });
    if (frame.mode === "tea") story.finishTea({ teaId: "mint", garnish: "lemon", blackTea: 20, quality: 100, emotionalMatch: 100 });
    else if (frame.canContinue) story.next();
    else story.choose(frame.choices[0]!.index);
  }
  throw new Error("Fifth night route was not reached");
}

test("wrong fifth-night addresses show distinct possible lives and survive reload", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
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
  }, beforeRoute());
  await page.goto("/");
  await page.getByRole("button", { name: "繼續故事" }).click();
  await expect(page.locator(".route-panel")).toBeVisible();

  await page.getByRole("button", { name: "夜行書店門外" }).click();
  await expect(page.locator(".route-log")).toContainText("他若在這道門前為自己停下");
  await expect(page.getByRole("button", { name: "夜行書店門外" })).toBeDisabled();
  await page.getByRole("button", { name: "已拆除的老郵局" }).click();
  await expect(page.locator(".route-log")).toContainText("妹妹的明信片收進防水套");
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator(".route-panel")).toContainText("已選 2/3");
  await expect(page.locator(".route-log li")).toHaveCount(2);

  await page.getByRole("button", { name: "末班公車站" }).click();
  await expect(page.locator(".route-log li")).toHaveCount(3);
  await expect(page.locator(".route-log")).toContainText("海邊車票就能在那個冬天被用掉");
  await expect(page.locator(".route-panel")).toContainText("找到 0 條地址線索");
  await page.screenshot({ path: `output/fifth-night-detours-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "帶著信回到書店" }).click();
  await expect(page.locator(".route-panel")).toHaveCount(0);
  expect(errors).toEqual([]);
});
