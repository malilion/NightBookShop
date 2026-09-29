import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { StoryBridge } from "../../src/story/storyBridge";
import {
  STORY_VERSION,
  newArchive,
  newHearth,
  newLamp,
  newLetter,
  newMelody,
  newOpening,
  newNotifications,
  newRoute,
  newTea,
  snapshotSchema,
  type GameSnapshot,
  type StoryVersion,
  type TeaId,
} from "../../src/types/game";
import { smallTargets } from "./touch-target-helpers";

const chapters = [
  { version: STORY_VERSION, file: "main", tea: "osmanthus", fragments: ["address", "reason", "wait"] },
  { version: "boyan-chapter-12", file: "boyan-chapter-12", tea: "chamomile", fragments: ["status", "boundary", "handoff", "next"] },
  { version: "ruoyin-chapter-11", file: "ruoyin-chapter-10", tea: "lavender", fragments: ["greeting", "fear", "music"] },
  { version: "yenuan-chapter-10", file: "yenuan-chapter-9", tea: "hojicha", fragments: ["flour", "apple", "waiting"] },
  { version: "haiming-chapter-14", file: "haiming-chapter-13", tea: "hojicha", fragments: ["light", "shore", "return", "remember"] },
] as const satisfies readonly { version: StoryVersion; file: string; tea: TeaId; fragments: readonly string[] }[];
const endings = [
  { chapter: 0, id: "recipient", choice: "陪她寫一張詢問收信意願的短箋", title: "遲來的收件人" },
  { chapter: 0, id: "unfinished", choice: "把信交還給她，今晚", title: "再等一個夜晚" },
  { chapter: 0, id: "intervention", choice: "仍替她封口", title: "替她決定的人" },
  { chapter: 1, id: "boyan-leave", choice: "先盤點離職後的生活", title: "空白履歷的第一行" },
  { chapter: 1, id: "boyan-boundary", choice: "工作負荷說明", title: "被聽見的界線" },
  { chapter: 1, id: "boyan-overwork", choice: "先把報告做完", title: "再撐一下就好" },
  { chapter: 2, id: "ruoyin-stage", choice: "給季晴的信寄出", title: "寄往有光的舞台" },
  { chapter: 2, id: "ruoyin-score", choice: "替普通人的故事寫旋律", title: "另一種樂章" },
  { chapter: 2, id: "ruoyin-echo", choice: "帶著舊傷重新參賽", title: "掌聲的回音" },
  { chapter: 3, id: "yenuan-reopen", choice: "讓原配方重新上架", title: "明天仍會出爐" },
  { chapter: 3, id: "yenuan-rest", choice: "讓晨麥休息一週", title: "休息中的晨麥" },
  { chapter: 3, id: "yenuan-copy", choice: "完全複製母親的麵包", title: "永遠相同的味道" },
  { chapter: 4, id: "haiming-voice", choice: "做一份聲音航海誌", title: "替記憶留一盞燈" },
  { chapter: 4, id: "haiming-boat", choice: "帶紙船去海邊", title: "讓紙船出海" },
  { chapter: 4, id: "haiming-hero", choice: "只寄流暢的英雄故事", title: "完美的守塔人" },
] as const;
const json = chapters.map((chapter) => readFileSync(`public/story/compiled/${chapter.file}.json`, "utf8"));

function beforeFinalChoice(ending: (typeof endings)[number]): GameSnapshot {
  const chapter = chapters[ending.chapter];
  const story = new StoryBridge(json[ending.chapter]!);
  story.next();
  for (let step = 0; step < 620; step++) {
    const frame = story.frame;
    if (frame.mode === "dialogue" && frame.choices.some((item) => item.text.includes(ending.choice))) {
      const slots = [...chapter.fragments];
      return snapshotSchema.parse({
        version: 1,
        storyVersion: chapter.version,
        inkState: story.serialize(),
        frame,
        tea: { ...newTea(), teaId: chapter.tea, garnish: ending.chapter === 3 ? "apple" : ending.chapter === 4 ? "caramel" : "none", step: "serve", leaves: 3, water: 70, seconds: 45 },
        letter: { ...newLetter(), slots, angles: Array(slots.length).fill(0), flipped: Array(slots.length).fill(false), inspected: true, alternate: ending.id === "haiming-hero" },
        melody: { ...newMelody(), notes: ending.chapter === 2 ? [0, 1, 3, 2] : [] },
        hearth: { ...newHearth(), responses: ending.chapter === 3 ? ["wait", "ask", "wait"] : [] },
        route: newRoute(),
        lamp: { ...newLamp(), turns: ending.chapter === 4 ? ["steady", "steady", "steady"] : [] },
        archive: newArchive(),
        notifications: ending.chapter === 1
          ? { paused: ["manager", "teammate", "system"], repliedMother: true }
          : newNotifications(),
        opening: { ...newOpening(), complete: true },
      });
    }
    if (frame.mode === "tea") story.finishTea({ teaId: chapter.tea, garnish: ending.chapter === 3 ? "apple" : ending.chapter === 4 ? "caramel" : "none", quality: 100, emotionalMatch: 100 });
    else if (frame.mode === "letter") story.finishLetter({ completion: 100, understood: ending.id !== "haiming-hero", alternate: ending.id === "haiming-hero" });
    else if (frame.mode === "melody") story.finishMelody(true);
    else if (frame.mode === "hearth") story.finishHearth({ heat: 41, care: 3, balanced: true });
    else if (frame.mode === "lamp") story.finishLamp({ brightness: 50, steady: 3, balanced: true });
    else if (frame.mode === "notifications") story.finishNotifications({ allPaused: true, repliedMother: true });
    else if (frame.canContinue) story.next();
    else {
      const choice = frame.choices.find((item) =>
        ending.chapter === 0 && ending.id === "recipient" ? item.text.includes("問她，是否願意")
          : ending.chapter === 0 && ending.id === "intervention" ? item.text.includes("替她把信寄出")
          : ending.chapter === 2 ? item.text === "回到最初的四個音"
          : ending.chapter === 3 ? item.text.includes(ending.id === "yenuan-reopen" ? "照媽媽的配方" : "加入自己喜歡的柚子")
          : false,
      ) ?? frame.choices[0];
      if (!choice) throw new Error(`No choice at ${chapter.version} step ${step}`);
      story.choose(choice.index);
    }
  }
  throw new Error(`Final choice was not reached: ${ending.id}`);
}

for (const ending of endings) {
  test(`${ending.id} is readable and collected`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.getByRole("link", { name: "設定" }).click();
    await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
    await page.getByRole("switch", { name: /減少動態效果/ }).check();
    const snapshot = beforeFinalChoice(ending);
    await page.evaluate(async (data) => {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("night-bookshop");
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const transaction = db.transaction("saves", "readwrite");
          transaction.objectStore("saves").put({ id: "auto-1", kind: "auto", updatedAt: new Date().toISOString(), snapshot: data });
          transaction.oncomplete = () => { db.close(); resolve(); };
          transaction.onerror = () => reject(transaction.error);
        };
      });
    }, snapshot);
    await page.goto("/");
    await page.getByRole("button", { name: "繼續故事" }).click();
    const choice = page.getByRole("button", { name: new RegExp(ending.choice) });
    await expect(choice).toBeVisible();
    await choice.click();
    for (let step = 0; step < 50; step++) {
      if (await page.locator(".ending-panel").isVisible()) break;
      const reveal = page.getByRole("button", { name: "顯示全文" });
      const next = page.getByRole("button", { name: "繼續", exact: true });
      const followup = page.locator(".dialogue-choices button").first();
      if (await reveal.isVisible()) await reveal.click();
      else if (await next.isVisible()) await next.click();
      else if (await followup.isVisible()) await followup.click();
      else throw new Error(`${ending.id} stalled after final choice`);
    }
    await expect(page.locator(".ending-panel")).toBeVisible();
    await expect(page.getByRole("heading", { name: ending.title })).toBeVisible();
    if (info.project.name === "mobile")
      expect(await smallTargets(page), `${ending.id} ending controls`).toEqual([]);
    await expect(page.getByRole("status", { name: "存檔狀態" })).toHaveText("進度自動保存在此瀏覽器");
    await page.screenshot({ path: `output/${ending.id}-ending-${info.project.name}.png`, fullPage: true, animations: "disabled" });
    await page.goto("/#/collection");
    await expect(page.getByRole("heading", { name: ending.title })).toBeVisible();
    expect(errors).toEqual([]);
  });
}
