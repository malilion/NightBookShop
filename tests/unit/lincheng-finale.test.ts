import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { StoryBridge } from "../../src/story/storyBridge";
import { parseTag } from "../../src/story/commandParser";
import { frameSchema, newLetter, type LetterDraft } from "../../src/types/game";
import { scoreArchive } from "../../src/services/archiveScoring";
import { scoreLetter } from "../../src/services/letterScoring";
import { chapterForVersion } from "../../src/data/catalog";

const compiled = readFileSync("public/story/compiled/lincheng-chapter-4.json", "utf8");
const chapterThree = readFileSync("public/story/compiled/lincheng-chapter-3.json", "utf8");
const chapterTwo = readFileSync("public/story/compiled/lincheng-chapter-2.json", "utf8");
const previousCompiled = readFileSync("public/story/compiled/lincheng-chapter-1.json", "utf8");
const targets = {
  "lincheng-dawn": "取回記憶",
  "lincheng-keeper": "自願成為下一任守夜人",
  "lincheng-shelf": "讓信暫留書架",
  "lincheng-midnight": "拒絕坐下",
} as const;

function play(target: keyof typeof targets, fullLetter = true, storyJson = compiled, options: { skipObjects?: boolean; previousEnding?: string } = {}) {
  const story = new StoryBridge(storyJson, options.previousEnding);
  story.next();
  const sections = new Set<string>();
  const texts: string[] = [];
  let steps = 0;
  while (story.frame.mode !== "ending") {
    expect(++steps).toBeLessThan(300);
    sections.add(story.frame.section);
    texts.push(story.frame.text);
    if (story.frame.mode === "tea")
      story.finishTea({ teaId: "osmanthus", quality: 90, emotionalMatch: 100 });
    else if (story.frame.mode === "archive")
      story.finishArchive(scoreArchive({ inspected: ["jinglan", "boyan", "ruoyin", "yenuan", "yuhang", "haiming"] }));
    else if (story.frame.mode === "letter") {
      expect(story.frame.fragments).toEqual(["kept", "afraid", "two-wishes", "embrace"]);
      story.finishLetter({ completion: fullLetter ? 100 : 50, understood: fullLetter });
    } else if (story.frame.canContinue) story.next();
    else {
      const selected = (options.skipObjects ? story.frame.choices.find((entry) => [
        "帶著看到的線索回到櫃台",
        "從兒時外套裡收起第一片信紙",
        "從高高的櫃台下收起另外兩片信紙",
      ].includes(entry.text)) : undefined) ?? story.frame.choices.find((entry) => entry.text.includes(targets[target])) ?? story.frame.choices[0];
      expect(selected).toBeDefined();
      story.choose(selected!.index);
    }
    const restored = new StoryBridge(storyJson);
    restored.restore(story.serialize(), frameSchema.parse(story.frame));
    expect(restored.frame).toEqual(story.frame);
  }
  return { story, sections, texts };
}

describe("Lincheng finale", () => {
  it("keeps the previous finale save version loadable", () => {
    const story = new StoryBridge(previousCompiled);
    story.next();
    const restored = new StoryBridge(previousCompiled);
    restored.restore(story.serialize(), frameSchema.parse(story.frame));
    expect(restored.frame).toEqual(story.frame);
    expect(chapterForVersion("lincheng-chapter-1")).toBe("lincheng");
    expect(chapterForVersion("lincheng-chapter-2")).toBe("lincheng");
    expect(chapterForVersion("lincheng-chapter-3")).toBe("lincheng");
    expect(chapterForVersion("lincheng-chapter-4")).toBe("lincheng");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the %s route in the previous finale", (target) => {
    const { story, sections } = play(target, true, previousCompiled);
    expect(story.frame.endingId).toBe(target);
    expect(sections.has("hidden-room")).toBe(false);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-two %s route", (target) => {
    expect(play(target, true, chapterTwo).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-three %s route", (target) => {
    expect(play(target, true, chapterThree).story.frame.endingId).toBe(target);
  });
  it("uses supported tags", () => {
    const source = readFileSync("story/chapters/finale_lincheng.ink", "utf8");
    for (const match of source.matchAll(/#\s*([^#\n}]+)/g))
      expect(() => parseTag(match[1]!)).not.toThrow();
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("reaches %s and restores each checkpoint", (target) => {
    const { story, sections } = play(target);
    expect(story.frame.endingId).toBe(target);
    if (target !== "lincheng-midnight") {
      for (const section of ["archive", "hidden-room", "child-home", "hidden-envelope", "owner-talk", "self-letter", "dawn-choice", "afterword", "coda"])
        expect(sections.has(section)).toBe(true);
      expect(story.frame.clues).toContain("sixfold-map");
    }
  });
  it("allows an incomplete letter to remain on the shelf", () => {
    expect(play("lincheng-shelf", false).story.frame.endingId).toBe("lincheng-shelf");
  });
  it("allows leaving each memory with all four fragments", () => {
    const { story } = play("lincheng-shelf", false, compiled, { skipObjects: true });
    expect(story.frame.fragments).toEqual(["kept", "afraid", "two-wishes", "embrace"]);
  });
  it("keeps Haiming's erased hesitation alongside the hero narrative", () => {
    const hero = play("lincheng-shelf", false, compiled, { previousEnding: "haiming-hero" });
    const light = play("lincheng-shelf", false, compiled, { previousEnding: "haiming-light" });
    expect(hero.texts.join(" ")).toContain("讓那頁原稿與整齊的版本並排");
    expect(light.texts.join(" ")).not.toContain("讓那頁原稿與整齊的版本並排");
  });
  it("requires every archive page and the four original lines for a full return", () => {
    expect(scoreArchive({ inspected: ["jinglan", "boyan", "ruoyin", "yenuan", "yuhang", "haiming"] }).complete).toBe(true);
    expect(scoreArchive({ inspected: ["jinglan", "boyan"] }).complete).toBe(false);
    const letter: LetterDraft = {
      ...newLetter(), slots: ["kept", "afraid", "two-wishes", "embrace"],
      angles: [0, 0, 0, 0], flipped: [false, false, false, false], inspected: true,
    };
    expect(scoreLetter(letter, "lincheng")).toEqual({ completion: 100, understood: true });
    letter.slots[3] = null;
    expect(scoreLetter(letter, "lincheng").understood).toBe(false);
  });
});
