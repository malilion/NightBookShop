import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { StoryBridge } from "../../src/story/storyBridge";
import { parseTag } from "../../src/story/commandParser";
import { frameSchema, newLetter, type LetterDraft } from "../../src/types/game";
import { scoreLetter } from "../../src/services/letterScoring";
import { cupMotif, matchesCupMotif } from "../../src/services/melodyScoring";

const compiled = readFileSync(
  "public/story/compiled/ruoyin-chapter-4.json",
  "utf8",
);
const previousCompiled = readFileSync("public/story/compiled/ruoyin-chapter-1.json", "utf8");
const chapterTwo = readFileSync("public/story/compiled/ruoyin-chapter-2.json", "utf8");
const chapterThree = readFileSync("public/story/compiled/ruoyin-chapter-3.json", "utf8");
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
  options: { skipObjects?: boolean; previousEnding?: string; finalBar?: "return" | "new" | "rest"; teaId?: "lavender" | "osmanthus" | "black" } = {},
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
        ) ?? (options.skipObjects
          ? story.frame.choices.find((entry) => [
              "從譜架下拾起第一片信紙",
              "從鏡框背後收起第二片信紙",
              "把節目單背面的第三片信紙收好",
              "帶著琴盒回書店，拼起信的兩面",
            ].includes(entry.text))
          : undefined) ?? story.frame.choices[0];
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
  it("carries Boyan's overwork ending into the banquet program response", () => {
    const overwork = play("ruoyin-stage", true, compiled, { previousEnding: "boyan-overwork" });
    const rest = play("ruoyin-stage", true, compiled, { previousEnding: "boyan-rest" });
    expect(overwork.texts.join(" ")).toContain("沒有再把「撐完」當作唯一值得稱讚的事");
    expect(rest.texts.join(" ")).not.toContain("沒有再把「撐完」當作唯一值得稱讚的事");
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
