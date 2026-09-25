import { expect, test } from "@playwright/test";
import { prepareOpening } from "./opening-helpers";

test("dialogue speed persists, reveals before advancing, and respects reduced motion", async ({
  page,
}, info) => {
  await page.goto("/#/settings");
  const speed = page.getByLabel("對話文字速度");
  await speed.selectOption("slow");
  await expect
    .poll(async () =>
      page.evaluate(async () => {
        const request = indexedDB.open("night-bookshop");
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        const value = await new Promise<unknown>((resolve, reject) => {
          const read = db
            .transaction("preferences")
            .objectStore("preferences")
            .get("settings");
          read.onsuccess = () => resolve(read.result?.value?.textSpeed);
          read.onerror = () => reject(read.error);
        });
        db.close();
        return value;
      }),
    )
    .toBe("slow");
  await page.reload();
  await expect(speed).toHaveValue("slow");
  await page.screenshot({
    path: `output/settings-speed-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("link", { name: "回到門前" }).click();
  await page.getByRole("button", { name: "開始故事", exact: true }).click();
  await prepareOpening(page);
  const dialogue = page.locator(".dialogue-text");
  const full = (await dialogue.getAttribute("data-full-text"))!;
  expect(full.length).toBeGreaterThan(20);
  await expect(page.getByRole("button", { name: "顯示全文" })).toBeVisible();
  expect((await dialogue.textContent())!.length).toBeLessThan(full.length);
  await page.reload();
  await expect(dialogue).toHaveAttribute("data-full-text", full);
  await page.getByRole("button", { name: "顯示全文" }).click();
  await expect(dialogue).toHaveText(full);
  await expect(
    page.getByRole("button", { name: "繼續", exact: true }),
  ).toBeVisible();
  await page.locator("#main").focus();
  await page.keyboard.press("Enter");
  await expect(dialogue).not.toHaveAttribute("data-full-text", full);
  const secondFull = (await dialogue.getAttribute("data-full-text"))!;
  await page.locator("#main").focus();
  await page.keyboard.press("Enter");
  await expect(dialogue).toHaveText(secondFull);
  await page.goto("/#/settings");
  await page.getByRole("switch", { name: /減少動態效果/ }).check();
  await page.goto("/#/game");
  const nextFull = (await dialogue.getAttribute("data-full-text"))!;
  await expect(dialogue).toHaveText(nextFull);
  await expect(page.getByRole("button", { name: "顯示全文" })).toHaveCount(0);
});

test("older reading preferences gain the standard speed without losing their switches", async ({
  page,
}) => {
  await page.goto("/#/settings");
  await page.evaluate(async () => {
    const request = indexedDB.open("night-bookshop");
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("preferences", "readwrite");
      transaction.objectStore("preferences").put({
        id: "settings",
        value: { largeText: true, reducedMotion: false },
      });
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    db.close();
  });
  await page.reload();
  await expect(
    page.getByRole("switch", { name: /放大故事文字/ }),
  ).toBeChecked();
  await expect(
    page.getByRole("switch", { name: /減少動態效果/ }),
  ).not.toBeChecked();
  await expect(page.getByLabel("對話文字速度")).toHaveValue("normal");
});
