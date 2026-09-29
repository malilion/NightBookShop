import { z } from "zod";
export const STORY_VERSION = "jinglan-chapter-8";
export const storyVersionSchema = z.enum([
  STORY_VERSION,
  "jinglan-chapter-7",
  "jinglan-chapter-6",
  "jinglan-chapter-5",
  "jinglan-chapter-4",
  "jinglan-chapter-3",
  "jinglan-chapter-2",
  "boyan-chapter-1",
  "boyan-chapter-2",
  "boyan-chapter-3",
  "boyan-chapter-4",
  "boyan-chapter-5",
  "boyan-chapter-6",
  "boyan-chapter-7",
  "boyan-chapter-8",
  "boyan-chapter-9",
  "boyan-chapter-10",
  "boyan-chapter-11",
  "boyan-chapter-12",
  "boyan-chapter-13",
  "ruoyin-chapter-1",
  "ruoyin-chapter-2",
  "ruoyin-chapter-3",
  "ruoyin-chapter-4",
  "ruoyin-chapter-5",
  "ruoyin-chapter-6",
  "ruoyin-chapter-7",
  "ruoyin-chapter-8",
  "ruoyin-chapter-9",
  "ruoyin-chapter-10",
  "ruoyin-chapter-11",
  "ruoyin-chapter-12",
  "yenuan-chapter-1",
  "yenuan-chapter-2",
  "yenuan-chapter-3",
  "yenuan-chapter-4",
  "yenuan-chapter-5",
  "yenuan-chapter-6",
  "yenuan-chapter-7",
  "yenuan-chapter-8",
  "yenuan-chapter-9",
  "yenuan-chapter-10",
  "yenuan-chapter-11",
  "yuhang-chapter-1",
  "yuhang-chapter-2",
  "yuhang-chapter-3",
  "yuhang-chapter-4",
  "yuhang-chapter-5",
  "yuhang-chapter-6",
  "yuhang-chapter-7",
  "yuhang-chapter-8",
  "yuhang-chapter-9",
  "yuhang-chapter-10",
  "yuhang-chapter-11",
  "yuhang-chapter-12",
  "haiming-chapter-1",
  "haiming-chapter-2",
  "haiming-chapter-3",
  "haiming-chapter-4",
  "haiming-chapter-5",
  "haiming-chapter-6",
  "haiming-chapter-7",
  "haiming-chapter-8",
  "haiming-chapter-9",
  "haiming-chapter-10",
  "haiming-chapter-11",
  "haiming-chapter-12",
  "haiming-chapter-13",
  "haiming-chapter-14",
  "haiming-chapter-15",
  "lincheng-chapter-1",
  "lincheng-chapter-2",
  "lincheng-chapter-3",
  "lincheng-chapter-4",
  "lincheng-chapter-5",
  "lincheng-chapter-6",
  "lincheng-chapter-7",
  "lincheng-chapter-8",
  "lincheng-chapter-9",
  "lincheng-chapter-10",
  "lincheng-chapter-11",
  "lincheng-chapter-12",
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
  "office",
  "clinic",
  "train",
  "childhood",
  "backstage",
  "banquet",
  "grandstage",
  "finalbar",
  "dawn-kitchen",
  "anniversary",
  "old-oven",
  "recipe-choice",
  "observations",
  "hearth",
  "hospital-return",
  "mail-route",
  "old-post-office",
  "last-bus",
  "empty-shop",
  "bookshop-door",
  "stamp-choice",
  "storm-tower",
  "summer-visit",
  "last-watch",
  "white-room",
  "log-choice",
  "watch-lamp",
  "archive",
  "visitor-seat",
  "child-home",
  "hidden-room",
  "hidden-envelope",
  "owner-talk",
  "self-letter",
  "dawn-choice",
]);
export const clueSchema = z.enum([
  "ring",
  "ticket",
  "envelope",
  "camellia",
  "margin",
  "bedside",
  "platform",
  "marriage",
  "old-address",
  "old-melody",
  "badge",
  "watch",
  "medicine",
  "exam",
  "notification",
  "date",
  "school-journal",
  "river-bookstall",
  "tea-apology",
  "broken-string",
  "concert-ticket",
  "injury",
  "stage-review",
  "cleaner",
  "company-recital",
  "first-joy",
  "motif",
  "bus-hum",
  "tea-breath",
  "tea-score",
  "manual-page",
  "burnt-bread",
  "candles",
  "burn-mark",
  "voicemail",
  "recipe-card",
  "recipe-postmark",
  "moon-card",
  "childhood-glimpse",
  "two-cups-break",
  "oven-pause",
  "tea-cleanup",
  "wet-envelope",
  "delivery-ledger",
  "wooden-shop",
  "postcard",
  "cancelled-leave",
  "expired-lease",
  "stamp-bottom",
  "future-postmark",
  "lighthouse-postcard",
  "sister-route-note",
  "own-address",
  "delivery-reflex",
  "address-card",
  "many-hands",
  "broken-lamp",
  "rescue-log",
  "kite",
  "wedding-invite",
  "paper-boat",
  "lighthouse-photo",
  "shared-melody",
  "tower-table",
  "today-page",
  "tea-date",
  "sixfold-map",
  "child-note",
  "hidden-page",
  "nameplate",
]);
export const fragmentSchema = z.enum([
  "address",
  "reason",
  "wait",
  "status",
  "boundary",
  "handoff",
  "next",
  "greeting",
  "fear",
  "music",
  "flour",
  "apple",
  "waiting",
  "tomorrow",
  "admit",
  "without-her",
  "begin",
  "light",
  "shore",
  "return",
  "remember",
  "kept",
  "afraid",
  "two-wishes",
  "embrace",
]);
export const sceneSchema = z.enum([
  "counter",
  "jinglan",
  "memory",
  "moon-sea",
  "boyan",
  "ruoyin",
  "yenuan",
  "yuhang",
  "haiming",
  "lincheng",
]);
export const modeSchema = z.enum([
  "dialogue",
  "tea",
  "letter",
  "melody",
  "hearth",
  "route",
  "lamp",
  "archive",
  "notifications",
  "ending",
]);
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
export const ingredientIdSchema = z.enum([
  "honey",
  "lemon",
  "apple",
  "caramel",
  "ginger",
  "rose",
  "milk",
  "cinnamon",
]);
export type IngredientId = z.infer<typeof ingredientIdSchema>;
/** One unit of an ingredient, steeped in the pot or stirred into the cup. */
export const ingredientUnitSchema = z.object({
  id: ingredientIdSchema,
  where: z.enum(["pot", "cup"]),
  /** Steep seconds on the hourglass when it went in. */
  at: z.number().min(0).max(120),
});
export type IngredientUnit = z.infer<typeof ingredientUnitSchema>;
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
  blendTeaId: teaIdSchema.nullable().default(null),
  garnish: z.enum(["none", "apple", "lemon", "caramel", "honey"]).default("none"),
  blackTea: z.number().min(0).max(30).default(0),
  leaves: z.number().min(0).max(5),
  blendLeaves: z.number().min(0).max(5).default(0),
  leafOrder: z.array(teaIdSchema).max(5).default([]),
  water: z.number().min(0).max(100),
  temperature: z.number().min(60).max(100),
  seconds: z.number().min(0).max(120),
  jarOpen: z.boolean().default(false),
  blendJarOpen: z.boolean().default(false),
  spoonLoaded: z.boolean().default(false),
  spoonTeaId: teaIdSchema.nullable().default(null),
  spilled: z.number().min(0).max(200).default(0),
  teaLost: z.number().min(0).max(100).default(0),
  cupWater: z.number().min(0).max(100).default(0),
  steepRunning: z.boolean().default(false),
  // Tea house only: ingredients by unit, and water boiled on the stove.
  ingredients: z.array(ingredientUnitSchema).max(6).default([]),
  kettleTemp: z.number().min(20).max(100).default(45),
  fire: z.number().int().min(0).max(3).default(0),
  /** Seconds the kettle has spent at a rolling boil. */
  kettleOverBoil: z.number().min(0).max(600).default(0),
  /** How long the water in the pot had boiled, mixed in as it was poured. */
  overBoil: z.number().min(0).max(600).default(0),
}).superRefine((draft, ctx) => {
  if (draft.leaves + draft.blendLeaves > 5)
    ctx.addIssue({ code: "custom", path: ["blendLeaves"], message: "兩種茶葉總量不能超過五匙。" });
  for (const id of new Set(draft.ingredients.map((unit) => unit.id)))
    if (draft.ingredients.filter((unit) => unit.id === id).length > 3)
      ctx.addIssue({ code: "custom", path: ["ingredients"], message: "同一種配料最多三份。" });
  if (draft.blendLeaves > 0 && (!draft.blendTeaId || draft.blendTeaId === draft.teaId))
    ctx.addIssue({ code: "custom", path: ["blendTeaId"], message: "第二種茶葉必須與第一種不同。" });
});
export type TeaDraft = z.infer<typeof teaSchema>;
export const letterSchema = z.object({
  slots: z.array(z.string().nullable()).min(3).max(4),
  inspected: z.boolean(),
  resonanceInspected: z.boolean().default(false),
  alternate: z.boolean(),
  angles: z
    .array(z.number().int().min(0).max(3))
    .min(3)
    .max(4)
    .default([0, 0, 0]),
  flipped: z.array(z.boolean()).min(3).max(4).default([false, false, false]),
  reverseSlots: z
    .array(z.string().nullable())
    .length(3)
    .default([null, null, null]),
  activeSide: z.enum(["front", "back"]).default("front"),
  stamp: z.enum(["none", "past", "present", "future"]).default("none"),
});
export type LetterDraft = z.infer<typeof letterSchema>;
export const melodySchema = z.object({
  notes: z.array(z.number().int().min(0).max(3)).max(4),
});
export type MelodyDraft = z.infer<typeof melodySchema>;
export const hearthActionSchema = z.enum(["rush", "silence", "wait", "ask"]);
export const hearthSchema = z.object({
  responses: z.array(hearthActionSchema).max(3),
});
export type HearthDraft = z.infer<typeof hearthSchema>;
export const routeStopSchema = z.enum(["post-office", "last-bus", "empty-shop", "bookshop-door"]);
export const routeSchema = z.object({ stops: z.array(routeStopSchema).max(3) });
export type RouteDraft = z.infer<typeof routeSchema>;
export const lampActionSchema = z.enum(["brighten", "dim", "steady"]);
export const lampSchema = z.object({ turns: z.array(lampActionSchema).max(3) });
export type LampDraft = z.infer<typeof lampSchema>;
export const archiveItemSchema = z.enum(["jinglan", "boyan", "ruoyin", "yenuan", "yuhang", "haiming"]);
export const archiveConnectionSchema = z.enum([
  "jinglan-boyan", "boyan-ruoyin", "ruoyin-haiming", "haiming-yuhang", "yuhang-yenuan",
]);
export const archiveSchema = z.object({
  inspected: z.array(archiveItemSchema).max(6),
  connections: z.array(archiveConnectionSchema).max(5).default([]),
});
export type ArchiveDraft = z.infer<typeof archiveSchema>;
export const workNotificationSchema = z.enum(["manager", "teammate", "system"]);
export type WorkNotification = z.infer<typeof workNotificationSchema>;
export const notificationsSchema = z.object({
  paused: z.array(workNotificationSchema).max(3),
  repliedMother: z.boolean(),
}).refine((draft) => new Set(draft.paused).size === draft.paused.length, "工作通知不能重複暫停。");
export type NotificationsDraft = z.infer<typeof notificationsSchema>;
export const openingTaskSchema = z.enum(["counter", "weather", "tea"]);
export type OpeningTask = z.infer<typeof openingTaskSchema>;
export const openingSchema = z.object({
  inspected: z.array(openingTaskSchema).max(3),
  complete: z.boolean(),
});
export type OpeningDraft = z.infer<typeof openingSchema>;
export const portraitCueSchema = z.enum([
  "none",
  "owner",
  "owner-apology",
  "lincheng-child",
  "boyan-soft",
  "ruoyin-reflective",
  "yenuan-thoughtful",
  "yuhang-hopeful",
  "haiming-searching",
  "haiming-warm",
]);
export const resonanceChapterSchema = z.enum(["jinglan", "boyan", "ruoyin", "yenuan", "yuhang", "haiming"]);
export type ResonanceChapterId = z.infer<typeof resonanceChapterSchema>;
export const frameSchema = z.object({
  section: sectionSchema.default("prologue"),
  clues: z.array(clueSchema).default([]),
  fragments: z.array(fragmentSchema).default([]),
  resonanceFragment: resonanceChapterSchema.nullable().default(null),
  brewSummary: z.string().default(""),
  text: z.string(),
  speaker: z.string(),
  portrait: portraitCueSchema.default("none"),
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
  melody: melodySchema.default({ notes: [] }),
  hearth: hearthSchema.default({ responses: [] }),
  route: routeSchema.default({ stops: [] }),
  lamp: lampSchema.default({ turns: [] }),
  archive: archiveSchema.default({ inspected: [], connections: [] }),
  notifications: notificationsSchema.default({ paused: [], repliedMother: false }),
  opening: openingSchema.default({ inspected: ["counter", "weather", "tea"], complete: true }),
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
  garnish?: TeaDraft["garnish"];
  blackTea?: number;
  primaryTeaId?: TeaId;
  blendTeaId?: TeaId | null;
  blendLeaves?: number;
  primaryLeaves?: number;
}
export const newTea = (): TeaDraft => ({
  step: "select",
  teaId: "osmanthus",
  blendTeaId: null,
  garnish: "none",
  blackTea: 0,
  leaves: 0,
  blendLeaves: 0,
  leafOrder: [],
  water: 0,
  temperature: 90,
  seconds: 0,
  jarOpen: false,
  blendJarOpen: false,
  spoonLoaded: false,
  spoonTeaId: null,
  spilled: 0,
  teaLost: 0,
  cupWater: 0,
  steepRunning: false,
  ingredients: [],
  kettleTemp: 45,
  fire: 0,
  kettleOverBoil: 0,
  overBoil: 0,
});
export const newLetter = (): LetterDraft => ({
  slots: [null, null, null],
  inspected: false,
  resonanceInspected: false,
  alternate: false,
  angles: [0, 0, 0],
  flipped: [false, false, false],
  reverseSlots: [null, null, null],
  activeSide: "front",
  stamp: "none",
});
export const newMelody = (): MelodyDraft => ({ notes: [] });
export const newHearth = (): HearthDraft => ({ responses: [] });
export const newRoute = (): RouteDraft => ({ stops: [] });
export const newLamp = (): LampDraft => ({ turns: [] });
export const newArchive = (): ArchiveDraft => ({ inspected: [], connections: [] });
export const newNotifications = (): NotificationsDraft => ({ paused: [], repliedMother: false });
export const newOpening = (): OpeningDraft => ({ inspected: [], complete: false });
