import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { StoryBridge } from "../../src/story/storyBridge";
import { parseTag } from "../../src/story/commandParser";
import { frameSchema, newLetter, type LetterDraft } from "../../src/types/game";
import { scoreLamp } from "../../src/services/lampScoring";
import { scoreLetter } from "../../src/services/letterScoring";

const compiled = readFileSync("public/story/compiled/haiming-chapter-15.json", "utf8");
const chapterFourteen = readFileSync("public/story/compiled/haiming-chapter-14.json", "utf8");
const chapterThirteen = readFileSync("public/story/compiled/haiming-chapter-13.json", "utf8");
const chapterTwelve = readFileSync("public/story/compiled/haiming-chapter-12.json", "utf8");
const chapterEleven = readFileSync("public/story/compiled/haiming-chapter-11.json", "utf8");
const chapterTen = readFileSync("public/story/compiled/haiming-chapter-10.json", "utf8");
const chapterNine = readFileSync("public/story/compiled/haiming-chapter-9.json", "utf8");
const chapterSeven = readFileSync("public/story/compiled/haiming-chapter-7.json", "utf8");
const chapterSix = readFileSync("public/story/compiled/haiming-chapter-6.json", "utf8");
const chapterFive = readFileSync("public/story/compiled/haiming-chapter-5.json", "utf8");
const chapterFour = readFileSync("public/story/compiled/haiming-chapter-4.json", "utf8");
const chapterThree = readFileSync("public/story/compiled/haiming-chapter-3.json", "utf8");
const chapterTwo = readFileSync("public/story/compiled/haiming-chapter-2.json", "utf8");
const previousCompiled = readFileSync("public/story/compiled/haiming-chapter-1.json", "utf8");
const targets = {
  "haiming-light": "邀請顧川到書店",
  "haiming-voice": "做一份聲音航海誌",
  "haiming-boat": "帶紙船去海邊",
  "haiming-hero": "只寄流暢的英雄故事",
} as const;

function play(target: keyof typeof targets, polished = false, storyJson = compiled, options: { skipObjects?: boolean; previousEnding?: string; garnish?: "caramel" | "none"; orderDates?: boolean; reunionChoice?: "flex"; prefer?: string; teaId?: "hojicha" | "puer" | "mint" } = {}) {
  const story = new StoryBridge(storyJson, options.previousEnding);
  story.next();
  const sections = new Set<string>();
  const texts: string[] = [];
  const portraits: string[] = [];
  let steps = 0;
  while (story.frame.mode !== "ending") {
    expect(++steps).toBeLessThan(280);
    sections.add(story.frame.section);
    texts.push(story.frame.text);
    portraits.push(story.frame.portrait);
    if (story.frame.mode === "tea")
      story.finishTea({ teaId: options.teaId ?? "hojicha", garnish: options.garnish ?? (options.teaId && options.teaId !== "hojicha" ? "none" : "caramel"), quality: 100, emotionalMatch: 100 });
    else if (story.frame.mode === "lamp")
      story.finishLamp(scoreLamp({ turns: ["steady", "steady", "steady"] }));
    else if (story.frame.mode === "letter") {
      expect(story.frame.fragments).toEqual(["light", "shore", "return", "remember"]);
      story.finishLetter({ completion: 100, understood: !polished, alternate: polished });
    } else if (story.frame.canContinue) story.next();
    else {
      const selected = (options.prefer ? story.frame.choices.find((entry) => entry.text.includes(options.prefer!)) : undefined) ?? (options.reunionChoice === "flex" ? story.frame.choices.find((entry) => entry.text.includes("保留改變方法")) : undefined) ?? (options.orderDates ? story.frame.choices.find((entry) => entry.text.includes("先替他排好年份")) : undefined) ?? (options.skipObjects ? story.frame.choices.find((entry) => [
        "從救援圖旁收起第一角紙船",
        "從風箏尾巴收起第二角紙船",
        "從邀請背面收起第三角紙船",
        "從煤油燈內取出最後一角紙船",
        "泡一杯茶，讓他慢慢想從哪裡開始",
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
  return { story, sections, texts, portraits };
}

describe("Haiming sixth night", () => {
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-thirteen %s route", (target) => {
    expect(play(target, false, chapterThirteen).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-fourteen %s route", (target) => {
    expect(play(target, target === "haiming-hero", chapterFourteen).story.frame.endingId).toBe(target);
  });
  it.each([
    ["yuhang-today", "那我這封，我自己交給小川"],
    ["yuhang-future", "我沒有七年。我寫明天"],
    ["yuhang-past", "寄回過去的，小川收不到"],
    ["yuhang-unknown", "不要讓它繞一輩子"],
  ])("lets %s shape how Haiming will hand over the letter", (previousEnding, answer) => {
    const light = play("haiming-light", false, compiled, { previousEnding, prefer: "這封信要自己交" }).texts.join(" ");
    expect(light).toContain("寫給自己的藍色信");
    expect(light).toContain(answer);
    expect(light).toContain("父子的手在紙船的摺痕上碰了一下");
  });
  it("carries the delivery answer into the other afterwords and stays optional", () => {
    const options = { previousEnding: "yuhang-today", prefer: "這封信要自己交" };
    expect(play("haiming-voice", false, compiled, options).texts.join(" ")).toContain("把收件人的名字念了兩遍");
    expect(play("haiming-boat", false, compiled, options).texts.join(" ")).toContain("他還沒交出去");
    expect(play("haiming-hero", true, compiled, options).texts.join(" ")).toContain("最後寄出傳記的，是妳");
    const first = play("haiming-light").texts.join(" ");
    expect(first).not.toContain("寫給自己的藍色信");
    expect(first).not.toContain("父子的手在紙船的摺痕上碰了一下");
  });
  it("lets pu-erh steady him for the wreck and remembers how it was heard", () => {
    const wind = play("haiming-voice", false, compiled, { teaId: "puer" }).texts.join(" ");
    expect(wind).toContain("妳想聽哪一種");
    expect(wind).toContain("最後那一下，是從這些慢慢來的");
    expect(wind).toContain("正好接上他說過的每一陣風");
    expect(wind).toContain("聽到第三遍才明白");
    const stops = play("haiming-light", false, compiled, { teaId: "puer", prefer: "通常講到哪裡就停" });
    const told = stops.texts.join(" ");
    expect(told).toContain("「後面是醫院。」");
    expect(told).toContain("往下移到醫院的號碼");
    expect(told).toContain("「然後我才去醫院。」");
    expect(told).not.toContain("正好接上他說過的每一陣風");
    expect(stops.story.frame.endingId).toBe("haiming-light");
  });
  it("lets mint sharpen his worry about dates and carries the answer into the fog", () => {
    const dated = play("haiming-boat", false, compiled, { teaId: "mint" });
    const written = dated.texts.join(" ");
    expect(written).toContain("是不是說錯了");
    expect(written).toContain("寫著，就不用一直問了");
    expect(written).toContain("背面寫著今天的日期和一個「晴」");
    expect(written).toContain("旁邊寫了顧川的名字");
    expect(dated.story.frame.endingId).toBe("haiming-boat");
    const allowed = play("haiming-hero", true, compiled, { teaId: "mint", prefer: "說錯日期也沒關係" }).texts.join(" ");
    expect(allowed).toContain("說錯了，燈也不會滅嗎");
    expect(allowed).toContain("那我問一下，應該也可以");
    expect(allowed).toContain("比較像我");
    expect(allowed).not.toContain("寫著，就不用一直問了");
    const hojicha = play("haiming-voice").texts.join(" ");
    for (const line of ["妳想聽哪一種", "是不是說錯了", "正好接上他說過的每一陣風", "那我問一下，應該也可以"])
      expect(hojicha).not.toContain(line);
  });
  it("uses only supported story tags", () => {
    const source = readFileSync("story/chapters/ch06_haiming.ink", "utf8");
    for (const match of source.matchAll(/#\s*([^#\n}]+)/g))
      expect(() => parseTag(match[1]!)).not.toThrow();
  });
  it("reveals the child and owner in the coda", () => {
    const { portraits, texts } = play("haiming-light");
    expect(portraits).toContain("lincheng-child");
    expect(portraits).toContain("owner");
    expect(portraits.indexOf("lincheng-child")).toBeLessThan(portraits.indexOf("owner"));
    expect(texts.join(" ")).toContain("妳暫時看不出它們通往哪裡");
    expect(texts.join(" ")).not.toContain("中心是夜行書店");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-twelve %s route", (target) => {
    expect(play(target, false, chapterTwelve).story.frame.endingId).toBe(target);
  });
  it("lets the opening questions return in the afterwords", () => {
    const light = play("haiming-light").texts.join(" ");
    for (const line of ["連我說錯的潮時，他也照抄", "東北風，四到五級", "他小時候還以為蛋本來就是那個顏色", "跟我煎的一樣"])
      expect(light).toContain(line);
    expect(play("haiming-voice").texts.join(" ")).toContain("顧川也照抄進日誌");
    expect(play("haiming-boat").texts.join(" ")).toContain("只問他是怎麼看出來的");
    expect(play("haiming-hero").texts.join(" ")).toContain("被當作筆誤刪掉了");
    const skipped = play("haiming-light", false, compiled, { skipObjects: true }).texts.join(" ");
    expect(skipped).not.toContain("跟我煎的一樣");
  });
  it("remembers how Lin Cheng answered when Haiming lost his place", () => {
    const gentle = play("haiming-light");
    const gentleText = gentle.texts.join(" ");
    expect(gentleText).toContain("對，妳剛才說過");
    expect(gentleText).toContain("不必每次都從頭解釋");
    expect(gentle.portraits[gentle.texts.findIndex((text) => text.includes("黑貓跳上桌"))]).toBe("haiming-warm");
    const along = play("haiming-light", false, compiled, { prefer: "順著他說" }).texts.join(" ");
    expect(along).toContain("像找回一個熟悉的座標");
    expect(along).not.toContain("不必每次都從頭解釋");
    const told = play("haiming-light", false, compiled, { prefer: "他剛才已經問過" });
    expect(told.texts.join(" ")).toContain("別人提醒我忘了的時候");
    expect(told.story.frame.endingId).toBe("haiming-light");
  });
  it("keeps the previous sixth-night version loadable", () => {
    expect(play("haiming-light", false, chapterEleven).story.frame.endingId).toBe("haiming-light");
  });
  it("uses searching and warm portraits at the matching story beats", () => {
    const { texts, portraits } = play("haiming-light");
    expect(portraits[texts.findIndex((text) => text.includes("這裡是哪裡？"))]).toBe("haiming-searching");
    expect(portraits[texts.findIndex((text) => text.includes("焦糖偷偷放進父親的杯裡"))]).toBe("haiming-warm");
    expect(portraits[texts.findIndex((text) => text.includes("顧川第一次握住父親的手"))]).toBe("haiming-warm");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("reaches %s and restores each choice and minigame checkpoint", (target) => {
    const { story, sections } = play(target);
    expect(story.frame.endingId).toBe(target);
    for (const section of ["storm-tower", "summer-visit", "last-watch", "white-room", "letter", "log-choice", "afterword", "coda"])
      expect(sections.has(section)).toBe(true);
    expect(story.frame.clues).toContain("lighthouse-photo");
    expect(story.frame.clues).toContain("shared-melody");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the previous %s route", (target) => {
    const { story } = play(target, false, previousCompiled);
    expect(story.frame.endingId).toBe(target);
    expect(story.frame.clues).not.toContain("shared-melody");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-two %s route", (target) => {
    expect(play(target, false, chapterTwo).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-three %s route", (target) => {
    expect(play(target, false, chapterThree).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-four %s route", (target) => {
    expect(play(target, false, chapterFour).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-five %s route", (target) => {
    expect(play(target, false, chapterFive).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-six %s route", (target) => {
    expect(play(target, false, chapterSix).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-seven %s route", (target) => {
    expect(play(target, false, chapterSeven).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-nine %s route", (target) => {
    expect(play(target, false, chapterNine).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-ten %s route", (target) => {
    expect(play(target, false, chapterTen).story.frame.endingId).toBe(target);
  });
  it("can leave each memory with four paper-boat fragments and no optional clues", () => {
    const { story } = play("haiming-boat", false, compiled, { skipObjects: true });
    expect(story.frame.fragments).toEqual(["light", "shore", "return", "remember"]);
    expect(story.frame.clues).not.toContain("rescue-log");
    expect(story.frame.clues).not.toContain("kite");
  });
  it("recalls Yuhang's past-stamp choice at the tide chart", () => {
    const past = play("haiming-boat", false, compiled, { previousEnding: "yuhang-past" });
    const today = play("haiming-boat", false, compiled, { previousEnding: "yuhang-today" });
    expect(past.texts.join(" ")).toContain("顧川的路也不該只照他的日誌安排");
    expect(today.texts.join(" ")).not.toContain("顧川的路也不該只照他的日誌安排");
  });
  it.each([
    ["yuhang-today", "知道可以出發與真的踏上船"],
    ["yuhang-future", "日期也可能再一次消失"],
    ["yuhang-past", "顧川的路也不該只照他的日誌安排"],
    ["yuhang-unknown", "不表示妳可以替雨航把他尚未拆的信打開"],
  ])("recalls %s without deciding for either visitor", (previousEnding, expected) => {
    const route = play("haiming-boat", false, compiled, { previousEnding });
    expect(route.texts.join(" ")).toContain(expected);
    expect(route.texts.join(" ")).toContain("不能用後來的風暴，抹掉我先前做的選擇");
    expect(route.texts.join(" ")).toContain("我曾能搭上早班船");
    expect(route.story.frame.endingId).toBe("haiming-boat");
  });
  it("lets Yuhang return after the future-stamp ending without claiming his plan is done", () => {
    const plan = play("haiming-boat", false, compiled, { previousEnding: "yuhang-future" });
    const flexible = play("haiming-boat", false, compiled, { previousEnding: "yuhang-future", reunionChoice: "flex" });
    expect(plan.sections).toContain("reunion");
    expect(plan.texts.join(" ")).toContain("箱子還在床下");
    expect(flexible.texts.join(" ")).toContain("不是另一張不能改的派送表");
    expect(plan.texts.join(" ")).toContain("兩點二十三分，一位老人推門進來");
    for (const previousEnding of ["yuhang-today", "yuhang-past", "yuhang-unknown"])
      expect(play("haiming-boat", false, compiled, { previousEnding }).sections).not.toContain("reunion");
  });
  it("responds to salted caramel actually being added to hojicha", () => {
    const caramel = play("haiming-boat");
    const plain = play("haiming-boat", false, compiled, { garnish: "none" });
    expect(caramel.texts.join(" ")).toContain("焙茶與一點鹹甜氣味");
    expect(plain.texts.join(" ")).toContain("海鹽焦糖還沒加入");
  });
  it("keeps distinct evidence in all four memories before Haiming chooses his words", () => {
    const explored = play("haiming-light");
    const skipped = play("haiming-boat", false, compiled, { skipObjects: true });
    const fullText = explored.texts.join(" ");
    const briefText = skipped.texts.join(" ");
    expect(fullText).toContain("被救回的人、錯過的出生、還來得及出發的那一刻");
    expect(fullText).toContain("孩子等候的時間、海明修燈的時間");
    expect(fullText).toContain("那天顧川怎麼等、後來怎麼想，得由顧川自己說");
    expect(fullText).toContain("它們不能替他擋住遺忘");
    expect(briefText).not.toContain("三件紀錄攤在一起");
    expect(briefText).toContain("還沒看過的東西不該由書店替他補寫");
  });
  it("lets Haiming keep his own wording even when the player first orders the dates", () => {
    const ordered = play("haiming-light", false, compiled, { orderDates: true });
    expect(ordered.texts.join(" ")).toContain("他請妳先別刪");
    expect(ordered.story.frame.endingId).toBe("haiming-light");
  });
  it("keeps contradictory original words for full understanding", () => {
    const letter: LetterDraft = {
      ...newLetter(), slots: ["light", "shore", "return", "remember"],
      angles: [0, 0, 0, 0], flipped: [false, false, false, false], inspected: true,
    };
    expect(scoreLetter(letter, "haiming")).toEqual({ completion: 100, understood: true });
    letter.alternate = true;
    expect(scoreLetter(letter, "haiming").understood).toBe(false);
    expect(play("haiming-hero", true).story.frame.endingId).toBe("haiming-hero");
  });
  it("keeps soft light and detects the extremes", () => {
    expect(scoreLamp({ turns: ["steady", "steady", "steady"] }).balanced).toBe(true);
    expect(scoreLamp({ turns: ["brighten", "brighten", "brighten"] }).brightness).toBe(100);
    expect(scoreLamp({ turns: ["dim", "dim", "dim"] }).brightness).toBe(0);
    expect(scoreLamp({ turns: ["brighten", "brighten", "brighten"] }).balanced).toBe(false);
  });
});
