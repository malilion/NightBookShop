import { describe, expect, it } from "vitest";
import { scoreTea } from "../../src/services/teaScoring";
import { scoreLetter } from "../../src/services/letterScoring";
import { newLetter, newTea, teaSchema } from "../../src/types/game";
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
  it("scores Yenuan's apple hojicha as the dedicated tea", () => {
    const base = { ...newTea(), teaId: "hojicha" as const, leaves: 3, water: 70, temperature: 95, seconds: 60 };
    const plain = scoreTea(base, "yenuan");
    const apple = scoreTea({ ...base, garnish: "apple" }, "yenuan");
    expect(plain.emotionalMatch).toBe(75);
    expect(apple.emotionalMatch).toBe(100);
    expect(apple.quality).toBeGreaterThan(plain.quality);
    expect(apple.garnish).toBe("apple");
  });
  it("reserves Boyan's highest tea fit for chamomile with honey", () => {
    const base = { ...newTea(), teaId: "chamomile" as const, leaves: 3, water: 70, temperature: 90, seconds: 60 };
    const plain = scoreTea(base, "boyan");
    const honey = scoreTea({ ...base, garnish: "honey" }, "boyan");
    expect(plain.emotionalMatch).toBe(75);
    expect(honey.emotionalMatch).toBe(100);
    expect(honey.quality).toBeGreaterThan(plain.quality);
    expect(honey.garnish).toBe("honey");
  });
  it("scores Yuhang's lemon mint as the dedicated tea", () => {
    const base = { ...newTea(), teaId: "mint" as const, leaves: 3, water: 70, temperature: 80, seconds: 30 };
    const plain = scoreTea(base, "yuhang");
    const lemon = scoreTea({ ...base, garnish: "lemon" }, "yuhang");
    const blend = scoreTea({ ...base, blackTea: 20 }, "yuhang");
    const complete = scoreTea({ ...base, garnish: "lemon", blackTea: 20 }, "yuhang");
    expect(plain.emotionalMatch).toBe(75);
    expect(lemon.emotionalMatch).toBe(85);
    expect(blend.emotionalMatch).toBe(90);
    expect(complete.emotionalMatch).toBe(100);
    expect(lemon.quality).toBeGreaterThan(plain.quality);
    expect(complete.quality).toBeGreaterThan(blend.quality);
    expect(complete.blackTea).toBe(20);
    expect(lemon.garnish).toBe("lemon");
  });
  it("scores Yuhang's optional honey and apple recipes without overtaking mint", () => {
    const chamomile = { ...newTea(), teaId: "chamomile" as const, leaves: 3, water: 70, temperature: 85, seconds: 45 };
    const hojicha = { ...newTea(), teaId: "hojicha" as const, leaves: 3, water: 70, temperature: 95, seconds: 60 };
    expect(scoreTea({ ...chamomile, garnish: "honey" }, "yuhang").emotionalMatch).toBe(75);
    expect(scoreTea(chamomile, "yuhang").emotionalMatch).toBe(65);
    expect(scoreTea({ ...hojicha, garnish: "apple" }, "yuhang").emotionalMatch).toBe(55);
    expect(scoreTea(hojicha, "yuhang").emotionalMatch).toBe(45);
  });
  it("scores Haiming's salted caramel hojicha as the dedicated tea", () => {
    const base = { ...newTea(), teaId: "hojicha" as const, leaves: 3, water: 70, temperature: 95, seconds: 60 };
    const plain = scoreTea(base, "haiming");
    const caramel = scoreTea({ ...base, garnish: "caramel" }, "haiming");
    expect(plain.emotionalMatch).toBe(75);
    expect(caramel.emotionalMatch).toBe(100);
    expect(caramel.quality).toBeGreaterThan(plain.quality);
    expect(caramel.garnish).toBe("caramel");
  });
  it("weights two selected teas by their actual spoon counts", () => {
    const base = { ...newTea(), teaId: "osmanthus" as const, blendTeaId: "puer" as const, leaves: 2, blendLeaves: 1, leafOrder: ["osmanthus", "osmanthus", "puer"] as ("osmanthus" | "puer")[], water: 70, temperature: 92, seconds: 50 };
    const mostlyOsmanthus = scoreTea(base);
    const mostlyPuer = scoreTea({ ...base, leaves: 1, blendLeaves: 2, leafOrder: ["osmanthus", "puer", "puer"] });
    expect(mostlyOsmanthus.emotionalMatch).toBe(92);
    expect(mostlyPuer.emotionalMatch).toBe(83);
    expect(mostlyOsmanthus.teaId).toBe("osmanthus");
    expect(mostlyPuer.teaId).toBe("puer");
    expect(mostlyOsmanthus.quality).toBeGreaterThan(mostlyPuer.quality);
    expect(mostlyOsmanthus.blendLeaves).toBe(1);
    const onlySecond = scoreTea({ ...base, leaves: 0, blendLeaves: 3, leafOrder: ["puer", "puer", "puer"] });
    expect(onlySecond).toMatchObject({ teaId: "puer", primaryTeaId: "puer", blendTeaId: null, blendLeaves: 0, primaryLeaves: 3, emotionalMatch: 75 });
    expect(() => teaSchema.parse({ ...base, blendLeaves: 4 })).toThrow();
    expect(() => teaSchema.parse({ ...base, blendTeaId: "osmanthus" })).toThrow();
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
