import { test, expect, type Page } from "@playwright/test";
import { prepareLeaves, pour, steepAndServe } from "./tea-helpers";
import { prepareOpening } from "./opening-helpers";

async function advanceUntil(page: Page, target: string, max = 260) {
  for (let step = 0; step < max; step++) {
    if (await page.locator(target).isVisible()) return;
    const reveal = page.getByRole("button", { name: "顯示全文" });
    const next = page.getByRole("button", { name: "繼續", exact: true });
    if (await reveal.isVisible()) await reveal.click({ timeout: 2_000 }).catch(() => undefined);
    else if (await next.isVisible()) await next.click();
    else if (await page.locator(".dialogue-choices button").first().isVisible())
      await page.locator(".dialogue-choices button").first().click();
    else throw new Error(`Cannot advance to ${target}`);
  }
  throw new Error(`Story did not reach ${target}`);
}
async function untilChoice(page: Page, name: string) {
  const target = page.getByRole("button", { name, exact: false });
  for (let step = 0; step < 40; step++) {
    if (await target.isVisible()) return target;
    const next = page.getByRole("button", { name: "繼續", exact: true });
    if (await next.isVisible()) await next.click();
    else throw new Error(`Choice not found: ${name}`);
  }
  throw new Error(`Choice not found: ${name}`);
}
async function inspectMemoryObjects(page: Page, section: string, labels: string[]) {
  const overlay = `.memory-evidence-${section}`;
  await advanceUntil(page, overlay);
  for (const label of labels) {
    await page.getByRole("button", { name: `探索物件：${label}` }).click();
    if (section === "old-post-office" && label === "派送簿") {
      await (await untilChoice(page, "對照代送郵戳與藍色信的收件欄")).click();
      await expect(page.locator(".dialogue-text")).toContainText("食譜卡的收件人可以選擇何時收下");
      const layout = (page.viewportSize()?.width ?? 0) < 600 ? "mobile" : "desktop";
      await page.screenshot({ path: `output/fifth-night-postmark-${layout}.png`, animations: "disabled" });
    }
    await advanceUntil(page, overlay);
    await expect(page.getByRole("button", { name: `探索物件：${label}` })).toHaveCount(0);
  }
  await expect(page.locator(`${overlay} .memory-object-seen`)).toHaveCount(3);
}
async function expectMemoryBackground(page: Page, scene: string, project: string) {
  await advanceUntil(page, `.scene-art img[src*="memory-${scene}.webp"]`);
  await expect(page.locator(".scene-art")).toHaveCount(1);
  await expect.poll(() => page.locator(`.scene-art img[src*="memory-${scene}.webp"]`).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  if (project === "mobile")
    await expect(page.locator(`.scene-art source[srcset*="memory-${scene}-mobile.webp"]`)).toHaveCount(1);
  await page.screenshot({ path: `output/fifth-night-${scene}-${project}.png`, animations: "disabled" });
}

test("fifth night restores the route and letter stamp before Yuhang signs today", async ({ page }, info) => {
  test.setTimeout(300_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("collection", "readwrite");
        for (const id of ["moonlight", "boyan-rest", "ruoyin-one", "yenuan-share"])
          tx.objectStore("collection").put({ id, unlockedAt: new Date().toISOString() });
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => reject(tx.error);
      };
    });
  });
  await page.getByRole("link", { name: "設定" }).click();
  await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
  await page.getByRole("switch", { name: /減少動態效果/ }).check();
  await page.reload();
  await page.goto("/#/chapters");
  await page.getByRole("button", { name: "翻開第五夜" }).click();
  await prepareOpening(page);
  await expect(page.locator(".scene-caption small")).toHaveText("第五夜 · 程雨航");
  await advanceUntil(page, ".tea-board");
  const touch = info.project.name === "mobile";
  await prepareLeaves(page, touch, 2);
  await page.getByRole("button", { name: "加入一片檸檬" }).click();
  await expect(page.getByRole("button", { name: /已加入檸檬片/ })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("slider", { name: "淡紅茶混合量" }).fill("20");
  await expect(page.getByRole("slider", { name: "淡紅茶混合量" })).toHaveValue("20");
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.getByRole("button", { name: /已加入檸檬片/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("slider", { name: "淡紅茶混合量" })).toHaveValue("20");
  await page.screenshot({ path: `output/fifth-night-lemon-tea-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await pour(page, "kettle", 68, touch);
  await steepAndServe(page, touch, "他");
  await page.getByRole("button", { name: /繼續故事/ }).click();
  await advanceUntil(page, ".route-panel");
  await page.getByRole("button", { name: "已拆除的老郵局" }).click();
  await page.getByRole("button", { name: "末班公車站" }).click();
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator(".route-panel")).toContainText("已選 2/3");
  await page.getByRole("button", { name: "鎖住的空店面" }).click();
  await page.screenshot({ path: `output/fifth-night-route-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "帶著信回到書店" }).click();
  await advanceUntil(page, '.scene-art img[src*="memory-post-office.webp"]');
  await expect(page.locator(".scene-art")).toHaveCount(1);
  if (touch) await expect(page.locator('.scene-art source[srcset*="memory-post-office-mobile.webp"]')).toHaveCount(1);
  await page.screenshot({ path: `output/fifth-night-post-office-${info.project.name}.png`, animations: "disabled" });
  await advanceUntil(page, ".memory-evidence-old-post-office");
  await page.screenshot({ path: `output/fifth-night-post-office-objects-${info.project.name}.png`, animations: "disabled" });
  await inspectMemoryObjects(page, "old-post-office", ["旅行書店明信片", "七年前的郵戳", "派送簿"]);
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator(".memory-evidence-old-post-office .memory-object-seen")).toHaveCount(3);
  await page.getByRole("button", { name: "從郵戳後收起第一片信紙" }).click();
  await expectMemoryBackground(page, "last-bus", info.project.name);
  await inspectMemoryObjects(page, "last-bus", ["取消的假單", "海邊車票", "末班站名"]);
  await page.getByRole("button", { name: "從假單裡收起第二片信紙" }).click();
  await expectMemoryBackground(page, "empty-shop", info.project.name);
  await inspectMemoryObjects(page, "empty-shop", ["過期租約", "未用的鑰匙", "兩個書架"]);
  await page.getByRole("button", { name: "從門縫裡收起第三片信紙" }).click();
  await expectMemoryBackground(page, "bookshop-door", info.project.name);
  await inspectMemoryObjects(page, "bookshop-door", ["燈塔照片", "簽收印章", "變動地址"]);
  await page.getByRole("button", { name: "從印章底部收起最後一片紙" }).click();
  await advanceUntil(page, ".letter-panel");
  await expect(page.locator(".letter-slot")).toHaveCount(4);
  for (const [index, line] of [
    "如果你又說明年再開始，",
    "請至少承認，你不是在等更好的時機。",
    "你只是不敢在沒有她的世界裡，",
    "完成我們一起想過的旅行書店。",
  ].entries()) {
    await page.getByRole("button", { name: line, exact: true }).click();
    await page.getByRole("button", { name: `信紙第 ${index + 1} 格，空白` }).click();
  }
  await page.getByRole("button", { name: "查看每年的墨跡" }).click();
  for (const size of await page.locator(".letter-stamps label").evaluateAll((labels) => labels.map((label) => {
    const rect = label.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }))) {
    expect(size.width).toBeGreaterThanOrEqual(44);
    expect(size.height).toBeGreaterThanOrEqual(44);
  }
  await page.getByRole("radio", { name: "現在" }).check();
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.getByRole("radio", { name: "現在" })).toBeChecked();
  await expect(page.locator(".letter-slot.filled")).toHaveCount(4);
  await page.screenshot({ path: `output/fifth-night-letter-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "把藍色信交還給他" }).click();
  await (await untilChoice(page, "替別人蓋過幾次章")).click();
  await (await untilChoice(page, "今天自己簽收")).click();
  await advanceUntil(page, '.dialogue-text[data-full-text*="和紙巾上那一枚是同一個紅色"]');
  await advanceUntil(page, ".ending-panel");
  await expect(page.getByRole("heading", { name: "今日簽收" })).toBeVisible();
  await page.getByRole("button", { name: /守夜手記/ }).click();
  await expect(page.getByRole("heading", { name: "七年後的郵戳" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "妹妹寄回的燈塔照片" })).toBeVisible();
  await page.screenshot({ path: `output/fifth-night-ending-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "關閉手記" }).click();
  await page.goto("/#/collection");
  await expect(page.getByRole("heading", { name: "今日簽收" })).toBeVisible();
  await expect(page.getByText("雨航的薄荷檸檬紅茶")).toBeVisible();
  expect(errors).toEqual([]);
});

for (const recipe of [
  { slot: 5, ingredient: "蜂蜜", garnish: "honey", heading: "雨航的洋甘菊蜂蜜茶" },
  { slot: 7, ingredient: "蘋果乾", garnish: "apple", heading: "雨航的焙茶蘋果茶" },
]) {
  test(`fifth night keeps ${recipe.ingredient} in the tea draft after reload`, async ({ page }, info) => {
    await page.goto("/");
    await page.evaluate(async () => {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("night-bookshop");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction("collection", "readwrite");
          for (const id of ["moonlight", "boyan-rest", "ruoyin-one", "yenuan-share"])
            tx.objectStore("collection").put({ id, unlockedAt: new Date().toISOString() });
          tx.oncomplete = () => { db.close(); resolve(); };
          tx.onerror = () => reject(tx.error);
        };
      });
    });
    await page.reload();
    await page.goto("/#/chapters");
    await page.getByRole("button", { name: "翻開第五夜" }).click();
    await prepareOpening(page);
    await advanceUntil(page, ".tea-board");
    await prepareLeaves(page, info.project.name === "mobile", recipe.slot);
    await expect(page.getByText(recipe.heading)).toBeVisible();
    await page.getByRole("button", { name: `加入一${recipe.ingredient === "蜂蜜" ? "小匙" : "片"}${recipe.ingredient}` }).click();
    await expect(page.getByRole("button", { name: `✓ 已加入${recipe.ingredient}` })).toHaveAttribute("aria-pressed", "true");
    await expect.poll(async () => page.evaluate(async () => {
      return await new Promise<string | undefined>((resolve, reject) => {
        const request = indexedDB.open("night-bookshop");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction("saves", "readonly");
          const read = tx.objectStore("saves").getAll();
          read.onsuccess = () => {
            const latest = (read.result as { kind: string; updatedAt: string; snapshot?: { tea?: { garnish?: string } } }[])
              .filter((save) => save.kind === "auto")
              .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
            resolve(latest?.snapshot?.tea?.garnish);
          };
          read.onerror = () => reject(read.error);
          tx.oncomplete = () => db.close();
        };
      });
    })).toBe(recipe.garnish);
    await page.reload();
    await expect(page.getByRole("button", { name: `✓ 已加入${recipe.ingredient}` })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
    await page.screenshot({ path: `output/fifth-night-${recipe.garnish}-tea-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  });
}
