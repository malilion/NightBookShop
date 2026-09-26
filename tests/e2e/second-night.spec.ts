import { test, expect, type Page } from "@playwright/test";
import { prepareLeaves, pour, steepAndServe } from "./tea-helpers";
import { prepareOpening } from "./opening-helpers";

async function advanceTo(page: Page, selector: string, max = 180) {
  for (let step = 0; step < max; step++) {
    if (await page.locator(selector).isVisible()) return;
    const reveal = page.getByRole("button", { name: "顯示全文" });
    const next = page.getByRole("button", { name: "繼續", exact: true });
    if (await reveal.isVisible()) await reveal.click();
    else if (await next.isVisible()) await next.click();
    else if (await page.locator(".dialogue-choices button").first().isVisible())
      await page.locator(".dialogue-choices button").first().click();
    else throw new Error(`Cannot advance to ${selector}`);
  }
  throw new Error(`Story did not reach ${selector}`);
}

async function inspectMemoryObjects(page: Page, section: string, labels: string[]) {
  const overlay = `.memory-evidence-${section}`;
  await advanceTo(page, overlay);
  for (const label of labels) {
    await page.getByRole("button", { name: `探索物件：${label}` }).click();
    await advanceTo(page, overlay);
    await expect(page.getByRole("button", { name: `探索物件：${label}` })).toHaveCount(0);
  }
  await expect(page.locator(`${overlay} .memory-object-seen`)).toHaveCount(3);
}

test("second night can be brewed, assembled, completed and resumed", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  // A completed first-night bookmark is the precondition for this chapter test.
  await page.evaluate(async () => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("collection", "readwrite");
        tx.objectStore("collection").put({
          id: "moonlight",
          unlockedAt: new Date().toISOString(),
        });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  });
  await page.getByRole("link", { name: "設定" }).click();
  await page
    .getByRole("combobox", { name: /對話文字速度/ })
    .selectOption("instant");
  await page.getByRole("switch", { name: /減少動態效果/ }).check();
  await page.reload();
  await page.goto("/#/chapters");
  await page.getByRole("button", { name: "翻開第二夜" }).click();
  await prepareOpening(page);
  await expect(page.locator(".scene-caption small")).toHaveText(
    "第二夜 · 許柏言",
  );
  const portrait = page.locator(".character-portrait");
  await expect(portrait).toBeVisible();
  await expect.poll(() => portrait.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await page.screenshot({ path: `output/second-night-portrait-${info.project.name}.png`, animations: "disabled" });
  await advanceTo(page, ".tea-board");
  const touch = info.project.name === "mobile";
  await prepareLeaves(page, touch, 5);
  await page.getByRole("button", { name: "加入一小匙蜂蜜" }).click();
  await expect(page.getByRole("button", { name: /已加入蜂蜜/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.getByRole("button", { name: /已加入蜂蜜/ })).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({ path: `output/second-night-honey-tea-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await pour(page, "kettle", 68, touch);
  await steepAndServe(page, touch, "他");
  await page.getByRole("button", { name: /繼續故事/ }).click();
  await advanceTo(page, '.scene-art img[src*="memory-office.webp"]');
  await expect(page.locator(".scene-art")).toHaveCount(1);
  if (touch) await expect(page.locator('.scene-art source[srcset*="memory-office-mobile.webp"]')).toHaveCount(1);
  await page.screenshot({ path: `output/second-night-office-${info.project.name}.png`, animations: "disabled" });
  await advanceTo(page, ".memory-evidence-office");
  await page.screenshot({ path: `output/second-night-office-objects-${info.project.name}.png`, animations: "disabled" });
  await inspectMemoryObjects(page, "office", ["識別證便條", "第一版辭職信", "工作排程"]);
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator(".memory-evidence-office .memory-object-seen")).toHaveCount(3);
  await page.getByRole("button", { name: "收好鍵盤下的信紙，走向候診區" }).click();
  await advanceTo(page, '.scene-art img[src*="memory-clinic.webp"]');
  await expect(page.locator(".scene-art")).toHaveCount(1);
  await expect.poll(() => page.locator('.scene-art img[src*="memory-clinic.webp"]').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  if (touch) await expect(page.locator('.scene-art source[srcset*="memory-clinic-mobile.webp"]')).toHaveCount(1);
  await page.screenshot({ path: `output/second-night-clinic-${info.project.name}.png`, animations: "disabled" });
  await inspectMemoryObjects(page, "clinic", ["檢查單", "胃藥袋", "過號的號碼牌"]);
  await page.getByRole("button", { name: "把第三封信攤平，走向列車" }).click();
  await advanceTo(page, '.scene-art img[src*="memory-train.webp"]');
  await expect(page.locator(".scene-art")).toHaveCount(1);
  await expect.poll(() => page.locator('.scene-art img[src*="memory-train.webp"]').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  if (touch) await expect(page.locator('.scene-art source[srcset*="memory-train-mobile.webp"]')).toHaveCount(1);
  await page.screenshot({ path: `output/second-night-train-${info.project.name}.png`, animations: "disabled" });
  await inspectMemoryObjects(page, "train", ["工作通知", "舊草稿日期", "列車路線圖"]);
  await page.getByRole("button", { name: "拾起車窗旁的信紙，回到書店" }).click();
  await advanceTo(page, ".notification-panel");
  await expect(page.getByRole("button", { name: "收起手機，看向車窗" })).toBeDisabled();
  await page.getByRole("button", { name: "暫停主管提醒" }).click();
  await page.getByRole("button", { name: "暫停同事訊息" }).click();
  await expect(page.locator(".notification-panel")).toContainText("已暫停 2／3 則工作通知");
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator(".notification-panel")).toContainText("已暫停 2／3 則工作通知");
  await expect(page.getByRole("group", { name: "母親的私人訊息" })).toBeVisible();
  await page.getByRole("button", { name: "回覆：明天先去看醫生" }).click();
  await page.getByRole("button", { name: "暫停系統通知" }).click();
  await page.screenshot({ path: `output/second-night-notifications-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "收起手機，看向車窗" }).click();
  await advanceTo(page, ".dialogue-choices");
  const ownFirstLine = page.getByRole("button", { name: "先問柏言最想讓對方知道的現況" });
  await expect(ownFirstLine).toBeVisible();
  await expect(page.getByRole("button", { name: "先照舊清單排好交接，再請他核對" })).toBeVisible();
  await page.screenshot({ path: `output/second-night-first-line-${info.project.name}.png`, animations: "disabled" });
  await ownFirstLine.click();
  await advanceTo(page, ".letter-panel");
  await expect(page.locator(".letter-slot")).toHaveCount(4);
  await page.screenshot({
    path: `output/second-night-letter-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.reload();
  await expect(page.locator(".letter-slot")).toHaveCount(4);
  for (const [index, line] of [
    "我目前無法維持原來的工作量。",
    "看診與休息以前，我不能再接臨時工作。",
    "現有資料已交接，其餘安排需團隊一起決定。",
    "等身體狀況清楚，再決定接下來怎麼工作。",
  ].entries()) {
    await page.getByRole("button", { name: line, exact: true }).click();
    await page
      .getByRole("button", { name: `信紙第 ${index + 1} 格，空白` })
      .click();
  }
  await page.getByRole("button", { name: "查看三版草稿" }).click();
  await page.getByRole("button", { name: "把信交還給他" }).click();
  await advanceTo(page, ".dialogue-choices");
  await page.getByRole("button", { name: /先陪他安排就醫和請假/ }).click();
  await advanceTo(page, ".ending-panel");
  await expect(
    page.getByRole("heading", { name: "明日可以晚一點" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /守夜手記/ }).click();
  await expect(page.getByRole("heading", { name: "柏言母親保存的校刊" })).toBeVisible();
  await page.getByRole("button", { name: "關閉手記" }).click();
  await page.screenshot({
    path: `output/second-night-ending-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.goto("/#/collection");
  await expect(
    page.getByRole("heading", { name: "明日可以晚一點" }),
  ).toBeVisible();
  await expect(page.getByText("柏言的洋甘菊蜂蜜茶")).toBeVisible();
  expect(errors).toEqual([]);
});
