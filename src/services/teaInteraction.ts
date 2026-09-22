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
export function tableLayout(compact: boolean) {
  const width = compact ? 600 : 1000,
    height = compact ? 940 : 710;
  return {
    width,
    height,
    shelfBottom: compact ? 350 : 210,
    jar: { x: compact ? 95 : 135, y: compact ? 460 : 370 },
    spoon: { x: compact ? 110 : 200, y: compact ? 710 : 580 },
    kettle: { x: compact ? 100 : 180, y: compact ? 610 : 510 },
    pot: { x: compact ? 330 : 545, y: compact ? 590 : 465 },
    cup: { x: compact ? 470 : 815, y: compact ? 790 : 555 },
    lid: { x: compact ? 475 : 720, y: compact ? 470 : 360 },
    hourglass: { x: compact ? 310 : 540, y: compact ? 820 : 610 },
    jarSlot(i: number) {
      return {
        x: compact ? 80 + (i % 4) * 145 : 75 + i * 120,
        y: compact ? 100 + Math.floor(i / 4) * 140 : 105,
      };
    },
  };
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
): Partial<TeaDraft> {
  const amount = clamp((tilt - 15) / 45, 0, 1) * 28 * clamp(dt, 0, 0.1);
  if (amount <= 0) return {};
  if (kind === "kettle") {
    const accepted = aligned ? Math.min(100 - draft.water, amount) : 0;
    return {
      water: draft.water + accepted,
      spilled: Math.min(200, draft.spilled + amount - accepted),
    };
  }
  const available = Math.max(0, draft.water - draft.cupWater - draft.teaLost);
  const pouring = Math.min(amount, available);
  const accepted = aligned ? Math.min(100 - draft.cupWater, pouring) : 0;
  return {
    cupWater: draft.cupWater + accepted,
    teaLost: Math.min(100, draft.teaLost + pouring - accepted),
    spilled: Math.min(200, draft.spilled + pouring - accepted),
  };
}
