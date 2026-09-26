import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { teas } from "../../src/data/catalog";
import { scoreTea } from "../../src/services/teaScoring";
import { StoryBridge } from "../../src/story/storyBridge";
import { newTea, type TeaDraft, type TeaId, type TeaResult } from "../../src/types/game";

const chapters = [
  { id: "ruoyin", version: 7, tea: "lavender", garnish: "none", blackTea: 0, nextMode: "melody", hidden: "bus-hum", listening: "tea-breath", mismatch: "tea-score", ask: "今晚最怕錯過哪個時刻" },
  { id: "yenuan", version: 7, tea: "hojicha", garnish: "apple", blackTea: 0, nextMode: "hearth", hidden: "two-cups-break", listening: "oven-pause", mismatch: "tea-cleanup", ask: "烤箱一安靜下來" },
  { id: "yuhang", version: 8, tea: "mint", garnish: "lemon", blackTea: 20, nextMode: "route", hidden: "sister-route-note", listening: "own-address", mismatch: "delivery-reflex", ask: "若寄給自己" },
  { id: "haiming", version: 9, tea: "hojicha", garnish: "caramel", blackTea: 0, nextMode: "lamp", hidden: "tower-table", listening: "today-page", mismatch: "tea-date", ask: "想保留的原句" },
] as const;

function fittingDraft(chapter: (typeof chapters)[number]): TeaDraft {
  const teaId = chapter.tea as TeaId;
  return {
    ...newTea(), teaId, garnish: chapter.garnish, blackTea: chapter.blackTea,
    leaves: 3, water: 70, temperature: teas[teaId].temperature, seconds: teas[teaId].seconds,
  };
}

function draftInRange(chapter: (typeof chapters)[number], minimum: number, maximum: number): TeaDraft {
  const fitting = fittingDraft(chapter);
  for (const leaves of [0, 1, 2])
    for (const water of [20, 40, 70])
      for (const temperature of [60, 70, 80, 90])
        for (const seconds of [0, 10, 20, 30]) {
          const draft = { ...fitting, leaves, water, temperature, seconds };
          const quality = scoreTea(draft, chapter.id).quality;
          if (quality >= minimum && quality < maximum) return draft;
        }
  throw new Error(`No tea recipe in ${minimum}-${maximum} for ${chapter.id}`);
}

function playToNextActivity(chapter: (typeof chapters)[number], tea: TeaResult, leave = false) {
  const json = readFileSync(`public/story/compiled/${chapter.id}-chapter-${chapter.version}.json`, "utf8");
  const story = new StoryBridge(json);
  story.next();
  let sawFollowup = false;
  for (let step = 0; step < 100; step++) {
    if (story.frame.mode === chapter.nextMode) return { story, sawFollowup };
    if (story.frame.mode === "tea") story.finishTea(tea);
    else if (story.frame.canContinue) story.next();
    else {
      const followup = story.frame.choices.some((choice) => choice.text.includes(chapter.ask));
      if (followup) sawFollowup = true;
      const choice = followup && leave ? story.frame.choices[1] : story.frame.choices[0];
      expect(choice).toBeDefined();
      story.choose(choice!.index);
    }
  }
  throw new Error(`Did not reach ${chapter.nextMode} for ${chapter.id}`);
}

describe.each(chapters)("$id tea quality", (chapter) => {
  it("uses real recipes for resonance, extra listening, and a non-blocking mismatch", () => {
    const ideal = scoreTea(fittingDraft(chapter), chapter.id);
    const suitable = scoreTea(draftInRange(chapter, 70, 90), chapter.id);
    const ordinary = scoreTea(draftInRange(chapter, 50, 70), chapter.id);
    const mismatched = scoreTea({ ...newTea(), teaId: "black", leaves: 0, water: 0, temperature: 60, seconds: 0 }, chapter.id);
    expect(ideal.quality).toBeGreaterThanOrEqual(90);
    expect(ideal.emotionalMatch).toBeGreaterThanOrEqual(90);
    expect(suitable.quality).toBeGreaterThanOrEqual(70);
    expect(suitable.quality).toBeLessThan(90);
    expect(ordinary.quality).toBeGreaterThanOrEqual(50);
    expect(ordinary.quality).toBeLessThan(70);
    expect(mismatched.quality).toBeLessThan(50);

    const resonant = playToNextActivity(chapter, ideal);
    const scoreNinety = playToNextActivity(chapter, { ...ideal, quality: 90, emotionalMatch: 75 });
    const steady = playToNextActivity(chapter, suitable);
    const ask = playToNextActivity(chapter, ordinary);
    const wait = playToNextActivity(chapter, ordinary, true);
    const poor = playToNextActivity(chapter, mismatched);
    expect(resonant.story.frame.clues).toContain(chapter.hidden);
    expect(scoreNinety.story.frame.clues).toContain(chapter.hidden);
    expect(steady.sawFollowup).toBe(false);
    expect(steady.story.frame.clues).not.toContain(chapter.hidden);
    expect(steady.story.metrics.trust).toBeGreaterThan(poor.story.metrics.trust);
    expect(ask.sawFollowup).toBe(true);
    expect(ask.story.frame.clues).toContain(chapter.listening);
    expect(wait.sawFollowup).toBe(true);
    expect(wait.story.frame.clues).not.toContain(chapter.listening);
    expect(poor.story.frame.clues).toContain(chapter.mismatch);
    expect(poor.story.frame.mode).toBe(chapter.nextMode);
  });
});
