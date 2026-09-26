import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { StoryBridge } from "../../src/story/storyBridge";
import { parseTag } from "../../src/story/commandParser";
import { frameSchema, newLetter, type LetterDraft } from "../../src/types/game";
import { scoreLetter } from "../../src/services/letterScoring";
import { cupMotif, matchesCupMotif } from "../../src/services/melodyScoring";

const compiled = readFileSync(
  "public/story/compiled/ruoyin-chapter-8.json",
  "utf8",
);
const chapterSeven = readFileSync("public/story/compiled/ruoyin-chapter-7.json", "utf8");
const chapterFive = readFileSync("public/story/compiled/ruoyin-chapter-5.json", "utf8");
const previousCompiled = readFileSync("public/story/compiled/ruoyin-chapter-1.json", "utf8");
const chapterTwo = readFileSync("public/story/compiled/ruoyin-chapter-2.json", "utf8");
const chapterThree = readFileSync("public/story/compiled/ruoyin-chapter-3.json", "utf8");
const chapterFour = readFileSync("public/story/compiled/ruoyin-chapter-4.json", "utf8");
const targets = {
  "ruoyin-one": "只為一個人拉完",
  "ruoyin-stage": "給季晴的信寄出",
  "ruoyin-score": "替普通人的故事寫旋律",
  "ruoyin-echo": "帶著舊傷重新參賽",
} as const;

function play(
  target: keyof typeof targets,
  fullLetter = true,
  storyJson = compiled,
  options: { skipObjects?: boolean; excludedChoices?: string[]; previousEnding?: string; finalBar?: "return" | "new" | "rest"; teaId?: "lavender" | "osmanthus" | "black"; chooseTexts?: string[] } = {},
) {
  const story = new StoryBridge(storyJson, options.previousEnding);
  story.next();
  const sections = new Set<string>();
  const texts: string[] = [];
  let finalChoiceOptions: string[] = [];
  let steps = 0;
  while (story.frame.mode !== "ending") {
    expect(++steps).toBeLessThan(250);
    sections.add(story.frame.section);
    texts.push(story.frame.text);
    if (story.frame.text.includes("接下來仍由她選擇要把它帶去哪裡"))
      finalChoiceOptions = story.frame.choices.map((choice) => choice.text);
    if (story.frame.mode === "tea") {
      story.finishTea({ teaId: options.teaId ?? "lavender", quality: 95, emotionalMatch: 100 });
    } else if (story.frame.mode === "melody") {
      story.finishMelody(true);
    } else if (story.frame.mode === "letter") {
      expect(story.frame.fragments).toEqual(["greeting", "fear", "music"]);
      story.finishLetter({
        completion: fullLetter ? 100 : 50,
        understood: fullLetter,
      });
    } else if (story.frame.canContinue) {
      story.next();
    } else {
      const finalBarText = {
        return: "回到最初的四個音",
        new: "加入一小段新的簡單旋律",
        rest: "先留下休止符",
      }[options.finalBar ?? "return"];
      const choice =
        story.frame.choices.find((entry) => entry.text === finalBarText) ??
        story.frame.choices.find((entry) =>
          entry.text.includes(targets[target]),
        ) ?? story.frame.choices.find((entry) =>
          options.chooseTexts?.some((text) => entry.text.includes(text)),
        ) ?? (options.skipObjects
          ? story.frame.choices.find((entry) => [
              "從譜架下拾起第一片信紙",
              "從鏡框背後收起第二片信紙",
              "把節目單背面的第三片信紙收好",
              "帶著琴盒回書店，拼起信的兩面",
            ].includes(entry.text))
          : undefined) ?? story.frame.choices.find((entry) =>
            !options.excludedChoices?.some((text) => entry.text.includes(text)),
          );
      expect(choice).toBeDefined();
      story.choose(choice!.index);
    }
    const restored = new StoryBridge(storyJson);
    restored.restore(story.serialize(), frameSchema.parse(story.frame));
    expect(restored.frame).toEqual(story.frame);
  }
  return { story, sections, texts, finalChoiceOptions };
}

describe("Ruoyin third night", () => {
  it("uses only supported story tags", () => {
    const source = readFileSync("story/chapters/ch03_ruoyin.ink", "utf8");
    for (const match of source.matchAll(/#\s*([^#\n}]+)/g))
      expect(() => parseTag(match[1]!)).not.toThrow();
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])(
    "reaches %s and restores every checkpoint",
    (target) => {
      const { story, sections } = play(target);
      expect(story.frame.endingId).toBe(target);
      for (const section of [
        "childhood",
        "backstage",
        "banquet",
        "grandstage",
        "letter",
        "finalbar",
        "afterword",
        "coda",
      ])
        expect(sections.has(section)).toBe(true);
      expect(story.frame.clues).toContain("manual-page");
      expect(story.frame.clues).toContain("company-recital");
      expect(story.frame.clues).toContain("first-joy");
      for (const clue of ["stage-review", "concert-ticket", "injury", "cleaner"])
        expect(story.frame.clues).toContain(clue);
    },
  );
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the old %s save route", (target) => {
    const { story } = play(target, true, previousCompiled);
    expect(story.frame.endingId).toBe(target);
    expect(story.frame.clues).not.toContain("company-recital");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-two %s save route", (target) => {
    expect(play(target, true, chapterTwo).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-three %s save route", (target) => {
    expect(play(target, true, chapterThree).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-four %s save route", (target) => {
    expect(play(target, true, chapterFour).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-five %s save route", (target) => {
    expect(play(target, true, chapterFive).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-seven %s save route", (target) => {
    expect(play(target, true, chapterSeven).story.frame.endingId).toBe(target);
  });
  it("changes all four memory recaps according to inspected evidence", () => {
    const explored = play("ruoyin-stage").texts.join(" ");
    const skipped = play("ruoyin-stage", true, compiled, { skipObjects: true }).texts.join(" ");
    for (const detail of ["雲朵旁的日期", "沒有折住的講評", "核對了那三分鐘", "坐過空椅"])
      expect(explored).toContain(detail);
    for (const detail of ["尚未查清的記憶", "還沒有讀全桌上的記錄", "尚未問門邊的人", "掌聲還在重複"])
      expect(skipped).toContain(detail);
    expect(skipped).not.toContain("雲朵旁的日期");
  });
  it("does not cite the award date when only the rain and score were inspected", () => {
    const route = play("ruoyin-stage", true, compiled, {
      excludedChoices: ["查看講台上隔年的獎狀"],
    }).texts.join(" ");
    expect(route).toContain("這四個音最初是寫給雨的");
    expect(route).not.toContain("雲朵旁的日期");
  });
  it("lets her discuss comparison and the stage without forcing an answer", () => {
    const { story, texts } = play("ruoyin-stage", true, compiled, {
      chooseTexts: ["為何不願再聽", "原樣念完", "會不會想替", "是否仍想站上"],
    });
    expect(story.frame.endingId).toBe("ruoyin-stage");
    const route = texts.join(" ");
    for (const detail of ["下一個音不像她", "沒讓她說完", "先學會聽", "還需要時間想清楚"])
      expect(route).toContain(detail);
  });
  it("can leave each memory early and still assemble both sides of the letter", () => {
    const { story, finalChoiceOptions } = play("ruoyin-stage", true, compiled, { skipObjects: true });
    expect(story.frame.fragments).toEqual(["greeting", "fear", "music"]);
    expect(story.frame.clues).not.toContain("company-recital");
    expect(finalChoiceOptions).not.toContain("陪她只為一個人拉完這首曲子");
  });
  it("reserves the first joyful playing memory for lavender tea", () => {
    const lavender = play("ruoyin-stage");
    const osmanthus = play("ruoyin-stage", true, compiled, { teaId: "osmanthus" });
    expect(lavender.story.frame.clues).toContain("first-joy");
    expect(osmanthus.story.frame.clues).not.toContain("first-joy");
    expect(osmanthus.story.frame.fragments).toEqual(["greeting", "fear", "music"]);
  });
  it.each(["return", "new", "rest"] as const)("accepts a sincere %s final bar after its memory is heard", (finalBar) => {
    const { story, texts, finalChoiceOptions } = play("ruoyin-one", true, compiled, { finalBar });
    expect(story.frame.endingId).toBe("ruoyin-one");
    expect(finalChoiceOptions).toContain("陪她只為一個人拉完這首曲子");
    expect(texts.join(" ")).toContain({
      return: "最後一小節回到最初的四個音",
      new: "最後一小節多了一段新的簡單旋律",
      rest: "最後一小節留下休止符",
    }[finalBar]);
  });
  it.each([
    ["boyan-rest", "這張節目單不能證明他已經好起來"],
    ["boyan-leave", "若音不需要替他的空白填上答案"],
    ["boyan-boundary", "能不能有人與她分擔收尾"],
    ["boyan-overwork", "沒有再把「撐完」當作唯一值得稱讚的事"],
  ])("carries the %s ending into the banquet program response", (previousEnding, expected) => {
    const { texts } = play("ruoyin-stage", true, compiled, { previousEnding });
    expect(texts.join(" ")).toContain(expected);
    expect(texts.join(" ")).toContain("被人聽見，不等於往後每一場都得替誰撐到底");
  });
  it("does not infer the previous visitor's fate without his chapter ending", () => {
    const { texts } = play("ruoyin-stage");
    expect(texts.join(" ")).toContain("節目單沒有寫他後來的生活");
  });
  it("front-only reading cannot qualify for the two-sided ending", () => {
    const { story } = play("ruoyin-stage", false);
    expect(story.frame.endingId).toBe("ruoyin-stage");
  });
  it("requires the four-note order and both sides of the letter", () => {
    expect(matchesCupMotif(cupMotif)).toBe(true);
    expect(matchesCupMotif([0, 1, 2, 3])).toBe(false);
    const letter: LetterDraft = {
      ...newLetter(),
      slots: ["greeting", "fear", "music"],
      reverseSlots: ["greeting", "fear", "music"],
      inspected: true,
    };
    expect(scoreLetter(letter, "ruoyin")).toEqual({
      completion: 100,
      understood: true,
    });
    letter.reverseSlots[2] = null;
    expect(scoreLetter(letter, "ruoyin").understood).toBe(false);
  });
});
