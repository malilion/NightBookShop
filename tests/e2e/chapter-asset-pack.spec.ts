import { expect, test, type Page } from "@playwright/test";

async function unlock(page: Page, ids: string[]) {
  await page.goto("/");
  await page.evaluate(async (endingIds) => {
    await navigator.serviceWorker.ready;
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
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
}

async function expectImagesCached(page: Page, urls: string[]) {
  await expect.poll(() => page.evaluate(async (paths) => {
    const cache = await caches.open("night-bookshop-chapter-images-v1");
    const matches = await Promise.all(paths.map((url) => cache.match(url)));
    return matches.every(Boolean);
  }, urls)).toBe(true);
}

async function expectStoryCached(page: Page, version: string) {
  await expect.poll(() => page.evaluate(async (storyVersion) => {
    const cache = await caches.open("night-bookshop-stories-v1");
    return !!(await cache.match(`/story/compiled/${storyVersion}.json`));
  }, version)).toBe(true);
}

test("starting a later chapter makes its unvisited memories available offline", async ({ page, context }) => {
  await unlock(page, ["moonlight", "boyan-rest", "ruoyin-one", "yenuan-share", "yuhang-today"]);
  await page.goto("/#/chapters");
  await page.getByRole("button", { name: "翻開第六夜" }).click();
  await expectStoryCached(page, "haiming-chapter-13");

  const chapterImages = [
    "/images/characters/haiming.webp",
    "/images/characters/haiming-searching.webp",
    "/images/characters/haiming-warm.webp",
    "/images/characters/yuhang.webp",
    "/images/characters/owner.webp",
    "/images/characters/lincheng-child.webp",
    ...["lighthouse", "summer-visit", "last-watch"].flatMap((scene) => [
      `/images/memory-${scene}.webp`,
      `/images/memory-${scene}-mobile.webp`,
    ]),
    "/images/memory-white-room-v2.webp",
    "/images/memory-white-room-v2-mobile.webp",
  ];
  await expectImagesCached(page, chapterImages);

  await context.setOffline(true);
  const offlineImage = await page.evaluate(async (url) => {
    const response = await fetch(url);
    return { ok: response.ok, type: response.headers.get("content-type"), bytes: (await response.blob()).size };
  }, "/images/memory-white-room-v2-mobile.webp");
  expect(offlineImage.ok).toBe(true);
  expect(offlineImage.type).toContain("image/webp");
  expect(offlineImage.bytes).toBeGreaterThan(0);
  await page.reload();
  await expect(page.getByRole("region", { name: "每晚開店準備" })).toContainText("第六夜");
  await context.setOffline(false);
});

test("second-night clinic and train load from the chapter pack offline", async ({ page, context }) => {
  await unlock(page, ["moonlight"]);
  await page.goto("/#/chapters");
  await page.getByRole("button", { name: "翻開第二夜" }).click();
  await expectStoryCached(page, "boyan-chapter-12");
  await expectImagesCached(page, [
    "/images/characters/boyan.webp",
    ...["office", "clinic", "train"].flatMap((scene) => [
      `/images/memory-${scene}.webp`,
      `/images/memory-${scene}-mobile.webp`,
    ]),
  ]);
  await context.setOffline(true);
  const response = await page.evaluate(async () => {
    const image = await fetch("/images/memory-train-mobile.webp");
    return { ok: image.ok, bytes: (await image.blob()).size };
  });
  expect(response.ok).toBe(true);
  expect(response.bytes).toBeGreaterThan(0);
  await page.reload();
  await expect(page.getByRole("region", { name: "每晚開店準備" })).toContainText("第二夜");
  await context.setOffline(false);
});

test("third-night memories load from the chapter pack offline", async ({ page, context }) => {
  await unlock(page, ["moonlight", "boyan-rest"]);
  await page.goto("/#/chapters");
  await page.getByRole("button", { name: "翻開第三夜" }).click();
  await expectStoryCached(page, "ruoyin-chapter-10");
  await expectImagesCached(page, [
    "/images/characters/ruoyin.webp",
    ...["practice-room", "backstage", "banquet", "grandstage"].flatMap((scene) => [
      `/images/memory-${scene}.webp`,
      `/images/memory-${scene}-mobile.webp`,
    ]),
  ]);
  await context.setOffline(true);
  const response = await page.evaluate(async () => {
    const image = await fetch("/images/memory-grandstage-mobile.webp");
    return { ok: image.ok, bytes: (await image.blob()).size };
  });
  expect(response.ok).toBe(true);
  expect(response.bytes).toBeGreaterThan(0);
  await page.reload();
  await expect(page.getByRole("region", { name: "每晚開店準備" })).toContainText("第三夜");
  await context.setOffline(false);
});

test("fourth-night memories load from the chapter pack offline", async ({ page, context }) => {
  await unlock(page, ["moonlight", "boyan-rest", "ruoyin-one"]);
  await page.goto("/#/chapters");
  await page.getByRole("button", { name: "翻開第四夜" }).click();
  await expectStoryCached(page, "yenuan-chapter-9");
  await expectImagesCached(page, [
    "/images/characters/yenuan.webp",
    ...["bakery", "anniversary", "hospital-return", "old-oven"].flatMap((scene) => [
      `/images/memory-${scene}.webp`,
      `/images/memory-${scene}-mobile.webp`,
    ]),
  ]);
  await context.setOffline(true);
  const response = await page.evaluate(async () => {
    const image = await fetch("/images/memory-old-oven-mobile.webp");
    return { ok: image.ok, bytes: (await image.blob()).size };
  });
  expect(response.ok).toBe(true);
  expect(response.bytes).toBeGreaterThan(0);
  await page.reload();
  await expect(page.getByRole("region", { name: "每晚開店準備" })).toContainText("第四夜");
  await context.setOffline(false);
});

test("fifth-night memories load from the chapter pack offline", async ({ page, context }) => {
  await unlock(page, ["moonlight", "boyan-rest", "ruoyin-one", "yenuan-share"]);
  await page.goto("/#/chapters");
  await page.getByRole("button", { name: "翻開第五夜" }).click();
  await expectStoryCached(page, "yuhang-chapter-10");
  await expectImagesCached(page, [
    "/images/characters/yuhang.webp",
    ...["post-office", "last-bus", "empty-shop", "bookshop-door"].flatMap((scene) => [
      `/images/memory-${scene}.webp`,
      `/images/memory-${scene}-mobile.webp`,
    ]),
  ]);
  await context.setOffline(true);
  const response = await page.evaluate(async () => {
    const image = await fetch("/images/memory-bookshop-door-mobile.webp");
    return { ok: image.ok, bytes: (await image.blob()).size };
  });
  expect(response.ok).toBe(true);
  expect(response.bytes).toBeGreaterThan(0);
  await page.reload();
  await expect(page.getByRole("region", { name: "每晚開店準備" })).toContainText("第五夜");
  await context.setOffline(false);
});

test("finale childhood home loads from the chapter pack offline", async ({ page, context }) => {
  await unlock(page, ["moonlight", "boyan-rest", "ruoyin-one", "yenuan-share", "yuhang-today", "haiming-light"]);
  await page.goto("/#/chapters");
  await page.getByRole("button", { name: "翻開終章" }).click();
  await expectStoryCached(page, "lincheng-chapter-11");
  await expectImagesCached(page, [
    "/images/characters/owner.webp",
    "/images/characters/lincheng-child.webp",
    ...["hidden-room", "child-home", "child-bookshop"].flatMap((scene) => [
      `/images/memory-${scene}.webp`,
      `/images/memory-${scene}-mobile.webp`,
    ]),
  ]);
  await context.setOffline(true);
  const response = await page.evaluate(async () => {
    const image = await fetch("/images/memory-child-home-mobile.webp");
    return { ok: image.ok, bytes: (await image.blob()).size };
  });
  expect(response.ok).toBe(true);
  expect(response.bytes).toBeGreaterThan(0);
  await page.reload();
  await expect(page.getByRole("region", { name: "每晚開店準備" })).toContainText("終章");
  await context.setOffline(false);
});
