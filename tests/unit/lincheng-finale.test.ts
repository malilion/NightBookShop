import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { StoryBridge, type PriorChapterEndings } from "../../src/story/storyBridge";
import { parseTag } from "../../src/story/commandParser";
import { frameSchema, newLetter, type LetterDraft } from "../../src/types/game";
import { archiveConnections, connectionBetween, scoreArchive } from "../../src/services/archiveScoring";
import { scoreLetter } from "../../src/services/letterScoring";
import { chapterForVersion } from "../../src/data/catalog";

const compiled = readFileSync("public/story/compiled/lincheng-chapter-9.json", "utf8");
const chapterEight = readFileSync("public/story/compiled/lincheng-chapter-8.json", "utf8");
const chapterSeven = readFileSync("public/story/compiled/lincheng-chapter-7.json", "utf8");
const chapterSix = readFileSync("public/story/compiled/lincheng-chapter-6.json", "utf8");
const chapterFive = readFileSync("public/story/compiled/lincheng-chapter-5.json", "utf8");
const chapterFour = readFileSync("public/story/compiled/lincheng-chapter-4.json", "utf8");
const chapterThree = readFileSync("public/story/compiled/lincheng-chapter-3.json", "utf8");
const chapterTwo = readFileSync("public/story/compiled/lincheng-chapter-2.json", "utf8");
const previousCompiled = readFileSync("public/story/compiled/lincheng-chapter-1.json", "utf8");
const targets = {
  "lincheng-dawn": "取回記憶",
  "lincheng-keeper": "自願成為下一任守夜人",
  "lincheng-shelf": "讓信暫留書架",
  "lincheng-midnight": "拒絕坐下",
} as const;
const completeArchive = {
  inspected: ["jinglan", "boyan", "ruoyin", "yenuan", "yuhang", "haiming"] as (typeof archiveConnections)[number]["first"][],
  connections: archiveConnections.map((connection) => connection.id),
};

function play(target: keyof typeof targets, fullLetter = true, storyJson = compiled, options: { skipObjects?: boolean; previousEnding?: string; askOwnerConsent?: boolean; priorEndings?: PriorChapterEndings } = {}) {
  const story = new StoryBridge(storyJson, options.previousEnding, options.priorEndings);
  story.next();
  const sections = new Set<string>();
  const texts: string[] = [];
  const speakers: string[] = [];
  const portraits: string[] = [];
  const choices: string[] = [];
  let steps = 0;
  while (story.frame.mode !== "ending") {
    expect(++steps).toBeLessThan(300);
    sections.add(story.frame.section);
    texts.push(story.frame.text);
    speakers.push(story.frame.speaker);
    portraits.push(story.frame.portrait);
    choices.push(...story.frame.choices.map((entry) => entry.text));
    if (story.frame.mode === "tea")
      story.finishTea({ teaId: "osmanthus", quality: 90, emotionalMatch: 100 });
    else if (story.frame.mode === "archive")
      story.finishArchive(scoreArchive(completeArchive));
    else if (story.frame.mode === "letter") {
      expect(story.frame.fragments).toEqual(["kept", "afraid", "two-wishes", "embrace"]);
      story.finishLetter({ completion: fullLetter ? 100 : 50, understood: fullLetter });
    } else if (story.frame.canContinue) story.next();
    else {
      const selected = (options.askOwnerConsent ? story.frame.choices.find((entry) => entry.text.includes("童年的保管請求")) : undefined) ?? (options.skipObjects ? story.frame.choices.find((entry) => [
        "帶著看到的線索回到櫃台",
        "從兒時外套裡收起第一片信紙",
        "從高高的櫃台下收起另外兩片信紙",
      ].includes(entry.text)) : undefined) ?? story.frame.choices.find((entry) => entry.text.includes(targets[target])) ?? story.frame.choices[0];
      expect(selected).toBeDefined();
      story.choose(selected!.index);
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
  return { story, sections, texts, speakers, portraits, choices };
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
    expect(chapterForVersion("lincheng-chapter-5")).toBe("lincheng");
    expect(chapterForVersion("lincheng-chapter-6")).toBe("lincheng");
    expect(chapterForVersion("lincheng-chapter-7")).toBe("lincheng");
    expect(chapterForVersion("lincheng-chapter-8")).toBe("lincheng");
    expect(chapterForVersion("lincheng-chapter-9")).toBe("lincheng");
  });
  it("keeps the previous finale version loadable", () => {
    expect(play("lincheng-dawn", true, chapterSeven).story.frame.endingId).toBe("lincheng-dawn");
    expect(play("lincheng-dawn", true, chapterEight).story.frame.endingId).toBe("lincheng-dawn");
  });
  it("reflects each visitor's four first endings in their finale letter slot", () => {
    const cases = [
      ["jinglan", "第一格", ["moonlight", "recipient", "unfinished", "intervention"]],
      ["boyan", "第二格", ["boyan-rest", "boyan-leave", "boyan-boundary", "boyan-overwork"]],
      ["ruoyin", "第三格", ["ruoyin-one", "ruoyin-stage", "ruoyin-score", "ruoyin-echo"]],
      ["yenuan", "第四格", ["yenuan-share", "yenuan-reopen", "yenuan-rest", "yenuan-copy"]],
      ["yuhang", "第五格", ["yuhang-today", "yuhang-future", "yuhang-past", "yuhang-unknown"]],
    ] as const;
    for (const [chapter, prefix, endings] of cases) {
      const replies = endings.map((ending) => {
        const result = play("lincheng-dawn", true, compiled, { priorEndings: { [chapter]: ending } });
        expect(result.story.story.variablesState[`ending_${chapter}`]).toBe(ending);
        const slot = result.texts.filter((text) => text.startsWith(prefix));
        expect(slot).toHaveLength(1);
        return slot[0];
      });
      expect(new Set(replies).size).toBe(4);
    }
    const unseeded = play("lincheng-dawn");
    expect(unseeded.texts.some((text) => /^[第一二三四五]格/.test(text))).toBe(false);
    const combined = play("lincheng-dawn", true, compiled, {
      previousEnding: "haiming-light",
      priorEndings: {
        jinglan: "moonlight",
        boyan: "boyan-rest",
        ruoyin: "ruoyin-one",
        yenuan: "yenuan-share",
        yuhang: "yuhang-today",
      },
    });
    expect(combined.texts.filter((text) => /^第[一二三四五六]格/.test(text))).toHaveLength(6);
    expect(new StoryBridge(chapterEight, "haiming-light", { jinglan: "moonlight" }).story.variablesState["ending_jinglan"]).toBeNull();
  }, 60000);
  it("keeps the map hidden until the six-night archive is complete", () => {
    const story = new StoryBridge(compiled);
    story.next();
    const beforeArchive: string[] = [];
    while (story.frame.mode !== "archive") {
      beforeArchive.push(story.frame.text);
      if (story.frame.mode === "tea") story.finishTea({ teaId: "osmanthus", quality: 90, emotionalMatch: 100 });
      else if (story.frame.canContinue) story.next();
      else story.choose(story.frame.choices[0]!.index);
    }
    expect(beforeArchive.join(" ")).not.toContain("接成一張地圖");
    story.finishArchive({ count: 2, complete: false });
    const retryTexts: string[] = [];
    while (story.frame.mode !== "archive") {
      retryTexts.push(story.frame.text);
      expect(story.frame.section).not.toBe("hidden-room");
      story.next();
    }
    expect(retryTexts.join(" ")).toContain("地圖還沒有接全");
    expect(story.frame.text).toContain("還有紙背的關係沒找齊");
    story.finishArchive(scoreArchive(completeArchive));
    while (story.frame.section !== "hidden-room") story.next();
    expect(story.frame.text).toContain("收藏室");
  });
  it("does not rewrite the visitors' choices in the closing narration", () => {
    const hero = play("lincheng-shelf", true, compiled, { previousEnding: "haiming-hero" });
    const closing = hero.texts.find((text) => text.includes("六位訪客的書籤仍在書架上"));
    expect(closing).toContain("後來他們各自做出的選擇");
    expect(closing).not.toContain("海明的信還留著原句");
    const boat = play("lincheng-dawn", true, compiled, { previousEnding: "haiming-boat" });
    expect(boat.texts.join(" ")).toContain("放回六張紙旁");
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
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-four %s route", (target) => {
    expect(play(target, true, chapterFour).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-five %s route", (target) => {
    expect(play(target, true, chapterFive).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-six %s route", (target) => {
    expect(play(target, true, chapterSix).story.frame.endingId).toBe(target);
  });
  it("requires refusing the visitor seat for the midnight ending", () => {
    const refusal = play("lincheng-midnight");
    const readLetter = play("lincheng-dawn");
    expect(refusal.sections.has("self-letter")).toBe(false);
    expect(refusal.choices).toContain("拒絕坐下，繼續替別人整理故事");
    expect(readLetter.choices).not.toContain("把信合起來，回到櫃台繼續接待別人");
    expect(readLetter.choices).toContain("承認那段過去，讓信暫留書架，帶著未完的記憶離開");
  });
  it("lets Lincheng challenge the owner's use of her childhood request", () => {
    const challenged = play("lincheng-dawn", true, compiled, { askOwnerConsent: true });
    const unasked = play("lincheng-dawn");
    expect(challenged.texts.join(" ")).toContain("不能拿童年的請求，當成妳成年後同意守夜的證據");
    expect(challenged.texts.join(" ")).toContain("請他把「保管信」與「讓門在黎明前打不開」分開記進手冊");
    expect(challenged.texts.join(" ")).toContain("這一次不需要替店主的決定辯護");
    expect(unasked.texts.join(" ")).not.toContain("這一次不需要替店主的決定辯護");
  });
  it.each([
    ["haiming-light", "兩種筆跡都留在桌上", "不必先同意你對那晚的解釋"],
    ["haiming-voice", "索引放回錄音旁", "連停筆的地方一起"],
    ["haiming-boat", "沒有在空信套上寫好寄出的日期", "再決定今天讀到哪一句"],
    ["haiming-hero", "那頁原稿與整齊的版本並排", "別替我刪去難看的句子"],
  ])("carries %s into the cabinet and owner conversation", (previousEnding, cabinet, ownerTalk) => {
    const { story, texts } = play("lincheng-dawn", true, compiled, { previousEnding });
    expect(story.frame.endingId).toBe("lincheng-dawn");
    expect(texts.join(" ")).toContain(cabinet);
    expect(texts.join(" ")).toContain(ownerTalk);
  });
  it("attributes the owner's explanation and Lincheng's question to their speakers", () => {
    const { texts, speakers } = play("lincheng-dawn", true, compiled, { previousEnding: "haiming-light" });
    expect(speakers[texts.findIndex((text) => text.startsWith("我只保管妳要求我留住的紙"))]).toBe("店主");
    expect(speakers[texts.findIndex((text) => text.startsWith("妳問他為何把這當成挑選店員的理由"))]).toBe("旁白");
    expect(speakers[texts.findIndex((text) => text.startsWith("妳想起海明與顧川共讀時"))]).toBe("林澄");
  });
  it("uses supported tags", () => {
    const source = readFileSync("story/chapters/finale_lincheng.ink", "utf8");
    for (const match of source.matchAll(/#\s*([^#\n}]+)/g))
      expect(() => parseTag(match[1]!)).not.toThrow();
  });
  it("shows owner and child only on their reveal lines", () => {
    const { portraits } = play("lincheng-dawn");
    expect(portraits).toContain("owner");
    expect(portraits).toContain("lincheng-child");
    expect(portraits.indexOf("owner")).toBeLessThan(portraits.indexOf("lincheng-child"));
    expect(portraits).toContain("none");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("reaches %s and restores each choice and minigame checkpoint", (target) => {
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
  it("requires five evidence links across every archive page and the four original lines", () => {
    expect(scoreArchive(completeArchive)).toMatchObject({ count: 6, connected: 5, complete: true });
    expect(scoreArchive({ ...completeArchive, connections: completeArchive.connections.slice(0, 4) }).complete).toBe(false);
    expect(scoreArchive({ ...completeArchive, inspected: ["jinglan", "boyan"] }).complete).toBe(false);
    expect(connectionBetween("jinglan", "boyan")?.id).toBe("jinglan-boyan");
    expect(connectionBetween("jinglan", "haiming")).toBeUndefined();
    const letter: LetterDraft = {
      ...newLetter(), slots: ["kept", "afraid", "two-wishes", "embrace"],
      angles: [0, 0, 0, 0], flipped: [false, false, false, false], inspected: true,
    };
    expect(scoreLetter(letter, "lincheng")).toEqual({ completion: 100, understood: true });
    letter.slots[3] = null;
    expect(scoreLetter(letter, "lincheng").understood).toBe(false);
  });
});
