import { expect, test, type Page } from "@playwright/test";
import { endings } from "../../src/data/catalog";

async function collect(page: Page, ids: string[]) {
  await page.evaluate(async (endingIds) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("collection", "readwrite");
        for (const id of endingIds)
          tx.objectStore("collection").put({ id, unlockedAt: new Date().toISOString() });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, ids);
  await page.reload();
}

test("collection reveals each chapter's recap and earned afterword without spoiling missing pages", async ({ page }, info) => {
  await page.goto("/#/collection");
  await expect(page.getByRole("heading", { name: "七夜回顧" })).toBeVisible();
  await expect(page.locator(".archive-card")).toHaveCount(7);
  await expect(page.locator(".bookmark-shelf-row li")).toHaveCount(28);
  await expect(page.locator(".bookmark-slot-locked")).toHaveCount(28);
  await expect(page.getByText("信封背面印著夜行書店五十年前的地址；書店理應從未固定存在。")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "尚未點亮的徽章" })).toHaveCount(4);

  await collect(page, ["recipient"]);
  await expect(page.getByText("信封背面印著夜行書店五十年前的地址；書店理應從未固定存在。")).toBeVisible();
  await expect(page.getByText("靜蘭的桂花烏龍")).toBeVisible();
  await expect(page.locator(".bookmark-slot-locked")).toHaveCount(27);
  await expect(page.locator(".archive-card").first()).toContainText("後日談仍是一張缺頁");
  await expect(page.getByRole("heading", { name: "第一封留下的信" })).toBeVisible();
  await page.locator(".bookmark-shelf").screenshot({ path: `output/collection-shelf-${info.project.name}.png` });
  await page.locator(".archive-card").first().screenshot({ path: `output/collection-recap-${info.project.name}.png` });

  await collect(page, ["moonlight"]);
  await page.getByText("閱讀後日談 · 一張還沒寫的明信片").click();
  await expect(page.getByText("過了幾個星期，靜蘭把一張空白明信片留在櫃台。她說，這次要等自己真的想寫了，才把它填滿。")).toBeVisible();

  await collect(page, Object.keys(endings));
  await expect(page.locator(".archive-afterword")).toHaveCount(7);
  await expect(page.locator(".bookmark-slot-locked")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "每一頁都讀過" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "讓他們自己決定" })).toBeVisible();
  await page.locator(".achievement-grid").screenshot({ path: `output/collection-achievements-${info.project.name}.png` });
});
