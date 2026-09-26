import { z } from "zod";
import { newTea, teaSchema } from "./game";

export const teaHouseKindSchema = z.enum(["daily", "night", "free"]);
export type TeaHouseKind = z.infer<typeof teaHouseKindSchema>;
export const teaHouseResultSchema = z.object({
  orderId: z.string(),
  score: z.number().int().min(0).max(100),
  stars: z.number().int().min(0).max(3),
  recipeId: z.string().nullable(),
});
export type TeaHouseResult = z.infer<typeof teaHouseResultSchema>;
export const teaHouseSessionSchema = z.object({
  kind: teaHouseKindSchema,
  /** Local date of a daily ticket; null for other sessions. */
  date: z.string().nullable(),
  seed: z.number().int().nonnegative(),
  orders: z.array(z.string()).max(5),
  index: z.number().int().min(0).max(5),
  results: z.array(teaHouseResultSchema).max(5),
  draft: teaSchema,
  startedAt: z.string(),
});
export type TeaHouseSession = z.infer<typeof teaHouseSessionSchema>;
const recordSchema = z.object({
  brewed: z.number().int().min(0),
  best: z.number().int().min(0).max(100),
});
export const teaHouseProgressSchema = z.object({
  version: z.literal(1),
  stars: z.number().int().min(0).default(0),
  served: z.number().int().min(0).default(0),
  perfect: z.number().int().min(0).default(0),
  nights: z.number().int().min(0).default(0),
  bestNight: z.number().int().min(0).max(15).default(0),
  daily: z
    .record(z.string(), z.object({ stars: z.number().int().min(0).max(15), score: z.number().int().min(0).max(500) }))
    .default({}),
  teas: z.record(z.string(), recordSchema).default({}),
  recipes: z.record(z.string(), z.object({ at: z.string(), best: z.number().int().min(0).max(100) })).default({}),
  session: teaHouseSessionSchema.nullable().default(null),
});
export type TeaHouseProgress = z.infer<typeof teaHouseProgressSchema>;
export const newTeaHouseProgress = (): TeaHouseProgress => ({
  version: 1,
  stars: 0,
  served: 0,
  perfect: 0,
  nights: 0,
  bestNight: 0,
  daily: {},
  teas: {},
  recipes: {},
  session: null,
});
export const newTeaHouseSession = (
  kind: TeaHouseKind,
  seed: number,
  orders: string[],
  date: string | null,
): TeaHouseSession => ({
  kind,
  date,
  seed,
  orders,
  index: 0,
  results: [],
  draft: newTea(),
  startedAt: new Date().toISOString(),
});
