import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { StoryBridge, type PriorChapterEndings } from "../../src/story/storyBridge";
import { parseTag } from "../../src/story/commandParser";
import { frameSchema, newLetter, type LetterDraft } from "../../src/types/game";
import { scoreLamp } from "../../src/services/lampScoring";
import { scoreLetter } from "../../src/services/letterScoring";

const compiled = readFileSync("public/story/compiled/haiming-chapter-27.json", "utf8");
const chapter26Archived = readFileSync("public/story/compiled/haiming-chapter-26.json", "utf8");
const chapter25Archived = readFileSync("public/story/compiled/haiming-chapter-25.json", "utf8");
const chapter24Archived = readFileSync("public/story/compiled/haiming-chapter-24.json", "utf8");
const chapter23Archived = readFileSync("public/story/compiled/haiming-chapter-23.json", "utf8");
const chapterTwentyTwo = readFileSync("public/story/compiled/haiming-chapter-22.json", "utf8");
const chapterTwentyOne = readFileSync("public/story/compiled/haiming-chapter-21.json", "utf8");
const chapterTwenty = readFileSync("public/story/compiled/haiming-chapter-20.json", "utf8");
const chapterNineteen = readFileSync("public/story/compiled/haiming-chapter-19.json", "utf8");
const chapterEighteen = readFileSync("public/story/compiled/haiming-chapter-18.json", "utf8");
const chapterSeventeen = readFileSync("public/story/compiled/haiming-chapter-17.json", "utf8");
const chapterSixteen = readFileSync("public/story/compiled/haiming-chapter-16.json", "utf8");
const chapterFifteen = readFileSync("public/story/compiled/haiming-chapter-15.json", "utf8");
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

function play(target: keyof typeof targets, polished = false, storyJson = compiled, options: { skipObjects?: boolean; previousEnding?: string; garnish?: "caramel" | "none"; orderDates?: boolean; reunionChoice?: "flex"; prefer?: string; teaId?: "hojicha" | "puer" | "mint"; extra?: string[]; priorEndings?: PriorChapterEndings } = {}) {
  const story = new StoryBridge(storyJson, options.previousEnding, options.priorEndings);
  story.next();
  const extra = [...(options.extra ?? [])];
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
      const extraStep = extra[0] && story.frame.choices.some((entry) => entry.text.includes(extra[0]!)) ? extra.shift() : undefined;
      const selected = (extraStep ? story.frame.choices.find((entry) => entry.text.includes(extraStep)) : undefined) ?? (options.prefer ? story.frame.choices.find((entry) => entry.text.includes(options.prefer!)) : undefined) ?? (options.reunionChoice === "flex" ? story.frame.choices.find((entry) => entry.text.includes("保留改變方法")) : undefined) ?? (options.orderDates ? story.frame.choices.find((entry) => entry.text.includes("先替他排好年份")) : undefined) ?? (options.skipObjects ? story.frame.choices.find((entry) => [
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
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-twenty-six %s route readable", (target) => {
    expect(play(target, target === "haiming-hero", chapter26Archived).story.frame.endingId).toBe(target);
  });
  it.each([
    ["puer", "浪頭打上第一層欄杆"],
    ["mint", "有沒有吃晚飯"],
  ] as const)("lets the %s tea return in the first memory", (teaId, line) => {
    expect(play("haiming-light", false, compiled, { teaId }).texts.join(" ")).toContain(line);
  });
  it("keeps the first memory unchanged for the suggested tea", () => {
    const texts = play("haiming-light").texts.join(" ");
    expect(texts).not.toContain("浪頭打上第一層欄杆");
    expect(texts).not.toContain("有沒有吃晚飯");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-twenty-five %s route readable", (target) => {
    expect(play(target, target === "haiming-hero", chapter25Archived).story.frame.endingId).toBe(target);
  });
  it.each([
    ["puer", "才說到那張邀請"],
    ["mint", "卻說不出那天為什麼沒有走"],
  ] as const)("lets the %s tea return in the later memory", (teaId, line) => {
    expect(play("haiming-light", false, compiled, { teaId }).texts.join(" ")).toContain(line);
  });
  it("keeps the later memory unchanged for the suggested tea", () => {
    const texts = play("haiming-light").texts.join(" ");
    expect(texts).not.toContain("才說到那張邀請");
    expect(texts).not.toContain("卻說不出那天為什麼沒有走");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-twenty-four %s route readable", (target) => {
    expect(play(target, target === "haiming-hero", chapter24Archived).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("remembers the second-choice talks in the %s afterword", (target) => {
    const texts = play(target, target === "haiming-hero", compiled, { extra: ["順著他說", "先替他排好年份"] }).texts.join(" ");
    expect(texts).toContain("常常自己就找回了座標");
    expect(texts).toContain("要看寄出的是哪一封");
  });
  it("leaves those afterword lines out on the first-choice route", () => {
    const texts = play("haiming-light").texts.join(" ");
    expect(texts).not.toContain("常常自己就找回了座標");
    expect(texts).not.toContain("要看寄出的是哪一封");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-twenty-three %s route readable", (target) => {
    expect(play(target, target === "haiming-hero", chapter23Archived).story.frame.endingId).toBe(target);
  });
  it.each([
    ["puer", "說到「適合放風箏」那一句"],
    ["mint", "反而更難受"],
  ] as const)("lets the %s tea return in the summer visit", (teaId, line) => {
    expect(play("haiming-light", false, compiled, { teaId }).texts.join(" ")).toContain(line);
  });
  it("keeps the summer visit unchanged for hojicha", () => {
    const texts = play("haiming-light").texts.join(" ");
    expect(texts).not.toContain("說到「適合放風箏」那一句");
    expect(texts).not.toContain("反而更難受");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-twenty %s route readable", (target) => {
    expect(play(target, target === "haiming-hero", chapterTwenty).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-twenty-two %s route readable", (target) => {
    expect(play(target, target === "haiming-hero", chapterTwentyTwo).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-twenty-one %s route readable", (target) => {
    expect(play(target, target === "haiming-hero", chapterTwentyOne).story.frame.endingId).toBe(target);
  });
  it.each([
    ["hojicha", "說完又說了一次。妳沒有提醒他"],
    ["puer", "說風向剛好轉了"],
    ["mint", "說今天是對的，才把紙船攤開"],
  ] as const)("lets the %s tea return just before the letter", (teaId, line) => {
    const texts = play("haiming-light", false, compiled, { teaId }).texts;
    const at = texts.findIndex((text) => text.includes(line));
    expect(at).toBeGreaterThan(-1);
    expect(texts.slice(at + 1).some((text) => text.includes("四片紙船上是海明寫給顧川的信"))).toBe(true);
  });
  it.each([
    ["hojicha", "haiming-light", "茶的味道倒沒記錯"],
    ["puer", "haiming-voice", "講得到船看見岸"],
    ["mint", "haiming-boat", "先確認今天的日期"],
  ] as const)("remembers the %s tea in the %s afterword", (teaId, target, line) => {
    const texts = play(target, false, compiled, { teaId }).texts.join(" ");
    expect(texts).toContain(line);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-nineteen %s route readable", (target) => {
    expect(play(target, target === "haiming-hero", chapterNineteen).story.frame.endingId).toBe(target);
  });
  it.each([
    ["haiming-light", "退到櫃台後", "沒有人急著填滿", "聽得見父親換氣"],
    ["haiming-light", "替顧川也泡一杯焙茶", "是焦糖放少了", "多放一點焦糖"],
    ["haiming-voice", "說一句晚安", "小川，晚安。", "跟著錄音又說了一次"],
    ["haiming-voice", "停在他剛才那個笑話", "最後一秒是他的笑聲", "笑完才發現自己在哭"],
    ["haiming-boat", "摺回原樣", "確定還在", "摺痕被摸得發軟"],
    ["haiming-boat", "寫上顧川的名字", "這樣船就知道要去哪裡", "讓他自己拿著"],
    ["haiming-hero", "收進一個信封", "還是我說的", "收進自己的包裡"],
    ["haiming-hero", "丟進字紙簍", "把傳記的封面撫平", "沒有地方可以查"],
  ] as const)("lets %s end with Lin Cheng's choice to %s", (target, choice, scene, afterword) => {
    const run = play(target, target === "haiming-hero", compiled, { extra: [choice] });
    const texts = run.texts.join(" ");
    expect(run.story.frame.endingId).toBe(target);
    expect(texts).toContain(scene);
    expect(texts).toContain(afterword);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-eighteen %s route readable", (target) => {
    expect(play(target, false, chapterEighteen).story.frame.endingId).toBe(target);
  });
  it.each([
    ["haiming-light", "反而是想起來", "我怕忘，妳怕記得", "一個怕想起來的孩子"],
    ["haiming-voice", "反而是想起來", "我怕忘，妳怕記得", "顧川不知道那是說給誰聽"],
    ["haiming-boat", "反而是想起來", "我怕忘，妳怕記得", "霧自己會散"],
    ["haiming-hero", "反而是想起來", "我怕忘，妳怕記得", "那一句也沒有寫進去"],
    ["haiming-light", "忘記這幾晚的客人", "它替我記得", "她也在寫航海誌"],
    ["haiming-voice", "忘記這幾晚的客人", "它替我記得", "她要記得她的客人"],
    ["haiming-boat", "忘記這幾晚的客人", "它替我記得", "那就讓她記"],
    ["haiming-hero", "忘記這幾晚的客人", "它替我記得", "傳記卻把他記得的方式刪掉了"],
  ] as const)("lets Haiming ask what Lin Cheng is afraid to forget before %s (%s)", (target, answer, reply, afterword) => {
    const run = play(target, target === "haiming-hero", compiled, { extra: ["明天醒來，要怎麼記得今晚", "摺個角", "怕忘記的事", answer] });
    const texts = run.texts.join(" ");
    expect(run.story.frame.endingId).toBe(target);
    expect(texts).toContain("妳有沒有怕忘記的事");
    expect(texts).toContain(reply);
    expect(texts).toContain(afterword);
    expect(texts).toContain(answer === "反而是想起來" ? "不是今晚才開始的" : "妳親手請人收起來的");
  });
  it("keeps Haiming's question until he has decided how to remember tonight", () => {
    const texts = play("haiming-light").texts.join(" ");
    expect(texts).not.toContain("妳有沒有怕忘記的事");
    expect(texts).not.toContain("不是今晚才開始的");
    expect(texts).not.toContain("妳親手請人收起來的");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-seventeen %s route readable", (target) => {
    expect(play(target, false, chapterSeventeen).story.frame.endingId).toBe(target);
  });
  it.each([
    ["moonlight", "haiming-light", "比較不怕寫錯", "大概不是他自己編的"],
    ["recipient", "haiming-voice", "我也該先問小川想不想聽", "同一首歌的聽眾"],
    ["unfinished", "haiming-boat", "都還在半路上", "也還在半路上的人"],
    ["intervention", "haiming-hero", "那我的信，妳別替我寄", "不是任何一個人的功績"],
  ] as const)("lets Jinglan's %s ending answer where Haiming learned the tune before %s", (jinglan, target, answer, afterword) => {
    const texts = play(target, target === "haiming-hero", compiled, { priorEndings: { jinglan }, extra: ["在校刊室聽過"] }).texts.join(" ");
    expect(texts).toContain("也許我們都只是路過同一個地方");
    expect(texts).toContain(answer);
    expect(texts).toContain(afterword);
  });
  it("offers both the teacher and the violinist when both earlier endings exist", () => {
    const texts = play("haiming-light", false, compiled, { priorEndings: { jinglan: "moonlight", ruoyin: "ruoyin-one" }, extra: ["小提琴手在寫這四個音", "在校刊室聽過"] }).texts.join(" ");
    expect(texts).toContain("常常也只照到一艘船");
    expect(texts).toContain("比較不怕寫錯");
    expect(texts).toContain("有人還在寫最後一個音");
    expect(texts).toContain("大概不是他自己編的");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-sixteen %s route readable", (target) => {
    expect(play(target, false, chapterSixteen).story.frame.endingId).toBe(target);
  });
  it.each([
    ["ruoyin-one", "haiming-light", "常常也只照到一艘船", "有人還在寫最後一個音"],
    ["ruoyin-stage", "haiming-voice", "順序常常反過來", "自己也會停在那裡"],
    ["ruoyin-score", "haiming-boat", "我可以講風向給她聽", "他沒有再補"],
    ["ruoyin-echo", "haiming-hero", "燈可以換人守", "那本來就不是他的歌"],
  ] as const)("lets Ruoyin's %s ending answer the tune Haiming hums before %s", (ruoyin, target, answer, afterword) => {
    const texts = play(target, target === "haiming-hero", compiled, { priorEndings: { ruoyin }, extra: ["小提琴手在寫這四個音"] }).texts.join(" ");
    expect(texts).toContain("那她後來，接上了嗎？");
    expect(texts).toContain(answer);
    expect(texts).toContain(afterword);
  });
  it("does not mention the violinist without Ruoyin's ending", () => {
    const texts = play("haiming-light", false, compiled, { extra: ["小提琴手在寫這四個音"] }).texts.join(" ");
    expect(texts).not.toContain("那她後來，接上了嗎？");
    expect(texts).not.toContain("有人還在寫最後一個音");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-fifteen %s route readable", (target) => {
    expect(play(target, false, chapterFifteen).story.frame.endingId).toBe(target);
  });
  it.each([
    ["haiming-light", "讓他自己念", "幫他在日誌今晚這一頁摺個角", ["顧川等他從頭再念", "用一枚夾子夾住了"]],
    ["haiming-light", "由妳念給他聽", "請他在住址卡背面寫一句", ["她念得比我好", "我收到了"]],
    ["haiming-voice", "讓他自己念", "請他在住址卡背面寫一句", ["第一次斷在一半", "第一件事是按下錄音鍵"]],
    ["haiming-boat", "由妳念給他聽", "幫他在日誌今晚這一頁摺個角", ["風把後半句吹散了", "也帶去了海邊"]],
    ["haiming-hero", "由妳念給他聽", "請他在住址卡背面寫一句", ["卻沒有把它寫進去", "那封信裡寫了什麼"]],
  ] as const)("lets Haiming read his line aloud and mark tonight before %s", (target, reader, mark, echoes) => {
    const texts = play(target, false, compiled, { extra: ["不知道怎麼回到你身邊", reader, "要怎麼記得今晚", mark] }).texts.join(" ");
    expect(texts).toContain("念出來，好像就真的是我說的了");
    expect(texts).toContain("很多晚上，我都以為自己會記得");
    expect(texts).toContain("紙船在桌上，燈還亮著");
    for (const echo of echoes) expect(texts).toContain(echo);
  });
  it("offers only the tonight question to a polished letter and keeps the talk optional", () => {
    const polished = play("haiming-hero", true, compiled, { extra: ["要怎麼記得今晚", "幫他在日誌今晚這一頁摺個角"] }).texts.join(" ");
    expect(polished).not.toContain("念出來，好像就真的是我說的了");
    expect(polished).toContain("摺角被壓平了");
    const skipped = play("haiming-voice").texts.join(" ");
    expect(skipped).not.toContain("紙船在桌上，燈還亮著");
    expect(skipped).not.toContain("第一件事是按下錄音鍵");
  });
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
