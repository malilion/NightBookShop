import { test, expect, type Page } from "@playwright/test";
import { prepareLeaves, pour, steepAndServe } from "./tea-helpers";
import { prepareOpening } from "./opening-helpers";

async function advanceUntil(page: Page, target: string, max = 250) {
  for (let step = 0; step < max; step++) {
    if (await page.locator(target).isVisible()) return;
    const reveal = page.getByRole("button", { name: "顯示全文" });
    const next = page.getByRole("button", { name: "繼續", exact: true });
    if (await reveal.isVisible()) await reveal.click();
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
  await page.screenshot({ path: `output/fourth-night-${scene}-${project}.png`, animations: "disabled" });
}

test("fourth night saves hearth, reads both recipe sides, and reaches Yenuan's new bread", async ({ page }, info) => {
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
        for (const id of ["moonlight", "boyan-rest", "ruoyin-one"])
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
  await expect(page.getByRole("heading", { name: "閱讀的步調" })).toBeVisible();
  await page.goto("/#/chapters");
  await page.getByRole("button", { name: "翻開第四夜" }).click();
  await prepareOpening(page);
  await expect(page.locator(".scene-caption small")).toHaveText("第四夜 · 葉暖");
  await advanceUntil(page, ".tea-board");
  const touch = info.project.name === "mobile";
  await prepareLeaves(page, touch, 7);
  await page.getByRole("button", { name: "加入一片蘋果乾" }).click();
  await expect(page.getByRole("button", { name: /已加入蘋果乾/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.getByRole("button", { name: /已加入蘋果乾/ })).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({ path: `output/fourth-night-apple-tea-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await pour(page, "kettle", 68, touch);
  await steepAndServe(page, touch, "她");
  await page.getByRole("button", { name: /繼續故事/ }).click();
  await advanceUntil(page, ".hearth-panel");
  await page.getByRole("button", { name: "陪她等一口氣" }).click();
  await page.getByRole("button", { name: "問她願不願意接著說" }).click();
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator(".hearth-panel")).toContainText("談話 2/3");
  await page.getByRole("button", { name: "陪她等一口氣" }).click();
  await page.screenshot({ path: `output/fourth-night-hearth-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "讓她繼續說" }).click();
  await advanceUntil(page, '.scene-art img[src*="memory-bakery.webp"]');
  await expect(page.locator(".scene-art")).toHaveCount(1);
  if (touch) await expect(page.locator('.scene-art source[srcset*="memory-bakery-mobile.webp"]')).toHaveCount(1);
  await page.screenshot({ path: `output/fourth-night-bakery-${info.project.name}.png`, animations: "disabled" });
  await advanceUntil(page, ".memory-evidence-dawn-kitchen");
  await page.screenshot({ path: `output/fourth-night-bakery-objects-${info.project.name}.png`, animations: "disabled" });
  await inspectMemoryObjects(page, "dawn-kitchen", ["第一顆麵包", "代送郵戳", "兩只茶杯"]);
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator(".memory-evidence-dawn-kitchen .memory-object-seen")).toHaveCount(3);
  await page.getByRole("button", { name: "從麵粉袋下收起第一片食譜" }).click();
  const dawnReflection = await untilChoice(page, "問她第一次想把晨麥留給誰");
  await page.screenshot({ path: `output/fourth-night-dawn-reflection-${info.project.name}.png`, animations: "disabled" });
  await dawnReflection.click();
  await expectMemoryBackground(page, "anniversary", info.project.name);
  await advanceUntil(page, ".memory-evidence-anniversary");
  await page.getByRole("button", { name: "探索物件：週年招牌" }).click();
  await untilChoice(page, "問她滿座以外，最想讓母親看見什麼");
  await page.screenshot({ path: `output/fourth-night-anniversary-reflection-${info.project.name}.png`, animations: "disabled" });
  await page.reload();
  await (await untilChoice(page, "問她滿座以外，最想讓母親看見什麼")).click();
  await advanceUntil(page, ".memory-evidence-anniversary");
  await expect(page.getByRole("button", { name: "探索物件：週年招牌" })).toHaveCount(0);
  await inspectMemoryObjects(page, "anniversary", ["未接來電", "活動帳本"]);
  await page.getByRole("button", { name: "收起活動傳單裡的第二片紙" }).click();
  await (await untilChoice(page, "問她當晚最不敢承認")).click();
  await expectMemoryBackground(page, "hospital-return", info.project.name);
  await inspectMemoryObjects(page, "hospital-return", ["母親的語音", "掛號紙", "麵包紙袋"]);
  await page.getByRole("button", { name: "帶著尚未回答的問題走向老烤箱" }).click();
  await (await untilChoice(page, "問她若不靠責備")).click();
  await expectMemoryBackground(page, "old-oven", info.project.name);
  await inspectMemoryObjects(page, "old-oven", ["二次發酵", "生日蠟燭", "食譜紙角"]);
  await page.getByRole("button", { name: "將第三片食譜收好，回書店" }).click();
  const ovenReflection = await untilChoice(page, "問她想保存的是母親的味道");
  await page.screenshot({ path: `output/fourth-night-oven-reflection-${info.project.name}.png`, animations: "disabled" });
  await ovenReflection.click();
  await advanceUntil(page, ".letter-panel");
  await expect(page.locator(".letter-slot")).toHaveCount(3);
  for (const [index, line] of [
    "麵粉揉至不黏手，先讓麵團安靜一會。",
    "蘋果切薄片，拌入一點肉桂。",
    "等待二次發酵，再送進烤箱。",
  ].entries()) {
    await page.getByRole("button", { name: line, exact: true }).click();
    await page.getByRole("button", { name: `信紙第 ${index + 1} 格，空白` }).click();
  }
  await page.getByRole("button", { name: /翻到背面 · 給葉暖的短箋/ }).click();
  for (const [index, line] of [
    "小暖，麵包要等，人也要。",
    "店是我們一起開始的，但妳要把它做成自己的。",
    "哪天做出不一樣的味道，記得留一口給我。",
  ].entries()) {
    await page.getByRole("button", { name: line, exact: true }).click();
    await page.getByRole("button", { name: `信紙第 ${index + 1} 格，空白` }).click();
  }
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
  await page.reload();
  await expect(page.locator(".letter-side-buttons")).toContainText("正面 3/3 · 背面 3/3");
  await page.screenshot({ path: `output/fourth-night-recipe-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "把食譜交還給她" }).click();
  await (await untilChoice(page, "問她想留下哪一口")).click();
  await (await untilChoice(page, "加入自己喜歡的柚子")).click();
  await (await untilChoice(page, "陪她烤一顆新的麵包")).click();
  await advanceUntil(page, ".ending-panel");
  await expect(page.getByRole("heading", { name: "留一口給妳" })).toBeVisible();
  await page.getByRole("button", { name: /守夜手記/ }).click();
  await expect(page.getByRole("heading", { name: "食譜卡上的月亮" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "食譜卡上的代送郵戳" })).toBeVisible();
  await page.screenshot({ path: `output/fourth-night-ending-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "關閉手記" }).click();
  await page.goto("/#/collection");
  await expect(page.getByRole("heading", { name: "留一口給妳" })).toBeVisible();
  await expect(page.getByText("葉暖的焙茶蘋果茶")).toBeVisible();
  expect(errors).toEqual([]);
});
