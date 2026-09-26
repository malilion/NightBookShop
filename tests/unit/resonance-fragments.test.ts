import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { StoryBridge } from "../../src/story/storyBridge";
import { frameSchema, type ResonanceChapterId, type TeaResult } from "../../src/types/game";
import { resonanceFragments } from "../../src/data/resonanceFragments";

const chapters = [
  { id: "jinglan", file: "main", teaId: "osmanthus" },
  { id: "boyan", file: "boyan-chapter-9", teaId: "chamomile" },
  { id: "ruoyin", file: "ruoyin-chapter-8", teaId: "lavender" },
  { id: "yenuan", file: "yenuan-chapter-7", teaId: "hojicha" },
  { id: "yuhang", file: "yuhang-chapter-8", teaId: "mint" },
  { id: "haiming", file: "haiming-chapter-10", teaId: "hojicha" },
] as const;

function atTea(file: string) {
  const story = new StoryBridge(readFileSync(`public/story/compiled/${file}.json`, "utf8"));
  story.next();
  for (let step = 0; step < 100 && story.frame.mode !== "tea"; step++) {
    if (story.frame.canContinue) story.next();
    else story.choose(story.frame.choices[0]!.index);
  }
  expect(story.frame.mode).toBe("tea");
  return story;
}

describe.each(chapters)("$id resonance fragment", (chapter) => {
  it("grants a readable extra fragment at score 90 and keeps it across a save restore", () => {
    const story = atTea(chapter.file);
    const result: TeaResult = { teaId: chapter.teaId, quality: 90, emotionalMatch: 75 };
    story.finishTea(result, chapter.id as ResonanceChapterId);
    expect(story.frame.resonanceFragment).toBe(chapter.id);
    expect(resonanceFragments[chapter.id].text.length).toBeGreaterThan(20);
    const restored = new StoryBridge(readFileSync(`public/story/compiled/${chapter.file}.json`, "utf8"));
    restored.restore(story.serialize(), frameSchema.parse(story.frame));
    expect(restored.frame.resonanceFragment).toBe(chapter.id);
  });

  it("does not grant the fragment at score 89", () => {
    const story = atTea(chapter.file);
    story.finishTea({ teaId: chapter.teaId, quality: 89, emotionalMatch: 100 }, chapter.id as ResonanceChapterId);
    expect(story.frame.resonanceFragment).toBeNull();
  });
});

it("Jinglan also recalls a hidden memory when another tea reaches score 90", () => {
  const story = atTea("main");
  story.finishTea({ teaId: "puer", quality: 90, emotionalMatch: 75 }, "jinglan");
  expect(story.frame.text).toContain("校刊室裡一張反覆修改的退稿信");
  expect(story.frame.resonanceFragment).toBe("jinglan");
});

it("shows a two-tea preparation note once before the visitor's response", () => {
  const story = atTea("main");
  story.finishTea({ teaId: "osmanthus", primaryTeaId: "osmanthus", blendTeaId: "puer", primaryLeaves: 2, blendLeaves: 1, quality: 96, emotionalMatch: 92 }, "jinglan");
  expect(story.frame.brewSummary).toContain("2 匙桂花烏龍與 1 匙熟普洱");
  expect(story.frame.speaker).toBe("旁白");
  story.next();
  expect(story.frame.brewSummary).toBe("");
});
