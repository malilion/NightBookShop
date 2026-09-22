import { teas } from "../data/catalog";
import { teaSchema, type TeaDraft, type TeaResult } from "../types/game";
const fit = (actual: number, ideal: number, tolerance: number) =>
  Math.max(0, 100 - (Math.abs(actual - ideal) / tolerance) * 100);
export function scoreTea(input: TeaDraft): TeaResult {
  const draft = teaSchema.parse(input);
  const tea = teas[draft.teaId];
  return {
    teaId: draft.teaId,
    emotionalMatch: tea.match,
    quality: Math.max(
      0,
      Math.round(
        tea.match * 0.4 +
          fit(draft.leaves, 3, 3) * 0.15 +
          fit(draft.temperature, tea.temperature, 30) * 0.15 +
          fit(draft.water, 70, 70) * 0.1 +
          fit(draft.seconds, tea.seconds, 60) * 0.2 -
          Math.min(15, draft.spilled * 0.15),
      ),
    ),
  };
}
