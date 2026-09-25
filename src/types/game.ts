import { z } from "zod";
export const STORY_VERSION = "jinglan-chapter-2";
export const storyVersionSchema = z.enum([
  STORY_VERSION,
  "jinglan-chapter-1",
  "jinglan-prototype-1",
]);
export type StoryVersion = z.infer<typeof storyVersionSchema>;
export const sectionSchema = z.enum([
  "prologue",
  "arrival",
  "tea",
  "listening",
  "school",
  "hospital",
  "platform",
  "reunion",
  "letter",
  "response",
  "coda",
  "afterword",
]);
export const clueSchema = z.enum([
  "ring",
  "ticket",
  "envelope",
  "margin",
  "bedside",
  "platform",
  "marriage",
  "old-address",
]);
export const fragmentSchema = z.enum(["address", "reason", "wait"]);
export const sceneSchema = z.enum(["counter", "jinglan", "memory", "moon-sea"]);
export const modeSchema = z.enum(["dialogue", "tea", "letter", "ending"]);
export const teaIdSchema = z.enum([
  "osmanthus",
  "puer",
  "mint",
  "jasmine",
  "black",
  "chamomile",
  "lavender",
  "hojicha",
]);
export type TeaId = z.infer<typeof teaIdSchema>;
export const teaSchema = z.object({
  step: z.enum([
    "select",
    "leaves",
    "scoop",
    "water",
    "steep",
    "serving",
    "serve",
  ]),
  teaId: teaIdSchema,
  leaves: z.number().min(0).max(5),
  water: z.number().min(0).max(100),
  temperature: z.number().min(60).max(100),
  seconds: z.number().min(0).max(120),
  jarOpen: z.boolean().default(false),
  spoonLoaded: z.boolean().default(false),
  spilled: z.number().min(0).max(200).default(0),
  teaLost: z.number().min(0).max(100).default(0),
  cupWater: z.number().min(0).max(100).default(0),
  steepRunning: z.boolean().default(false),
});
export type TeaDraft = z.infer<typeof teaSchema>;
export const letterSchema = z.object({
  slots: z.array(z.string().nullable()).length(3),
  inspected: z.boolean(),
  alternate: z.boolean(),
  angles: z.array(z.number().int().min(0).max(3)).length(3).default([0, 0, 0]),
  flipped: z.array(z.boolean()).length(3).default([false, false, false]),
});
export type LetterDraft = z.infer<typeof letterSchema>;
export const frameSchema = z.object({
  section: sectionSchema.default("prologue"),
  clues: z.array(clueSchema).default([]),
  fragments: z.array(fragmentSchema).default([]),
  text: z.string(),
  speaker: z.string(),
  scene: sceneSchema,
  mode: modeSchema,
  choices: z.array(
    z.object({ index: z.number().int().nonnegative(), text: z.string() }),
  ),
  canContinue: z.boolean(),
  endingId: z.enum([
    "",
    "moonlight",
    "recipient",
    "unfinished",
    "intervention",
  ]),
});
export type StoryFrame = z.infer<typeof frameSchema>;
export const snapshotSchema = z.object({
  version: z.literal(1),
  storyVersion: storyVersionSchema,
  inkState: z.string(),
  frame: frameSchema,
  tea: teaSchema,
  letter: letterSchema,
});
export type GameSnapshot = z.infer<typeof snapshotSchema>;
export const saveSchema = z.object({
  id: z.string(),
  kind: z.enum(["auto", "manual", "chapter"]),
  updatedAt: z.string().datetime(),
  snapshot: snapshotSchema,
});
export type SaveGame = z.infer<typeof saveSchema>;
export interface TeaResult {
  quality: number;
  emotionalMatch: number;
  teaId: TeaId;
}
export const newTea = (): TeaDraft => ({
  step: "select",
  teaId: "osmanthus",
  leaves: 0,
  water: 0,
  temperature: 90,
  seconds: 0,
  jarOpen: false,
  spoonLoaded: false,
  spilled: 0,
  teaLost: 0,
  cupWater: 0,
  steepRunning: false,
});
export const newLetter = (): LetterDraft => ({
  slots: [null, null, null],
  inspected: false,
  alternate: false,
  angles: [0, 0, 0],
  flipped: [false, false, false],
});
