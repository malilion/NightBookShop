import {
  sceneSchema,
  sectionSchema,
  clueSchema,
  fragmentSchema,
  portraitCueSchema,
} from "../types/game";
export function parseTag(tag: string) {
  const [type, ...parts] = tag.trim().split(":");
  const value = parts.join(":").trim();
  if (type === "section")
    return { type, value: sectionSchema.parse(value) } as const;
  if (type === "clue") return { type, value: clueSchema.parse(value) } as const;
  if (type === "fragment")
    return { type, value: fragmentSchema.parse(value) } as const;
  if (type === "scene")
    return { type, value: sceneSchema.parse(value) } as const;
  if (type === "portrait")
    return { type, value: portraitCueSchema.parse(value) } as const;
  if (
    type === "speaker" &&
    [
      "林澄",
      "周靜蘭",
      "許柏言",
      "沈若音",
      "季晴",
      "葉暖",
      "葉暖的母親",
      "程雨航",
      "程雨航的妹妹",
      "顧海明",
      "顧川",
      "店主",
      "旁白",
      "員工手冊",
      "年輕的靜蘭",
      "年輕的若音",
    ].includes(value)
  )
    return { type, value } as const;
  if (type === "minigame" && ["tea", "letter", "melody", "hearth", "route", "lamp", "archive", "notifications"].includes(value))
    return { type, value: value as "tea" | "letter" | "melody" | "hearth" | "route" | "lamp" | "archive" | "notifications" } as const;
  if (
    type === "ending" &&
    [
      "moonlight",
      "recipient",
      "unfinished",
      "intervention",
      "boyan-rest",
      "boyan-leave",
      "boyan-boundary",
      "boyan-overwork",
      "ruoyin-one",
      "ruoyin-stage",
      "ruoyin-score",
      "ruoyin-echo",
      "yenuan-share",
      "yenuan-reopen",
      "yenuan-rest",
      "yenuan-copy",
      "yuhang-today",
      "yuhang-future",
      "yuhang-past",
      "yuhang-unknown",
      "haiming-light",
      "haiming-voice",
      "haiming-boat",
      "haiming-hero",
      "lincheng-dawn",
      "lincheng-keeper",
      "lincheng-shelf",
      "lincheng-midnight",
    ].includes(value)
  )
    return {
      type,
      value: value as
        | "moonlight"
        | "recipient"
        | "unfinished"
        | "intervention"
        | "boyan-rest"
        | "boyan-leave"
        | "boyan-boundary"
        | "boyan-overwork"
        | "ruoyin-one"
        | "ruoyin-stage"
        | "ruoyin-score"
        | "ruoyin-echo"
        | "yenuan-share"
        | "yenuan-reopen"
        | "yenuan-rest"
        | "yenuan-copy"
        | "yuhang-today"
        | "yuhang-future"
        | "yuhang-past"
        | "yuhang-unknown"
        | "haiming-light"
        | "haiming-voice"
        | "haiming-boat"
        | "haiming-hero"
        | "lincheng-dawn"
        | "lincheng-keeper"
        | "lincheng-shelf"
        | "lincheng-midnight",
    } as const;
  throw new Error(`未知的故事標記：${tag}`);
}
