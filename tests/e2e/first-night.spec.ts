import { test, expect, type Page } from "@playwright/test";
import { collectPageErrors } from "./page-errors";
import { setOffline } from "./offline-helpers";
import {
  prepareLeaves,
  pour,
  steepAndServe,
  geometry,
  drag,
  canTouch,
} from "./tea-helpers";
import { prepareOpening } from "./opening-helpers";
async function until(page: Page, text: string) {
  const target = page.getByRole("button", { name: text, exact: false });
  const reveal = page.getByRole("button", { name: "顯示全文" });
  for (let i = 0; i < 240;) {
    await expect(
      target.or(page.locator(".dialogue-panel button")).first(),
    ).toBeVisible();
    if (await target.isVisible()) return;
    if (await reveal.isVisible()) {
      await reveal.click({ timeout: 2_000 }).catch(() => undefined);
      continue;
    }
    await page.locator(".dialogue-panel button").first().click();
    i++;
  }
  throw new Error("Target not reached: " + text);
}
async function untilMemory(page: Page, section: string) {
  const target = page.locator(`.memory-evidence-${section}`);
  for (let step = 0; step < 240; step++) {
    if (await target.isVisible()) return;
    const reveal = page.getByRole("button", { name: "顯示全文" });
    const next = page.locator(".dialogue-panel button").first();
    await expect(next).toBeVisible();
    if (await reveal.isVisible()) await reveal.click({ timeout: 2_000 }).catch(() => undefined);
    else await next.click();
  }
  throw new Error(`Memory not reached: ${section}`);
}
async function flush(page: Page) {
  await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText(
    "進度自動保存在此瀏覽器",
  );
}
test("complete first-night loop, reload minigames, collect and restore a manual save", async ({
  page,
  context,
}, info) => {
  test.setTimeout(300_000);
  const errors: string[] = [];
  collectPageErrors(page, errors);
  // Keep this end-to-end story route bounded; animation timing is covered by
  // dedicated dialogue and tea-film tests.
  await page.goto("/#/settings");
  await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "夜行書店", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `output/title-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "開始故事", exact: true }).click();
  const opening = page.getByRole("region", { name: "每晚開店準備" });
  await expect(opening.getByRole("button", { name: "開門迎接今晚的訪客" })).toBeDisabled();
  await opening.getByRole("button", { name: /整理櫃台/ }).click();
  await opening.getByRole("button", { name: /查看夜況/ }).click();
  await flush(page);
  await page.reload();
  await expect(opening).toContainText("已準備 2/3 項");
  await expect(opening.getByRole("button", { name: /整理櫃台/ })).toHaveAttribute("aria-pressed", "true");
  await opening.getByRole("button", { name: /備好茶具/ }).click();
  await page.screenshot({ path: `output/opening-first-${info.project.name}.png`, fullPage: true, animations: "disabled" });
  await opening.getByRole("button", { name: "開門迎接今晚的訪客" }).click();
  await until(page, "翻開今晚的第一頁");
  await page.getByRole("button", { name: /翻開今晚的第一頁/ }).click();
  await until(page, "先替她拉開椅子");
  const jinglanPortrait = page.locator(".character-portrait");
  await expect(jinglanPortrait).toHaveAttribute("src", "/images/characters/jinglan.webp");
  await expect.poll(() => jinglanPortrait.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('.scene-art img[src*="jinglan-room.webp"]')).toHaveCount(1);
  if (info.project.name.endsWith("mobile"))
    await expect(page.locator('.scene-art source[srcset*="jinglan-room-mobile.webp"]')).toHaveCount(1);
  await page.screenshot({ path: `output/jinglan-portrait-${info.project.name}.png`, animations: "disabled" });
  await page.screenshot({
    path: `output/dialogue-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: /先替她拉開椅子/ }).click();
  await until(page, "問包裡那朵壓乾的白山茶");
  await page.getByRole("button", { name: "問包裡那朵壓乾的白山茶" }).click();
  await page.getByRole("button", { name: /守夜手記/ }).click();
  await expect(page.getByRole("heading", { name: "壓乾的白山茶" })).toBeVisible();
  await page.screenshot({ path: `output/jinglan-camellia-${info.project.name}.png`, animations: "disabled" });
  await page.getByRole("button", { name: "關閉手記" }).click();
  await until(page, "茶罐：桂花烏龍");
  await expect(page.locator(".shelf-jar .tea-prop-3d")).toHaveCount(8);
  await prepareLeaves(page, info.project.name.endsWith("mobile"));
  await pour(page, "kettle", 68, info.project.name.endsWith("mobile"));
  await expect(page.locator(".tea-board")).toHaveAttribute(
    "data-liquor-color",
    "#dae1d8",
  );
  await flush(page);
  const water = await page.locator(".tea-board").getAttribute("data-water");
  await page.evaluate(() =>
    navigator.serviceWorker.ready.then(() => undefined),
  );
  await setOffline(context, true);
  await page.reload();
  await expect(page.locator(".tea-board")).toHaveAttribute(
    "data-water",
    water!,
  );
  await page.screenshot({
    path: `output/tea-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  // The tea draft is restored offline; full films are downloaded on demand.
  await setOffline(context, false);
  await steepAndServe(page, info.project.name.endsWith("mobile"));
  const completion = page.getByRole("dialog", {
    name: "把這一杯，放到她面前。",
  });
  await expect(completion).toBeVisible();
  const brewedColor = await page
    .locator(".tea-board")
    .getAttribute("data-liquor-color");
  expect(brewedColor).not.toBe("#dae1d8");
  // The teapot is empty after pouring; verify the filled cup and film instead.
  await expect(
    page.locator('[data-prop-asset="cup-water"] [data-liquor-color]'),
  ).toHaveAttribute("data-liquor-color", brewedColor!);
  await expect(
    completion.locator(".film-liquor-layer [data-liquor-color]"),
  ).toHaveAttribute("data-liquor-color", brewedColor!);
  const film = completion.locator("video");
  await expect(film).toHaveJSProperty("videoWidth", 1280);
  await expect(film).toHaveJSProperty("loop", false);
  await completion.getByRole("button", { name: "暫停動畫" }).click();
  const pausedAt = await film.evaluate(
    (v) => (v as HTMLVideoElement).currentTime,
  );
  await page.waitForTimeout(250);
  expect(await film.evaluate((v) => (v as HTMLVideoElement).currentTime)).toBe(
    pausedAt,
  );
  const mask = completion.locator(".film-liquor-layer");
  const pausedFrame = await mask.getAttribute("data-frame");
  await page.waitForTimeout(150);
  await expect(mask).toHaveAttribute("data-frame", pausedFrame!);
  // Exact seek-to-mask synchronization is covered by tea-brew-films.spec.ts;
  // keep this long story route focused on pause and save restoration.
  await flush(page);
  await page.reload();
  await page.getByRole("button", { name: "將茶遞給她", exact: true }).click();
  await expect
    .poll(() => film.evaluate((v) => (v as HTMLVideoElement).currentTime))
    .toBeGreaterThan(0.2);
  await page.screenshot({
    path: `output/tea-completion-${info.project.name}.png`,
    animations: "disabled",
  });
  // The brew film runs ten seconds before the story resumes by itself.
  await expect(completion).not.toBeVisible({ timeout: 20000 });
  await until(page, "聽她說，那一晚");
  await page.getByRole("button", { name: /聽她說，那一晚/ }).click();
  for (const scene of ["school", "hospital", "platform"]) {
    await untilMemory(page, scene);
    await expect(
      page.locator(`.scene-art img[src*="memory-${scene}.webp"]`),
    ).toHaveCount(1);
    await expect(
      page.getByRole("group", { name: "記憶中的物件" }),
    ).toBeVisible();
    if (info.project.name.endsWith("mobile"))
      await expect(
        page.locator(
          `.scene-art source[srcset*="memory-${scene}-mobile.webp"]`,
        ),
      ).toHaveCount(1);
    if (scene === "school") {
      await page.getByRole("button", { name: "探索物件：稿紙改字" }).click();
      await expect(page.locator(".dialogue-text")).toHaveAttribute(
        "data-full-text",
        /稿紙上是一首投給校刊的詩/,
      );
      await flush(page);
      await page.reload();
      await untilMemory(page, scene);
      await expect(page.locator(".memory-object-seen")).toContainText(
        "稿紙改字",
      );
      await expect(
        page.getByRole("button", { name: "探索物件：獎學金便條" }),
        // Its number is the choice's key; the paper boat question comes first.
      ).toContainText("03");
    }
    if (scene === "hospital") {
      const familyQuestion = page.getByRole("button", {
        name: "問靜蘭，家人原本怎麼看她去外地",
      });
      await expect(familyQuestion).toBeVisible();
      await familyQuestion.click();
      await expect(page.locator(".dialogue-text")).toHaveAttribute(
        "data-full-text",
        /外地沒有人照應/,
      );
      await flush(page);
      await page.reload();
      await untilMemory(page, scene);
      await expect(familyQuestion).toHaveCount(0);
      await expect(page.getByRole("button", { name: "探索物件：公用電話" })).toBeVisible();
    }
    await page.screenshot({
      path: `output/memory-${scene}-${info.project.name}.png`,
      animations: "disabled",
    });
  }
  await until(page, "拾起詩集裡最後一角信紙");
  await page.getByRole("button", { name: "拾起詩集裡最後一角信紙" }).click();
  await until(page, "陪她走到月台出口");
  await page.getByRole("button", { name: "陪她走到月台出口" }).click();
  await until(page, "聽她說一件和先生在一起的日常");
  await page.getByRole("button", { name: "聽她說一件和先生在一起的日常" }).click();
  const paper = page.locator(".letter-paper");
  for (let step = 0; step < 80 && !(await paper.isVisible()); step++) {
    const reveal = page.getByRole("button", { name: "顯示全文" });
    if (await reveal.isVisible()) await reveal.click({ timeout: 2_000 }).catch(() => undefined);
    else await page.locator(".dialogue-panel button").first().click();
  }
  await expect(paper).toBeVisible();
  const zoomLevel = page.getByRole("group", { name: "拼信工作區縮放" }).locator("output");
  await expect(zoomLevel).toHaveText("100%");
  await page.getByRole("button", { name: "放大拼信工作區" }).click();
  await expect(zoomLevel).toHaveText("115%");
  await page.getByRole("button", { name: "縮小拼信工作區" }).click();
  await expect(zoomLevel).toHaveText("100%");
  await page.getByRole("button", { name: "放大拼信工作區" }).click();
  await expect(zoomLevel).toHaveText("115%");
  if (info.project.name.endsWith("mobile") && canTouch(page)) {
    const paper = page.locator(".letter-paper");
    await paper.scrollIntoViewIfNeeded();
    const box = (await paper.boundingBox())!;
    const x = box.x + box.width / 2;
    const y = box.y + Math.min(80, box.height / 2);
    const session = await context.newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x - 25, y, id: 0 }, { x: x + 25, y, id: 1 }] });
    await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - 60, y, id: 0 }, { x: x + 60, y, id: 1 }] });
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [{ x: x + 60, y, id: 1 }] });
    await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await session.detach();
    await expect.poll(async () => Number.parseInt(await zoomLevel.textContent() ?? "0", 10)).toBeGreaterThan(100);
    await page.screenshot({ path: "output/letter-pinch-mobile.png", animations: "disabled" });
    for (let step = 0; step < 5 && Number.parseInt(await zoomLevel.textContent() ?? "0", 10) > 115; step++)
      await page.getByRole("button", { name: "縮小拼信工作區" }).click();
    await expect(zoomLevel).toHaveText("115%");
    await page.waitForTimeout(300);
  }
  const firstPiece = page.getByRole("button", {
    name: "岳川，我不是不願意跟你走。",
    exact: true,
  });
  await firstPiece.click();
  await page.getByRole("button", { name: "旋轉 90°" }).click();
  await page.getByRole("button", { name: "翻到背面" }).click();
  await flush(page);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "紙角畫著一枚小小的月亮。" }),
  ).toBeVisible();
  await expect(page.locator(".fragment-paper").last()).toHaveAttribute(
    "style",
    /rotate\(90deg\)/,
  );
  await page.getByRole("button", { name: "紙角畫著一枚小小的月亮。" }).click();
  await page.getByRole("button", { name: "翻回正面" }).click();
  await firstPiece.scrollIntoViewIfNeeded();
  const source = (await firstPiece.boundingBox())!;
  const target = (await page
    .getByRole("button", { name: "信紙第 1 格，空白" })
    .boundingBox())!;
  const from = {
    x: source.x + source.width / 2,
    y: source.y + source.height / 2,
  };
  const to = {
    x: target.x + target.width / 2,
    y: target.y + target.height / 2,
  };
  if (info.project.name.endsWith("mobile") && canTouch(page)) {
    const session = await context.newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [from],
    });
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [to],
    });
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await session.detach();
  } else {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 10 });
    await page.mouse.up();
  }
  // 先確認碎片真的放進第 1 格；沒有的話，把遊戲自己的回饋寫進錯誤訊息，方便從 CI 日誌判斷原因。
  const placedFirst = page.getByRole("button", {
    name: "信紙第 1 格：岳川，我不是不願意跟你走。",
  });
  if (!(await placedFirst.isVisible({ timeout: 2_000 }).catch(() => false)))
    throw new Error(
      `drag did not place the piece: feedback="${await page.locator(".letter-panel .panel-footer .subtle").textContent()}", from=${JSON.stringify(from)}, to=${JSON.stringify(to)}, hit=${await page.evaluate(({ x, y }) => { const hit = document.elementFromPoint(x, y); return hit ? `${hit.tagName}.${hit.className}` : "none"; }, to)}`,
    );
  await flush(page);
  await page.reload();
  // Reload must bring back GameView; a failed lazy chunk leaves only the skip link.
  await expect(page.locator(".letter-panel")).toBeVisible();
  await expect(placedFirst).toBeVisible();
  await page.getByRole("button", {
    name: "只是那一晚，我也有不能離開的人。",
    exact: true,
  }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("button", { name: "信紙第 2 格：只是那一晚，我也有不能離開的人。" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("button", { name: "信紙第 3 格：只是那一晚，我也有不能離開的人。" })).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("button", { name: "信紙第 2 格：只是那一晚，我也有不能離開的人。" })).toBeFocused();
  await page.getByRole("button", { name: "請不要等我。", exact: true }).click();
  await page.getByRole("button", { name: "信紙第 3 格，空白" }).click();
  await page.getByRole("button", { name: "查看不同的墨跡" }).click();
  const laterInk = page.getByRole("checkbox", {
    name: "使用多年後補寫的句子",
  });
  // Seeing the later ink is enough; choosing it instead of her original words
  // would make the letter not understood and hide the ink question below.
  await expect(laterInk).toBeVisible();
  await expect(laterInk).not.toBeChecked();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `output/letter-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.screenshot({ path: `output/first-night-ink-reflection-${info.project.name}.png`, animations: "disabled" });
  await flush(page);
  await page.reload();
  await expect(page.getByRole("checkbox", { name: "使用多年後補寫的句子" })).not.toBeChecked();
  await page.getByRole("button", { name: "把信交還給她" }).click();
  await until(page, "把兩種墨色分開，問她多年後寫");
  await page.getByRole("button", { name: /把兩種墨色分開，問她多年後寫/ }).click();
  await until(page, "把信交回她手裡，聽她自己決定下一步");
  await page.getByRole("button", { name: "把信交回她手裡，聽她自己決定下一步" }).click();
  await until(page, "陪她寫一封信");
  await page.getByRole("button", { name: /守夜手記/ }).click();
  await expect(page.getByRole("heading", { name: "校刊室外的四個音" })).toBeVisible();
  await page.getByRole("button", { name: "關閉手記" }).click();
  await page.getByRole("button", { name: "開啟遊戲選單" }).click();
  await page.getByRole("link", { name: "存檔與讀檔" }).click();
  await page.getByRole("button", { name: "儲存", exact: true }).first().click();
  await expect(page.getByRole("status")).toHaveText("已存入第 1 格。");
  await page.getByRole("link", { name: "回到書店" }).click();
  await page.getByRole("button", { name: /陪她寫一封信/ }).click();
  for (
    let i = 0;
    i < 100 &&
    !(await page.getByRole("heading", { name: "月光抵達之處" }).isVisible());
  ) {
    const reveal = page.getByRole("button", { name: "顯示全文" });
    if (await reveal.isVisible()) {
      await reveal.click({ timeout: 2_000 }).catch(() => undefined);
      continue;
    }
    const next = page.getByRole("button", { name: "繼續", exact: true });
    if (await next.isVisible()) await next.click();
    else await page.locator(".dialogue-choices button").first().click();
    i++;
  }
  await expect(
    page.getByRole("heading", { name: "月光抵達之處" }),
  ).toBeVisible();
  await flush(page);
  await page.getByRole("link", { name: "翻開故事收藏" }).click();
  await expect(page).toHaveURL(/#\/collection$/);
  await expect(
    page.getByRole("heading", { name: "故事收藏", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "月光抵達之處" }),
  ).toBeVisible();
  await page.screenshot({
    path: `output/collection-${info.project.name}.png`,
    fullPage: true,
    animations: "disabled",
  });
  await page.goto("/#/chapters");
  await expect(page.getByRole("button", { name: "翻開第二夜" })).toBeVisible();
  await page.getByRole("button", { name: "翻開第二夜" }).click();
  await page.getByRole("button", { name: "開始新的一夜" }).click();
  await page.getByRole("region", { name: "每晚開店準備" }).getByRole("button", { name: /整理櫃台/ }).click();
  await expect(page.getByRole("region", { name: "每晚開店準備" })).toContainText("靜蘭寫給自己的信已帶走");
  await prepareOpening(page);
  await expect(page.locator(".scene-caption small")).toHaveText("第二夜 · 許柏言");
  await expect(page.locator(".dialogue-text")).toHaveAttribute(
    "data-full-text",
    /十二點四十七分/,
  );
  await flush(page);
  await page.reload();
  await expect(page.locator(".dialogue-text")).toHaveAttribute(
    "data-full-text",
    /十二點四十七分/,
  );
  const secondReveal = page.getByRole("button", { name: "顯示全文" });
  if (await secondReveal.isVisible()) await secondReveal.click();
  await page.getByRole("button", { name: "繼續", exact: true }).click();
  await expect(page.locator(".dialogue-text")).toHaveAttribute(
    "data-full-text",
    /靜蘭親手摺好的桂花書籤/,
  );
  await page.goto("/#/saves");
  await page.getByRole("button", { name: "讀取", exact: true }).first().click();
  if (await page.getByRole("button", { name: "讀取這一頁" }).isVisible())
    await page.getByRole("button", { name: "讀取這一頁" }).click();
  await expect(
    page.getByRole("button", { name: /陪她寫一封信/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("settings persist, locked chapters stay unavailable, empty collection and keyboard work", async ({
  page,
}) => {
  await page.goto("/#/collection");
  await expect(
    page.getByRole("heading", { name: "第一頁，還留著空白。" }),
  ).toBeVisible();
  await page.goto("/#/settings");
  await page.getByRole("switch", { name: /放大故事文字/ }).check();
  await page.getByRole("switch", { name: /減少動態效果/ }).check();
  await expect(page.locator(".app")).toHaveClass(/large-text/);
  await page.reload();
  await expect(
    page.getByRole("switch", { name: /放大故事文字/ }),
  ).toBeChecked();
  await page.goto("/#/chapters");
  await expect(page.getByText("故事尚在書寫")).toHaveCount(0);
  await expect(page.getByText("完成第一夜後解鎖")).toBeVisible();
  await expect(page.getByText("完成第二夜後解鎖")).toBeVisible();
  await page.getByRole("button", { name: "翻開第一夜" }).click();
  await prepareOpening(page);
  await expect(page.getByRole("region", { name: "故事對話" })).toBeVisible();
  await flush(page);
  await expect(page.getByRole("button", { name: "繼續", exact: true })).toBeVisible();
  await page.locator("#main").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".dialogue-text > span")).toContainText(
    "「林澄，暫代店員。」",
  );
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "暫停在這一頁" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("cached shell and first-night story resume offline", async ({
  page,
  context,
}) => {
  await page.goto("/#/settings");
  await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
  await page.goto("/");
  await page.getByRole("button", { name: "開始故事", exact: true }).click();
  await prepareOpening(page);
  await expect(page.getByRole("region", { name: "故事對話" })).toBeVisible();
  await flush(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await expect(page.getByRole("region", { name: "故事對話" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => !!navigator.serviceWorker.controller))
    .toBe(true);
  const before = await page
    .locator(".dialogue-text")
    .getAttribute("data-full-text");
  await setOffline(context, true);
  await page.reload();
  await expect(page.locator(".dialogue-text")).toHaveAttribute(
    "data-full-text",
    before!,
  );
  await expect(page.locator(".dialogue-text")).toHaveText(before!);
  await page.getByRole("button", { name: "繼續", exact: true }).click();
  await expect(page.locator(".dialogue-text")).not.toHaveText(before!);
  await setOffline(context, false);
});

test("tea is playable without films, keyboard spills stop, and mistakes can be repaired", async ({
  page,
}) => {
  await page.route("**/video/**", (route) => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "開始故事", exact: true }).click();
  await prepareOpening(page);
  await until(page, "茶罐：桂花烏龍");
  const board = page.locator(".tea-board");
  const { layout: l } = await geometry(page);
  // Select the fourth jar using only the keyboard, then remove its lid.
  const jar = page.getByRole("button", { name: "茶罐：茉莉綠茶" });
  await jar.focus();
  await page.keyboard.press("Enter");
  const initial = l.jarSlot(3);
  for (let i = 0; i < Math.round((initial.x - l.jar.x) / 20); i++)
    await page.keyboard.press("ArrowLeft");
  for (let i = 0; i < Math.round((l.jar.y - initial.y) / 20); i++)
    await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "茉莉綠茶", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "茶罐蓋", exact: true }).focus();
  await page.keyboard.press("Enter");
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("button", { name: "茶罐蓋", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "重新整理茶席" }).click();
  await prepareLeaves(page);
  // Return one spoonful to the jar, then add it back.
  await drag(page, l.spoon, l.pot);
  await expect(board).toHaveAttribute("data-leaves", "2");
  await drag(page, l.spoon, l.jar);
  await drag(page, l.spoon, l.jar);
  await drag(page, l.spoon, l.pot);
  await expect(board).toHaveAttribute("data-leaves", "3");
  await page.getByRole("button", { name: "提起銅水壺" }).focus();
  await page.keyboard.press("Enter");
  for (let i = 0; i < 6; i++) await page.keyboard.press("e");
  await expect
    .poll(async () => Number(await board.getAttribute("data-spilled")))
    .toBeGreaterThan(1);
  await expect(board).toHaveAttribute("data-water", "0");
  await page.keyboard.press("Escape");
  const spilled = await board.getAttribute("data-spilled");
  await page.waitForTimeout(300);
  await expect(board).toHaveAttribute("data-spilled", spilled!);
  await expect(page.getByRole("dialog")).not.toBeVisible();
  // A spill does not block refilling or handing the cup back to the story.
  await pour(page, "kettle", 68);
  await steepAndServe(page);
  await expect(
    page.getByText("影片暫時無法播放，仍可繼續故事。"),
  ).toBeVisible();
  await page.getByRole("button", { name: "略過動畫，繼續故事" }).click();
  await expect(page.getByRole("region", { name: "故事對話" })).toBeVisible();
});

test("tea pauses under the menu and can be restarted after a mistake", async ({
  page,
}) => {
  await page.goto("/#/settings");
  await page.getByRole("switch", { name: /減少動態效果/ }).check();
  await expect(page.locator(".app")).toHaveClass(/reduce-motion/);
  await page.getByRole("link", { name: "回到門前" }).click();
  await page.getByRole("button", { name: "開始故事", exact: true }).click();
  await prepareOpening(page);
  await until(page, "茶罐：桂花烏龍");
  await prepareLeaves(page);
  await pour(page, "kettle", 35);
  await pour(page, "kettle", 68);
  const { layout: l } = await geometry(page);
  await drag(page, l.lid, l.pot);
  const board = page.locator(".tea-board");
  await expect(page.locator(".table-steam")).toHaveCount(0);
  await expect
    .poll(async () => Number(await board.getAttribute("data-seconds")))
    .toBeGreaterThan(1);
  await page.getByRole("button", { name: "沙漏：開始或暫停浸泡" }).click();
  const paused = await board.getAttribute("data-seconds");
  await page.waitForTimeout(300);
  await expect(board).toHaveAttribute("data-seconds", paused!);
  await page.getByRole("button", { name: "沙漏：開始或暫停浸泡" }).click();
  await page.getByRole("button", { name: "開啟遊戲選單" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const menuTime = await board.getAttribute("data-seconds");
  await page.waitForTimeout(400);
  await expect(board).toHaveAttribute("data-seconds", menuTime!);
  await page.keyboard.press("Escape");
  await expect
    .poll(async () => Number(await board.getAttribute("data-seconds")))
    .toBeGreaterThan(Number(menuTime));
  await page.getByRole("button", { name: "重新整理茶席" }).click();
  for (const field of ["water", "leaves", "seconds", "spilled", "cup"])
    await expect(board).toHaveAttribute(`data-${field}`, "0");
  await expect(board).toHaveAttribute("data-step", "select");
  await prepareLeaves(page);
  await pour(page, "kettle", 68);
  await drag(page, l.lid, l.pot);
  await pour(page, "pot", 28);
  await page.getByRole("button", { name: "將茶遞給她", exact: true }).click();
  const completion = page.getByRole("dialog", {
    name: "把這一杯，放到她面前。",
  });
  await expect(completion.locator("video")).toHaveCount(0);
  await expect(completion.getByText("靜態製茶畫面")).toBeVisible();
  await expect(
    completion.getByRole("button", { name: "繼續故事", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByRole("region", { name: "故事對話" })).toBeVisible();
});

test("infusion changes with time and survives a paused offline reload", async ({
  page,
  context,
}, info) => {
  await page.goto("/");
  await page.getByRole("button", { name: "開始故事", exact: true }).click();
  await prepareOpening(page);
  await until(page, "翻開今晚的第一頁");
  await page.getByRole("button", { name: /翻開今晚的第一頁/ }).click();
  await until(page, "先替她拉開椅子");
  await page.getByRole("button", { name: /先替她拉開椅子/ }).click();
  await until(page, "茶罐：桂花烏龍");
  await prepareLeaves(page, info.project.name.endsWith("mobile"), 1);
  await pour(page, "kettle", 68, info.project.name.endsWith("mobile"));
  const { layout } = await geometry(page);
  await drag(page, layout.lid, layout.pot, info.project.name.endsWith("mobile"));
  const board = page.locator(".tea-board");
  await expect
    .poll(async () => Number(await board.getAttribute("data-seconds")))
    .toBeGreaterThan(9);
  await page.getByRole("button", { name: "沙漏：開始或暫停浸泡" }).click();
  const before = await board.getAttribute("data-liquor-color");
  const seconds = await board.getAttribute("data-seconds");
  await page.waitForTimeout(300);
  await expect(board).toHaveAttribute("data-liquor-color", before!);
  await flush(page);
  await page.evaluate(() =>
    navigator.serviceWorker.ready.then(() => undefined),
  );
  await setOffline(context, true);
  await page.reload();
  await expect(board).toHaveAttribute("data-seconds", seconds!);
  await expect(board).toHaveAttribute("data-liquor-color", before!);
  await page.getByRole("button", { name: "沙漏：開始或暫停浸泡" }).click();
  await expect
    .poll(async () => Number(await board.getAttribute("data-seconds")))
    .toBeGreaterThan(Number(seconds) + 10);
  await page.getByRole("button", { name: "沙漏：開始或暫停浸泡" }).click();
  expect(await board.getAttribute("data-liquor-color")).not.toBe(before);
  await page.screenshot({
    path: `output/tea-infusion-${info.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "重新整理茶席" }).click();
  await expect(board).toHaveAttribute("data-liquor-color", "#dae1d8");
});
