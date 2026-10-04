import { readFileSync } from "node:fs";
import { setOffline } from "./offline-helpers";
import { expect, test } from "@playwright/test";
import { StoryBridge } from "../../src/story/storyBridge";
import { newLetter, newTea, snapshotSchema } from "../../src/types/game";

test("upgrading preserves a previously cached story for offline saved games", async ({ page, context }) => {
  const version = "ruoyin-chapter-8";
  const archived = readFileSync(`public/story/compiled/${version}.json`, "utf8");
  const story = new StoryBridge(archived);
  story.next();
  const snapshot = snapshotSchema.parse({
    version: 1,
    storyVersion: version,
    inkState: story.serialize(),
    frame: story.frame,
    tea: newTea(),
    letter: newLetter(),
  });

  // The manifest document has the same origin without running the app's SW registration.
  await page.goto("/manifest.webmanifest");
  await page.evaluate(async (json) => {
    const oldPrecache = await caches.open("workbox-precache-v2-previous-release");
    await oldPrecache.put(
      "/story/compiled/ruoyin-chapter-8.json?__WB_REVISION__=previous",
      new Response(json, { status: 200, headers: { "content-type": "application/json" } }),
    );
    // Install the new worker from this document: WebKit's test browser drops a
    // large cache entry written here once the page navigates away.
    const registration = await navigator.serviceWorker.register("/sw.js");
    const worker = registration.installing ?? registration.waiting ?? registration.active!;
    if (worker.state !== "activated")
      await new Promise<void>((resolve) =>
        worker.addEventListener("statechange", () => worker.state === "activated" && resolve()),
      );
  }, archived);

  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.evaluate(async (data) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("saves", "readwrite");
        tx.objectStore("saves").put({ id: "auto-1", kind: "auto", updatedAt: new Date().toISOString(), snapshot: data });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, snapshot);
  await expect.poll(() => page.evaluate(async () => {
    const cache = await caches.open("night-bookshop-stories-v1");
    return !!(await cache.match("/story/compiled/ruoyin-chapter-8.json"));
  })).toBe(true);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  await setOffline(context, true);
  await page.getByRole("button", { name: "繼續故事" }).click();
  await expect(page.locator(".dialogue-text")).toContainText("一點三十六分");
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await setOffline(context, false);
});
