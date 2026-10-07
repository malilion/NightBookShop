import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { StoryBridge, readInkString, visitorQuestionVariables, type PriorChapterEndings } from "../../src/story/storyBridge";
import { parseTag } from "../../src/story/commandParser";
import { frameSchema, newLetter, type LetterDraft, type TeaId } from "../../src/types/game";
import { archiveConnections, connectionBetween, scoreArchive } from "../../src/services/archiveScoring";
import { scoreLetter } from "../../src/services/letterScoring";
import { chapterForVersion } from "../../src/data/catalog";

const compiled = readFileSync("public/story/compiled/lincheng-chapter-20.json", "utf8");
const chapter19Archived = readFileSync("public/story/compiled/lincheng-chapter-19.json", "utf8");
const chapterEighteen = readFileSync("public/story/compiled/lincheng-chapter-18.json", "utf8");
const chapterSeventeen = readFileSync("public/story/compiled/lincheng-chapter-17.json", "utf8");
const chapterSixteen = readFileSync("public/story/compiled/lincheng-chapter-16.json", "utf8");
const chapterFifteen = readFileSync("public/story/compiled/lincheng-chapter-15.json", "utf8");
const chapterFourteen = readFileSync("public/story/compiled/lincheng-chapter-14.json", "utf8");
const chapterThirteen = readFileSync("public/story/compiled/lincheng-chapter-13.json", "utf8");
const chapterTwelve = readFileSync("public/story/compiled/lincheng-chapter-12.json", "utf8");
const chapterEleven = readFileSync("public/story/compiled/lincheng-chapter-11.json", "utf8");
const chapterTen = readFileSync("public/story/compiled/lincheng-chapter-10.json", "utf8");
const chapterNine = readFileSync("public/story/compiled/lincheng-chapter-9.json", "utf8");
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

function play(target: keyof typeof targets, fullLetter = true, storyJson = compiled, options: { skipObjects?: boolean; previousEnding?: string; askOwnerConsent?: boolean; priorEndings?: PriorChapterEndings; teaId?: TeaId; teaQuality?: number; refusal?: string[]; carried?: Record<string, string> } = {}) {
  const story = new StoryBridge(storyJson, options.previousEnding, options.priorEndings, options.carried);
  story.next();
  const refusal = [...(options.refusal ?? [])];
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
      story.finishTea({ teaId: options.teaId ?? "osmanthus", quality: options.teaQuality ?? 90, emotionalMatch: 100 });
    else if (story.frame.mode === "archive")
      story.finishArchive(scoreArchive(completeArchive));
    else if (story.frame.mode === "letter") {
      expect(story.frame.fragments).toEqual(["kept", "afraid", "two-wishes", "embrace"]);
      story.finishLetter({ completion: fullLetter ? 100 : 50, understood: fullLetter });
    } else if (story.frame.canContinue) story.next();
    else {
      const refusalStep = refusal[0] && story.frame.choices.some((entry) => entry.text.includes(refusal[0]!)) ? refusal.shift() : undefined;
      const selected = (refusalStep ? story.frame.choices.find((entry) => entry.text.includes(refusalStep)) : undefined) ?? (options.askOwnerConsent ? story.frame.choices.find((entry) => entry.text.includes("童年的保管請求")) : undefined) ?? (options.skipObjects ? story.frame.choices.find((entry) => [
        "帶著看到的線索回到櫃台",
        "從兒時外套裡收起第一片信紙",
        "從高高的櫃台下收起另外兩片信紙",
        "請他先別說，妳想直接看六夜的紙",
        "走到童年的夜行書店",
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

const firstAnswers = { lincheng_destination: "home", lincheng_shift: "locked", lincheng_paused: "moon", lincheng_mother: "dumplings", lincheng_card: "told", lincheng_fear: "remember" };
const secondAnswers = { lincheng_destination: "unsure", lincheng_shift: "fine", lincheng_paused: "unsure", lincheng_mother: "rarely", lincheng_card: "kept", lincheng_fear: "guests" };

describe("Lincheng finale", () => {
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-nineteen %s route readable", (target) => {
    expect(play(target, true, chapter19Archived).story.frame.endingId).toBe(target);
  });
  it.each([
    [{ tea_jinglan: "osmanthus", tea_boyan: "chamomile", tea_ruoyin: "lavender", tea_yenuan: "hojicha", tea_yuhang: "mint", tea_haiming: "hojicha" },
      ["桂花樹下輪流讀詩", "肩膀比進門時低了一點", "第一次沒有握成拳", "焦香和她麵包籃裡", "把杯把轉向自己", "說了兩次。"]],
    [{ tea_jinglan: "puer", tea_boyan: "black", tea_ruoyin: "osmanthus", tea_yenuan: "lavender", tea_yuhang: "chamomile", tea_haiming: "puer" },
      ["先說了三十年的教書", "自己把筆電合上的", "念起了音樂院的名次", "別人家女兒的故事", "一次也沒有去摸", "慢慢說起。"]],
    [{ tea_jinglan: "mint", tea_boyan: "mint", tea_ruoyin: "black", tea_yenuan: "black", tea_yuhang: "hojicha", tea_haiming: "mint" },
      ["她只說了一半", "分成了三欄", "沒有提到手傷的復出計畫", "本來就乾淨的櫃台", "他就站起來想走", "先確認了今天的日期"]],
  ] as const)("remembers the tea poured on each night when turning the bookmarks", (carried, lines) => {
    const said = play("lincheng-dawn", true, compiled, { carried }).texts.join(" ");
    for (const line of lines) expect(said).toContain(line);
  });
  it("turns the bookmarks without tea lines when no night was saved", () => {
    const said = play("lincheng-dawn").texts.join(" ");
    expect(said).toContain("乾掉的桂花");
    for (const line of ["那晚妳替她泡的是", "那晚是洋甘菊", "那晚是焙茶", "那晚是薄荷茶"]) expect(said).not.toContain(line);
  });
  it("reads the tea back from a finished chapter save", () => {
    const chapter = new StoryBridge(readFileSync("public/story/compiled/yuhang-chapter-22.json", "utf8"));
    chapter.next();
    for (let step = 0; step < 200 && chapter.frame.mode !== "tea"; step++) {
      if (chapter.frame.canContinue) chapter.next();
      else chapter.choose(chapter.frame.choices[chapter.frame.choices.length - 1]!.index);
    }
    expect(chapter.frame.mode).toBe("tea");
    chapter.finishTea({ teaId: "hojicha", garnish: "none", quality: 80, emotionalMatch: 80 });
    expect(readInkString(chapter.serialize(), "tea_type")).toBe("hojicha");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-eighteen %s route readable", (target) => {
    expect(play(target, true, chapterEighteen).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-seventeen %s route readable", (target) => {
    expect(play(target, true, chapterSeventeen).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-sixteen %s route readable", (target) => {
    expect(play(target, true, chapterSixteen).story.frame.endingId).toBe(target);
  });
  it.each([
    ["lincheng-dawn", "請他也找一天讀它", "今晚我也想試試", "已經拆開了"],
    ["lincheng-dawn", "讀不讀由他", "妳說話越來越像手冊了", "她沒有提，那是他的"],
    ["lincheng-keeper", "請他也找一天讀它", "今晚我也想試試", "他說留給下一封"],
    ["lincheng-keeper", "讀不讀由他", "妳說話越來越像手冊了", "沒有問他要去哪裡"],
    ["lincheng-shelf", "請他也找一天讀它", "今晚我也想試試", "兩封隔著幾本書"],
    ["lincheng-shelf", "讀不讀由他", "妳說話越來越像手冊了", "都在等寫給的那個人"],
  ] as const)("lets Lin Cheng ask the owner about his own unread letter before %s (%s)", (target, answer, reply, afterword) => {
    const run = play(target, true, compiled, { refusal: ["他自己有沒有一封沒讀的信", answer] });
    const said = run.texts.join(" ");
    expect(run.story.frame.endingId).toBe(target);
    expect(said).toContain("放得比妳的信還久");
    expect(said).toContain(reply);
    expect(said).toContain(afterword);
  });
  it("leaves the owner's letter alone when Lin Cheng does not ask", () => {
    const said = play("lincheng-dawn", true, compiled, { refusal: ["讓他把手冊最後一頁交給妳"] }).texts.join(" ");
    expect(said).not.toContain("放得比妳的信還久");
    expect(said).not.toContain("已經拆開了");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-fifteen %s route readable", (target) => {
    expect(play(target, true, chapterFifteen).story.frame.endingId).toBe(target);
  });
  it.each([
    ["lincheng-dawn", "先去吃一頓早餐", "第一份端給自己的早餐", "老闆記得她的口味"],
    ["lincheng-dawn", "先打電話給母親", "那快回去睡。", "有時只講早餐吃了什麼"],
    ["lincheng-keeper", "寫下自己的一條規則", "店員也可以坐下。」店主看了", "後來每一任店員都讀得到"],
    ["lincheng-keeper", "先把門關上，睡一覺", "在妳的位置蜷成一團", "第二晚開門時，她的茶是熱的"],
    ["lincheng-shelf", "在書背貼一張便條", "給以後的妳一個找得到的記號", "經過的客人看見"],
    ["lincheng-shelf", "只記住它在第幾層", "左邊第七本。妳把這個數字", "像確認一把鑰匙還在"],
    ["lincheng-midnight", "把信塞回櫃台最底下", "抽屜關上時", "都會碰到它的邊角"],
    ["lincheng-midnight", "把信放在那張空椅上", "也沒有拆開", "先把它推到旁邊"],
  ] as const)("lets %s end with Lin Cheng's choice to %s", (target, choice, scene, afterword) => {
    const run = play(target, true, compiled, { refusal: [choice] });
    const said = run.texts.join(" ");
    expect(run.story.frame.endingId).toBe(target);
    expect(said).toContain(scene);
    expect(said).toContain(afterword);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-fourteen %s route readable", (target) => {
    expect(play(target, true, chapterFourteen).story.frame.endingId).toBe(target);
  });
  it.each([
    [firstAnswers, ["很久沒想過自己要去哪裡", "是母親", "也是藏起那封信的那一年", "可以問母親那一晚", "今年的卡片，妳想回一句", "現在妳想起來了，燈還亮著"]],
    [secondAnswers, ["用現在的筆跡寫下「林澄」", "我不太好。可是我想慢慢好起來", "下一拍落在這裡", "這可以是第一句", "寫給自己的那一封", "我也是這幾晚的客人"]],
  ] as const)("lets Lin Cheng answer the six visitors' questions after reading her letter", (carried, lines) => {
    const run = play("lincheng-dawn", true, compiled, { carried, refusal: ["回答六夜裡訪客問過妳的問題"] });
    const said = run.texts.join(" ");
    expect(run.story.frame.endingId).toBe("lincheng-dawn");
    expect(said).toContain("妳一直是問問題的人");
    for (const line of lines) expect(said).toContain(line);
    expect(said).toContain("有幾題的答案，後來又改過");
    if (carried.lincheng_card === "told") expect(said).toContain("只有一行：「地址還對。」");
    else expect(said).not.toContain("只有一行：「地址還對。」");
  });
  it.each([
    ["lincheng-keeper", "她會先回答一句，再把話還給對方"],
    ["lincheng-shelf", "其餘的，跟信一起留在書架上"],
  ] as const)("carries the answered questions into %s", (target, afterword) => {
    const said = play(target, true, compiled, { carried: firstAnswers, refusal: ["回答六夜裡訪客問過妳的問題"] }).texts.join(" ");
    expect(said).toContain(afterword);
  });
  it("answers only the questions that were actually asked", () => {
    const said = play("lincheng-dawn", true, compiled, { carried: { lincheng_card: "kept" }, refusal: ["回答六夜裡訪客問過妳的問題"] }).texts.join(" ");
    expect(said).toContain("寫給自己的那一封");
    expect(said).not.toContain("很久沒想過自己要去哪裡");
    expect(said).not.toContain("現在妳想起來了，燈還亮著");
  });
  it("hides the answers when no visitor asked, or when the letter was left unread", () => {
    expect(play("lincheng-dawn").choices).not.toContain("回答六夜裡訪客問過妳的問題");
    expect(play("lincheng-shelf", false, compiled, { carried: firstAnswers }).choices).not.toContain("回答六夜裡訪客問過妳的問題");
  });
  it("remembers the unanswered questions in the midnight afterword", () => {
    const said = play("lincheng-midnight", true, compiled, { carried: { lincheng_fear: "guests" } }).texts.join(" ");
    expect(said).toContain("今晚先說你的");
    expect(play("lincheng-midnight").texts.join(" ")).not.toContain("今晚先說你的");
  });
  it("reads each night's answer back from a finished chapter save", () => {
    const sources = {
      jinglan: "main.json", boyan: "boyan-chapter-23.json", ruoyin: "ruoyin-chapter-22.json",
      yenuan: "yenuan-chapter-20.json", yuhang: "yuhang-chapter-22.json", haiming: "haiming-chapter-26.json",
    } as const;
    for (const [visitor, variable] of Object.entries(visitorQuestionVariables)) {
      const chapter = new StoryBridge(readFileSync(`public/story/compiled/${sources[visitor as keyof typeof sources]}`, "utf8"));
      chapter.next();
      expect(readInkString(chapter.serialize(), variable)).toBe("");
      chapter.story.variablesState[variable] = "answered";
      expect(readInkString(chapter.serialize(), variable)).toBe("answered");
    }
    expect(readInkString("not json", "lincheng_card")).toBe("");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-eleven %s route readable", (target) => {
    expect(play(target, true, chapterEleven).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-twelve %s route readable", (target) => {
    expect(play(target, true, chapterTwelve).story.frame.endingId).toBe(target);
  });
  it.each([
    ["請店主現在抱妳一下", "lincheng-dawn", "今天要站著，還是坐著？"],
    ["說妳想把這個擁抱留給母親", "lincheng-dawn", "就先抱了她"],
    ["把黑貓抱到腿上", "lincheng-dawn", "看她過了馬路"],
    ["請店主現在抱妳一下", "lincheng-keeper", "要不要抱一下，還是我坐在這裡就好？"],
    ["說妳想把這個擁抱留給母親", "lincheng-shelf", "讓母親抱了一下"],
  ] as const)("lets Lin Cheng ask whether anyone held her that night, then %s before %s", (answer, target, afterword) => {
    const run = play(target, true, compiled, { refusal: ["那晚有沒有人抱過妳", answer] });
    const said = run.texts.join(" ");
    expect(said).toContain("不碰妳才是尊重妳");
    expect(said).toContain(afterword);
    expect(said).toContain("信還在杯旁");
    expect(run.story.frame.endingId).toBe(target);
  });
  it("lets Lin Cheng leave the pawprinted line blank or finish it in her own hand", () => {
    const blank = play("lincheng-shelf", true, compiled, { refusal: ["被貓腳印壓住的那一筆", "讓那一行繼續空著"] }).texts.join(" ");
    expect(blank).toContain("只寫了半個「我」字");
    expect(blank).toContain("再回來寫");
    expect(blank).not.toContain("我也想被好好照顧");
    const self = play("lincheng-keeper", true, compiled, { refusal: ["被貓腳印壓住的那一筆", "用現在的筆跡在旁邊補完它"] }).texts.join(" ");
    expect(self).toContain("我也想被好好照顧");
    expect(self).toContain("寫一句給自己的話");
    const skipped = play("lincheng-dawn", true, compiled, { skipObjects: true });
    expect(skipped.choices).not.toContain("再看一次被貓腳印壓住的那一筆");
    expect(skipped.texts.join(" ")).not.toContain("信還在杯旁");
  });
  it("offers an unfinished letter its blank spaces instead of the embrace question", () => {
    const run = play("lincheng-shelf", false, compiled, { refusal: ["看看信上還空著的地方"] });
    const said = run.texts.join(" ");
    expect(run.choices).not.toContain("問店主，那晚有沒有人抱過妳");
    expect(said).toContain("空白不等於丟了");
    expect(run.story.frame.endingId).toBe("lincheng-shelf");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-thirteen %s route readable", (target) => {
    expect(play(target, true, chapterThirteen).story.frame.endingId).toBe(target);
  });
  it.each([
    [{ jinglan: "moonlight", boyan: "boyan-rest", ruoyin: "ruoyin-one", yenuan: "yenuan-share", yuhang: "yuhang-today" }, "haiming-light", ["給二十四歲的周靜蘭", "沒有一句道歉", "只拉給一個人", "也留了一口給自己", "沒有再改成明年", "顧川補在旁邊的時間"]],
    [{ jinglan: "recipient", boyan: "boyan-leave", ruoyin: "ruoyin-stage", yenuan: "yenuan-reopen", yuhang: "yuhang-future" }, "haiming-voice", ["她先問了，才寄", "這裡我自己填", "季晴的名字", "又寫了回去", "整理第一箱書", "講了兩次的笑話"]],
    [{ jinglan: "unfinished", boyan: "boyan-boundary", ruoyin: "ruoyin-score", yenuan: "yenuan-rest", yuhang: "yuhang-past" }, "haiming-boat", ["妳就等了", "寫著別人的名字", "別人的故事寫成的旋律", "站在門口寫的", "只寫了一半的清單", "沒有攤開"]],
    [{ jinglan: "intervention", boyan: "boyan-overwork", ruoyin: "ruoyin-echo", yenuan: "yenuan-copy", yuhang: "yuhang-unknown" }, "haiming-hero", ["說「等等」時的聲音", "那行醫囑", "沒有看妳", "每個數字都描過兩遍", "妳替他找的理由", "找不到他說害怕的那一句"]],
  ] as const)("lets Lin Cheng turn over each visitor's bookmark as it ended (%#)", (priorEndings, previousEnding, lines) => {
    const run = play("lincheng-dawn", true, compiled, { priorEndings, previousEnding, refusal: ["靜蘭的書籤", "柏言的書籤", "若音的書籤", "葉暖的書籤", "雨航的書籤", "海明的書籤"] });
    const said = run.texts.join(" ");
    for (const line of lines) expect(said).toContain(line);
    expect(said).toContain("六張書籤都翻過了");
    expect(said).toContain("想想那個人現在在哪裡");
  });
  it("keeps the bookmarks optional and gives a plain line without earlier endings", () => {
    const quiet = play("lincheng-keeper", true, compiled, { refusal: ["先坐到訪客席"] }).texts.join(" ");
    expect(quiet).not.toContain("六張書籤都翻過了");
    expect(quiet).not.toContain("之前坐過這張椅子的人");
    const plain = play("lincheng-shelf", true, compiled, { refusal: ["靜蘭的書籤", "柏言的書籤", "若音的書籤", "葉暖的書籤", "雨航的書籤", "海明的書籤"] }).texts.join(" ");
    for (const line of ["乾掉的桂花", "十一點四十七分", "最後一個音沒有寫完", "拍不太掉", "日期在七年後", "燈還亮著"])
      expect(plain).toContain(line);
    expect(plain).toContain("它們跟她的信放在同一層書架");
  });
  it("lets Lin Cheng own every visitor she decided for when the owner apologizes", () => {
    const overstepped = {
      jinglan: "intervention", boyan: "boyan-overwork", ruoyin: "ruoyin-echo", yenuan: "yenuan-copy", yuhang: "yuhang-unknown",
    };
    const keeper = play("lincheng-keeper", true, compiled, { priorEndings: overstepped, previousEnding: "haiming-hero", refusal: ["自己也曾替訪客做過決定"] });
    const said = keeper.texts.join(" ");
    for (const line of ["妳替靜蘭封了口", "先把報告做完", "帶著舊傷回到比賽", "一筆不改地照舊做", "地址寫錯", "刪成一份整齊的傳記", "自己卻少了一塊", "也包括我。"])
      expect(said).toContain(line);
    expect(keeper.choices).not.toContain("告訴店主，六位訪客都是自己做的決定");
    expect(keeper.story.frame.endingId).toBe("lincheng-keeper");
    const one = play("lincheng-dawn", true, compiled, { priorEndings: { jinglan: "moonlight", boyan: "boyan-rest", ruoyin: "ruoyin-echo", yenuan: "yenuan-share", yuhang: "yuhang-today" }, previousEnding: "haiming-light", refusal: ["自己也曾替訪客做過決定"] }).texts.join(" ");
    expect(one).toContain("帶著舊傷回到比賽");
    expect(one).not.toContain("妳替靜蘭封了口");
    expect(one).toContain("要我幫忙，還是要我等？");
  });
  it("lets a finale with no overstepped visitor ask for the same treatment", () => {
    const clean = { jinglan: "moonlight", boyan: "boyan-rest", ruoyin: "ruoyin-one", yenuan: "yenuan-share", yuhang: "yuhang-today" };
    const shelf = play("lincheng-shelf", true, compiled, { priorEndings: clean, previousEnding: "haiming-light", refusal: ["六位訪客都是自己做的決定"] });
    const said = shelf.texts.join(" ");
    expect(said).toContain("我的信，要我自己拆");
    expect(said).toContain("店主沒有替她挑位置");
    expect(shelf.choices).not.toContain("告訴店主，自己也曾替訪客做過決定");
    const quiet = play("lincheng-shelf", true, compiled, { priorEndings: clean, previousEnding: "haiming-light", refusal: ["讓他把手冊最後一頁交給妳"] }).texts.join(" ");
    expect(quiet).not.toContain("我的信，要我自己拆");
    expect(quiet).not.toContain("店主沒有替她挑位置");
  });
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
    expect(chapterForVersion("lincheng-chapter-10")).toBe("lincheng");
    expect(chapterForVersion("lincheng-chapter-11")).toBe("lincheng");
    expect(chapterForVersion("lincheng-chapter-12")).toBe("lincheng");
    expect(chapterForVersion("lincheng-chapter-13")).toBe("lincheng");
    expect(chapterForVersion("lincheng-chapter-14")).toBe("lincheng");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-ten %s route loadable", (target) => {
    expect(play(target, true, chapterTen).story.frame.endingId).toBe(target);
  });
  it("answers each of the eight teas Lin Cheng can brew for herself", () => {
    const teaIds: TeaId[] = ["osmanthus", "puer", "mint", "jasmine", "black", "chamomile", "lavender", "hojicha"];
    const replies = teaIds.map((teaId) => {
      const { texts } = play("lincheng-dawn", true, compiled, { teaId, skipObjects: true });
      const start = texts.findIndex((text) => text.includes("慢慢泡一杯"));
      const end = texts.findIndex((text) => text.includes("店主在櫃台另一側坐下"));
      return texts.slice(start + 1, end).join(" ");
    });
    expect(new Set(replies).size).toBe(8);
    expect(replies[3]).toContain("六位訪客沒有一個人選過這罐");
    expect(replies[4]).toContain("這杯茶可以提神，但今晚不用拿它撐過什麼");
  });
  it("notices whether Lin Cheng brewed for herself slowly or in a hurry", () => {
    const careful = play("lincheng-dawn", true, compiled, { teaQuality: 95, skipObjects: true }).texts.join(" ");
    const rushed = play("lincheng-dawn", true, compiled, { teaQuality: 40, skipObjects: true }).texts.join(" ");
    const plain = play("lincheng-dawn", true, compiled, { teaQuality: 70, skipObjects: true }).texts.join(" ");
    expect(careful).toContain("第一次照自己的節奏泡完一杯");
    expect(rushed).toContain("這一杯不必端給任何人");
    expect(rushed).not.toContain("第一次照自己的節奏泡完一杯");
    expect(plain).not.toContain("這一杯不必端給任何人");
    expect(plain).not.toContain("第一次照自己的節奏泡完一杯");
  });
  it("lets Lin Cheng try the door and read the notes before refusing, and remembers both", () => {
    const refused = play("lincheng-midnight", true, compiled, { refusal: ["拒絕坐下，繼續替別人", "問他那張椅子", "試試它能不能打開", "翻看六位訪客的手記", "仍然拒絕坐下"] });
    const text = refused.texts.join(" ");
    expect(refused.choices).toContain("仍然拒絕坐下，繼續替別人整理故事");
    for (const line of ["我不會替妳推過來", "門就開了一道縫", "六個人都坐下過", "所以這一次留下，不是誰把妳關在裡面", "只有自己那一封，還沒有人坐下來讀"])
      expect(text).toContain(line);
    expect(refused.sections.has("self-letter")).toBe(false);
    expect(refused.story.frame.endingId).toBe("lincheng-midnight");
    const direct = play("lincheng-midnight");
    expect(direct.texts.join(" ")).not.toContain("不是誰把妳關在裡面");
    expect(direct.story.frame.endingId).toBe("lincheng-midnight");
  });
  it("lets Lin Cheng change her mind after refusing and sit down after all", () => {
    const changed = play("lincheng-dawn", true, compiled, { refusal: ["拒絕坐下，繼續替別人", "問他那張椅子", "還是坐下"] });
    const text = changed.texts.join(" ");
    expect(text).toContain("黑貓從椅面跳開，把位置讓給妳");
    expect(changed.sections.has("self-letter")).toBe(true);
    expect(changed.story.frame.endingId).toBe("lincheng-dawn");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-nine %s route loadable", (target) => {
    expect(play(target, true, chapterNine).story.frame.endingId).toBe(target);
  });
  it("lets the owner observe Lin Cheng only with her consent, and remembers it", () => {
    const dawn = play("lincheng-dawn").texts.join(" ");
    for (const line of ["拇指真的按在月亮的尖角上", "自己每晚也是最後一個坐下", "我想確定它還能開", "那天晚上，妳怕不怕", "比平常長的信", "沒有回頭確認它還開著"])
      expect(dawn).toContain(line);
    expect(play("lincheng-keeper").texts.join(" ")).toContain("會先替自己倒一杯茶");
    expect(play("lincheng-shelf").texts.join(" ")).toContain("拇指在口袋裡空了好幾天");
    const declined = play("lincheng-dawn", true, compiled, { skipObjects: true });
    const declinedText = declined.texts.join(" ");
    expect(declinedText).toContain("被人問過「可不可以」之後再拒絕");
    expect(declinedText).not.toContain("我想確定它還能開");
    expect(declinedText).not.toContain("那天晚上，妳怕不怕");
    expect(declined.story.frame.endingId).toBe("lincheng-dawn");
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
