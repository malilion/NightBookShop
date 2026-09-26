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
function matchTea(teaId: TeaId, chapterId: string, garnish: TeaDraft["garnish"], blackTea: number) {
  return (
    chapterId === "haiming"
      ? teaId === "hojicha" && garnish !== "caramel"
        ? 75
        : haimingTeaMatch[teaId] ?? 55
      : chapterId === "yuhang"
      ? teaId === "mint"
        ? garnish === "lemon" && blackTea >= 15 ? 100
          : blackTea >= 15 ? 90
          : garnish === "lemon" ? 85 : 75
        : teaId === "chamomile" && garnish === "honey" ? 75
        : teaId === "hojicha" && garnish === "apple" ? 55
        : yuhangTeaMatch[teaId] ?? 55
      : chapterId === "yenuan"
      ? teaId === "hojicha" && garnish !== "apple"
        ? 75
        : yenuanTeaMatch[teaId] ?? 55
      : chapterId === "ruoyin"
      ? (ruoyinTeaMatch[teaId] ?? 55)
      : chapterId === "boyan"
        ? teaId === "chamomile" && garnish !== "honey"
          ? 75
          : (boyanTeaMatch[teaId] ?? 55)
        : teas[teaId].match
  );
}
export function scoreTea(input: TeaDraft, chapterId = "jinglan"): TeaResult {
  const draft = teaSchema.parse(input);
  const blendTeaId = draft.blendTeaId !== draft.teaId && draft.blendLeaves > 0 ? draft.blendTeaId : null;
  const blendLeaves = blendTeaId ? draft.blendLeaves : 0;
  const totalLeaves = draft.leaves + blendLeaves;
  const blendRatio = totalLeaves > 0 ? blendLeaves / totalLeaves : 0;
  const primary = teas[draft.teaId];
  const secondary = blendTeaId ? teas[blendTeaId] : null;
  const emotionalMatch = Math.round(
    matchTea(draft.teaId, chapterId, draft.garnish, draft.blackTea) * (1 - blendRatio) +
      (blendTeaId ? matchTea(blendTeaId, chapterId, "none", 0) * blendRatio : 0),
  );
  const idealTemperature = primary.temperature * (1 - blendRatio) + (secondary?.temperature ?? 0) * blendRatio;
  const idealSeconds = primary.seconds * (1 - blendRatio) + (secondary?.seconds ?? 0) * blendRatio;
  const dominantTeaId = blendLeaves > draft.leaves ? blendTeaId! : draft.teaId;
  const activeBlendTeaId = draft.leaves > 0 ? blendTeaId : null;
  return {
    teaId: dominantTeaId,
    garnish: dominantTeaId === draft.teaId ? draft.garnish : "none",
    blackTea: dominantTeaId === draft.teaId ? draft.blackTea : 0,
    primaryTeaId: activeBlendTeaId ? draft.teaId : dominantTeaId,
    blendTeaId: activeBlendTeaId,
    blendLeaves: activeBlendTeaId ? blendLeaves : 0,
    primaryLeaves: activeBlendTeaId ? draft.leaves : totalLeaves,
    emotionalMatch,
    quality: Math.max(
      0,
      Math.round(
        emotionalMatch * 0.4 +
          fit(totalLeaves, 3, 3) * 0.15 +
          fit(draft.temperature, idealTemperature, 30) * 0.15 +
          fit(draft.water, 70, 70) * 0.1 +
          fit(draft.seconds, idealSeconds, 60) * 0.2 -
          Math.min(15, draft.spilled * 0.15),
      ),
    ),
  };
}
