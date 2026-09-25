import { test, expect } from "@playwright/test";
import { prepareOpening } from "./opening-helpers";

const visitors = [
  { chapter: "第二夜", id: "boyan" },
  { chapter: "第三夜", id: "ruoyin" },
  { chapter: "第四夜", id: "yenuan" },
  { chapter: "第五夜", id: "yuhang" },
  { chapter: "第六夜", id: "haiming" },
] as const;

for (const visitor of visitors) {
  test(`${visitor.chapter} shows ${visitor.id} as a transparent portrait`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.evaluate(async () => {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("night-bookshop");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction("collection", "readwrite");
          for (const id of ["moonlight", "boyan-rest", "ruoyin-one", "yenuan-share", "yuhang-today"])
            transaction.objectStore("collection").put({ id, unlockedAt: new Date().toISOString() });
          transaction.oncomplete = () => { db.close(); resolve(); };
          transaction.onerror = () => reject(transaction.error);
        };
      });
    });
    await page.reload();
    await page.goto("/#/chapters");
    if (visitor.id === "boyan")
      await page.screenshot({ path: `output/chapter-portraits-${info.project.name}.png`, fullPage: true, animations: "disabled" });
    const chapterButton = page.getByRole("button", { name: `翻開${visitor.chapter}` });
    await expect(chapterButton.locator("..").locator(".chapter-art-portrait")).toHaveAttribute("src", `/images/characters/${visitor.id}.webp`);
    await chapterButton.click();
    await prepareOpening(page);
    const portrait = page.locator(".character-portrait");
    await expect(portrait).toBeVisible();
    await expect(portrait).toHaveAttribute("src", `/images/characters/${visitor.id}.webp`);
    await expect.poll(() => portrait.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    await expect(page.locator(".dialogue-panel")).toBeVisible();
    const dialogueText = page.locator(".dialogue-text");
    const fullText = await dialogueText.getAttribute("data-full-text");
    const revealButton = page.getByRole("button", { name: "顯示全文" });
    if (await revealButton.isVisible()) await revealButton.click();
    await expect(dialogueText.locator("span")).toHaveText(fullText ?? "");
    await page.screenshot({ path: `output/${visitor.id}-portrait-${info.project.name}.png`, animations: "disabled" });
    expect(errors).toEqual([]);
  });
}
