import { createServer, type Server } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { prepareOpening } from "./opening-helpers";
import { appReady } from "./app-ready";

// Playwright's WebKit refuses service-worker responses while a context is set
// offline, so Safari's offline play is checked the way it fails in real life:
// this test serves dist/ itself and then shuts the server down.
const types: Record<string, string> = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".ogg": "audio/ogg",
  ".mp3": "audio/mpeg", ".webmanifest": "application/manifest+json", ".mp4": "video/mp4",
  ".webm": "video/webm", ".woff2": "font/woff2",
};
let server: Server;
let origin = "";
const up = () =>
  new Promise<void>((resolve) => {
    server = createServer(async (request, response) => {
      let path = decodeURIComponent(new URL(request.url ?? "/", "http://x").pathname);
      if (path.endsWith("/")) path += "index.html";
      try {
        const body = await readFile(join("dist", path));
        response.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream" });
        response.end(body);
      } catch {
        response.writeHead(404);
        response.end();
      }
    });
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      origin = `http://127.0.0.1:${typeof address === "object" && address ? address.port : 0}`;
      resolve();
    });
  });
const down = () =>
  new Promise<void>((resolve) => {
    server.closeAllConnections();
    server.close(() => resolve());
  });

test.skip(({ browserName }) => browserName !== "webkit", "Chromium runs check offline play with setOffline");
test.beforeEach(up);
test.afterEach(async () => {
  if (server?.listening) await down();
});

async function controlled(page: Page) {
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
}

test("Safari resumes the first night with the server gone", async ({ page }) => {
  await page.goto(`${origin}/#/settings`);
  await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
  await page.goto(`${origin}/`);
  await page.getByRole("button", { name: "開始故事", exact: true }).click();
  await prepareOpening(page);
  await expect(page.getByRole("region", { name: "故事對話" })).toBeVisible();
  await controlled(page);
  const before = await page.locator(".dialogue-text").getAttribute("data-full-text");
  await down();
  await page.reload();
  await expect(page.locator(".dialogue-text")).toHaveAttribute("data-full-text", before!);
  await page.getByRole("button", { name: "繼續", exact: true }).click();
  await expect(page.locator(".dialogue-text")).not.toHaveAttribute("data-full-text", before!);
  await expect(page.locator(".character-portrait, .scene-art img").first()).toBeVisible();
});

test("Safari keeps a later chapter's story and art after the server goes away", async ({ page }) => {
  await page.goto(`${origin}/`);
  await appReady(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("collection", "readwrite");
        tx.objectStore("collection").put({ id: "moonlight", unlockedAt: new Date().toISOString() });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  });
  await controlled(page);
  await page.goto(`${origin}/#/chapters`);
  await page.getByRole("button", { name: "翻開第二夜" }).click();
  await expect.poll(() => page.evaluate(async () => !!(await (await caches.open("night-bookshop-stories-v1")).match("/story/compiled/boyan-chapter-23.json")))).toBe(true);
  const art = ["/images/characters/boyan.webp", "/images/characters/boyan-tense.webp", "/images/memory-train-mobile.webp"];
  await expect.poll(() => page.evaluate(async (urls) => {
    const cache = await caches.open("night-bookshop-chapter-images-v1");
    return (await Promise.all(urls.map((url) => cache.match(url)))).every(Boolean);
  }, art)).toBe(true);
  await down();
  const fetched = await page.evaluate(async (urls) => Promise.all(urls.map(async (url) => {
    const response = await fetch(url);
    return response.ok && (await response.blob()).size > 0;
  })), [...art, "/story/compiled/boyan-chapter-23.json"]);
  expect(fetched).toEqual([true, true, true, true]);
  await page.reload();
  await expect(page.getByRole("region", { name: "每晚開店準備" })).toContainText("第二夜");
});
