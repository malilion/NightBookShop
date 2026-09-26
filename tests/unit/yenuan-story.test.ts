import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { StoryBridge } from "../../src/story/storyBridge";
import { parseTag } from "../../src/story/commandParser";
import { frameSchema, newLetter, type LetterDraft } from "../../src/types/game";
import { scoreLetter } from "../../src/services/letterScoring";
import { scoreHearth } from "../../src/services/hearthScoring";

const compiled = readFileSync("public/story/compiled/yenuan-chapter-6.json", "utf8");
const chapterFive = readFileSync("public/story/compiled/yenuan-chapter-5.json", "utf8");
const chapterFour = readFileSync("public/story/compiled/yenuan-chapter-4.json", "utf8");
const chapterThree = readFileSync("public/story/compiled/yenuan-chapter-3.json", "utf8");
const chapterTwo = readFileSync("public/story/compiled/yenuan-chapter-2.json", "utf8");
const previousCompiled = readFileSync("public/story/compiled/yenuan-chapter-1.json", "utf8");
const targets = {
  "yenuan-share": "陪她烤一顆新的麵包",
  "yenuan-reopen": "讓原配方重新上架",
  "yenuan-rest": "讓晨麥休息一週",
  "yenuan-copy": "完全複製母親的麵包",
} as const;

function play(target: keyof typeof targets, fullLetter = true, storyJson = compiled, options: { skipObjects?: boolean; previousEnding?: string; garnish?: "apple" | "none"; chooseTexts?: string[] } = {}) {
  const story = new StoryBridge(storyJson, options.previousEnding);
  story.next();
  const sections = new Set<string>();
  const texts: string[] = [];
  let finalChoiceOptions: string[] = [];
  let steps = 0;
  while (story.frame.mode !== "ending") {
    expect(++steps).toBeLessThan(260);
    sections.add(story.frame.section);
    texts.push(story.frame.text);
    if (story.frame.text.includes("烤箱還有餘溫"))
      finalChoiceOptions = story.frame.choices.map((choice) => choice.text);
    if (story.frame.mode === "tea")
      story.finishTea({ teaId: "hojicha", garnish: options.garnish ?? "apple", quality: 100, emotionalMatch: 100 });
    else if (story.frame.mode === "hearth")
      story.finishHearth(scoreHearth({ responses: ["wait", "ask", "wait"] }));
    else if (story.frame.mode === "letter") {
      expect(story.frame.fragments).toEqual(["flour", "apple", "waiting"]);
      story.finishLetter({ completion: fullLetter ? 100 : 50, understood: fullLetter });
    } else if (story.frame.canContinue) story.next();
    else {
      const choice = (options.skipObjects ? story.frame.choices.find((entry) => [
        "從麵粉袋下收起第一片食譜",
        "收起活動傳單裡的第二片紙",
        "帶著尚未回答的問題走向老烤箱",
        "將第三片食譜收好，回書店",
      ].includes(entry.text)) : undefined) ?? story.frame.choices.find((entry) =>
        options.chooseTexts?.some((text) => entry.text.includes(text)),
      ) ?? story.frame.choices.find((entry) =>
        entry.text.includes(target === "yenuan-reopen" ? "照媽媽的配方" : "加入自己喜歡的柚子"),
      ) ?? story.frame.choices.find((entry) => entry.text.includes(targets[target]))
        ?? story.frame.choices[0];
      // Recipe preference is chosen before the ending choice.
      const endingChoice = story.frame.choices.find((entry) => entry.text.includes(targets[target]));
      story.choose((endingChoice ?? choice)!.index);
    }
    const restored = new StoryBridge(storyJson);
    restored.restore(story.serialize(), frameSchema.parse(story.frame));
    expect(restored.frame).toEqual(story.frame);
  }
  return { story, sections, texts, finalChoiceOptions };
}

describe("Yenuan fourth night", () => {
  it("uses only supported story tags", () => {
    const source = readFileSync("story/chapters/ch04_yenuan.ink", "utf8");
    for (const match of source.matchAll(/#\s*([^#\n}]+)/g))
      expect(() => parseTag(match[1]!)).not.toThrow();
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])(
    "reaches %s and restores every checkpoint",
    (target) => {
      const { story, sections } = play(target);
      expect(story.frame.endingId).toBe(target);
      for (const section of [
        "dawn-kitchen", "anniversary", "hospital-return", "old-oven", "letter", "recipe-choice", "afterword", "coda",
      ]) expect(sections.has(section)).toBe(true);
      expect(story.frame.clues).toContain("moon-card");
      expect(story.frame.clues).toContain("childhood-glimpse");
      expect(story.frame.clues).toContain("recipe-postmark");
      expect(story.frame.clues).toContain("voicemail");
    },
  );
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the previous %s route", (target) => {
    const { story } = play(target, true, previousCompiled);
    expect(story.frame.endingId).toBe(target);
    expect(story.frame.clues).not.toContain("recipe-postmark");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-two %s route", (target) => {
    expect(play(target, true, chapterTwo).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-three %s route", (target) => {
    expect(play(target, true, chapterThree).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-four %s route", (target) => {
    expect(play(target, true, chapterFour).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-five %s route", (target) => {
    expect(play(target, true, chapterFive).story.frame.endingId).toBe(target);
  });
  it("keeps the memory recaps grounded in inspected evidence", () => {
    const explored = play("yenuan-rest").texts.join(" ");
    const skipped = play("yenuan-rest", true, compiled, { skipObjects: true }).texts.join(" ");
    for (const detail of ["兩只杯子在布巾邊", "未接來電", "紙袋裡剩下的一片", "紙背的第一句"])
      expect(explored).toContain(detail);
    for (const detail of ["沒有看清那天如何收場", "沒有翻看收銀台旁的記錄", "尚未準備好的聲音", "烤箱旁還有沒看的痕跡"])
      expect(skipped).toContain(detail);
    expect(skipped).not.toContain("妳們看過未接來電");
  });
  it("can ask about grief without forcing the voicemail or a perfect recipe", () => {
    const { story, texts, finalChoiceOptions } = play("yenuan-rest", true, compiled, {
      skipObjects: true,
      chooseTexts: ["為何連一口麵包", "當晚最不敢承認", "先承認今晚仍然難過", "若這次麵包仍烤焦", "催她趕快填好"],
    });
    expect(story.frame.endingId).toBe("yenuan-rest");
    const route = texts.join(" ");
    for (const detail of ["不肯讓自己跟上", "想被肯定", "只用「我太晚到」", "比較不焦的一片"])
      expect(route).toContain(detail);
    expect(finalChoiceOptions).not.toContain("陪她烤一顆新的麵包，留一口給母親");
  });
  it("can leave each memory early without forcing the mother's voicemail", () => {
    const { story } = play("yenuan-rest", true, compiled, { skipObjects: true });
    expect(story.frame.fragments).toEqual(["flour", "apple", "waiting"]);
    expect(story.frame.clues).not.toContain("voicemail");
    expect(story.frame.clues).not.toContain("recipe-postmark");
  });
  it("carries Ruoyin's repeating applause into the anniversary sign response", () => {
    const echo = play("yenuan-rest", true, compiled, { previousEnding: "ruoyin-echo" });
    const one = play("yenuan-rest", true, compiled, { previousEnding: "ruoyin-one" });
    expect(echo.texts.join(" ")).toContain("沒有把滿座的店面當作葉暖今晚必須做到完美的理由");
    expect(one.texts.join(" ")).not.toContain("沒有把滿座的店面當作葉暖今晚必須做到完美的理由");
  });
  it("responds to apple actually being added to the hojicha", () => {
    const apple = play("yenuan-rest");
    const plain = play("yenuan-rest", true, compiled, { garnish: "none" });
    expect(apple.texts.join(" ")).toContain("焙茶的烘香和蘋果乾的甜味升起");
    expect(plain.texts.join(" ")).toContain("仍放在碟裡的蘋果乾");
  });
  it("requires both sides of the recipe for full understanding", () => {
    const letter: LetterDraft = {
      ...newLetter(),
      slots: ["flour", "apple", "waiting"],
      reverseSlots: ["flour", "apple", "waiting"],
      inspected: true,
    };
    expect(scoreLetter(letter, "yenuan")).toEqual({ completion: 100, understood: true });
    letter.reverseSlots[2] = null;
    expect(scoreLetter(letter, "yenuan").understood).toBe(false);
    expect(play("yenuan-rest", false).story.frame.endingId).toBe("yenuan-rest");
  });
  it("makes listening pace consequential", () => {
    expect(scoreHearth({ responses: ["wait", "ask", "wait"] }).balanced).toBe(true);
    expect(scoreHearth({ responses: ["rush", "rush", "rush"] }).heat).toBe(100);
    expect(scoreHearth({ responses: ["silence", "silence", "silence"] }).heat).toBe(0);
    expect(scoreHearth({ responses: ["rush", "rush", "rush"] }).balanced).toBe(false);
    expect(scoreHearth({ responses: ["silence", "silence", "silence"] }).balanced).toBe(false);
  });
});
