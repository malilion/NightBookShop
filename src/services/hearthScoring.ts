import { hearthSchema, type HearthDraft } from "../types/game";

const changes = { rush: 25, silence: -25, wait: -7, ask: 5 } as const;
export function scoreHearth(input: HearthDraft) {
  const draft = hearthSchema.parse(input);
  const heat = Math.max(
    0,
    Math.min(100, 50 + draft.responses.reduce((sum, action) => sum + changes[action], 0)),
  );
  const care = draft.responses.filter((action) => action === "wait" || action === "ask").length;
  return {
    heat,
    care,
    balanced: draft.responses.length === 3 && heat >= 30 && heat <= 70 && care >= 2,
  };
}
