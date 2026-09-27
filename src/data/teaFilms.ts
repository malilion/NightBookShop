import type { TeaDraft, TeaId } from "../types/game";

// Per-frame liquor masks for a film, packed into one WebP atlas. x/y/width/
// height are video pixels; sx/sy locate the cell in the atlas, stored at
// 1/scale resolution. Frames without visible tea are null.
export interface LiquorFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  sx: number;
  sy: number;
}
export interface LiquorFrames {
  fps: number;
  width: number;
  height: number;
  scale: number;
  atlas: { file: string; width: number; height: number };
  frames: (LiquorFrame | null)[];
}

// The four shots of every brew film, in frames at 30 fps. Mirrors
// video/src/tea-varieties.js; a unit test keeps the two in step.
export const brewFilmShots = [
  { id: "scoop", label: "取茶", from: 0, to: 75 },
  { id: "infuse", label: "注水", from: 75, to: 141 },
  { id: "pour", label: "倒茶", from: 141, to: 216 },
  { id: "serve", label: "奉茶", from: 216, to: 300 },
] as const;

export type TeaGarnish = TeaDraft["garnish"];
// Garnishes with their own film, and the teas the story offers them with.
// Mirrors video/src/tea-varieties.js; a unit test keeps the two in step.
export const brewFilmGarnishes: Record<Exclude<TeaGarnish, "none">, readonly TeaId[]> = {
  apple: ["hojicha"],
  caramel: ["hojicha"],
  lemon: ["mint"],
  honey: ["chamomile"],
};

/**
 * A cup's brew film under /video/tea/; add .mp4, .webm, -poster.webp or
 * -still.webp. A garnish the tea has a film for picks that film; any other
 * garnish plays the tea's own.
 */
export const brewFilmAsset = (tea: TeaId, garnish: TeaGarnish = "none") =>
  garnish !== "none" && brewFilmGarnishes[garnish].includes(tea) ? `brew-${tea}-${garnish}-v1` : `brew-${tea}-v1`;
export const brewFilmPath = (tea: TeaId, garnish: TeaGarnish = "none") =>
  `/video/tea/${brewFilmAsset(tea, garnish)}`;

// Every tea's film shares one mask: the pour and serve shots are identical.
let brewLiquor: Promise<LiquorFrames | null> | null = null;
export function loadBrewLiquor() {
  brewLiquor ??= fetch("/video/tea/brew-liquor-v1.json")
    .then((response) => (response.ok ? (response.json() as Promise<LiquorFrames>) : null))
    .catch(() => null)
    .then((frames) => {
      // A failed load (offline, first visit) is retried next time.
      if (!frames) brewLiquor = null;
      return frames;
    });
  return brewLiquor;
}
