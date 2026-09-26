import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { StoryBridge } from "../../src/story/storyBridge";
import { parseTag } from "../../src/story/commandParser";
import { frameSchema, newLetter, type LetterDraft } from "../../src/types/game";
import { scoreLamp } from "../../src/services/lampScoring";
import { scoreLetter } from "../../src/services/letterScoring";

const compiled = readFileSync("public/story/compiled/haiming-chapter-9.json", "utf8");
const chapterSeven = readFileSync("public/story/compiled/haiming-chapter-7.json", "utf8");
const chapterSix = readFileSync("public/story/compiled/haiming-chapter-6.json", "utf8");
const chapterFive = readFileSync("public/story/compiled/haiming-chapter-5.json", "utf8");
const chapterFour = readFileSync("public/story/compiled/haiming-chapter-4.json", "utf8");
const chapterThree = readFileSync("public/story/compiled/haiming-chapter-3.json", "utf8");
const chapterTwo = readFileSync("public/story/compiled/haiming-chapter-2.json", "utf8");
const previousCompiled = readFileSync("public/story/compiled/haiming-chapter-1.json", "utf8");
const targets = {
  "haiming-light": "邀請顧川到書店",
  "haiming-voice": "做一份聲音航海誌",
  "haiming-boat": "帶紙船去海邊",
  "haiming-hero": "只寄流暢的英雄故事",
} as const;

function play(target: keyof typeof targets, polished = false, storyJson = compiled, options: { skipObjects?: boolean; previousEnding?: string; garnish?: "caramel" | "none"; orderDates?: boolean; reunionChoice?: "flex" } = {}) {
  const story = new StoryBridge(storyJson, options.previousEnding);
  story.next();
  const sections = new Set<string>();
  const texts: string[] = [];
  const portraits: string[] = [];
  let steps = 0;
  while (story.frame.mode !== "ending") {
    expect(++steps).toBeLessThan(280);
    sections.add(story.frame.section);
    texts.push(story.frame.text);
    portraits.push(story.frame.portrait);
    if (story.frame.mode === "tea")
      story.finishTea({ teaId: "hojicha", garnish: options.garnish ?? "caramel", quality: 100, emotionalMatch: 100 });
    else if (story.frame.mode === "lamp")
      story.finishLamp(scoreLamp({ turns: ["steady", "steady", "steady"] }));
    else if (story.frame.mode === "letter") {
      expect(story.frame.fragments).toEqual(["light", "shore", "return", "remember"]);
      story.finishLetter({ completion: 100, understood: !polished, alternate: polished });
    } else if (story.frame.canContinue) story.next();
    else {
      const selected = (options.reunionChoice === "flex" ? story.frame.choices.find((entry) => entry.text.includes("保留改變方法")) : undefined) ?? (options.orderDates ? story.frame.choices.find((entry) => entry.text.includes("先替他排好年份")) : undefined) ?? (options.skipObjects ? story.frame.choices.find((entry) => [
        "從救援圖旁收起第一角紙船",
        "從風箏尾巴收起第二角紙船",
        "從邀請背面收起第三角紙船",
        "從煤油燈內取出最後一角紙船",
      ].includes(entry.text)) : undefined) ?? story.frame.choices.find((entry) => entry.text.includes(targets[target])) ?? story.frame.choices[0];
      expect(selected).toBeDefined();
      story.choose(selected!.index);
    }
    const restored = new StoryBridge(storyJson);
    restored.restore(story.serialize(), frameSchema.parse(story.frame));
    expect(restored.frame).toEqual(story.frame);
  }
  return { story, sections, texts, portraits };
}

describe("Haiming sixth night", () => {
  it("uses only supported story tags", () => {
    const source = readFileSync("story/chapters/ch06_haiming.ink", "utf8");
    for (const match of source.matchAll(/#\s*([^#\n}]+)/g))
      expect(() => parseTag(match[1]!)).not.toThrow();
  });
  it("reveals the child and owner in the coda", () => {
    const { portraits } = play("haiming-light");
    expect(portraits).toContain("lincheng-child");
    expect(portraits).toContain("owner");
    expect(portraits.indexOf("lincheng-child")).toBeLessThan(portraits.indexOf("owner"));
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("reaches %s and restores each checkpoint", (target) => {
    const { story, sections } = play(target);
    expect(story.frame.endingId).toBe(target);
    for (const section of ["storm-tower", "summer-visit", "last-watch", "white-room", "letter", "log-choice", "afterword", "coda"])
      expect(sections.has(section)).toBe(true);
    expect(story.frame.clues).toContain("lighthouse-photo");
    expect(story.frame.clues).toContain("shared-melody");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the previous %s route", (target) => {
    const { story } = play(target, false, previousCompiled);
    expect(story.frame.endingId).toBe(target);
    expect(story.frame.clues).not.toContain("shared-melody");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-two %s route", (target) => {
    expect(play(target, false, chapterTwo).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-three %s route", (target) => {
    expect(play(target, false, chapterThree).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-four %s route", (target) => {
    expect(play(target, false, chapterFour).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-five %s route", (target) => {
    expect(play(target, false, chapterFive).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-six %s route", (target) => {
    expect(play(target, false, chapterSix).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-seven %s route", (target) => {
    expect(play(target, false, chapterSeven).story.frame.endingId).toBe(target);
  });
  it("can leave each memory with four paper-boat fragments and no optional clues", () => {
    const { story } = play("haiming-boat", false, compiled, { skipObjects: true });
    expect(story.frame.fragments).toEqual(["light", "shore", "return", "remember"]);
    expect(story.frame.clues).not.toContain("rescue-log");
    expect(story.frame.clues).not.toContain("kite");
  });
  it("recalls Yuhang's past-stamp choice at the tide chart", () => {
    const past = play("haiming-boat", false, compiled, { previousEnding: "yuhang-past" });
    const today = play("haiming-boat", false, compiled, { previousEnding: "yuhang-today" });
    expect(past.texts.join(" ")).toContain("顧川的路也不該只照他的日誌安排");
    expect(today.texts.join(" ")).not.toContain("顧川的路也不該只照他的日誌安排");
  });
  it("lets Yuhang return after the future-stamp ending without claiming his plan is done", () => {
    const plan = play("haiming-boat", false, compiled, { previousEnding: "yuhang-future" });
    const flexible = play("haiming-boat", false, compiled, { previousEnding: "yuhang-future", reunionChoice: "flex" });
    expect(plan.sections).toContain("reunion");
    expect(plan.texts.join(" ")).toContain("箱子還在床下");
    expect(flexible.texts.join(" ")).toContain("不是另一張不能改的派送表");
    expect(plan.texts.join(" ")).toContain("兩點二十三分，一位老人推門進來");
    for (const previousEnding of ["yuhang-today", "yuhang-past", "yuhang-unknown"])
      expect(play("haiming-boat", false, compiled, { previousEnding }).sections).not.toContain("reunion");
  });
  it("responds to salted caramel actually being added to hojicha", () => {
    const caramel = play("haiming-boat");
    const plain = play("haiming-boat", false, compiled, { garnish: "none" });
    expect(caramel.texts.join(" ")).toContain("焙茶與一點鹹甜氣味");
    expect(plain.texts.join(" ")).toContain("海鹽焦糖還沒加入");
  });
  it("keeps distinct evidence in all four memories before Haiming chooses his words", () => {
    const explored = play("haiming-light");
    const skipped = play("haiming-boat", false, compiled, { skipObjects: true });
    const fullText = explored.texts.join(" ");
    const briefText = skipped.texts.join(" ");
    expect(fullText).toContain("被救回的人、錯過的出生、還來得及出發的那一刻");
    expect(fullText).toContain("孩子等候的時間、海明修燈的時間");
    expect(fullText).toContain("那天顧川怎麼等、後來怎麼想，得由顧川自己說");
    expect(fullText).toContain("它們不能替他擋住遺忘");
    expect(briefText).not.toContain("三件紀錄攤在一起");
    expect(briefText).toContain("還沒看過的東西不該由書店替他補寫");
  });
  it("lets Haiming keep his own wording even when the player first orders the dates", () => {
    const ordered = play("haiming-light", false, compiled, { orderDates: true });
    expect(ordered.texts.join(" ")).toContain("他請妳先別刪");
    expect(ordered.story.frame.endingId).toBe("haiming-light");
  });
  it("keeps contradictory original words for full understanding", () => {
    const letter: LetterDraft = {
      ...newLetter(), slots: ["light", "shore", "return", "remember"],
      angles: [0, 0, 0, 0], flipped: [false, false, false, false], inspected: true,
    };
    expect(scoreLetter(letter, "haiming")).toEqual({ completion: 100, understood: true });
    letter.alternate = true;
    expect(scoreLetter(letter, "haiming").understood).toBe(false);
    expect(play("haiming-hero", true).story.frame.endingId).toBe("haiming-hero");
  });
  it("keeps soft light and detects the extremes", () => {
    expect(scoreLamp({ turns: ["steady", "steady", "steady"] }).balanced).toBe(true);
    expect(scoreLamp({ turns: ["brighten", "brighten", "brighten"] }).brightness).toBe(100);
    expect(scoreLamp({ turns: ["dim", "dim", "dim"] }).brightness).toBe(0);
    expect(scoreLamp({ turns: ["brighten", "brighten", "brighten"] }).balanced).toBe(false);
  });
});
