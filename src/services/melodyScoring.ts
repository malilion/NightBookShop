export const cupMotif = [0, 1, 3, 2] as const;
export function matchesCupMotif(notes: readonly number[]) {
  return (
    notes.length === cupMotif.length &&
    notes.every((note, index) => note === cupMotif[index])
  );
}
