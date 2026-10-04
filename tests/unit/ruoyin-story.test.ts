import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { StoryBridge, type PriorChapterEndings } from "../../src/story/storyBridge";
import { parseTag } from "../../src/story/commandParser";
import { frameSchema, newLetter, type LetterDraft } from "../../src/types/game";
import { scoreLetter } from "../../src/services/letterScoring";
import { cupMotif, matchesCupMotif } from "../../src/services/melodyScoring";

const compiled = readFileSync(
  "public/story/compiled/ruoyin-chapter-15.json",
  "utf8",
);
const chapterFourteen = readFileSync("public/story/compiled/ruoyin-chapter-14.json", "utf8");
const chapterThirteen = readFileSync("public/story/compiled/ruoyin-chapter-13.json", "utf8");
const chapterTwelve = readFileSync("public/story/compiled/ruoyin-chapter-12.json", "utf8");
const chapterEleven = readFileSync("public/story/compiled/ruoyin-chapter-11.json", "utf8");
const chapterTen = readFileSync("public/story/compiled/ruoyin-chapter-10.json", "utf8");
const chapterNine = readFileSync("public/story/compiled/ruoyin-chapter-9.json", "utf8");
const chapterSeven = readFileSync("public/story/compiled/ruoyin-chapter-7.json", "utf8");
const chapterEight = readFileSync("public/story/compiled/ruoyin-chapter-8.json", "utf8");
const chapterFive = readFileSync("public/story/compiled/ruoyin-chapter-5.json", "utf8");
const previousCompiled = readFileSync("public/story/compiled/ruoyin-chapter-1.json", "utf8");
const chapterTwo = readFileSync("public/story/compiled/ruoyin-chapter-2.json", "utf8");
const chapterThree = readFileSync("public/story/compiled/ruoyin-chapter-3.json", "utf8");
const chapterFour = readFileSync("public/story/compiled/ruoyin-chapter-4.json", "utf8");
const targets = {
  "ruoyin-one": "只為一個人拉完",
  "ruoyin-stage": "給季晴的信寄出",
  "ruoyin-score": "替普通人的故事寫旋律",
  "ruoyin-echo": "帶著舊傷重新參賽",
} as const;

function play(
  target: keyof typeof targets,
  fullLetter = true,
  storyJson = compiled,
  options: { skipObjects?: boolean; excludedChoices?: string[]; previousEnding?: string; finalBar?: "return" | "new" | "rest"; teaId?: "lavender" | "osmanthus" | "black"; chooseTexts?: string[]; latePrompt?: string; skipScoreTable?: boolean; priorEndings?: PriorChapterEndings } = {},
) {
  const story = new StoryBridge(storyJson, options.previousEnding, options.priorEndings);
  story.next();
  const sections = new Set<string>();
  const texts: string[] = [];
  let finalChoiceOptions: string[] = [];
  let steps = 0;
  while (story.frame.mode !== "ending") {
    expect(++steps).toBeLessThan(250);
    sections.add(story.frame.section);
    texts.push(story.frame.text);
    if (story.frame.text.includes("接下來仍由她選擇要把它帶去哪裡"))
      finalChoiceOptions = story.frame.choices.map((choice) => choice.text);
    if (story.frame.mode === "tea") {
      story.finishTea({ teaId: options.teaId ?? "lavender", quality: 95, emotionalMatch: 100 });
    } else if (story.frame.mode === "melody") {
      story.finishMelody(true);
    } else if (story.frame.mode === "letter") {
      expect(story.frame.fragments).toEqual(["greeting", "fear", "music"]);
      story.finishLetter({
        completion: fullLetter ? 100 : 50,
        understood: fullLetter,
      });
    } else if (story.frame.canContinue) {
      story.next();
    } else {
      const finalBarText = {
        return: "回到最初的四個音",
        new: "加入一小段新的簡單旋律",
        rest: "先留下休止符",
      }[options.finalBar ?? "return"];
      const scoreTable = story.frame.choices.some((entry) => entry.text.includes("把鉛筆交回若音"));
      const scoreChoice = scoreTable && (options.latePrompt || options.skipScoreTable)
        ? story.frame.choices.find((entry) => options.latePrompt && entry.text.includes(options.latePrompt))
          ?? story.frame.choices.find((entry) => entry.text.includes("把鉛筆交回若音"))
        : undefined;
      const choice =
        story.frame.choices.find((entry) => entry.text === finalBarText) ??
        story.frame.choices.find((entry) =>
          entry.text.includes(targets[target]),
        ) ?? scoreChoice ?? story.frame.choices.find((entry) =>
          options.chooseTexts?.some((text) => entry.text.includes(text)),
        ) ?? (options.skipObjects
          ? story.frame.choices.find((entry) => [
              "從譜架下拾起第一片信紙",
              "從鏡框背後收起第二片信紙",
              "把節目單背面的第三片信紙收好",
              "帶著琴盒回書店，拼起信的兩面",
            ].includes(entry.text))
          : undefined) ?? story.frame.choices.find((entry) =>
            !options.excludedChoices?.some((text) => entry.text.includes(text)),
          );
      expect(choice).toBeDefined();
      story.choose(choice!.index);
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

describe("Ruoyin third night", () => {
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-fourteen %s route readable", (target) => {
    expect(play(target, true, chapterFourteen).story.frame.endingId).toBe(target);
  });
  it.each([
    ["ruoyin-one", "遞一條溫毛巾", "原來可以先等手回來", "先把手泡進溫水裡"],
    ["ruoyin-one", "問她手還好嗎", "有一點痠。", "她會照實說"],
    ["ruoyin-stage", "陪她走到門邊的信箱", "她小聲說：「好了。」", "郵戳是半夜"],
    ["ruoyin-stage", "明天自己寄", "讓她簽名才算收到", "簽名欄是季晴的字"],
    ["ruoyin-score", "先替自己寫第一段", "先交我自己的", "都會先聽見那個雨天"],
    ["ruoyin-score", "留給下一位客人", "第一個寫的人不必知道她是誰", "夜班的計程車司機"],
    ["ruoyin-echo", "說得太快", "我習慣聽別人說快的那一句", "提早一小時收琴"],
    ["ruoyin-echo", "抄得工整一點", "放進琴盒最上層", "一格也沒有空下來"],
  ] as const)("lets %s end with Lin Cheng's choice to %s", (target, choice, scene, afterword) => {
    const run = play(target, true, compiled, { chooseTexts: [choice] });
    const texts = run.texts.join(" ");
    expect(run.story.frame.endingId).toBe(target);
    expect(texts).toContain(scene);
    expect(texts).toContain(afterword);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-thirteen %s route readable", (target) => {
    expect(play(target, true, chapterThirteen).story.frame.endingId).toBe(target);
  });
  it.each([
    ["ruoyin-one", "常畫月亮", "要不要畫一個", "雲旁邊多了一個歪歪的月亮"],
    ["ruoyin-stage", "常畫月亮", "要不要畫一個", "一個很多年沒畫的人"],
    ["ruoyin-score", "常畫月亮", "要不要畫一個", "黑貓的爪印旁邊"],
    ["ruoyin-echo", "常畫月亮", "要不要畫一個", "沒有抄過去"],
    ["ruoyin-one", "想不起來有什麼停下的", "可能只是還沒到下一拍", "那個說想不起來的店員"],
    ["ruoyin-stage", "想不起來有什麼停下的", "可能只是還沒到下一拍", "她先對一個店員說過"],
    ["ruoyin-score", "想不起來有什麼停下的", "可能只是還沒到下一拍", "給還想不起來的人"],
    ["ruoyin-echo", "想不起來有什麼停下的", "可能只是還沒到下一拍", "她那陣子畫過的唯一一個"],
  ] as const)("lets Ruoyin ask what Lin Cheng stopped doing before %s (%s)", (target, answer, reply, afterword) => {
    const run = play(target, true, compiled, { finalBar: "rest", chooseTexts: [answer] });
    const texts = run.texts.join(" ");
    expect(run.story.frame.endingId).toBe(target);
    expect(texts).toContain("後來停下來的事");
    expect(texts).toContain(reply);
    expect(texts).toContain(afterword);
    expect(texts).toContain(answer === "常畫月亮" ? "彎的方向卻一樣" : "夾在第一頁旁");
  });
  it("keeps Ruoyin's question until she has talked about resting her hand", () => {
    const texts = play("ruoyin-one", true, compiled, { skipScoreTable: true }).texts.join(" ");
    expect(texts).not.toContain("後來停下來的事");
    expect(texts).not.toContain("彎的方向卻一樣");
    expect(texts).not.toContain("夾在第一頁旁");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("keeps the chapter-twelve %s route readable", (target) => {
    expect(play(target, true, chapterTwelve).story.frame.endingId).toBe(target);
  });
  it.each([
    ["moonlight", "寫給那個十歲的人聽"],
    ["recipient", "想聽的人，我再拉給他"],
    ["unfinished", "最後一個音晚一點落下，也沒關係"],
    ["intervention", "那最後一小節，請讓我自己寫"],
  ])("lets Jinglan's %s ending answer Ruoyin's four notes", (jinglan, answer) => {
    const texts = play("ruoyin-one", true, compiled, { previousEnding: "boyan-rest", priorEndings: { jinglan }, latePrompt: "第一晚有位老師也聽過這四個音" }).texts.join(" ");
    expect(texts).toContain("最後一個音沒有落下");
    expect(texts).toContain(answer);
    expect(texts).toContain("給第一晚也聽見的人");
  });
  it.each([
    ["ruoyin-stage", "她也在等最後一個音"],
    ["ruoyin-score", "借給所有沒聽完的人"],
    ["ruoyin-echo", "掌聲蓋過了那一拍"],
  ] as const)("carries Jinglan's four notes into the %s afterword", (target, afterword) => {
    expect(play(target, true, compiled, { priorEndings: { jinglan: "moonlight" }, latePrompt: "第一晚有位老師也聽過這四個音" }).texts.join(" ")).toContain(afterword);
  });
  it("does not mention the first night's listener without Jinglan's ending", () => {
    const texts = play("ruoyin-one", true, compiled, { latePrompt: "第一晚有位老師也聽過這四個音" }).texts.join(" ");
    expect(texts).not.toContain("第一晚那位退休的國文老師");
    expect(texts).not.toContain("給第一晚也聽見的人");
  });
  it("uses only supported story tags", () => {
    const source = readFileSync("story/chapters/ch03_ruoyin.ink", "utf8");
    for (const match of source.matchAll(/#\s*([^#\n}]+)/g))
      expect(() => parseTag(match[1]!)).not.toThrow();
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])(
    "reaches %s and restores each choice and minigame checkpoint",
    (target) => {
      const { story, sections } = play(target);
      expect(story.frame.endingId).toBe(target);
      for (const section of [
        "childhood",
        "backstage",
        "banquet",
        "grandstage",
        "letter",
        "finalbar",
        "afterword",
        "coda",
      ])
        expect(sections.has(section)).toBe(true);
      expect(story.frame.clues).toContain("manual-page");
      expect(story.frame.clues).toContain("company-recital");
      expect(story.frame.clues).toContain("first-joy");
      for (const clue of ["stage-review", "concert-ticket", "injury", "cleaner"])
        expect(story.frame.clues).toContain(clue);
    },
  );
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the old %s save route", (target) => {
    const { story } = play(target, true, previousCompiled);
    expect(story.frame.endingId).toBe(target);
    expect(story.frame.clues).not.toContain("company-recital");
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-two %s save route", (target) => {
    expect(play(target, true, chapterTwo).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-three %s save route", (target) => {
    expect(play(target, true, chapterThree).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-four %s save route", (target) => {
    expect(play(target, true, chapterFour).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-five %s save route", (target) => {
    expect(play(target, true, chapterFive).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-seven %s save route", (target) => {
    expect(play(target, true, chapterSeven).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-eight %s save route", (target) => {
    expect(play(target, true, chapterEight).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-nine %s save route", (target) => {
    expect(play(target, true, chapterNine).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-ten %s save route", (target) => {
    expect(play(target, true, chapterTen).story.frame.endingId).toBe(target);
  });
  it.each(Object.keys(targets) as (keyof typeof targets)[])("preserves the chapter-eleven %s save route", (target) => {
    expect(play(target, true, chapterEleven).story.frame.endingId).toBe(target);
  });
  it.each([
    ["boyan-rest", "先承認自己累了", "讓鋼琴先走"],
    ["boyan-leave", "空白履歷", "讓鋼琴先走"],
    ["boyan-boundary", "旁邊的人才接得住", "哪裡需要鋼琴多撐一點"],
    ["boyan-overwork", "回診那格仍空著", "那我不要再請妳勸我了"],
  ])("lets %s return on the grand stage and in the answer about sharing the load", (previousEnding, reflection, answer) => {
    const route = play("ruoyin-one", true, compiled, { previousEnding }).texts.join(" ");
    expect(route).toContain(reflection);
    expect(route).toContain(answer);
    expect(route).toContain("她的左手在琴頸上歇一拍");
  });
  it("keeps the sharing question optional and lets the echo ending erase the mark", () => {
    const echo = play("ruoyin-echo", true, compiled, { previousEnding: "boyan-rest" }).texts.join(" ");
    expect(echo).toContain("被她自己擦掉了");
    const skipped = play("ruoyin-one", true, compiled, { previousEnding: "boyan-rest", skipScoreTable: true, chooseTexts: ["先請她休息"] });
    const quiet = skipped.texts.join(" ");
    expect(quiet).toContain("先承認自己累了");
    expect(quiet).not.toContain("讓鋼琴先走");
    expect(quiet).not.toContain("她的左手在琴頸上歇一拍");
    expect(skipped.story.frame.endingId).toBe("ruoyin-one");
    expect(play("ruoyin-one").texts.join(" ")).not.toContain("先承認自己累了");
  });
  it("lets osmanthus tea pull her into rankings and remembers how they were met", () => {
    const tree = play("ruoyin-stage", true, compiled, { teaId: "osmanthus", chooseTexts: ["窗外那棵樹是什麼樣子"] }).texts.join(" ");
    expect(tree).toContain("每個名字後面都跟著一個數字");
    expect(tree).toContain("原來那條走廊，不是只有分數");
    expect(tree).toContain("不記得自己有沒有聞到");
    expect(tree).toContain("路邊有一棵桂花");
    const ranks = play("ruoyin-echo", true, compiled, { teaId: "osmanthus", chooseTexts: ["把名單念完"] });
    const said = ranks.texts.join(" ");
    expect(said).toContain("「第七名。」");
    expect(said).toContain("這次沒有再從第一名數下來");
    expect(said).toContain("她排在第二");
    expect(said).not.toContain("路邊有一棵桂花");
    expect(ranks.story.frame.endingId).toBe("ruoyin-echo");
  });
  it("lets black tea turn to a comeback plan without the hand, and carries the answer on", () => {
    const hand = play("ruoyin-one", true, compiled, { teaId: "black", chooseTexts: ["寫計畫時會不會痛"] });
    const asked = hand.texts.join(" ");
    expect(asked).toContain("沒有一行寫到她的手");
    expect(asked).toContain("寫完，就好像已經練過了一樣");
    expect(asked).toContain("先問醫師");
    expect(asked).toContain("第一欄不是時數，是手的狀況");
    expect(hand.story.frame.endingId).toBe("ruoyin-one");
    const blanks = play("ruoyin-echo", true, compiled, { teaId: "black", chooseTexts: ["留一格空白"] }).texts.join(" ");
    expect(blanks).toContain("一格也沒填，卻也沒有把它們劃掉");
    expect(blanks).toContain("有點緊，還能握弓");
    expect(blanks).toContain("全塗成了練習時數");
    expect(blanks).not.toContain("先問醫師");
    const lavender = play("ruoyin-echo").texts.join(" ");
    for (const line of ["每個名字後面都跟著一個數字", "沒有一行寫到她的手", "她排在第二", "全塗成了練習時數"])
      expect(lavender).not.toContain(line);
  });
  it("lets the opening details return at the last bar and in the afterwords", () => {
    const one = play("ruoyin-one").texts.join(" ");
    for (const line of ["座位圖一格一格變灰", "我前一晚自己改了三次編曲", "每次寫到那裡，我都會回頭去改第一個音", "那片空白第一次有了要落筆的地方", "寫著一間小咖啡館的名字"])
      expect(one).toContain(line);
    expect(play("ruoyin-stage").texts.join(" ")).toContain("後來便忘了數");
    expect(play("ruoyin-score").texts.join(" ")).toContain("先把那段故事記進簿子");
    expect(play("ruoyin-echo").texts.join(" ")).toContain("一直在等對方拉錯");
    const quiet = play("ruoyin-stage", true, compiled, { excludedChoices: ["演出頁面", "演出標籤", "最後那一大片空白"] }).texts.join(" ");
    expect(quiet).not.toContain("後來便忘了數");
    expect(quiet).not.toContain("那片空白第一次有了要落筆的地方");
  });
  it("changes all four memory recaps according to inspected evidence", () => {
    const explored = play("ruoyin-stage").texts.join(" ");
    const skipped = play("ruoyin-stage", true, compiled, { skipObjects: true }).texts.join(" ");
    for (const detail of ["雲朵旁的日期", "沒有折住的講評", "核對了那三分鐘", "坐過空椅"])
      expect(explored).toContain(detail);
    for (const detail of ["尚未查清的記憶", "還沒有讀全桌上的記錄", "尚未問門邊的人", "掌聲還在重複"])
      expect(skipped).toContain(detail);
    expect(skipped).not.toContain("雲朵旁的日期");
  });
  it("does not cite the award date when only the rain and score were inspected", () => {
    const route = play("ruoyin-stage", true, compiled, {
      excludedChoices: ["查看講台上隔年的獎狀"],
    }).texts.join(" ");
    expect(route).toContain("這四個音最初是寫給雨的");
    expect(route).not.toContain("雲朵旁的日期");
  });
  it("lets her discuss comparison and the stage without forcing an answer", () => {
    const { story, texts } = play("ruoyin-stage", true, compiled, {
      chooseTexts: ["為何不願再聽", "原樣念完", "會不會想替", "是否仍想站上"],
    });
    expect(story.frame.endingId).toBe("ruoyin-stage");
    const route = texts.join(" ");
    for (const detail of ["下一個音不像她", "沒讓她說完", "先學會聽", "還需要時間想清楚"])
      expect(route).toContain(detail);
  });
  it("can leave each memory early and still assemble both sides of the letter", () => {
    const { story, finalChoiceOptions } = play("ruoyin-stage", true, compiled, { skipObjects: true, skipScoreTable: true });
    expect(story.frame.fragments).toEqual(["greeting", "fear", "music"]);
    expect(story.frame.clues).not.toContain("company-recital");
    expect(finalChoiceOptions).not.toContain("陪她只為一個人拉完這首曲子");
  });
  it.each([
    ["return", "最初四個音", "妳們先前沒有停下來聽那場雨"],
    ["new", "新的旋律想先給誰聽", "妳們沒有問過那位聽眾的想法"],
    ["rest", "手累時能不能把休止符留下", "妳們沒有讀到過去的復健紀錄"],
  ] as const)("can ground a sincere %s ending in a new conversation", (finalBar, latePrompt, expected) => {
    const { story, texts, finalChoiceOptions } = play("ruoyin-one", true, compiled, {
      skipObjects: true,
      excludedChoices: ["問她左手是否還痛"],
      finalBar,
      latePrompt,
    });
    expect(story.frame.endingId).toBe("ruoyin-one");
    expect(texts.join(" ")).toContain(expected);
    expect(finalChoiceOptions).toContain("陪她只為一個人拉完這首曲子");
  });
  it("reserves the first joyful playing memory for lavender tea", () => {
    const lavender = play("ruoyin-stage");
    const osmanthus = play("ruoyin-stage", true, compiled, { teaId: "osmanthus" });
    expect(lavender.story.frame.clues).toContain("first-joy");
    expect(osmanthus.story.frame.clues).not.toContain("first-joy");
    expect(osmanthus.story.frame.fragments).toEqual(["greeting", "fear", "music"]);
  });
  it.each(["return", "new", "rest"] as const)("accepts a sincere %s final bar after its memory is heard", (finalBar) => {
    const { story, texts, finalChoiceOptions } = play("ruoyin-one", true, compiled, { finalBar });
    expect(story.frame.endingId).toBe("ruoyin-one");
    expect(finalChoiceOptions).toContain("陪她只為一個人拉完這首曲子");
    expect(texts.join(" ")).toContain({
      return: "最後一小節回到最初的四個音",
      new: "最後一小節多了一段新的簡單旋律",
      rest: "最後一小節留下休止符",
    }[finalBar]);
  });
  it.each([
    ["boyan-rest", "這張節目單不能證明他已經好起來"],
    ["boyan-leave", "若音不需要替他的空白填上答案"],
    ["boyan-boundary", "能不能有人與她分擔收尾"],
    ["boyan-overwork", "沒有再把「撐完」當作唯一值得稱讚的事"],
  ])("carries the %s ending into the banquet program response", (previousEnding, expected) => {
    const { texts } = play("ruoyin-stage", true, compiled, { previousEnding });
    expect(texts.join(" ")).toContain(expected);
    expect(texts.join(" ")).toContain("被人聽見，不等於往後每一場都得替誰撐到底");
  });
  it("does not infer the previous visitor's fate without his chapter ending", () => {
    const { texts } = play("ruoyin-stage");
    expect(texts.join(" ")).toContain("節目單沒有寫他後來的生活");
  });
  it("front-only reading cannot qualify for the two-sided ending", () => {
    const { story } = play("ruoyin-stage", false);
    expect(story.frame.endingId).toBe("ruoyin-stage");
  });
  it("requires the four-note order and both sides of the letter", () => {
    expect(matchesCupMotif(cupMotif)).toBe(true);
    expect(matchesCupMotif([0, 1, 2, 3])).toBe(false);
    const letter: LetterDraft = {
      ...newLetter(),
      slots: ["greeting", "fear", "music"],
      reverseSlots: ["greeting", "fear", "music"],
      inspected: true,
    };
    expect(scoreLetter(letter, "ruoyin")).toEqual({
      completion: 100,
      understood: true,
    });
    letter.reverseSlots[2] = null;
    expect(scoreLetter(letter, "ruoyin").understood).toBe(false);
  });
});
