import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { StoryBridge } from "../../src/story/storyBridge";
import { parseTag } from "../../src/story/commandParser";
import { frameSchema, newLetter, type LetterDraft } from "../../src/types/game";
import { scoreLetter } from "../../src/services/letterScoring";
import { scoreHearth } from "../../src/services/hearthScoring";

const compiled = readFileSync("public/story/compiled/yenuan-chapter-21.json", "utf8");
const chapter20Archived = readFileSync("public/story/compiled/yenuan-chapter-20.json", "utf8");
const chapter19Archived = readFileSync("public/story/compiled/yenuan-chapter-19.json", "utf8");
const chapter18Archived = readFileSync("public/story/compiled/yenuan-chapter-18.json", "utf8");
const chapter17Archived = readFileSync("public/story/compiled/yenuan-chapter-17.json", "utf8");
const chapterSixteen = readFileSync("public/story/compiled/yenuan-chapter-16.json", "utf8");
const chapterFifteen = readFileSync("public/story/compiled/yenuan-chapter-15.json", "utf8");
const chapterFourteen = readFileSync("public/story/compiled/yenuan-chapter-14.json", "utf8");
const chapterThirteen = readFileSync("public/story/compiled/yenuan-chapter-13.json", "utf8");
const chapterTwelve = readFileSync("public/story/compiled/yenuan-chapter-12.json", "utf8");
const chapterEleven = readFileSync("public/story/compiled/yenuan-chapter-11.json", "utf8");
const chapterTen = readFileSync("public/story/compiled/yenuan-chapter-10.json", "utf8");
const chapterNine = readFileSync("public/story/compiled/yenuan-chapter-9.json", "utf8");
const chapterEight = readFileSync("public/story/compiled/yenuan-chapter-8.json", "utf8");
const chapterSeven = readFileSync("public/story/compiled/yenuan-chapter-7.json", "utf8");
const chapterFive = readFileSync("public/story/compiled/yenuan-chapter-5.json", "utf8");
const chapterFour = readFileSync("public/story/compiled/yenuan-chapter-4.json", "utf8");
const chapterThree = readFileSync("public/story/compiled/yenuan-chapter-3.json", "utf8");
const chapterTwo = readFileSync("public/story/compiled/yenuan-chapter-2.json", "utf8");
const previousCompiled = readFileSync("public/story/compiled/yenuan-chapter-1.json", "utf8");
const targets = {
  "yenuan-share": "陪她烤一顆新的麵包",
  "yenuan-reopen": "讓原配方重新上架",
  "yenuan-rest": "讓晨麥休息一週",
  "yenuan-copy": "完全複製母親的麵包",
} as const;

function play(target: keyof typeof targets, fullLetter = true, storyJson = compiled, options: { skipObjects?: boolean; previousEnding?: string; garnish?: "apple" | "none"; teaId?: "hojicha" | "lavender" | "black"; chooseTexts?: string[] } = {}) {
  const story = new StoryBridge(storyJson, options.previousEnding);
  story.next();
  const sections = new Set<string>();
  const texts: string[] = [];
  let finalChoiceOptions: string[] = [];
  let steps = 0;
  while (story.frame.mode !== "ending") {
    expect(++steps).toBeLessThan(260);
    sections.add(story.frame.section);
    texts.push(story.frame.text);
    if (story.frame.text.includes("烤箱還有餘溫"))
      finalChoiceOptions = story.frame.choices.map((choice) => choice.text);
    if (story.frame.mode === "tea")
      story.finishTea({ teaId: options.teaId ?? "hojicha", garnish: options.garnish ?? (options.teaId && options.teaId !== "hojicha" ? "none" : "apple"), quality: 100, emotionalMatch: 100 });
    else if (story.frame.mode === "hearth")
      story.finishHearth(scoreHearth({ responses: ["wait", "ask", "wait"] }));
    else if (story.frame.mode === "letter") {
      expect(story.frame.fragments).toEqual(["flour", "apple", "waiting"]);
      story.finishLetter({ completion: fullLetter ? 100 : 50, understood: fullLetter });
    } else if (story.frame.canContinue) story.next();
    else {
      const choice = (options.skipObjects ? story.frame.choices.find((entry) => [
        "從麵粉袋下收起第一片食譜",
        "收起活動傳單裡的第二片紙",
        "帶著尚未回答的問題走向老烤箱",
        "將第三片食譜收好，回書店",
        "請她先坐下，妳去泡茶",
        "讓那顆麵包留在籃底，先拼食譜",
      ].includes(entry.text)) : undefined) ?? story.frame.choices.find((entry) =>
        options.chooseTexts?.some((text) => entry.text.includes(text)),
      ) ?? story.frame.choices.find((entry) =>
        entry.text.includes(target === "yenuan-reopen" ? "照媽媽的配方" : "加入自己喜歡的柚子"),
      ) ?? story.frame.choices.find((entry) => entry.text.includes(targets[target]))
        ?? story.frame.choices[0];
      // Recipe preference is chosen before the ending choice.
      const endingChoice = story.frame.choices.find((entry) => entry.text.includes(targets[target]));
      story.choose((endingChoice ?? choice)!.index);
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
  return { story, sections, texts, finalChoiceOptions };
}

describe("Yenuan fourth night", () => {
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-twenty %s route readable", (target) => {
    expect(play(target, true, chapter20Archived).story.frame.endingId).toBe(target);
  });
  it.each([
    ["lavender", "用的卻是別人的語氣"],
    ["black", "她的手指也跟著動了一下"],
  ] as const)("lets the %s tea return in the first memory", (teaId, line) => {
    expect(play("yenuan-rest", true, compiled, { teaId }).texts.join(" ")).toContain(line);
  });
  it("keeps the first memory unchanged for the suggested tea", () => {
    const texts = play("yenuan-share").texts.join(" ");
    expect(texts).not.toContain("用的卻是別人的語氣");
    expect(texts).not.toContain("她的手指也跟著動了一下");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-nineteen %s route readable", (target) => {
    expect(play(target, true, chapter19Archived).story.frame.endingId).toBe(target);
  });
  it.each([
    ["lavender", "這是她自己的那一晚"],
    ["black", "又放開"],
  ] as const)("lets the %s tea return in the later memory", (teaId, line) => {
    expect(play("yenuan-rest", true, compiled, { teaId }).texts.join(" ")).toContain(line);
  });
  it("keeps the later memory unchanged for the suggested tea", () => {
    const texts = play("yenuan-share").texts.join(" ");
    expect(texts).not.toContain("這是她自己的那一晚");
    expect(texts).not.toContain("又放開");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-eighteen %s route readable", (target) => {
    expect(play(target, true, chapter18Archived).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("remembers the second-choice talks in the %s afterword", (target) => {
    const texts = play(target, true, compiled, { chooseTexts: ["會先找誰幫忙", "若這次麵包仍烤焦"] }).texts.join(" ");
    expect(texts).toContain("那三個名字一直排在她心裡");
    expect(texts).toContain("即使有些早上仍做不到");
  });
  it("leaves those afterword lines out on the first-choice route", () => {
    const texts = play("yenuan-share").texts.join(" ");
    expect(texts).not.toContain("那三個名字一直排在她心裡");
    expect(texts).not.toContain("即使有些早上仍做不到");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-seventeen %s route readable", (target) => {
    expect(play(target, true, chapter17Archived).story.frame.endingId).toBe(target);
  });
  it.each([
    ["lavender", "像在看別人家的店"],
    ["black", "像又想去擦"],
  ] as const)("lets the %s tea return in the anniversary memory", (teaId, line) => {
    expect(play("yenuan-rest", true, compiled, { teaId }).texts.join(" ")).toContain(line);
  });
  it("keeps the anniversary memory unchanged for hojicha", () => {
    const texts = play("yenuan-share").texts.join(" ");
    expect(texts).not.toContain("像在看別人家的店");
    expect(texts).not.toContain("像又想去擦");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-thirteen %s route readable", (target) => {
    expect(play(target, true, chapterThirteen).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-sixteen %s route readable", (target) => {
    expect(play(target, true, chapterSixteen).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-fifteen %s route readable", (target) => {
    expect(play(target, true, chapterFifteen).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-fourteen %s route readable", (target) => {
    expect(play(target, true, chapterFourteen).story.frame.endingId).toBe(target);
  });
  it.each([
    ["hojicha", "晨麥打烊以後就是這個味道"],
    ["lavender", "已經不再說「那個女兒」"],
    ["black", "沒有去找抹布"],
  ] as const)("lets the %s tea return just before the recipe", (teaId, line) => {
    const texts = play("yenuan-rest", true, compiled, { teaId }).texts;
    const at = texts.findIndex((text) => text.includes(line));
    expect(at).toBeGreaterThan(-1);
    expect(texts.slice(at + 1).some((text) => text.includes("正面是蘋果麵包食譜"))).toBe(true);
  });
  it.each([
    ["hojicha", "yenuan-share", "手邊總有一杯是給自己的"],
    ["lavender", "yenuan-rest", "試著用「我」說今天發生了什麼"],
    ["black", "yenuan-copy", "擦完三遍就停"],
  ] as const)("remembers the %s tea in the %s afterword", (teaId, target, line) => {
    const texts = play(target, true, compiled, { teaId }).texts.join(" ");
    expect(texts).toContain(line);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-twelve %s route readable", (target) => {
    expect(play(target, true, chapterTwelve).story.frame.endingId).toBe(target);
  });
  it.each([
    ["yenuan-share", "一起包餃子", "最想問的那句一直沒問", "剁進餃子餡"],
    ["yenuan-reopen", "一起包餃子", "最想問的那句一直沒問", "說的不只是配方"],
    ["yenuan-rest", "一起包餃子", "最想問的那句一直沒問", "對著空廚房說了幾句"],
    ["yenuan-copy", "一起包餃子", "最想問的那句一直沒問", "那句話更沒有地方問了"],
    ["yenuan-share", "很少打電話回家", "媽媽都想知道這個", "先寫好的開頭"],
    ["yenuan-reopen", "很少打電話回家", "媽媽都想知道這個", "沒有收件人的相簿"],
    ["yenuan-rest", "很少打電話回家", "媽媽都想知道這個", "寫滿七格"],
    ["yenuan-copy", "很少打電話回家", "媽媽都想知道這個", "卻總是記不起來"],
  ] as const)("lets Yenuan ask about Lin Cheng's mother before %s (%s)", (target, answer, reply, afterword) => {
    const run = play(target, true, compiled, { chooseTexts: ["聽她問起妳的母親", answer] });
    const texts = run.texts.join(" ");
    expect(run.story.frame.endingId).toBe(target);
    expect(texts).toContain("妳媽媽呢？");
    expect(texts).toContain(reply);
    expect(texts).toContain(afterword);
    expect(texts).toContain(answer === "一起包餃子" ? "也許就是那一年以前" : "這樣也可以說");
  });
  it("leaves Yenuan's question out when the player moves on to the recipe", () => {
    const texts = play("yenuan-share", true, compiled, { chooseTexts: ["想留下哪一口"] }).texts.join(" ");
    expect(texts).not.toContain("妳媽媽呢？");
    expect(texts).not.toContain("也許就是那一年以前");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-eleven %s route readable", (target) => {
    expect(play(target, true, chapterEleven).story.frame.endingId).toBe(target);
  });
  it.each([
    ["yenuan-share", "接過一片，坐在她旁邊吃", "可是我喜歡", "跟一個人一起吃過"],
    ["yenuan-share", "把第一片留給明早的常客", "改，不是對不起她", "少放了一點柚子皮"],
    ["yenuan-reopen", "照實說「一樣」", "對，就是這個", "多畫一道短線"],
    ["yenuan-reopen", "是我烤的，可能差一點", "也是晨麥的味道", "今年的蘋果比較甜"],
    ["yenuan-rest", "補一行留言方式", "休息完會回覆", "休息好再回來"],
    ["yenuan-rest", "讓門關著就好", "敲門的人就讓他敲", "也沒有去想是誰"],
    ["yenuan-copy", "不會差，只要照著做", "筆尖把紙劃破了一點", "用膠帶貼了起來"],
    ["yenuan-copy", "把茶推到她面前", "麵包在架上慢慢涼了", "差一點也沒關係"],
  ] as const)("lets %s end with Lin Cheng's choice to %s", (target, choice, scene, afterword) => {
    const run = play(target, true, compiled, { chooseTexts: [choice] });
    const texts = run.texts.join(" ");
    expect(texts).toContain(scene);
    expect(texts).toContain(afterword);
    expect(run.story.frame.endingId).toBe(target);
  });
  it("uses only supported story tags", () => {
    const source = readFileSync("story/chapters/ch04_yenuan.ink", "utf8");
    for (const match of source.matchAll(/#\s*([^#\n}]+)/g))
      expect(() => parseTag(match[1]!)).not.toThrow();
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])(
    "reaches %s and restores each choice and minigame checkpoint",
    (target) => {
      const { story, sections } = play(target);
      expect(story.frame.endingId).toBe(target);
      for (const section of [
        "dawn-kitchen", "anniversary", "hospital-return", "old-oven", "letter", "recipe-choice", "afterword", "coda",
      ]) expect(sections.has(section)).toBe(true);
      expect(story.frame.clues).toContain("moon-card");
      expect(story.frame.clues).toContain("childhood-glimpse");
      expect(story.frame.clues).toContain("recipe-postmark");
      expect(story.frame.clues).toContain("voicemail");
    },
  );
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the previous %s route", (target) => {
    const { story } = play(target, true, previousCompiled);
    expect(story.frame.endingId).toBe(target);
    expect(story.frame.clues).not.toContain("recipe-postmark");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-two %s route", (target) => {
    expect(play(target, true, chapterTwo).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-three %s route", (target) => {
    expect(play(target, true, chapterThree).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-four %s route", (target) => {
    expect(play(target, true, chapterFour).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-five %s route", (target) => {
    expect(play(target, true, chapterFive).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-seven %s route", (target) => {
    expect(play(target, true, chapterSeven).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-eight %s route", (target) => {
    expect(play(target, true, chapterEight).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-nine %s route", (target) => {
    expect(play(target, true, chapterNine).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("restores the chapter-ten %s route", (target) => {
    expect(play(target, true, chapterTen).story.frame.endingId).toBe(target);
  });
  it.each([
    ["ruoyin-one", "不必寫給滿座的客人", "寫給明天早上的我"],
    ["ruoyin-stage", "先聽完別人的味道", "寫給明天早上的我"],
    ["ruoyin-score", "不必寫得很長", "寫給明天早上的我"],
    ["ruoyin-echo", "未必就是回來了", "是不是就不用決定了"],
  ])("lets %s return at the recipe's last line", (previousEnding, reflection, answer) => {
    const share = play("yenuan-share", true, compiled, { previousEnding }).texts.join(" ");
    expect(share).toContain(reflection);
    expect(share).toContain(answer);
    expect(share).toContain("給早上的自己，先吃一片");
  });
  it("keeps the last-line question optional and absent without a previous night", () => {
    expect(play("yenuan-copy", true, compiled, { previousEnding: "ruoyin-one" }).texts.join(" ")).toContain("沒有留給她");
    const first = play("yenuan-share");
    expect(first.texts.join(" ")).not.toContain("給早上的自己，先吃一片");
    expect(first.story.frame.endingId).toBe("yenuan-share");
  });
  it("lets lavender tea tell the night as someone else's story until the hospital", () => {
    const stranger = play("yenuan-reopen", true, compiled, { teaId: "lavender", chooseTexts: ["那個女兒後來怎麼了"] }).texts.join(" ");
    expect(stranger).toContain("有個麵包師的女兒");
    expect(stranger).toContain("說成是別人，我就不用決定要不要原諒她");
    expect(stranger).toContain("我說不下去別人的故事了");
    expect(stranger).toContain("改口：「是我。」");
    const firstPerson = play("yenuan-reopen", true, compiled, { teaId: "lavender", chooseTexts: ["試著用「我」說一句"] });
    const said = firstPerson.texts.join(" ");
    expect(said).toContain("「我……說了再五分鐘。」");
    expect(said).toContain("這次她沒有停在「再五分鐘」");
    expect(said).not.toContain("改口：「是我。」");
    expect(firstPerson.story.frame.endingId).toBe("yenuan-reopen");
    const hojicha = play("yenuan-reopen").texts.join(" ");
    expect(hojicha).not.toContain("有個麵包師的女兒");
    expect(hojicha).not.toContain("我說不下去別人的故事了");
  });
  it("lets black tea send Yenuan tidying, and remembers how the cloth was answered", () => {
    const together = play("yenuan-rest", true, compiled, { teaId: "black", chooseTexts: ["陪她一起擦"] }).texts.join(" ");
    expect(together).toContain("抹布經過妳的茶杯三次");
    expect(together).toContain("好像擦不出更多東西了");
    expect(together).toContain("讓傳單留著皺摺");
    expect(together).toContain("把抹布掛回去");
    const seated = play("yenuan-rest", true, compiled, { teaId: "black", chooseTexts: ["把抹布收走"] });
    const quiet = seated.texts.join(" ");
    expect(quiet).toContain("我就只剩下那天晚上");
    expect(quiet).toContain("她沒有再去撫平傳單");
    expect(quiet).toContain("那一週她練習讓手空著");
    expect(quiet).not.toContain("把抹布掛回去");
    expect(seated.story.frame.endingId).toBe("yenuan-rest");
    const hojicha = play("yenuan-rest").texts.join(" ");
    expect(hojicha).not.toContain("抹布經過妳的茶杯三次");
    expect(hojicha).not.toContain("讓手空著");
  });
  it("lets the opening details and the cut burnt bread return in each afterword", () => {
    const text = (target: keyof typeof targets, options = {}) => play(target, true, compiled, options).texts.join(" ");
    const share = text("yenuan-share");
    for (const line of ["同一個季節裡重複了好幾年", "不知道該對誰說生日快樂", "聞一整天就飽了", "我追了三條街", "只把它推到妳手邊", "我從來沒切開過", "比我以為的甜"])
      expect(share).toContain(line);
    expect(share).toContain("先吃中間最軟的那一片");
    expect(text("yenuan-reopen")).toContain("最後一片總是葉暖自己吃掉的");
    expect(text("yenuan-rest")).toContain("比她記得的還多一盒");
    expect(text("yenuan-copy")).toContain("沒有再切開第二次");
    const skipped = play("yenuan-share", true, compiled, { skipObjects: true });
    expect(skipped.texts.join(" ")).not.toContain("我從來沒切開過");
    expect(skipped.texts.join(" ")).not.toContain("先吃中間最軟的那一片");
  });
  it("keeps the memory recaps grounded in inspected evidence", () => {
    const explored = play("yenuan-rest").texts.join(" ");
    const skipped = play("yenuan-rest", true, compiled, { skipObjects: true }).texts.join(" ");
    for (const detail of ["兩只杯子在布巾邊", "未接來電", "紙袋裡剩下的一片", "紙背的第一句"])
      expect(explored).toContain(detail);
    for (const detail of ["沒有看清那天如何收場", "沒有翻看收銀台旁的記錄", "尚未準備好的聲音", "烤箱旁還有沒看的痕跡"])
      expect(skipped).toContain(detail);
    expect(skipped).not.toContain("妳們看過未接來電");
  });
  it("can ask about grief without forcing the voicemail or a perfect recipe", () => {
    const { story, texts, finalChoiceOptions } = play("yenuan-rest", true, compiled, {
      skipObjects: true,
      chooseTexts: ["為何連一口麵包", "當晚最不敢承認", "先承認今晚仍然難過", "若這次麵包仍烤焦", "催她趕快填好"],
    });
    expect(story.frame.endingId).toBe("yenuan-rest");
    const route = texts.join(" ");
    for (const detail of ["不肯讓自己跟上", "想被肯定", "只用「我太晚到」", "比較不焦的一片"])
      expect(route).toContain(detail);
    expect(finalChoiceOptions).not.toContain("陪她烤一顆新的麵包，留一口給母親");
  });
  it("can leave each memory early without forcing the mother's voicemail", () => {
    const { story } = play("yenuan-rest", true, compiled, { skipObjects: true });
    expect(story.frame.fragments).toEqual(["flour", "apple", "waiting"]);
    expect(story.frame.clues).not.toContain("voicemail");
    expect(story.frame.clues).not.toContain("recipe-postmark");
  });
  it.each([
    ["ruoyin-one", "若音只為一個人彈的三分鐘"],
    ["ruoyin-stage", "若音親手送出的信"],
    ["ruoyin-score", "若音的交換簿還留著空白"],
    ["ruoyin-echo", "沒有把滿座的店面當作葉暖今晚必須做到完美的理由"],
  ])("carries %s into the anniversary sign without speaking for Yenuan", (previousEnding, detail) => {
    const route = play("yenuan-rest", true, compiled, { previousEnding }).texts.join(" ");
    expect(route).toContain(detail);
    expect(route).toContain("那是我畫的");
    expect(route).toContain("我還是該接電話");
    expect(route).toContain("我可以先想清楚要寫什麼");
  });
  it("can leave the anniversary sign without pressing Yenuan for an answer", () => {
    const route = play("yenuan-rest", true, compiled, {
      previousEnding: "ruoyin-one",
      chooseTexts: ["先把招牌放回"],
    }).texts.join(" ");
    expect(route).toContain("沒有逼她替滿座的客人找出一個能代替母親的答案");
    expect(route).not.toContain("我可以先想清楚要寫什麼");
  });
  it("responds to apple actually being added to the hojicha", () => {
    const apple = play("yenuan-rest");
    const plain = play("yenuan-rest", true, compiled, { garnish: "none" });
    expect(apple.texts.join(" ")).toContain("焙茶的烘香和蘋果乾的甜味升起");
    expect(plain.texts.join(" ")).toContain("仍放在碟裡的蘋果乾");
  });
  it("requires both sides of the recipe for full understanding", () => {
    const letter: LetterDraft = {
      ...newLetter(),
      slots: ["flour", "apple", "waiting"],
      reverseSlots: ["flour", "apple", "waiting"],
      inspected: true,
    };
    expect(scoreLetter(letter, "yenuan")).toEqual({ completion: 100, understood: true });
    letter.reverseSlots[2] = null;
    expect(scoreLetter(letter, "yenuan").understood).toBe(false);
    expect(play("yenuan-rest", false).story.frame.endingId).toBe("yenuan-rest");
  });
  it("makes listening pace consequential", () => {
    expect(scoreHearth({ responses: ["wait", "ask", "wait"] }).balanced).toBe(true);
    expect(scoreHearth({ responses: ["rush", "rush", "rush"] }).heat).toBe(100);
    expect(scoreHearth({ responses: ["silence", "silence", "silence"] }).heat).toBe(0);
    expect(scoreHearth({ responses: ["rush", "rush", "rush"] }).balanced).toBe(false);
    expect(scoreHearth({ responses: ["silence", "silence", "silence"] }).balanced).toBe(false);
  });
});
