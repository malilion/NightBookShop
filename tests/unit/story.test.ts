import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { StoryBridge } from "../../src/story/storyBridge";
import { parseTag } from "../../src/story/commandParser";
import { frameSchema } from "../../src/types/game";
import { supportsMemoryEvidence } from "../../src/data/memoryEvidence";
const compiled = readFileSync("public/story/compiled/main.json", "utf8");
function play(
  seed: number,
  target?: string,
  legacy = false,
  source = compiled,
  reflection: "explore" | "skip" | "daily" = "explore",
  skipObservation = false,
  brew?: { teaId: "osmanthus" | "puer" | "mint"; quality: number },
  skipFamily = false,
) {
  const story = new StoryBridge(
    legacy
      ? readFileSync("public/story/compiled/jinglan-prototype-1.json", "utf8")
      : source,
  );
  story.next();
  const sections = new Set<string>();
  const texts: string[] = [];
  let state = seed,
    steps = 0;
  const random = () =>
    (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296;
  while (story.frame.mode !== "ending") {
    expect(++steps).toBeLessThan(600);
    sections.add(story.frame.section);
    texts.push(story.frame.text);
    if (story.frame.mode === "tea")
      story.finishTea({
        quality: brew?.quality ?? (target ? 100 : Math.floor(random() * 101)),
        emotionalMatch: 100,
        teaId: brew?.teaId ?? (target
          ? "osmanthus"
          : (["mint", "puer", "osmanthus"][seed % 3] as "mint")),
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
        (skipObservation && choices.find((c) => c.text.includes("把茶具備好，讓她慢慢說"))) ||
        (skipFamily && choices.find((c) => c.text.includes("把病房門口那片信紙收好"))) ||
        (reflection === "skip" && choices.find((c) => c.text.includes("把信交回她手裡，聽她自己決定下一步"))) ||
        (reflection === "daily" && choices.find((c) => c.text.includes("讓她自己決定，要不要談後來的生活"))) ||
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
  return { story, sections, texts };
}
describe("complete Jinglan chapter", () => {
  it("shows memory objects only for story versions that contain the interactive hubs", () => {
    expect(supportsMemoryEvidence("jinglan-chapter-1")).toBe(false);
    expect(supportsMemoryEvidence("jinglan-chapter-2")).toBe(true);
    expect(supportsMemoryEvidence("haiming-chapter-3")).toBe(false);
    expect(supportsMemoryEvidence("haiming-chapter-9")).toBe(true);
    expect(supportsMemoryEvidence("haiming-chapter-10")).toBe(true);
    expect(supportsMemoryEvidence("haiming-chapter-11")).toBe(true);
    expect(supportsMemoryEvidence("haiming-chapter-12")).toBe(true);
    expect(supportsMemoryEvidence("jinglan-prototype-1")).toBe(false);
  });
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
      expect(story.frame.clues).toContain("old-melody");
    },
    15_000,
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
  it.each(["moonlight", "recipient", "unfinished", "intervention"])("continues chapter-two %s saves against their archived compiled story", (target) => {
    const previous = readFileSync("public/story/compiled/jinglan-chapter-2.json", "utf8");
    const { story } = play(2, target, false, previous);
    expect(story.frame.endingId).toBe(target);
    expect(story.frame.clues).not.toContain("old-melody");
  });
  it("continues chapter-three saves against their archived compiled story", () => {
    const previous = readFileSync("public/story/compiled/jinglan-chapter-3.json", "utf8");
    expect(play(2, "moonlight", false, previous).story.frame.endingId).toBe("moonlight");
  });
  it("continues chapter-four saves against their archived compiled story", () => {
    const previous = readFileSync("public/story/compiled/jinglan-chapter-4.json", "utf8");
    expect(play(2, "moonlight", false, previous).story.frame.endingId).toBe("moonlight");
  });
  it("continues chapter-five saves against the exact archived compiled story", () => {
    const previous = readFileSync("public/story/compiled/jinglan-chapter-5.json", "utf8");
    expect(play(2, "moonlight", false, previous).story.frame.endingId).toBe("moonlight");
  });
  it("continues chapter-six saves against the exact archived compiled story", () => {
    const previous = readFileSync("public/story/compiled/jinglan-chapter-6.json", "utf8");
    expect(play(2, "moonlight", false, previous).story.frame.endingId).toBe("moonlight");
  });
  it("lets Jinglan describe her family's objection without erasing her own choice", () => {
    const explored = play(1, "moonlight").texts.join(" ");
    const skipped = play(1, "moonlight", false, compiled, "explore", false, undefined, true);
    expect(explored).toContain("外地沒有人照應");
    expect(explored).toContain("母親的反對與那晚她自己選擇留下，都是真的");
    expect(skipped.texts.join(" ")).not.toContain("外地沒有人照應");
    expect(skipped.story.frame.endingId).toBe("moonlight");
  });
  it("lets Jinglan keep the white camellia beside both parts of her life", () => {
    const explored = play(1, "moonlight");
    const skipped = play(1, "moonlight", false, compiled, "explore", true);
    expect(explored.story.frame.clues).toContain("camellia");
    expect(explored.texts.join(" ")).toContain("不是要誰替我選一邊");
    expect(skipped.story.frame.clues).not.toContain("camellia");
    expect(skipped.texts.join(" ")).not.toContain("不是要誰替我選一邊");
    expect(skipped.story.frame.endingId).toBe("moonlight");
  });
  it("unlocks the osmanthus-tree poetry memory at both careful and imperfect brews", () => {
    for (const quality of [45, 90]) {
      const text = play(1, "moonlight", false, compiled, "explore", false, { teaId: "osmanthus", quality }).texts.join(" ");
      expect(text).toContain("坐在樹下輪流讀詩");
      expect(text).toContain("花落進書頁");
    }
    const puer = play(1, "moonlight", false, compiled, "explore", false, { teaId: "puer", quality: 90 });
    expect(puer.texts.join(" ")).not.toContain("坐在樹下輪流讀詩");
  });
  it("lets Jinglan compare the two inks and her later life before deciding", () => {
    const explored = play(1, "moonlight").texts.join(" ");
    const skipped = play(1, "moonlight", false, compiled, "skip").texts.join(" ");
    const daily = play(1, "moonlight", false, compiled, "daily").texts.join(" ");
    expect(explored).toContain("他沒有留下答案。我不能替他說原諒");
    expect(explored).toContain("她把深色的「請原諒我」放在原信旁");
    expect(skipped).not.toContain("他沒有留下答案。我不能替他說原諒");
    expect(skipped).not.toContain("她把深色的「請原諒我」放在原信旁");
    expect(daily).toContain("每逢下雨都會把兩把傘靠在門邊");
    expect(daily).toContain("那是她自己的日子，還會接著往前");
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
