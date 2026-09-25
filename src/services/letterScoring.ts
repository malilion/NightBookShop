import {
  letterPieces,
  boyanLetterPieces,
  ruoyinLetterPieces,
  yenuanLetterPieces,
  yuhangLetterPieces,
  haimingLetterPieces,
  linchengLetterPieces,
} from "../data/catalog";
import { letterSchema, type LetterDraft } from "../types/game";
export function scoreLetter(input: LetterDraft, chapterId = "jinglan") {
  const draft = letterSchema.parse(input);
  if (chapterId === "lincheng") {
    const correct = draft.slots.filter((id, index) => id === linchengLetterPieces[index]?.id).length;
    return {
      completion: Math.round((correct / linchengLetterPieces.length) * 100),
      understood: correct === linchengLetterPieces.length && draft.inspected && !draft.alternate,
    };
  }
  if (chapterId === "haiming") {
    const correct = draft.slots.filter((id, index) => id === haimingLetterPieces[index]?.id).length;
    return {
      completion: Math.round((correct / haimingLetterPieces.length) * 100),
      understood: correct === haimingLetterPieces.length && draft.inspected && !draft.alternate,
    };
  }
  if (chapterId === "yuhang") {
    const correct = draft.slots.filter((id, index) => id === yuhangLetterPieces[index]?.id).length;
    return {
      completion: Math.round((correct / yuhangLetterPieces.length) * 100),
      understood: correct === yuhangLetterPieces.length && draft.inspected,
    };
  }
  if (chapterId === "ruoyin" || chapterId === "yenuan") {
    const pieces = chapterId === "yenuan" ? yenuanLetterPieces : ruoyinLetterPieces;
    const front = draft.slots.filter(
      (id, index) => id === pieces[index]?.id,
    ).length;
    const back = draft.reverseSlots.filter(
      (id, index) => id === pieces[index]?.id,
    ).length;
    return {
      completion: Math.round(((front + back) / 6) * 100),
      understood: front === 3 && back === 3 && draft.inspected,
    };
  }
  const pieces = chapterId === "boyan" ? boyanLetterPieces : letterPieces;
  const correct = draft.slots.filter(
    (id, index) =>
      id === pieces[index]?.id &&
      !draft.flipped[pieces.findIndex((piece) => piece.id === id)],
  ).length;
  return {
    completion: Math.round((correct / pieces.length) * 100),
    understood:
      correct === pieces.length && draft.inspected && !draft.alternate,
  };
}
