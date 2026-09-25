import { describe, expect, it } from "vitest";
import { scoreTea } from "../../src/services/teaScoring";
import { scoreLetter } from "../../src/services/letterScoring";
import { newLetter } from "../../src/types/game";
import { newTea } from "../../src/types/game";
describe("minigame results", () => {
  it("uses every tea input and caps score through validated input", () => {
    const ideal = { ...newTea(), leaves: 3, seconds: 45, water: 70 };
    expect(scoreTea(ideal)).toMatchObject({
      quality: 100,
      emotionalMatch: 100,
    });
    for (const patch of [
      { teaId: "mint" as const },
      { leaves: 1 },
      { water: 0 },
      { temperature: 60 },
      { seconds: 120 },
    ])
      expect(scoreTea({ ...ideal, ...patch }).quality).toBeLessThan(100);
    expect(scoreTea({ ...ideal, teaId: "mint" }).emotionalMatch).toBe(25);
    expect(() => scoreTea({ ...ideal, water: Number.NaN })).toThrow();
  });
  it("only understands a complete original letter after observing ink", () => {
    const letter = {
      ...newLetter(),
      slots: ["address", "reason", "wait"],
      inspected: true,
      alternate: false,
    };
    expect(scoreLetter(letter)).toEqual({ completion: 100, understood: true });
    expect(scoreLetter({ ...letter, inspected: false }).understood).toBe(false);
    expect(scoreLetter({ ...letter, alternate: true }).understood).toBe(false);
    expect(scoreLetter({ ...letter, flipped: [false, false, true] })).toEqual({
      completion: 67,
      understood: false,
    });
    expect(scoreLetter({ ...letter, slots: [null, null, null] })).toEqual({
      completion: 0,
      understood: false,
    });
    expect(
      scoreLetter({ ...letter, slots: ["wait", "reason", "address"] })
        .completion,
    ).toBe(33);
  });
});
