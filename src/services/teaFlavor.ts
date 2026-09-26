import { teas } from "../data/catalog";
import {
  aromaWords,
  bitterSensitivity,
  flavorAxes,
  flavorLabels,
  ingredients,
  teaFlavors,
  type FlavorAxis,
  type FlavorProfile,
} from "../data/teaFlavor";
import type { IngredientUnit, TeaDraft, TeaId } from "../types/game";

export type BrewInput = Pick<
  TeaDraft,
  "teaId" | "leaves" | "water" | "temperature" | "seconds" | "garnish"
> &
  Partial<Pick<TeaDraft, "blendTeaId" | "blendLeaves" | "blackTea" | "ingredients" | "overBoil">>;

export interface BrewAnalysis {
  profile: FlavorProfile;
  /** 0–10 astringency from heat, over-extraction or steeped lemon peel. */
  bitterness: number;
  /** 1 is the recipe strength; below .6 reads thin, above 1.25 strong. */
  extraction: number;
  thin: boolean;
  strong: boolean;
  /** Steep progress in recipe lengths, sped up by hotter water. */
  progress: number;
  /** Water boiled too long loses its lift (水老). */
  stale: boolean;
  /** More than three ingredient units start to hide the tea. */
  masked: boolean;
  idealTemperature: number;
  idealSeconds: number;
  /** Teas actually in the pot, the larger share first. */
  teas: TeaId[];
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
const round = (value: number) => Math.round(value * 10) / 10;
export const roundToFive = (value: number) => Math.round(value / 5) * 5;

// Each note has its own clock. Top notes bloom first and fade when stewed;
// sweetness settles; body and roast keep building. All read 1 on recipe time.
export const noteCurves = {
  top: (t: number) => (t <= 1 ? (1 - Math.exp(-3 * t)) / (1 - Math.exp(-3)) : Math.max(0.55, 1 - 0.28 * (t - 1))),
  sweet: (t: number) => (t <= 1 ? (1 - Math.exp(-2 * t)) / (1 - Math.exp(-2)) : 1),
  deep: (t: number) => (1 - Math.exp(-1.2 * t)) / (1 - Math.exp(-1.2)),
};

export function brewShares(draft: Pick<BrewInput, "teaId" | "leaves" | "blendTeaId" | "blendLeaves">) {
  const blendTeaId =
    draft.blendTeaId && draft.blendTeaId !== draft.teaId && (draft.blendLeaves ?? 0) > 0
      ? draft.blendTeaId
      : null;
  const blendLeaves = blendTeaId ? (draft.blendLeaves ?? 0) : 0;
  const total = draft.leaves + blendLeaves;
  const blendRatio = total > 0 ? blendLeaves / total : 0;
  const shares: [TeaId, number][] = [];
  if (draft.leaves > 0) shares.push([draft.teaId, 1 - blendRatio]);
  if (blendTeaId) shares.push([blendTeaId, blendRatio]);
  shares.sort((a, b) => b[1] - a[1]);
  const primary = teas[draft.teaId];
  const secondary = blendTeaId ? teas[blendTeaId] : null;
  return {
    shares,
    total,
    idealTemperature:
      primary.temperature * (1 - blendRatio) + (secondary?.temperature ?? 0) * blendRatio,
    idealSeconds: primary.seconds * (1 - blendRatio) + (secondary?.seconds ?? 0) * blendRatio,
  };
}

/** Hotter water runs the steep clock faster; cooler water slows it. */
export function heatFactor(temperature: number, idealTemperature: number) {
  return clamp(1 + (temperature - idealTemperature) / 40, 0.4, 1.6);
}

/** The tea house lists ingredients by unit; a story cup has one garnish in the pot. */
export function ingredientUnits(draft: Pick<BrewInput, "garnish" | "ingredients">): IngredientUnit[] {
  if (draft.ingredients?.length) return draft.ingredients;
  return draft.garnish && draft.garnish !== "none" ? [{ id: draft.garnish, where: "pot", at: 0 }] : [];
}

function weighted(shares: [TeaId, number][], pick: (id: TeaId) => number) {
  return shares.reduce((sum, [id, share]) => sum + pick(id) * share, 0);
}

/**
 * Tasting model. Steep progress runs on the recipe clock, faster in hotter
 * water; leaves and a fuller pot set the strength. Ingredients release by
 * how long they have steeped, or join the cup at a fixed share. This is a
 * game rule, not a laboratory extraction model.
 * `projected` previews the composition as if brewed on recipe.
 */
export function analyzeBrew(draft: BrewInput, projected = false): BrewAnalysis {
  const { shares, total, idealTemperature, idealSeconds } = brewShares(draft);
  const water = projected ? 70 : draft.water;
  const temperature = projected ? roundToFive(idealTemperature) : draft.temperature;
  const seconds = projected ? idealSeconds : draft.seconds;
  const overBoil = projected ? 0 : (draft.overBoil ?? 0);
  const blackTea = draft.blackTea ?? 0;
  const heat = heatFactor(temperature, idealTemperature);
  const brewing = total > 0 && water > 0 && idealSeconds > 0;
  const progress = brewing ? (heat * Math.max(0, seconds)) / idealSeconds : 0;
  const strength = brewing ? (total / 3) * Math.sqrt(70 / Math.max(10, water + blackTea)) : 0;
  const extraction = strength * noteCurves.deep(progress);
  const staleness = overBoil > 10 ? Math.min(0.3, (overBoil - 10) / 60) : 0;
  const units = ingredientUnits(draft);
  const mask = units.length > 3 ? Math.min(0.4, 0.1 * (units.length - 3)) : 0;
  const scale: Record<FlavorAxis, number> = {
    floral: 0,
    fresh: 0,
    sweet: strength ** 0.8 * noteCurves.sweet(progress),
    roast: extraction,
    body: extraction,
  };
  scale.floral = scale.fresh =
    strength ** 0.7 * noteCurves.top(progress) * (temperature < idealTemperature - 10 ? 0.85 : 1) * (1 - staleness);
  const profile = Object.fromEntries(
    flavorAxes.map((axis) => [axis, weighted(shares, (id) => teaFlavors[id][axis]) * scale[axis] * (1 - mask)]),
  ) as FlavorProfile;
  if (blackTea > 0 && water > 0) {
    const share = Math.min(0.55, blackTea / Math.max(30, water + blackTea));
    for (const axis of flavorAxes)
      profile[axis] = profile[axis] * (1 - share) + teaFlavors.black[axis] * share;
  }
  let peel = 0,
    soften = 1;
  const counts = new Map<string, number>();
  for (const unit of units) counts.set(unit.id, (counts.get(unit.id) ?? 0) + 1);
  for (const unit of units) {
    const spec = ingredients[unit.id];
    // A second or third unit adds less than the first.
    const diminish = counts.get(unit.id)! ** 0.8 / counts.get(unit.id)!;
    let share: number;
    if (unit.where === "cup") {
      share = spec.cup;
      for (const [axis, value] of Object.entries(spec.cupBonus ?? {}))
        profile[axis as FlavorAxis] += value * diminish;
    } else {
      const steeped = projected ? 1 : water > 0 ? (heat * Math.max(0, seconds - unit.at)) / idealSeconds : 0;
      share = 1 - Math.exp(-spec.release * steeped);
      if (spec.fade) share *= Math.max(0.5, 1 - spec.fade * Math.max(0, steeped - 1));
      if (spec.peel) peel += spec.peel * Math.max(0, steeped - 0.8);
      if (unit.id === "milk") {
        share *= 0.75;
        profile.fresh -= 0.6 * share;
      }
    }
    for (const [axis, value] of Object.entries(spec.flavor))
      profile[axis as FlavorAxis] += value * share * diminish;
    if (spec.soften) soften *= spec.soften;
  }
  const sensitivity = shares.length ? weighted(shares, (id) => bitterSensitivity[id]) : 0;
  const bitterness = clamp(
    ((brewing
      ? sensitivity *
        (Math.max(0, extraction - 1.12) * 7 + Math.max(0, temperature - idealTemperature - 3) * 0.3)
      : 0) +
      peel) *
      soften,
    0,
    10,
  );
  profile.sweet -= bitterness * 0.35;
  for (const axis of flavorAxes) profile[axis] = round(clamp(profile[axis], 0, 10));
  return {
    profile,
    bitterness: round(bitterness),
    extraction: Math.round(extraction * 100) / 100,
    thin: extraction > 0 && extraction < 0.6,
    strong: extraction > 1.25,
    progress: Math.round(progress * 100) / 100,
    stale: staleness > 0,
    masked: mask > 0,
    idealTemperature: Math.round(idealTemperature),
    idealSeconds: Math.round(idealSeconds),
    teas: shares.map(([id]) => id),
  };
}

const strongest = (profile: FlavorProfile, skip: FlavorAxis[] = []) =>
  flavorAxes
    .filter((axis) => !skip.includes(axis))
    .reduce((best, axis) => (profile[axis] > profile[best] ? axis : best), flavorAxes.find((axis) => !skip.includes(axis))!);

/** Three short lines: nose, palate and finish. */
export function tastingNotes(analysis: BrewAnalysis, draft: Pick<BrewInput, "garnish" | "ingredients"> = { garnish: "none" }) {
  const { profile, teas: inPot } = analysis;
  if (!inPot.length || analysis.extraction === 0)
    return {
      aroma: inPot.length ? "熱水剛碰到茶葉，香氣還沒醒。" : "壺裡還沒有茶葉。",
      palate: "等茶湯慢慢上色。",
      finish: "",
    };
  const nose = inPot.map((id) => aromaWords[id]).join("與");
  const added = [...new Set(ingredientUnits(draft).map((unit) => ingredients[unit.id].name))];
  const extra = added.length ? `，混著${added.join("、")}` : "";
  const lead = strongest(profile);
  const second = strongest(profile, [lead]);
  const texture = analysis.thin
    ? "入口偏淡，像還在等什麼"
    : analysis.strong
      ? "入口濃重"
      : profile.body >= 6.5
        ? "入口厚實溫潤"
        : profile.body <= 3
          ? "入口輕盈"
          : "入口圓潤";
  const finish = analysis.masked
    ? "配料太多，茶自己的味道被蓋過了。"
    : analysis.bitterness >= 4
      ? "尾韻發澀，泡得太久或水太燙。"
      : analysis.bitterness >= 1.5
        ? "尾韻帶一點澀。"
        : analysis.stale
          ? "水煮得太久，茶湯少了一點鮮活。"
          : profile.sweet >= 6.5
            ? "尾韻回甘，留下一點甜。"
            : profile.fresh >= 6.5
              ? "尾韻清涼，像夜風吹過。"
              : profile.roast >= 6.5
                ? "尾韻有溫暖的焙火香。"
                : "尾韻乾淨，安安靜靜。";
  return {
    aroma: `${analysis.thin ? "淡淡的" : ""}${nose}${extra}。`,
    palate: `${texture}，${flavorLabels[lead]}最明顯，其次是${flavorLabels[second]}。`,
    finish,
  };
}
