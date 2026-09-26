import props3d from "../data/teaPropAssets.json" with { type: "json" };
import type { TeaDraft } from "../types/game";
export interface Point {
  x: number;
  y: number;
}
export const distance = (a: Point, b: Point) =>
  Math.hypot(a.x - b.x, a.y - b.y);
export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
/**
 * Table positions. On a boiling table the kettle sits on its stove, so the
 * spoon moves to a clear spot.
 */
export function tableLayout(compact: boolean, boiling = false) {
  const width = compact ? 600 : 1000,
    height = compact ? 940 : 710;
  return {
    width,
    height,
    shelfBottom: compact ? 390 : 210,
    jar: { x: compact ? 95 : 135, y: compact ? 460 : 370 },
    blendJar: { x: compact ? 270 : 340, y: compact ? 460 : 370 },
    spoon: boiling ? { x: compact ? 130 : 330, y: compact ? 800 : 625 } : { x: compact ? 110 : 200, y: compact ? 710 : 580 },
    kettle: { x: compact ? 100 : 180, y: compact ? 610 : 510 },
    pot: { x: compact ? 330 : 545, y: compact ? 590 : 465 },
    cup: { x: compact ? 470 : 815, y: compact ? 790 : 555 },
    lid: { x: compact ? 475 : 720, y: compact ? 470 : 360 },
    hourglass: { x: compact ? 310 : 540, y: compact ? 820 : 610 },
    jarSlot(i: number) {
      return {
        x: compact ? 80 + (i % 4) * 145 : 75 + i * 120,
        y: compact ? 100 + Math.floor(i / 4) * 180 : 105,
      };
    },
  };
}
// The tea house boils its own water: °C per real second below 80°C by fire level.
export const fireRates = [0, 2.2, 4.5, 8] as const;
export const fireNames = ["熄火", "文火", "中火", "武火"] as const;
/** Water colder than this will not brew; the kettle refuses to pour it. */
export const minPourTemperature = 60;
/**
 * One step of the kettle: heating slows as it nears the boil, time at a full
 * boil is counted (water boiled too long goes flat), and it cools off the fire.
 */
export function heatTick(
  kettle: { kettleTemp: number; kettleOverBoil: number },
  fire: number,
  onStove: boolean,
  dt: number,
) {
  const temp = kettle.kettleTemp;
  if (onStove && fire > 0) {
    const slow = temp > 80 ? Math.max(0.35, 1 - (temp - 80) / 40) : 1;
    const next = Math.min(100, temp + (fireRates[fire] ?? 0) * slow * dt);
    return {
      kettleTemp: next,
      kettleOverBoil: next >= 99.5 ? Math.min(600, kettle.kettleOverBoil + dt) : kettle.kettleOverBoil,
    };
  }
  return { kettleTemp: Math.max(25, temp - 0.6 * dt), kettleOverBoil: kettle.kettleOverBoil };
}
/** Bubble stages by eye: 蟹眼, 魚眼, 連珠, then a rolling boil that goes flat. */
export function boilStage(temp: number, overBoil = 0) {
  if (temp >= 99.5) return overBoil > 10 ? "水老" : "鼓浪";
  if (temp >= 94) return "連珠";
  if (temp >= 85) return "魚眼";
  if (temp >= 70) return "蟹眼";
  return "初溫";
}
/** Game seconds around the recipe time where the aroma peaks (timing ≥ 90 in the tea house). */
export function steepWindow(idealSeconds: number): [number, number] {
  return [Math.max(0, idealSeconds - 4), idealSeconds + 4];
}
/** Keep the full 15–75 degree pouring arc above the opening. */
export function pourAnchor(target: Point, kind: "kettle" | "pot"): Point {
  return { x: target.x - (kind === "kettle" ? 80 : 60), y: target.y - 145 };
}
export function spout(
  position: Point,
  tilt: number,
  kind: "kettle" | "pot",
): Point {
  const angle = (tilt * Math.PI) / 180;
  const local = props3d[kind].spout;
  return {
    x: position.x + local.x * Math.cos(angle) - local.y * Math.sin(angle),
    y: position.y + local.x * Math.sin(angle) + local.y * Math.cos(angle),
  };
}
export function catchesWater(
  tip: Point,
  target: Point,
  kind: "kettle" | "pot",
) {
  const rim = target.y - (kind === "kettle" ? 35 : 18);
  return (
    Math.abs(tip.x - target.x) < (kind === "kettle" ? 43 : 36) &&
    tip.y < rim - 6 &&
    tip.y > rim - 200
  );
}
/** Deterministic flow used by both pointer and keyboard access. dt is seconds. */
export function pourTick(
  draft: TeaDraft,
  dt: number,
  tilt: number,
  aligned: boolean,
  kind: "kettle" | "pot",
  /** Boiled kettle water mixes into the pot; without it the stove dial sets the heat. */
  kettle?: { temp: number; overBoil: number },
): Partial<TeaDraft> {
  const amount = clamp((tilt - 15) / 45, 0, 1) * 28 * clamp(dt, 0, 0.1);
  if (amount <= 0) return {};
  if (kind === "kettle") {
    const accepted = aligned ? Math.min(100 - draft.water, amount) : 0;
    const mix = (pot: number, poured: number) => (pot * draft.water + poured * accepted) / (draft.water + accepted);
    const mixed =
      kettle === undefined || accepted <= 0
        ? {}
        : { temperature: mix(draft.temperature, kettle.temp), overBoil: mix(draft.overBoil, kettle.overBoil) };
    return {
      water: draft.water + accepted,
      spilled: Math.min(200, draft.spilled + amount - accepted),
      ...mixed,
    };
  }
  const available = Math.max(0, draft.water + draft.blackTea - draft.cupWater - draft.teaLost);
  const pouring = Math.min(amount, available);
  const accepted = aligned ? Math.min(100 - draft.cupWater, pouring) : 0;
  return {
    cupWater: draft.cupWater + accepted,
    teaLost: Math.min(100, draft.teaLost + pouring - accepted),
    spilled: Math.min(200, draft.spilled + pouring - accepted),
  };
}
