import {
  sceneSchema,
  sectionSchema,
  clueSchema,
  fragmentSchema,
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
  if (
    type === "speaker" &&
    ["林澄", "周靜蘭", "旁白", "員工手冊", "年輕的靜蘭"].includes(value)
  )
    return { type, value } as const;
  if (type === "minigame" && ["tea", "letter"].includes(value))
    return { type, value: value as "tea" | "letter" } as const;
  if (
    type === "ending" &&
    ["moonlight", "recipient", "unfinished", "intervention"].includes(value)
  )
    return {
      type,
      value: value as "moonlight" | "recipient" | "unfinished" | "intervention",
    } as const;
  throw new Error(`未知的故事標記：${tag}`);
}
