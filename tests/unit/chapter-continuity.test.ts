import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { StoryBridge } from "../../src/story/storyBridge";
import { frameSchema } from "../../src/types/game";

const chapters = [
  ["boyan", ["moonlight", "recipient", "unfinished", "intervention"]],
  ["ruoyin", ["boyan-rest", "boyan-leave", "boyan-boundary", "boyan-overwork"]],
  ["yenuan", ["ruoyin-one", "ruoyin-stage", "ruoyin-score", "ruoyin-echo"]],
  ["yuhang", ["yenuan-share", "yenuan-reopen", "yenuan-rest", "yenuan-copy"]],
  ["haiming", ["yuhang-today", "yuhang-future", "yuhang-past", "yuhang-unknown"]],
  ["lincheng", ["haiming-light", "haiming-voice", "haiming-boat", "haiming-hero"]],
] as const;

describe("previous-night story continuity", () => {
  it.each(chapters)("%s responds to all four preceding endings and saves the selected response", (chapter, endings) => {
    const version = chapter === "boyan" || chapter === "yuhang" ? 5 : 4;
    const json = readFileSync(`public/story/compiled/${chapter}-chapter-${version}.json`, "utf8");
    const responses = endings.map((ending) => {
      const story = new StoryBridge(json, ending);
      story.next();
      const frame = story.next();
      expect(frame.text.length).toBeGreaterThan(20);
      expect(story.story.variablesState["previous_ending"]).toBe(ending);
      const restored = new StoryBridge(json);
      restored.restore(story.serialize(), frameSchema.parse(frame));
      expect(restored.frame).toEqual(frame);
      expect(restored.story.variablesState["previous_ending"]).toBe(ending);
      return frame.text;
    });
    expect(new Set(responses).size).toBe(4);
    const unseeded = new StoryBridge(json);
    unseeded.next();
    expect(responses).not.toContain(unseeded.next().text);
  });

  it("ignores the new context when restoring a story version without that variable", () => {
    const json = readFileSync("public/story/compiled/boyan-chapter-2.json", "utf8");
    const story = new StoryBridge(json, "moonlight");
    expect(story.next().text).toContain("十二點四十七分");
  });
});
