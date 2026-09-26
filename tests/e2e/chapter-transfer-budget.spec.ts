import { expect, test } from "@playwright/test";
import { chapterImages, chapterImageCacheName } from "../../src/services/chapterAssetPack";
import { nightName, playableChapters } from "../../src/data/catalog";

test.use({ serviceWorkers: "block" });

const completedEndings = [
  "moonlight",
  "boyan-rest",
  "ruoyin-one",
  "yenuan-share",
  "yuhang-today",
  "haiming-light",
];
const chapterBudget = 8 * 1024 * 1024;

for (const [index, chapter] of playableChapters.entries()) {
  test(`${nightName(chapter)} first chapter visit stays within the resource budget`, async ({ page }) => {
    await page.goto("/");
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
    }, completedEndings.slice(0, index));
    await page.reload();
    await page.goto("/#/chapters");
    const start = page.getByRole("button", { name: `翻開${nightName(chapter)}` });
    await expect(start).toBeVisible();
    await page.evaluate(() => performance.clearResourceTimings());
    await start.click();
    await expect(page.getByRole("region", { name: "每晚開店準備" })).toBeVisible();
    await expect.poll(() => page.evaluate(async ({ cacheName, urls }) => {
      if (urls.length === 0) return true;
      const cache = await caches.open(cacheName);
      const entries = await Promise.all(urls.map((url) => cache.match(url)));
      return entries.every(Boolean);
    }, { cacheName: chapterImageCacheName, urls: [...chapterImages[chapter]] })).toBe(true);
    await expect.poll(() => page.locator(".scene-art img").evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);

    const resources = await page.evaluate(() =>
      performance.getEntriesByType("resource")
        .map((entry) => entry as PerformanceResourceTiming)
        .filter((entry) => entry.name.startsWith(location.origin))
        .map((entry) => ({
          path: new URL(entry.name).pathname,
          transferBytes: entry.transferSize,
          bodyBytes: entry.decodedBodySize,
        })),
    );
    const transferred = resources.reduce((sum, entry) => sum + entry.transferBytes, 0);
    const body = resources.reduce((sum, entry) => sum + entry.bodyBytes, 0);
    expect(resources.length).toBeGreaterThan(0);
    expect(transferred).toBeGreaterThan(0);
    expect(body).toBeGreaterThan(0);
    for (const url of chapterImages[chapter])
      expect(resources.some((entry) => entry.path === url), `${url} should be included in the measured first visit`).toBe(true);
    expect(body).toBeLessThanOrEqual(chapterBudget);
    console.log(`${nightName(chapter)}: ${resources.length} requests, ${(transferred / 1024).toFixed(1)} KiB transferred, ${(body / 1024).toFixed(1)} KiB resource bodies`);
  });
}
