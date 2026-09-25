import { teas } from "../data/catalog";
import {
  teaSchema,
  type TeaDraft,
  type TeaId,
  type TeaResult,
} from "../types/game";
const fit = (actual: number, ideal: number, tolerance: number) =>
  Math.max(0, 100 - (Math.abs(actual - ideal) / tolerance) * 100);
const boyanTeaMatch: Partial<Record<TeaId, number>> = {
  chamomile: 100,
  mint: 65,
  black: 25,
};
const ruoyinTeaMatch: Partial<Record<TeaId, number>> = {
  lavender: 100,
  osmanthus: 65,
  black: 25,
};
const yenuanTeaMatch: Partial<Record<TeaId, number>> = {
  hojicha: 100,
  lavender: 65,
  black: 25,
};
const yuhangTeaMatch: Partial<Record<TeaId, number>> = {
  mint: 100,
  chamomile: 65,
  hojicha: 45,
};
const haimingTeaMatch: Partial<Record<TeaId, number>> = {
  hojicha: 100,
  puer: 75,
  mint: 40,
};
export function scoreTea(input: TeaDraft, chapterId = "jinglan"): TeaResult {
  const draft = teaSchema.parse(input);
  const tea = teas[draft.teaId];
  const emotionalMatch =
    chapterId === "haiming"
      ? draft.teaId === "hojicha" && draft.garnish !== "caramel"
        ? 75
        : haimingTeaMatch[draft.teaId] ?? 55
      : chapterId === "yuhang"
      ? draft.teaId === "mint"
        ? draft.garnish === "lemon" && draft.blackTea >= 15 ? 100
          : draft.blackTea >= 15 ? 90
          : draft.garnish === "lemon" ? 85 : 75
        : draft.teaId === "chamomile" && draft.garnish === "honey" ? 75
        : draft.teaId === "hojicha" && draft.garnish === "apple" ? 55
        : yuhangTeaMatch[draft.teaId] ?? 55
      : chapterId === "yenuan"
      ? draft.teaId === "hojicha" && draft.garnish !== "apple"
        ? 75
        : yenuanTeaMatch[draft.teaId] ?? 55
      : chapterId === "ruoyin"
      ? (ruoyinTeaMatch[draft.teaId] ?? 55)
      : chapterId === "boyan"
        ? draft.teaId === "chamomile" && draft.garnish !== "honey"
          ? 75
          : (boyanTeaMatch[draft.teaId] ?? 55)
        : tea.match;
  return {
    teaId: draft.teaId,
    garnish: draft.garnish,
    blackTea: draft.blackTea,
    emotionalMatch,
    quality: Math.max(
      0,
      Math.round(
        emotionalMatch * 0.4 +
          fit(draft.leaves, 3, 3) * 0.15 +
          fit(draft.temperature, tea.temperature, 30) * 0.15 +
          fit(draft.water, 70, 70) * 0.1 +
          fit(draft.seconds, tea.seconds, 60) * 0.2 -
          Math.min(15, draft.spilled * 0.15),
      ),
    ),
  };
}
