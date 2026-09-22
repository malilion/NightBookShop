import { describe, it, expect } from "vitest";
import { newTea, teaSchema } from "../../src/types/game";
import {
  spout,
  catchesWater,
  pourTick,
  pourAnchor,
} from "../../src/services/teaInteraction";
import { scoreTea } from "../../src/services/teaScoring";
import { teas } from "../../src/data/catalog";
describe("hands-on tea rules", () => {
  it("keeps both spouts over the opening throughout the supported pouring arc", () => {
    const target = { x: 500, y: 500 };
    for (const kind of ["kettle", "pot"] as const) {
      for (const tilt of [16, 30, 45, 60, 75]) {
        expect(
          catchesWater(
            spout(pourAnchor(target, kind), tilt, kind),
            target,
            kind,
          ),
        ).toBe(true);
      }
    }
  });
  it("only catches a tilted stream above the vessel, with water and spill conserved", () => {
    const target = { x: 545, y: 465 },
      tip = spout({ x: 465, y: 320 }, 60, "kettle");
    expect(catchesWater(tip, target, "kettle")).toBe(true);
    expect(catchesWater({ x: 100, y: 300 }, target, "kettle")).toBe(false);
    expect(catchesWater({ x: 545, y: 500 }, target, "kettle")).toBe(false);
    const draft = { ...newTea(), water: 99 };
    const tick = pourTick(draft, 0.1, 60, true, "kettle");
    expect(tick.water).toBe(100);
    expect(tick.spilled).toBeCloseTo(1.8);
    const missed = pourTick(newTea(), 0.1, 60, false, "kettle");
    expect(missed.water).toBe(0);
    expect(missed.spilled).toBeCloseTo(2.8);
    expect(pourTick(draft, 0.1, 10, true, "kettle")).toEqual({});
  });
  it("cannot pour more tea than the pot contains, including previously spilled tea", () => {
    const draft = { ...newTea(), water: 20, cupWater: 18, teaLost: 1 };
    const result = pourTick(draft, 10, 75, true, "pot");
    expect(result.cupWater).toBe(19);
    expect(
      pourTick({ ...draft, cupWater: 19 }, 0.1, 75, true, "pot").cupWater,
    ).toBe(19);
  });
  it("supports eight different recipes and gives spills a bounded quality cost", () => {
    expect(Object.keys(teas)).toHaveLength(8);
    for (const [id, tea] of Object.entries(teas)) {
      const draft = teaSchema.parse({
        ...newTea(),
        teaId: id,
        leaves: 3,
        water: 70,
        seconds: tea.seconds,
        temperature: tea.temperature,
      });
      expect(scoreTea(draft).quality).toBeGreaterThanOrEqual(70);
      expect(scoreTea({ ...draft, spilled: 200 }).quality).toBe(
        scoreTea(draft).quality - 15,
      );
    }
  });
  it("loads earlier drafts with safe defaults for new interaction fields", () => {
    const old = {
      step: "water",
      teaId: "osmanthus",
      leaves: 3,
      water: 70,
      temperature: 90,
      seconds: 45,
    };
    expect(teaSchema.parse(old)).toMatchObject({
      water: 70,
      spilled: 0,
      teaLost: 0,
      cupWater: 0,
      spoonLoaded: false,
    });
  });
});
