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
    // Restore every choice/minigame boundary and sample long dialogue runs.
    if (
      story.frame.mode === "dialogue" &&
      story.frame.canContinue &&
      steps % 20 !== 0
    ) continue;
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
  }, 300000);
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
  it("continues chapter-seven saves against the exact archived compiled story", () => {
    const previous = readFileSync("public/story/compiled/jinglan-chapter-7.json", "utf8");
    for (const target of ["moonlight", "recipient", "unfinished", "intervention"])
      expect(play(2, target, false, previous).story.frame.endingId).toBe(target);
  });
  it("continues chapter-eight saves against the exact archived compiled story", () => {
    const previous = readFileSync("public/story/compiled/jinglan-chapter-8.json", "utf8");
    for (const target of ["moonlight", "recipient", "unfinished", "intervention"])
      expect(play(2, target, false, previous).story.frame.endingId).toBe(target);
  });
  it.each([
    ["moonlight", "走回住處", "有地方要回去", "有沒有回家換衣服"],
    ["recipient", "走回住處", "有地方要回去", "有沒有帶傘"],
    ["unfinished", "走回住處", "有地方要回去", "會記掛很久"],
    ["intervention", "走回住處", "有地方要回去", "在妳替她封口以前說的"],
    ["moonlight", "說不上來", "自己那一篇交白卷", "名字要先寫上"],
    ["recipient", "說不上來", "自己那一篇交白卷", "也還沒交自己那一篇"],
    ["unfinished", "說不上來", "自己那一篇交白卷", "那是她那晚對一個店員說過的話"],
    ["intervention", "說不上來", "自己那一篇交白卷", "自己那一篇仍是白卷"],
  ])("lets Jinglan ask where Lin Cheng was going before %s (%s)", (target, answer, reply, afterword) => {
    const story = new StoryBridge(compiled);
    story.next();
    const texts: string[] = [];
    const desired = { moonlight: "陪她寫一封信", recipient: "問她，是否願意", unfinished: "把信交還給她，今晚", intervention: "替她把信寄出" }[target]!;
    for (let steps = 0; story.frame.mode !== "ending"; steps++) {
      expect(steps).toBeLessThan(600);
      texts.push(story.frame.text);
      if (story.frame.mode === "tea") story.finishTea({ teaId: "osmanthus", quality: 100, emotionalMatch: 100 });
      else if (story.frame.mode === "letter") story.finishLetter({ completion: 100, understood: true, alternate: false });
      else if (story.frame.canContinue) story.next();
      else {
        const choices = story.frame.choices;
        const choice = choices.find((c) => c.text.includes("聽她問起妳的事") || c.text.includes(answer))
          ?? choices.find((c) => c.text.includes(desired))
          ?? choices.find((c) => c.text.includes("仍替她封口"))
          ?? choices[0]!;
        story.choose(choice.index);
      }
    }
    const text = texts.join(" ");
    expect(story.frame.endingId).toBe(target);
    expect(text).toContain("妳今晚本來要去哪裡");
    expect(text).toContain(reply);
    expect(text).toContain(afterword);
    expect(text).toContain(answer === "走回住處" ? "等妳天亮回去開" : "像也在等一個人先把名字寫上");
  });
  it("continues chapter-nine saves against the exact archived compiled story", () => {
    const previous = readFileSync("public/story/compiled/jinglan-chapter-9.json", "utf8");
    for (const target of ["moonlight", "recipient", "unfinished", "intervention"])
      expect(play(2, target, false, previous).story.frame.endingId).toBe(target);
  });
  it.each([
    ["recipient", "在信箱旁站一會", "這次站一會就夠了", "這句話她記得是自己說的"],
    ["recipient", "讓她自己跟這封短箋道別", "水聲停下時", "才打電話告訴孫女"],
    ["intervention", "寫下她說過的「等等」", "妳寫完沒有再改", "都會先翻到那裡"],
    ["intervention", "向她道歉", "我聽見了。", "原不原諒，是她的事"],
  ])("lets %s end with Lin Cheng's choice to %s", (target, choiceText, scene, afterword) => {
    const story = new StoryBridge(compiled);
    story.next();
    const texts: string[] = [];
    const desired = { recipient: "問她，是否願意", intervention: "替她把信寄出" }[target]!;
    for (let steps = 0; story.frame.mode !== "ending"; steps++) {
      expect(steps).toBeLessThan(600);
      texts.push(story.frame.text);
      if (story.frame.mode === "tea") story.finishTea({ teaId: "osmanthus", quality: 100, emotionalMatch: 100 });
      else if (story.frame.mode === "letter") story.finishLetter({ completion: 100, understood: true, alternate: false });
      else if (story.frame.canContinue) story.next();
      else {
        const choices = story.frame.choices;
        const choice = choices.find((c) => c.text.includes(choiceText))
          ?? choices.find((c) => c.text.includes(desired))
          ?? choices.find((c) => c.text.includes("仍替她封口"))
          ?? choices[0]!;
        story.choose(choice.index);
      }
    }
    const text = texts.join(" ");
    expect(story.frame.endingId).toBe(target);
    expect(text).toContain(scene);
    expect(text).toContain(afterword);
  });
  it("continues chapter-ten saves against the exact archived compiled story", () => {
    const previous = readFileSync("public/story/compiled/jinglan-chapter-10.json", "utf8");
    for (const target of ["moonlight", "recipient", "unfinished", "intervention"])
      expect(play(2, target, false, previous).story.frame.endingId).toBe(target);
  });
  it("continues chapter-thirteen saves against the exact archived compiled story", () => {
    const previous = readFileSync("public/story/compiled/jinglan-chapter-13.json", "utf8");
    for (const target of ["moonlight", "recipient", "unfinished", "intervention"])
      expect(play(2, target, false, previous).story.frame.endingId).toBe(target);
  });
  it("continues chapter-twelve saves against the exact archived compiled story", () => {
    const previous = readFileSync("public/story/compiled/jinglan-chapter-12.json", "utf8");
    for (const target of ["moonlight", "recipient", "unfinished", "intervention"])
      expect(play(2, target, false, previous).story.frame.endingId).toBe(target);
  });
  it("continues chapter-eleven saves against the exact archived compiled story", () => {
    const previous = readFileSync("public/story/compiled/jinglan-chapter-11.json", "utf8");
    for (const target of ["moonlight", "recipient", "unfinished", "intervention"])
      expect(play(2, target, false, previous).story.frame.endingId).toBe(target);
  });
  it.each([
    ["osmanthus", "像碰一下很久以前的那棵樹"],
    ["puer", "晚一點說也還能說"],
    ["mint", "不必說滿的位置"],
  ] as const)("lets the %s tea return just before the letter", (teaId, line) => {
    const texts = play(2, "moonlight", false, compiled, "explore", false, { teaId, quality: 100 }).texts;
    const at = texts.findIndex((text) => text.includes(line));
    expect(at).toBeGreaterThan(-1);
    expect(texts.slice(at + 1).some((text) => text.includes("先選碎片，再放到信上的位置"))).toBe(true);
  });
  it("continues chapter-fourteen saves against the exact archived compiled story", () => {
    const previous = readFileSync("public/story/compiled/jinglan-chapter-14.json", "utf8");
    for (const target of ["moonlight", "recipient", "unfinished", "intervention"])
      expect(play(2, target, false, previous).story.frame.endingId).toBe(target);
  });
  it.each([
    ["puer", "有人在等，有人不能走"],
    ["mint", "這一段是後一半"],
  ] as const)("lets the %s tea return in the hospital memory", (teaId, line) => {
    expect(play(2, "moonlight", false, compiled, "explore", false, { teaId, quality: 100 }).texts.join(" ")).toContain(line);
  });
  it("keeps the hospital memory unchanged for osmanthus", () => {
    const text = play(2, "moonlight").texts.join(" ");
    expect(text).not.toContain("有人在等，有人不能走");
    expect(text).not.toContain("這一段是後一半");
  });
  it.each([
    ["osmanthus", "moonlight", "巷口的桂花開了"],
    ["puer", "unfinished", "這茶要慢慢喝，話也是"],
    ["mint", "recipient", "說涼得太快"],
  ] as const)("remembers the %s tea in the %s afterword", (teaId, target, line) => {
    const text = play(2, target, false, compiled, "explore", false, { teaId, quality: 100 }).texts.join(" ");
    expect(text).toContain(line);
  });
  it("leaves Jinglan's question out when the player goes straight to her decision", () => {
    const text = play(2, "moonlight", false, compiled, "skip").texts.join(" ");
    expect(text).not.toContain("妳今晚本來要去哪裡");
    expect(text).not.toContain("等妳天亮回去開");
  });
  it("lets pu-erh walk around the platform before reaching it", () => {
    const route = (target: string, prefer: string) => {
      const story = new StoryBridge(compiled);
      story.next();
      const texts: string[] = [];
      for (let steps = 0; story.frame.mode !== "ending"; steps++) {
        expect(steps).toBeLessThan(600);
        texts.push(story.frame.text);
        if (story.frame.mode === "tea") story.finishTea({ teaId: prefer.startsWith("mint:") ? "mint" : "puer", quality: 100, emotionalMatch: 100 });
        else if (story.frame.mode === "letter") story.finishLetter({ completion: 100, understood: true, alternate: false });
        else if (story.frame.canContinue) story.next();
        else {
          const want = prefer.replace(/^mint:/, "");
          const desired = { moonlight: "陪她寫一封信", recipient: "問她，是否願意", unfinished: "把信交還給她，今晚", intervention: "替她把信寄出" }[target]!;
          const choice = story.frame.choices.find((c) => c.text.includes(want))
            ?? story.frame.choices.find((c) => c.text.includes(desired))
            ?? story.frame.choices.find((c) => c.text.includes("仍替她封口"))
            ?? story.frame.choices[0]!;
          story.choose(choice.index);
        }
      }
      return { ending: story.frame.endingId, text: texts.join(" ") };
    };
    const teaching = route("moonlight", "聽她先說教書的事");
    expect(teaching.ending).toBe("moonlight");
    expect(teaching.text).toContain("我自己沒走，就想讓他們走");
    expect(teaching.text).toContain("自己那一篇，一直沒交");
    expect(teaching.text).toContain("他叫陳岳川");
    const notReady = route("unfinished", "是不是還沒準備好");
    expect(notReady.ending).toBe("unfinished");
    expect(notReady.text).toContain("我繞了五十年");
    expect(notReady.text).toContain("可是我人已經在這裡了");
    expect(notReady.text).toContain("一個我答應過要去送他的人");
    expect(notReady.text).not.toContain("自己那一篇，一直沒交");
    const water = route("recipient", "mint:換一杯熱開水");
    expect(water.ending).toBe("recipient");
    expect(water.text).toContain("這茶有點冷");
    expect(water.text).toContain("剛才那杯熱水，比它好");
    expect(water.text).toContain("她倒了一杯白開水坐在窗邊");
    const short = route("moonlight", "mint:今晚少說一點");
    expect(short.ending).toBe("moonlight");
    expect(short.text).toContain("那我先說一半");
    expect(short.text).toContain("她其實已經把行李收好");
    expect(short.text).toContain("今晚我本來只打算說一半");
    expect(short.text).not.toContain("剛才那杯熱水，比它好");
    const osmanthus = play(1, "moonlight").texts.join(" ");
    for (const line of ["我教了三十一年國文", "這茶有點冷", "可是我人已經在這裡了", "今晚我本來只打算說一半"])
      expect(osmanthus).not.toContain(line);
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
