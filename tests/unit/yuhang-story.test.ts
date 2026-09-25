import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { StoryBridge } from "../../src/story/storyBridge";
import { parseTag } from "../../src/story/commandParser";
import { frameSchema, newLetter, type LetterDraft, type TeaDraft } from "../../src/types/game";
import { scoreLetter } from "../../src/services/letterScoring";
import { scoreRoute } from "../../src/services/routeScoring";

const compiled = readFileSync("public/story/compiled/yuhang-chapter-6.json", "utf8");
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

function play(target: keyof typeof targets, fullLetter = true, detour = false, storyJson = compiled, options: { skipObjects?: boolean; previousEnding?: string; teaId?: "mint" | "chamomile" | "hojicha"; garnish?: TeaDraft["garnish"]; blackTea?: number; promiseChoice?: string } = {}) {
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
      const selected = (options.skipObjects ? story.frame.choices.find((entry) => [
        "從郵戳後收起第一片信紙",
        "從假單裡收起第二片信紙",
        "從門縫裡收起第三片信紙",
        "從印章底部收起最後一片紙",
      ].includes(entry.text)) : undefined) ?? story.frame.choices.find((entry) => options.promiseChoice && entry.text.includes(options.promiseChoice)) ?? story.frame.choices.find((entry) => entry.text.includes(targets[target].choice)) ?? story.frame.choices[0];
      expect(selected).toBeDefined();
      story.choose(selected!.index);
    }
    const restored = new StoryBridge(storyJson);
    restored.restore(story.serialize(), frameSchema.parse(story.frame));
    expect(restored.frame).toEqual(story.frame);
  }
  return { story, sections, texts };
}

describe("Yuhang fifth night", () => {
  it("uses only supported tags", () => {
    const source = readFileSync("story/chapters/ch05_yuhang.ink", "utf8");
    for (const match of source.matchAll(/#\s*([^#\n}]+)/g))
      expect(() => parseTag(match[1]!)).not.toThrow();
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("reaches %s and restores each checkpoint", (target) => {
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
  it("allows leaving every memory with four fragments and no optional clues", () => {
    const { story } = play("yuhang-unknown", true, false, compiled, { skipObjects: true });
    expect(story.frame.fragments).toEqual(["tomorrow", "admit", "without-her", "begin"]);
    expect(story.frame.clues).not.toContain("lighthouse-postcard");
    expect(story.frame.clues).not.toContain("stamp-bottom");
  });
  it("recalls Yenuan's dated rest decision in the post office ledger", () => {
    const rest = play("yuhang-unknown", true, false, compiled, { previousEnding: "yenuan-rest" });
    const share = play("yuhang-unknown", true, false, compiled, { previousEnding: "yenuan-share" });
    expect(rest.texts.join(" ")).toContain("停下來也能是一個具體的決定");
    expect(share.texts.join(" ")).not.toContain("停下來也能是一個具體的決定");
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
