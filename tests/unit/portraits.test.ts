import { existsSync, readFileSync, statSync } from "node:fs";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { portraitCues } from "../../src/data/portraits";
import { chapterImages } from "../../src/services/chapterAssetPack";
import { playUntil } from "../storyWalk";
import { portraitCueSchema } from "../../src/types/game";

const publicFile = (url: string) => new URL(`../../public${url}`, import.meta.url).pathname;
const current = {
  jinglan: "main.json",
  boyan: "boyan-chapter-19.json",
  ruoyin: "ruoyin-chapter-18.json",
  yenuan: "yenuan-chapter-16.json",
  yuhang: "yuhang-chapter-18.json",
  haiming: "haiming-chapter-22.json",
  lincheng: "lincheng-chapter-18.json",
} as const;
const storyJson = (chapter: keyof typeof current) =>
  readFileSync(`public/story/compiled/${current[chapter]}`, "utf8");

// The expression portraits added with each chapter's story version.
const expressions = [
  ["jinglan-tearful", "jinglan"],
  ["jinglan-smile", "jinglan"],
  ["boyan-tense", "boyan"],
  ["ruoyin-smile", "ruoyin"],
  ["yenuan-tearful", "yenuan"],
  ["yuhang-worried", "yuhang"],
  ["lincheng", "lincheng"],
  ["lincheng-tearful", "lincheng"],
] as const;

describe("character portraits", () => {
  it("maps every story cue to an image", () => {
    const cues = portraitCueSchema.options.filter((cue) => cue !== "none");
    expect(Object.keys(portraitCues).sort()).toEqual([...cues].sort());
  });

  it.each(Object.entries(portraitCues))("publishes the %s portrait as a transparent 2:3 image", async (cue, { src }) => {
    const file = publicFile(src);
    expect(existsSync(file), cue).toBe(true);
    expect(statSync(file).size).toBeLessThanOrEqual(260 * 1024);
    const { width, height, hasAlpha } = await sharp(file).metadata();
    expect([width, height, hasAlpha]).toEqual([1024, 1536, true]);
  });

  it.each(expressions)("cues %s in the current %s story and ships it with the chapter", (cue, chapter) => {
    expect(storyJson(chapter)).toContain(`"^portrait:${cue}"`);
    const src = portraitCues[cue].src;
    // The first night's portraits are installed with the app; later ones come with the chapter.
    if (chapter === "jinglan") {
      const config = readFileSync("vite.config.ts", "utf8");
      expect(config).toContain(`"${src.slice(1)}"`);
    } else expect(chapterImages[chapter]).toContain(src);
  });

  it.each([
    ["jinglan-tearful", "jinglan", "osmanthus", ["聽她說一件和先生在一起的日常"], "眼睛卻紅了"],
    ["jinglan-smile", "jinglan", "puer", ["是不是還沒準備好說那個約定"], "我繞了四十年"],
    ["jinglan-smile", "jinglan", "osmanthus", ["是否願意把信寄到岳川的舊址", "陪她寫一張詢問收信意願的短箋"], "今晚是我想寄"],
    ["boyan-tense", "boyan", "mint", ["問他哪件事暫時不必填進今晚"], "工作群組的新訊息"],
    ["ruoyin-smile", "ruoyin", "lavender", ["把鉛筆交回若音", "只為一個人拉完", "問她手還好嗎"], "有一點痠"],
    ["yenuan-tearful", "yenuan", "hojicha", ["問她願不願意切開那顆焦麵包", "遞給她中間最軟的一小片"], "比我以為的甜"],
    ["yuhang-worried", "yuhang", "hojicha", ["讓他走到門口，不攔他"], "家那一站"],
    ["lincheng", "lincheng", "osmanthus", ["先坐到訪客席"], "第一次，妳不用替下一位客人安排座位"],
    ["lincheng-tearful", "lincheng", "osmanthus", ["先坐到訪客席"], "藏信是真的"],
    ["lincheng-tearful", "lincheng", "osmanthus", ["先坐到訪客席", "那晚有沒有人抱過妳", "請店主現在抱妳一下"], "可以抱一下嗎"],
  ] as const)("shows %s on the %s line it was drawn for (%s tea)", (cue, chapter, teaId, hints, line) => {
    const frame = playUntil(storyJson(chapter), teaId, [...hints], line)?.frame;
    expect(frame?.mode).toBe("dialogue");
    expect(frame?.portrait).toBe(cue);
  });

  it("shows adult Lin Cheng apart from the visitors", () => {
    expect(portraitCues.lincheng.kind).toBe("self");
    expect(portraitCues["lincheng-tearful"].kind).toBe("self");
  });
});
