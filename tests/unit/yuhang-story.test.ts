import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { StoryBridge } from "../../src/story/storyBridge";
import { parseTag } from "../../src/story/commandParser";
import { frameSchema, newLetter, type LetterDraft, type TeaDraft } from "../../src/types/game";
import { scoreLetter } from "../../src/services/letterScoring";
import { scoreRoute } from "../../src/services/routeScoring";
import { deliveryRouteScene } from "../../src/data/deliveryRouteNarrative";

const compiled = readFileSync("public/story/compiled/yuhang-chapter-10.json", "utf8");
const chapterNine = readFileSync("public/story/compiled/yuhang-chapter-9.json", "utf8");
const chapterEight = readFileSync("public/story/compiled/yuhang-chapter-8.json", "utf8");
const chapterSix = readFileSync("public/story/compiled/yuhang-chapter-6.json", "utf8");
const chapterFive = readFileSync("public/story/compiled/yuhang-chapter-5.json", "utf8");
const chapterFour = readFileSync("public/story/compiled/yuhang-chapter-4.json", "utf8");
const chapterThree = readFileSync("public/story/compiled/yuhang-chapter-3.json", "utf8");
const chapterTwo = readFileSync("public/story/compiled/yuhang-chapter-2.json", "utf8");
const previousCompiled = readFileSync("public/story/compiled/yuhang-chapter-1.json", "utf8");
const targets = {
  "yuhang-today": { stamp: "present", choice: "今天自己簽收" },
  "yuhang-future": { stamp: "future", choice: "寄往七年後" },
  "yuhang-past": { stamp: "past", choice: "妹妹的紀念盒" },
  "yuhang-unknown": { stamp: "none", choice: "拒絕簽收" },
} as const;

function play(target: keyof typeof targets, fullLetter = true, detour = false, storyJson = compiled, options: { skipObjects?: boolean; previousEnding?: string; teaId?: "mint" | "chamomile" | "hojicha"; garnish?: TeaDraft["garnish"]; blackTea?: number; promiseChoice?: string; deferPostmarkComparison?: boolean } = {}) {
  const story = new StoryBridge(storyJson, options.previousEnding);
  story.next();
  const sections = new Set<string>();
  const texts: string[] = [];
  let steps = 0;
  while (story.frame.mode !== "ending") {
    expect(++steps).toBeLessThan(280);
    sections.add(story.frame.section);
    texts.push(story.frame.text);
    if (story.frame.mode === "tea")
      story.finishTea({ teaId: options.teaId ?? "mint", garnish: options.garnish ?? "lemon", blackTea: options.blackTea ?? 20, quality: 100, emotionalMatch: 100 });
    else if (story.frame.mode === "route")
      story.finishRoute(scoreRoute({ stops: detour ? ["bookshop-door", "post-office", "last-bus"] : ["post-office", "last-bus", "empty-shop"] }));
    else if (story.frame.mode === "letter") {
      expect(story.frame.fragments).toEqual(["tomorrow", "admit", "without-her", "begin"]);
      story.finishLetter({ completion: fullLetter ? 100 : 50, understood: fullLetter, stamp: targets[target].stamp });
    } else if (story.frame.canContinue) story.next();
    else {
      const selected = (options.deferPostmarkComparison ? story.frame.choices.find((entry) => entry.text.includes("讓他先把派送簿收好")) : undefined) ?? (options.skipObjects ? story.frame.choices.find((entry) => [
        "從郵戳後收起第一片信紙",
        "從假單裡收起第二片信紙",
        "從門縫裡收起第三片信紙",
        "從印章底部收起最後一片紙",
        "請他先把郵袋放下，茶一會兒就好",
        "末班車進站，和他一起上車",
        "走到那間鎖住的店門前",
      ].includes(entry.text)) : undefined) ?? story.frame.choices.find((entry) => options.promiseChoice && entry.text.includes(options.promiseChoice)) ?? story.frame.choices.find((entry) => entry.text.includes(targets[target].choice)) ?? story.frame.choices[0];
      expect(selected).toBeDefined();
      story.choose(selected!.index);
    }
    if (
      story.frame.mode !== "dialogue" ||
      !story.frame.canContinue ||
      steps % 20 === 0
    ) {
      const restored = new StoryBridge(storyJson);
      restored.restore(story.serialize(), frameSchema.parse(story.frame));
      expect(restored.frame).toEqual(story.frame);
    }
  }
  return { story, sections, texts };
}

describe("Yuhang fifth night", () => {
  it("uses only supported tags", () => {
    const source = readFileSync("story/chapters/ch05_yuhang.ink", "utf8");
    for (const match of source.matchAll(/#\s*([^#\n}]+)/g))
      expect(() => parseTag(match[1]!)).not.toThrow();
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("reaches %s and restores each choice and minigame checkpoint", (target) => {
    const { story, sections } = play(target);
    expect(story.frame.endingId).toBe(target);
    for (const section of ["old-post-office", "last-bus", "empty-shop", "bookshop-door", "letter", "stamp-choice", "afterword", "coda"])
      expect(sections.has(section)).toBe(true);
    expect(story.frame.clues).toContain("future-postmark");
    expect(story.frame.clues).toContain("lighthouse-postcard");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the previous %s route", (target) => {
    const { story } = play(target, true, false, previousCompiled);
    expect(story.frame.endingId).toBe(target);
    expect(story.frame.clues).not.toContain("lighthouse-postcard");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-two %s route", (target) => {
    expect(play(target, true, false, chapterTwo).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-three %s route", (target) => {
    expect(play(target, true, false, chapterThree).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-four %s route", (target) => {
    expect(play(target, true, false, chapterFour).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-five %s route", (target) => {
    expect(play(target, true, false, chapterFive).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-six %s route", (target) => {
    expect(play(target, true, false, chapterSix).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-eight %s route", (target) => {
    expect(play(target, true, false, chapterEight).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-nine %s route", (target) => {
    expect(play(target, true, false, chapterNine).story.frame.endingId).toBe(target);
  });
  it("carries optional talks at the door, bus stop and shop walk into later scenes", () => {
    const talked = play("yuhang-today");
    const skipped = play("yuhang-today", true, false, compiled, { skipObjects: true });
    const talk = talked.texts.join(" ");
    for (const line of ["一直停在我撿到它的那場雨裡", "她起頭，我收尾", "晚上的信箱不會", "不排進去，就可以一直說還沒輪到", "我爸那時候問的就是這個吧"])
      expect(talk).toContain(line);
    expect(talk).toContain("也許不是每件事，都要由我替她收尾");
    expect(talk).toContain("終於替自己答了一次");
    const quiet = skipped.texts.join(" ");
    expect(quiet).not.toContain("她起頭，我收尾");
    expect(quiet).not.toContain("終於替自己答了一次");
    expect(skipped.story.frame.endingId).toBe("yuhang-today");
  });
  it("lets the past and refused endings answer the opening questions", () => {
    expect(play("yuhang-past").texts.join(" ")).toContain("第一次寫給自己");
    expect(play("yuhang-unknown").texts.join(" ")).toContain("那場雨是哪一天");
  });
  it("allows leaving every memory with four fragments and no optional clues", () => {
    const { story } = play("yuhang-unknown", true, false, compiled, { skipObjects: true });
    expect(story.frame.fragments).toEqual(["tomorrow", "admit", "without-her", "begin"]);
    expect(story.frame.clues).not.toContain("lighthouse-postcard");
    expect(story.frame.clues).not.toContain("stamp-bottom");
  });
  it.each([
    ["yenuan-share", "父親當年只留下再次送達的機會"],
    ["yenuan-reopen", "送到，也不用立刻開始"],
    ["yenuan-rest", "停下來也能是一個具體的決定"],
    ["yenuan-copy", "只是把原樣交回去"],
  ])("recalls %s during post office exploration", (previousEnding, expected) => {
    const played = play("yuhang-unknown", true, false, compiled, { previousEnding });
    expect(played.texts.join(" ")).toContain(expected);
    expect(played.texts.join(" ")).toContain("食譜卡的收件人可以選擇何時收下");
  });
  it("lets the player set aside the postmark comparison without losing the ending", () => {
    const deferred = play("yuhang-today", true, false, compiled, { previousEnding: "yenuan-rest", deferPostmarkComparison: true });
    expect(deferred.texts.join(" ")).toContain("沒有把葉暖的選擇當作雨航必須照做的答案");
    expect(deferred.texts.join(" ")).not.toContain("食譜卡的收件人可以選擇何時收下");
    expect(deferred.story.frame.endingId).toBe("yuhang-today");
  });
  it("lets the promise conversation reflect evidence the player actually examined", () => {
    const seen = play("yuhang-today", true, false, compiled, { promiseChoice: "過期租約" });
    const skipped = play("yuhang-today", true, false, compiled, { skipObjects: true, promiseChoice: "過期租約" });
    expect(seen.texts.join(" ")).toContain("妳念出租約背面的日期");
    expect(skipped.texts.join(" ")).toContain("妳指向他一直帶著的鑰匙");
    expect(seen.texts.join(" ")).toContain("我想過");
    expect(seen.story.frame.endingId).toBe("yuhang-today");
    expect(skipped.story.frame.endingId).toBe("yuhang-today");
  });
  it("responds to lemon actually being added to mint tea", () => {
    const lemon = play("yuhang-unknown");
    const plain = play("yuhang-unknown", true, false, compiled, { garnish: "none", blackTea: 0 });
    const lemonOnly = play("yuhang-unknown", true, false, compiled, { blackTea: 0 });
    const blackOnly = play("yuhang-unknown", true, false, compiled, { garnish: "none" });
    expect(lemon.texts.join(" ")).toContain("薄荷與檸檬的清香混進妳倒入的淡紅茶");
    expect(lemonOnly.texts.join(" ")).toContain("妳沒有加淡紅茶");
    expect(blackOnly.texts.join(" ")).toContain("妳倒入少許淡紅茶");
    expect(plain.texts.join(" ")).toContain("碟裡的檸檬仍在");
  });
  it("reserves the station dream for chamomile with honey and recalls apple hojicha separately", () => {
    const honey = play("yuhang-unknown", true, false, compiled, { teaId: "chamomile", garnish: "honey", blackTea: 0 });
    const plain = play("yuhang-unknown", true, false, compiled, { teaId: "chamomile", garnish: "none", blackTea: 0 });
    const apple = play("yuhang-unknown", true, false, compiled, { teaId: "hojicha", garnish: "apple", blackTea: 0 });
    expect(honey.texts.join(" ")).toContain("你不用替我把每一站都走完");
    expect(plain.texts.join(" ")).not.toContain("你不用替我把每一站都走完");
    expect(plain.texts.join(" ")).toContain("今晚他先坐著");
    expect(apple.texts.join(" ")).toContain("蘋果切成很薄的片");
  });
  it("wrong turns reveal a detour without blocking the chapter", () => {
    expect(scoreRoute({ stops: ["post-office", "last-bus", "empty-shop"] })).toEqual({ correct: 3, detours: 0 });
    expect(scoreRoute({ stops: ["bookshop-door", "post-office", "last-bus"] })).toEqual({ correct: 0, detours: 3 });
    expect(play("yuhang-unknown", false, true).story.frame.endingId).toBe("yuhang-unknown");
  });
  it("shows a distinct possible life for each wrong route clue", () => {
    const wrongStops = ["bookshop-door", "post-office", "last-bus"] as const;
    const detours = wrongStops.map((stop, index) => deliveryRouteScene(index, stop));
    expect(detours.every((scene) => !scene.matchesClue && scene.text.includes("另一種可能"))).toBe(true);
    expect(new Set(detours.map((scene) => scene.text)).size).toBe(3);
    for (const [index, stop] of (["post-office", "last-bus", "empty-shop"] as const).entries())
      expect(deliveryRouteScene(index, stop).matchesClue).toBe(true);
  });
  it("requires four lines and inspection to understand the letter", () => {
    const letter: LetterDraft = {
      ...newLetter(),
      slots: ["tomorrow", "admit", "without-her", "begin"],
      angles: [0, 0, 0, 0],
      flipped: [false, false, false, false],
      inspected: true,
      stamp: "present",
    };
    expect(scoreLetter(letter, "yuhang")).toEqual({ completion: 100, understood: true });
    letter.inspected = false;
    expect(scoreLetter(letter, "yuhang").understood).toBe(false);
    letter.inspected = true;
    letter.slots[3] = null;
    expect(scoreLetter(letter, "yuhang").understood).toBe(false);
  });
});
