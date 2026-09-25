import { letterPieces } from "../data/catalog";
import { letterSchema, type LetterDraft } from "../types/game";
export function scoreLetter(input: LetterDraft) {
  const draft = letterSchema.parse(input);
  const correct = draft.slots.filter(
    (id, index) =>
      id === letterPieces[index]?.id &&
      !draft.flipped[letterPieces.findIndex((piece) => piece.id === id)],
  ).length;
  return {
    completion: Math.round((correct / 3) * 100),
    understood: correct === 3 && draft.inspected && !draft.alternate,
  };
}
