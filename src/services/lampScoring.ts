import { lampSchema, type LampDraft } from "../types/game";

const changes = { brighten: 25, dim: -25, steady: 0 } as const;
export function scoreLamp(input: LampDraft) {
  const draft = lampSchema.parse(input);
  const brightness = Math.max(0, Math.min(100, 50 + draft.turns.reduce((sum, turn) => sum + changes[turn], 0)));
  const steady = draft.turns.filter((turn) => turn === "steady").length;
  return { brightness, steady, balanced: draft.turns.length === 3 && brightness >= 30 && brightness <= 70 && steady >= 2 };
}
