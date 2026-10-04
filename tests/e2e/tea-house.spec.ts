import { expect, test, type Page } from "@playwright/test";
import { collectPageErrors } from "./page-errors";
import { newTea } from "../../src/types/game";
import { newTeaHouseProgress } from "../../src/types/teaHouse";
import { drag, geometry, pour, prepareLeaves } from "./tea-helpers";

async function seedTeaHouse(page: Page, value: unknown) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "夜行書店", exact: true })).toBeVisible();
  await page.evaluate(async (progress) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction("preferences", "readwrite");
        tx.objectStore("preferences").put({ id: "tea-house", value: progress });
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => reject(tx.error);
      };
    });
  }, value);
}

/** Put the stove on its strongest fire until the kettle reaches the cup's heat. */
async function boil(page: Page, target: number) {
  const board = page.locator(".tea-board");
  await page.getByRole("group", { name: "爐火火力" }).getByRole("button", { name: "武火" }).click();
  await expect(board).toHaveAttribute("data-fire", "3");
  await expect
    .poll(async () => Number(await board.getAttribute("data-kettle-temp")), { timeout: 30000, intervals: [100] })
    .toBeGreaterThanOrEqual(target + 1);
}

/** Lid on, lift the pot inside the hourglass's gold window, pour and serve. */
async function steepAndServe(page: Page, touch: boolean) {
  const { layout: l } = await geometry(page);
  const board = page.locator(".tea-board");
  await drag(page, l.lid, l.pot, touch);
  await expect(board).toHaveAttribute("data-step", "steep");
  const [start] = (await board.getAttribute("data-window"))!.split(",").map(Number);
  await expect
    .poll(async () => Number(await board.getAttribute("data-seconds")), { timeout: 60000, intervals: [100] })
    .toBeGreaterThanOrEqual(start! + 1);
  await pour(page, "pot", 28, touch);
  await page.getByRole("button", { name: /^奉茶給/ }).click();
  const result = page.locator(".serve-result");
  await expect(result).toBeVisible();
  return result;
}

test("a tea house night: read orders, brew, discover a recipe and close the shop", async ({ page }, info) => {
  const touch = info.project.name.endsWith("mobile");
  const errors: string[] = [];
  collectPageErrors(page, errors);
  await seedTeaHouse(page, {
    ...newTeaHouseProgress(),
    stars: 8,
    served: 3,
    session: {
      kind: "night",
      date: null,
      seed: 1,
      orders: ["guest:nurse", "guest:guard", "guest:traveler", "guest:barista", "guest:vendor"],
      index: 3,
      results: [
        { orderId: "guest:nurse", score: 96, stars: 3, recipeId: null },
        { orderId: "guest:guard", score: 81, stars: 2, recipeId: null },
        { orderId: "guest:traveler", score: 92, stars: 3, recipeId: null },
      ],
      draft: newTea(),
      startedAt: new Date().toISOString(),
    },
  });
  await page.goto("/#/tea");
  const ticket = page.getByRole("article", { name: /第 4 位客人：下班的咖啡師/ });
  await expect(ticket).toContainText("焙火香");
  await expect(page.getByRole("img", { name: /客人期望：焙香濃一點/ })).toBeVisible();

  // Fourth guest: roasted but not heavy — plain hojicha, water boiled to 95°C.
  await prepareLeaves(page, touch, 7);
  await expect(page.getByRole("region", { name: "完成度" })).toContainText("份量");
  await boil(page, 95);
  await expect(page.getByRole("region", { name: "爐火與水溫" })).toContainText(/連珠|魚眼/);
  await pour(page, "kettle", 68, touch);
  await expect.poll(async () => Number(await page.locator(".tea-board").getAttribute("data-water"))).toBeGreaterThan(60);
  await page.screenshot({ path: `output/tea-house-service-${info.project.name}.png`, animations: "disabled", fullPage: true });
  const first = await steepAndServe(page, touch);
  expect(Number(await first.getAttribute("data-stars"))).toBeGreaterThanOrEqual(2);
  await expect(first.getByRole("heading", { level: 2 })).toHaveText(/月下神品|溫潤上品/);
  await expect(first).toContainText("焙香濃一點");
  await expect(first.getByRole("list", { name: "完成度" }).getByRole("listitem")).toHaveCount(7);
  await page.screenshot({ path: `output/tea-house-result-${info.project.name}.png`, animations: "disabled" });
  await first.getByRole("button", { name: "迎接下一位客人" }).click();
  // The table clears for the next guest without a reload.
  await expect(page.locator(".tea-board")).toHaveAttribute("data-step", "select");
  await expect(page.locator(".tea-board")).toHaveAttribute("data-kettle-temp", "45");

  // The night is saved between guests.
  const vendor = page.getByRole("article", { name: /第 5 位客人：收攤的夜市阿姨/ });
  await expect(vendor).toBeVisible();
  await page.reload();
  await expect(vendor).toBeVisible();
  await expect(page.getByRole("list", { name: "今晚的客人" }).getByRole("listitem")).toHaveCount(5);
  await expect(page.getByRole("listitem", { name: /第 4 位：[23] 顆星/ })).toBeVisible();

  // Fifth guest: sweet and roasted — salted caramel melts in the pot, a named recipe.
  await prepareLeaves(page, touch, 7);
  await page.getByRole("button", { name: "加入海鹽焦糖" }).click();
  await expect(page.locator(".tea-board")).toHaveAttribute("data-ingredients", "caramel@pot");
  await expect(page.getByText("這個組合似乎有名字")).toBeVisible();
  await boil(page, 95);
  await pour(page, "kettle", 68, touch);
  const second = await steepAndServe(page, touch);
  await expect(second.locator(".serve-recipe.fresh")).toContainText("燈塔焦糖焙");
  await second.getByRole("button", { name: "看今晚的成績" }).click();

  const summary = page.getByRole("region", { name: "今晚打烊了。" });
  await expect(summary).toBeVisible();
  await expect(summary.getByRole("listitem")).toHaveCount(5);
  await summary.getByRole("button", { name: "複製成績" }).click();
  await expect(summary.locator(".night-share")).toContainText("夜行書店・午夜茶席");
  await page.screenshot({ path: `output/tea-house-summary-${info.project.name}.png`, animations: "disabled", fullPage: true });
  await summary.getByRole("button", { name: "回到茶席入口" }).click();

  await expect(page.getByRole("heading", { name: "午夜茶席", level: 1 })).toBeVisible();
  await expect(page.locator('[data-recipe="lighthouse-caramel"]')).not.toHaveClass(/locked/);
  await expect(page.locator('[data-recipe="lighthouse-caramel"]')).toContainText("炭焙焙茶 ＋ 海鹽焦糖");
  await expect(page.locator(".recipe-book-heading")).toContainText("特調 1／20");
  expect(errors).toEqual([]);
});

test("the title opens the tea house, a daily ticket and a free table", async ({ page }, info) => {
  const errors: string[] = [];
  collectPageErrors(page, errors);
  await page.goto("/");
  await page.getByRole("link", { name: "午夜茶席" }).click();
  await expect(page.getByRole("heading", { name: "午夜茶席", level: 1 })).toBeVisible();
  await expect(page.locator(".recipe-card.locked")).toHaveCount(20);
  await page.screenshot({ path: `output/tea-house-lobby-${info.project.name}.png`, animations: "disabled", fullPage: true });
  await page.getByRole("button", { name: "開始今日茶單" }).click();
  await expect(page.getByRole("article", { name: /第 1 位客人/ })).toBeVisible();
  await expect(page.getByRole("list", { name: "客人的口味期望" })).toBeVisible();
  await expect(page.locator(".shelf-jar .tea-prop-3d")).toHaveCount(8);
  // The stove cycles its fire; cold water will not pour.
  const stove = page.getByRole("button", { name: /^風爐/ });
  await stove.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".tea-board")).toHaveAttribute("data-fire", "1");
  await expect(page.getByRole("region", { name: "爐火與水溫" }).getByRole("button", { name: "文火" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "加入蜂蜜" })).toBeDisabled();
  await expect(page.getByRole("list", { name: "第一次營業" })).toBeVisible();
  await page.getByRole("button", { name: "結束今晚" }).click();
  const confirm = page.getByRole("dialog", { name: "提早結束今晚？" });
  await confirm.getByRole("button", { name: "繼續奉茶" }).click();
  await expect(page.getByRole("article", { name: /第 1 位客人/ })).toBeVisible();
  await page.getByRole("button", { name: "結束今晚" }).click();
  await confirm.getByRole("button", { name: "結束營業" }).click();
  await expect(page.getByRole("button", { name: "開始今日茶單" })).toBeVisible();
  await page.getByRole("button", { name: "獨自泡茶" }).click();
  await expect(page.getByRole("heading", { name: "自由茶席" })).toBeVisible();
  await expect(page.getByRole("button", { name: "品嚐這一杯" })).toBeDisabled();
  await page.getByRole("button", { name: "茶譜" }).click();
  await expect(page.getByRole("dialog", { name: "茶譜" })).toBeVisible();
  await page.getByRole("button", { name: "回到茶席" }).click();
  await page.getByRole("button", { name: "離開茶席" }).click();
  await expect(page.getByRole("button", { name: "獨自泡茶" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("the tea house also runs as its own page without the story engine", async ({ page, request }, info) => {
  const errors: string[] = [];
  collectPageErrors(page, errors);
  await page.goto("/tea.html");
  await expect(page).toHaveTitle("午夜茶席 · The Midnight Tea Table");
  await expect(page.getByRole("heading", { name: "午夜茶席", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "回到門前" })).toHaveCount(0);
  const sound = page.getByRole("button", { name: /聲音：/ });
  await sound.click();
  await expect(sound).toHaveText(/聲音：關/);
  await page.getByRole("button", { name: "獨自泡茶" }).click();
  await expect(page.locator(".shelf-jar .tea-prop-3d")).toHaveCount(8);
  await page.screenshot({ path: `output/tea-house-standalone-${info.project.name}.png`, animations: "disabled" });
  // The bookshop's entry script (with the story engine) and story files never load here.
  const bookshop = await (await request.get("/")).text();
  const storyEntry = bookshop.match(/<script type="module" crossorigin src="([^"]+)"/)![1]!;
  const loaded = await page.evaluate(() => performance.getEntriesByType("resource").map((entry) => new URL(entry.name).pathname));
  expect(loaded).not.toContain(storyEntry);
  expect(loaded.some((path) => path.includes("/story/compiled/"))).toBe(false);
  expect(errors).toEqual([]);
});
