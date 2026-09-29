import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { StoryBridge } from "../../src/story/storyBridge";
import { parseTag } from "../../src/story/commandParser";
import { frameSchema, newLetter, newTea, type LetterDraft, type TeaDraft } from "../../src/types/game";
import { scoreLetter } from "../../src/services/letterScoring";
import { scoreTea } from "../../src/services/teaScoring";

const compiled = readFileSync("public/story/compiled/boyan-chapter-13.json", "utf8");
const chapterTwelve = readFileSync("public/story/compiled/boyan-chapter-12.json", "utf8");
const chapterEleven = readFileSync("public/story/compiled/boyan-chapter-11.json", "utf8");
const chapterTen = readFileSync("public/story/compiled/boyan-chapter-10.json", "utf8");
const chapterNine = readFileSync("public/story/compiled/boyan-chapter-9.json", "utf8");
const chapterSeven = readFileSync("public/story/compiled/boyan-chapter-7.json", "utf8");
const chapterSix = readFileSync("public/story/compiled/boyan-chapter-6.json", "utf8");
const chapterFive = readFileSync("public/story/compiled/boyan-chapter-5.json", "utf8");
const chapterFour = readFileSync("public/story/compiled/boyan-chapter-4.json", "utf8");
const chapterThree = readFileSync("public/story/compiled/boyan-chapter-3.json", "utf8");
const chapterTwo = readFileSync("public/story/compiled/boyan-chapter-2.json", "utf8");
const previousCompiled = readFileSync("public/story/compiled/boyan-chapter-1.json", "utf8");
const choicesByEnding = {
  "boyan-rest": "先陪他安排就醫和請假",
  "boyan-leave": "先盤點離職後的生活",
  "boyan-boundary": "工作負荷說明",
  "boyan-overwork": "先把報告做完",
} as const;

function complete(
  target: keyof typeof choicesByEnding,
  storyJson = compiled,
  options: { skipObjects?: boolean; skipOpening?: boolean; previousEnding?: string; repliedMother?: boolean; honey?: boolean; orderHandoffFirst?: boolean; teaDraft?: TeaDraft; teaFollowup?: "leave"; teaChoice?: string } = {},
) {
  const story = new StoryBridge(storyJson, options.previousEnding);
  story.next();
  const sections = new Set<string>();
  const texts: string[] = [];
  let steps = 0;
  while (story.frame.mode !== "ending") {
    expect(++steps).toBeLessThan(280);
    sections.add(story.frame.section);
    texts.push(story.frame.text);
    if (story.frame.mode === "tea") {
      story.finishTea(options.teaDraft ? scoreTea(options.teaDraft, "boyan") : { teaId: "chamomile", garnish: options.honey ? "honey" : "none", quality: 95, emotionalMatch: options.honey ? 100 : 75 });
    } else if (story.frame.mode === "letter") {
      expect(story.frame.fragments).toEqual(["status", "boundary", "handoff", "next"]);
      story.finishLetter({ completion: 100, understood: true });
    } else if (story.frame.mode === "notifications") {
      story.finishNotifications({ allPaused: true, repliedMother: options.repliedMother ?? true });
    } else if (story.frame.canContinue) {
      story.next();
    } else {
      const choice = (options.teaChoice ? story.frame.choices.find((entry) => entry.text.includes(options.teaChoice!)) : undefined) ?? (options.teaFollowup === "leave" ? story.frame.choices.find((entry) => entry.text.includes("先讓杯子和手機都留在桌上")) : undefined) ?? (options.skipOpening ? story.frame.choices.find((entry) => entry.text.includes("先替他燒水")) : undefined) ?? (options.orderHandoffFirst ? story.frame.choices.find((entry) => entry.text.includes("先照舊清單排好交接")) : undefined) ?? story.frame.choices.find((entry) =>
        entry.text.includes(choicesByEnding[target]),
      ) ?? (options.skipObjects
        ? story.frame.choices.find((entry) => [
            "收好鍵盤下的信紙，走向候診區",
            "把第三封信攤平，走向列車",
            "拾起車窗旁的信紙，回到書店",
          ].includes(entry.text))
        : undefined) ?? story.frame.choices[0];
      expect(choice).toBeDefined();
      story.choose(choice!.index);
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

describe("Boyan second night", () => {
  it.each(Object.keys(choicesByEnding) as (keyof typeof choicesByEnding)[])("restores the chapter-twelve %s route", (target) => {
    expect(complete(target, chapterTwelve).story.frame.endingId).toBe(target);
  });
  it.each([
    ["moonlight", "先寄一份給自己"],
    ["recipient", "先問主管什麼時候方便談"],
    ["unfinished", "我的身體，大概沒辦法等五十年"],
    ["intervention", "那這封，我自己來"],
  ])("lets Jinglan's %s ending shape how Boyan sends his letter", (previousEnding, answer) => {
    const route = complete("boyan-rest", compiled, { previousEnding, teaChoice: "放了五十年" }).texts.join(" ");
    expect(route).toContain("最早的一張也不過三週");
    expect(route).toContain(answer);
    expect(route).toContain("先把副本寄給自己，在捷運上讀了一遍");
  });
  it("carries the fifty-year letter into each afterword and keeps it optional", () => {
    const options = { previousEnding: "moonlight", teaChoice: "放了五十年" };
    expect(complete("boyan-leave", compiled, options).texts.join(" ")).toContain("喝完一杯茶，才按下送出");
    expect(complete("boyan-boundary", compiled, options).texts.join(" ")).toContain("當面交到主管手上");
    expect(complete("boyan-overwork", compiled, options).texts.join(" ")).toContain("已經又過了一週");
    const first = complete("boyan-rest").texts.join(" ");
    expect(first).not.toContain("最早的一張也不過三週");
    expect(first).not.toContain("在捷運上讀了一遍");
  });
  it("compiles only supported story tags", () => {
    const source = readFileSync("story/chapters/ch02_boyan.ink", "utf8");
    for (const match of source.matchAll(/#\s*([^#\n}]+)/g))
      expect(() => parseTag(match[1]!)).not.toThrow();
  });
  it.each(Object.keys(choicesByEnding) as (keyof typeof choicesByEnding)[])(
    "reaches %s through all three memories, tea and a four-part letter",
    (target) => {
      const { story, sections } = complete(target);
      expect(story.frame.endingId).toBe(target);
      for (const section of ["office", "clinic", "train", "letter", "afterword", "coda"])
        expect(sections.has(section)).toBe(true);
      expect(story.frame.clues).toContain("date");
      for (const clue of ["badge", "exam", "medicine", "notification"])
        expect(story.frame.clues).toContain(clue);
      if (target === "boyan-rest") expect(story.frame.clues).toContain("school-journal");
    },
  );
  it.each(Object.keys(choicesByEnding) as (keyof typeof choicesByEnding)[])("preserves the old %s save route", (target) => {
    const { story } = complete(target, previousCompiled);
    expect(story.frame.endingId).toBe(target);
    expect(story.frame.clues).not.toContain("school-journal");
  });
  it.each(Object.keys(choicesByEnding) as (keyof typeof choicesByEnding)[])("preserves the chapter-two %s save route", (target) => {
    expect(complete(target, chapterTwo).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(choicesByEnding) as (keyof typeof choicesByEnding)[])("preserves the chapter-three %s save route", (target) => {
    expect(complete(target, chapterThree).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(choicesByEnding) as (keyof typeof choicesByEnding)[])("preserves the chapter-four %s save route", (target) => {
    expect(complete(target, chapterFour).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(choicesByEnding) as (keyof typeof choicesByEnding)[])("preserves the chapter-five %s save route", (target) => {
    expect(complete(target, chapterFive).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(choicesByEnding) as (keyof typeof choicesByEnding)[])("preserves the chapter-six %s save route", (target) => {
    expect(complete(target, chapterSix).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(choicesByEnding) as (keyof typeof choicesByEnding)[])("preserves the chapter-seven %s save route", (target) => {
    expect(complete(target, chapterSeven).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(choicesByEnding) as (keyof typeof choicesByEnding)[])("preserves the chapter-nine %s save route", (target) => {
    expect(complete(target, chapterNine).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(choicesByEnding) as (keyof typeof choicesByEnding)[])("preserves the chapter-ten %s save route", (target) => {
    expect(complete(target, chapterTen).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(choicesByEnding) as (keyof typeof choicesByEnding)[])("preserves the chapter-eleven %s save route", (target) => {
    expect(complete(target, chapterEleven).story.frame.endingId).toBe(target);
  });
  it("requires an extra dialogue to stop after black tea and lets mint sort without full relief", () => {
    const black = { ...newTea(), teaId: "black" as const, leaves: 3, water: 70, temperature: 95, seconds: 55 };
    const mint = { ...newTea(), teaId: "mint" as const, leaves: 3, water: 70, temperature: 85, seconds: 55 };
    const blackRoute = complete("boyan-rest", compiled, { teaDraft: black });
    const blackAlternative = complete("boyan-rest", compiled, { teaDraft: black, teaChoice: "現在願意先放下" });
    const mintRoute = complete("boyan-rest", compiled, { teaDraft: mint });
    const mintAlternative = complete("boyan-rest", compiled, { teaDraft: mint, teaChoice: "暫時不必填進今晚" });
    expect(blackRoute.texts.join(" ")).toContain("若不多問一句，他又要回到剛才的報告裡");
    expect(blackRoute.texts.join(" ")).toContain("不能讓對方提早回覆");
    expect(blackAlternative.texts.join(" ")).toContain("交接不必今晚一次寫完");
    expect(mintRoute.texts.join(" ")).toContain("還不能讓他放心休息");
    expect(mintRoute.texts.join(" ")).toContain("把報告放在「明早」");
    expect(mintAlternative.texts.join(" ")).toContain("卻還沒真的鬆下來");
    expect(blackRoute.story.frame.endingId).toBe("boyan-rest");
    expect(mintRoute.story.frame.endingId).toBe("boyan-rest");
  });
  it("responds to the brewed quality, offers extra listening, and keeps poor tea playable", () => {
    const ideal = { ...newTea(), teaId: "chamomile" as const, garnish: "honey" as const, leaves: 3, water: 70, temperature: 90, seconds: 60 };
    const middling = { ...ideal, garnish: "none" as const, leaves: 1, water: 40, temperature: 75, seconds: 10 };
    const poor = { ...ideal, teaId: "black" as const, garnish: "none" as const, leaves: 0, water: 0, temperature: 60, seconds: 0 };
    expect(scoreTea(ideal, "boyan").quality).toBeGreaterThanOrEqual(90);
    expect(scoreTea(middling, "boyan").quality).toBeGreaterThanOrEqual(50);
    expect(scoreTea(middling, "boyan").quality).toBeLessThan(70);
    expect(scoreTea(poor, "boyan").quality).toBeLessThan(50);
    const best = complete("boyan-rest", compiled, { teaDraft: ideal });
    const followup = complete("boyan-rest", compiled, { teaDraft: middling });
    const quiet = complete("boyan-rest", compiled, { teaDraft: middling, teaFollowup: "leave" });
    const mismatched = complete("boyan-rest", compiled, { teaDraft: poor });
    expect(best.story.frame.clues).toContain("river-bookstall");
    expect(followup.texts.join(" ")).toContain("我怕明早有人找不到我");
    expect(quiet.texts.join(" ")).not.toContain("我怕明早有人找不到我");
    expect(mismatched.story.frame.clues).toContain("tea-apology");
    expect(mismatched.story.frame.endingId).toBe("boyan-rest");
  });
  it("opens a distinct health and help conversation after honey chamomile", () => {
    const honey = complete("boyan-rest", compiled, { honey: true });
    const plain = complete("boyan-rest", compiled);
    expect(honey.texts.join(" ")).toContain("我一直以為胸悶只是咖啡喝太多");
    expect(honey.texts.join(" ")).toContain("我可以先約門診");
    expect(plain.texts.join(" ")).not.toContain("我可以先約門診");
  });
  it("can leave each memory early while preserving all four fragments and the date clue", () => {
    const { story } = complete("boyan-rest", compiled, { skipObjects: true });
    expect(story.frame.fragments).toEqual(["status", "boundary", "handoff", "next"]);
    expect(story.frame.clues).toContain("date");
    expect(story.frame.clues).not.toContain("exam");
  });
  it("carries Jinglan's intervention ending into Boyan's office response", () => {
    const intervention = complete("boyan-rest", compiled, { skipObjects: true, previousEnding: "intervention" });
    const moonlight = complete("boyan-rest", compiled, { skipObjects: true, previousEnding: "moonlight" });
    expect(intervention.texts.join(" ")).toContain("等柏言自己拿起來");
    expect(moonlight.texts.join(" ")).not.toContain("等柏言自己拿起來");
  });
  it.each([
    ["moonlight", "靜蘭親手摺好的書籤"],
    ["recipient", "收信的人和寄出的時間"],
    ["unfinished", "這封信可以先留在這裡"],
    ["intervention", "不要替柏言拿起筆"],
  ])("lets %s shape the optional office question and Boyan's first reading", (previousEnding, prompt) => {
    const asked = complete("boyan-rest", compiled, { previousEnding });
    const skipped = complete("boyan-rest", compiled, { previousEnding, skipObjects: true });
    expect(asked.texts.join(" ")).toContain(prompt);
    expect(asked.texts.join(" ")).toContain("收件人先留白");
    expect(skipped.texts.join(" ")).not.toContain("收件人先留白");
    expect(asked.story.frame.endingId).toBe("boyan-rest");
    expect(skipped.story.frame.endingId).toBe("boyan-rest");
  });
  it("keeps the mother's message separate from work notifications", () => {
    const replied = complete("boyan-rest", compiled, { repliedMother: true });
    const deferred = complete("boyan-rest", compiled, { repliedMother: false });
    expect(replied.texts.join(" ")).toContain("我明天先去看醫生，之後再打給妳");
    expect(deferred.texts.join(" ")).toContain("明天看完醫生再回");
    expect(replied.story.frame.clues).toContain("notification");
  });
  it("changes memory recaps when evidence is explored or skipped", () => {
    const explored = complete("boyan-rest", compiled, { honey: true });
    const skipped = complete("boyan-rest", compiled, { skipObjects: true });
    expect(explored.texts.join(" ")).toContain("曾主動幫忙、曾被別人代為答應");
    expect(explored.texts.join(" ")).toContain("醫療需要由醫療人員判斷");
    expect(explored.texts.join(" ")).toContain("七年前的願望也沒有替他做決定");
    expect(skipped.texts.join(" ")).toContain("沒有請妳替他猜別人為何把工作交過來");
    expect(skipped.texts.join(" ")).not.toContain("曾主動幫忙、曾被別人代為答應");
  });
  it("lets Boyan move his current condition before the handoff list", () => {
    const ordered = complete("boyan-rest", compiled, { orderHandoffFirst: true });
    expect(ordered.texts.join(" ")).toContain("交接可以寫，但不能再替我說完全部");
    expect(ordered.story.frame.endingId).toBe("boyan-rest");
  });
  it("lets Boyan show the coffee, the unsent drafts and the face-down phone, or skip straight to the kettle", () => {
    const looked = complete("boyan-rest");
    const skipped = complete("boyan-rest", compiled, { skipOpening: true });
    const lookedText = looked.texts.join(" ");
    const skippedText = skipped.texts.join(" ");
    expect(lookedText).toContain("我記得價錢，不記得味道");
    expect(lookedText).toContain("都是辭職信");
    expect(lookedText).toContain("翻過去就不算在看");
    expect(lookedText).toContain("這一袋才是診間給的");
    expect(lookedText).toContain("這次我想讓手也停一下");
    expect(lookedText).toContain("這杯茶不要求他喝完");
    expect(skippedText).not.toContain("我記得價錢，不記得味道");
    expect(skippedText).not.toContain("都是辭職信");
    expect(skippedText).not.toContain("翻過去就不算在看");
    expect(skippedText).not.toContain("這一袋才是診間給的");
    expect(skippedText).not.toContain("這次我想讓手也停一下");
    expect(skipped.story.frame.endingId).toBe("boyan-rest");
  });
  it("softens Boyan's portrait when he names the three drafts", () => {
    const story = new StoryBridge(compiled);
    story.next();
    for (let step = 0; step < 80 && !story.frame.text.includes("都是辭職信"); step++) {
      if (story.frame.canContinue) story.next();
      else {
        const bag = story.frame.choices.find((choice) => choice.text.includes("胃藥"));
        story.choose((bag ?? story.frame.choices[0])!.index);
      }
    }
    expect(story.frame.text).toContain("都是辭職信");
    expect(story.frame.portrait).toBe("boyan-soft");
  });
  it("distinguishes urgent recurring symptoms from a later appointment", () => {
    const { texts } = complete("boyan-rest");
    expect(texts.join(" ")).toContain("就別等明早掛號，立刻請求急救");
    expect(texts.join(" ")).toContain("今晚胸口安靜下來了");
  });
  it("scores all four letter positions", () => {
    const letter: LetterDraft = {
      ...newLetter(),
      slots: ["status", "boundary", "handoff", "next"],
      angles: [0, 0, 0, 0],
      flipped: [false, false, false, false],
      inspected: true,
    };
    expect(scoreLetter(letter, "boyan")).toEqual({
      completion: 100,
      understood: true,
    });
    letter.slots[1] = null;
    expect(scoreLetter(letter, "boyan").completion).toBe(75);
  });
});
