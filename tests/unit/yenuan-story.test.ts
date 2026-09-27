import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { StoryBridge } from "../../src/story/storyBridge";
import { parseTag } from "../../src/story/commandParser";
import { frameSchema, newLetter, type LetterDraft } from "../../src/types/game";
import { scoreLetter } from "../../src/services/letterScoring";
import { scoreHearth } from "../../src/services/hearthScoring";

const compiled = readFileSync("public/story/compiled/yenuan-chapter-9.json", "utf8");
const chapterEight = readFileSync("public/story/compiled/yenuan-chapter-8.json", "utf8");
const chapterSeven = readFileSync("public/story/compiled/yenuan-chapter-7.json", "utf8");
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
        "請她先坐下，妳去泡茶",
        "讓那顆麵包留在籃底，先拼食譜",
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
  return { story, sections, texts, finalChoiceOptions };
}

describe("Yenuan fourth night", () => {
  it("uses only supported story tags", () => {
    const source = readFileSync("story/chapters/ch04_yenuan.ink", "utf8");
    for (const match of source.matchAll(/#\s*([^#\n}]+)/g))
      expect(() => parseTag(match[1]!)).not.toThrow();
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])(
    "reaches %s and restores each choice and minigame checkpoint",
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
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-seven %s route", (target) => {
    expect(play(target, true, chapterSeven).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-eight %s route", (target) => {
    expect(play(target, true, chapterEight).story.frame.endingId).toBe(target);
  });
  it("lets the opening details and the cut burnt bread return in each afterword", () => {
    const text = (target: keyof typeof targets, options = {}) => play(target, true, compiled, options).texts.join(" ");
    const share = text("yenuan-share");
    for (const line of ["同一個季節裡重複了好幾年", "不知道該對誰說生日快樂", "聞一整天就飽了", "我追了三條街", "只把它推到妳手邊", "我從來沒切開過", "比我以為的甜"])
      expect(share).toContain(line);
    expect(share).toContain("先吃中間最軟的那一片");
    expect(text("yenuan-reopen")).toContain("最後一片總是葉暖自己吃掉的");
    expect(text("yenuan-rest")).toContain("比她記得的還多一盒");
    expect(text("yenuan-copy")).toContain("沒有再切開第二次");
    const skipped = play("yenuan-share", true, compiled, { skipObjects: true });
    expect(skipped.texts.join(" ")).not.toContain("我從來沒切開過");
    expect(skipped.texts.join(" ")).not.toContain("先吃中間最軟的那一片");
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
  it.each([
    ["ruoyin-one", "若音只為一個人彈的三分鐘"],
    ["ruoyin-stage", "若音親手送出的信"],
    ["ruoyin-score", "若音的交換簿還留著空白"],
    ["ruoyin-echo", "沒有把滿座的店面當作葉暖今晚必須做到完美的理由"],
  ])("carries %s into the anniversary sign without speaking for Yenuan", (previousEnding, detail) => {
    const route = play("yenuan-rest", true, compiled, { previousEnding }).texts.join(" ");
    expect(route).toContain(detail);
    expect(route).toContain("那是我畫的");
    expect(route).toContain("我還是該接電話");
    expect(route).toContain("我可以先想清楚要寫什麼");
  });
  it("can leave the anniversary sign without pressing Yenuan for an answer", () => {
    const route = play("yenuan-rest", true, compiled, {
      previousEnding: "ruoyin-one",
      chooseTexts: ["先把招牌放回"],
    }).texts.join(" ");
    expect(route).toContain("沒有逼她替滿座的客人找出一個能代替母親的答案");
    expect(route).not.toContain("我可以先想清楚要寫什麼");
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
