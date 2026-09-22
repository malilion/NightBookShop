import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { StoryBridge } from "../../src/story/storyBridge";
import { parseTag } from "../../src/story/commandParser";
import { frameSchema } from "../../src/types/game";
const compiled = readFileSync("public/story/compiled/main.json", "utf8");
function play(
  seed: number,
  target?: string,
  legacy = false,
  source = compiled,
) {
  const story = new StoryBridge(
    legacy
      ? readFileSync("public/story/compiled/jinglan-prototype-1.json", "utf8")
      : source,
  );
  story.next();
  const sections = new Set<string>();
  let state = seed,
    steps = 0;
  const random = () =>
    (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296;
  while (story.frame.mode !== "ending") {
    expect(++steps).toBeLessThan(600);
    sections.add(story.frame.section);
    if (story.frame.mode === "tea")
      story.finishTea({
        quality: target ? 100 : Math.floor(random() * 101),
        emotionalMatch: 100,
        teaId: target
          ? "osmanthus"
          : (["mint", "puer", "osmanthus"][seed % 3] as "mint"),
      });
    else if (story.frame.mode === "letter") {
      if (!legacy)
        expect(story.frame.fragments).toEqual(["address", "reason", "wait"]);
      story.finishLetter({
        completion: target ? 100 : seed % 2 ? 100 : 33,
        understood: !!target || (seed % 2 === 1 && seed % 3 === 0),
        alternate: !target && seed % 3 === 1,
      });
    } else if (story.frame.canContinue) story.next();
    else {
      const choices = story.frame.choices;
      expect(choices.length).toBeGreaterThan(0);
      const desired = {
        moonlight: "陪她寫一封信",
        recipient: "問她，是否願意",
        unfinished: "把信交還給她，今晚",
        intervention: "替她把信寄出",
      }[target || ""];
      const choice =
        (desired && choices.find((c) => c.text.includes(desired))) ||
        (target === "intervention" &&
          choices.find((c) => c.text.includes("仍替她封口"))) ||
        choices[target ? 0 : Math.floor(random() * choices.length)]!;
      story.choose(choice.index);
    }
    // Verify all targeted routes and sampled checkpoints on varied routes.
    if (!target && steps % 20 !== 0 && story.frame.mode === "dialogue")
      continue;
    const restored = new StoryBridge(
      legacy
        ? readFileSync("public/story/compiled/jinglan-prototype-1.json", "utf8")
        : source,
    );
    restored.restore(story.serialize(), frameSchema.parse(story.frame));
    expect(restored.frame).toEqual(story.frame);
    expect(restored.metrics).toEqual(story.metrics);
  }
  return { story, sections };
}
describe("complete Jinglan chapter", () => {
  it("all authored tags use the runtime allowlist", () => {
    const source = readFileSync("story/chapters/ch01_jinglan.ink", "utf8");
    for (const match of source.matchAll(/#\s*([^#\n}]+)/g))
      expect(() => parseTag(match[1]!)).not.toThrow();
    expect(() => parseTag("minigame:unknown")).toThrow();
  });
  it.each(["moonlight", "recipient", "unfinished", "intervention"])(
    "reaches %s through three memories and a complete afterword",
    (target) => {
      const { story, sections } = play(1, target);
      expect(story.frame.endingId).toBe(target);
      for (const section of [
        "school",
        "hospital",
        "platform",
        "coda",
        "afterword",
      ])
        expect(sections.has(section)).toBe(true);
      expect(story.frame.clues).toContain("old-address");
    },
  );
  it("128 deterministic varied routes terminate, including imperfect tea and letters", () => {
    const endings = new Set<string>();
    for (let seed = 1; seed <= 128; seed++)
      endings.add(play(seed).story.frame.endingId);
    expect(endings).toEqual(
      new Set(["moonlight", "recipient", "unfinished", "intervention"]),
    );
  }, 60000);
  it("continues original prototype saves against their original story", () => {
    expect(play(2, "moonlight", true).story.frame.endingId).toBe("moonlight");
  });
  it("continues chapter-one saves against their archived compiled story", () => {
    const original = readFileSync(
      "public/story/compiled/jinglan-chapter-1.json",
      "utf8",
    );
    expect(play(2, "moonlight", false, original).story.frame.endingId).toBe(
      "moonlight",
    );
  });
  it("blocks invalid choices and out-of-phase results", () => {
    const story = new StoryBridge(compiled);
    story.next();
    expect(() => story.choose(99)).toThrow();
    expect(() =>
      story.finishTea({
        quality: 100,
        emotionalMatch: 100,
        teaId: "osmanthus",
      }),
    ).toThrow();
  });
});
