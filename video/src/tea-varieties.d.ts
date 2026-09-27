export interface BrewFilmTea {
  name: string;
  glaze: string;
  liquor: string;
  leaf: "pellet" | "pearl" | "chunk" | "strip" | "crumple" | "flower" | "roasted";
  goldenTips?: boolean;
  leafColors: string[];
  mix?: { kind: string; share: number; second?: { kind: string; share: number } };
  wet: { kind: "leaf" | "mint" | "flower"; color: string };
  dish: string;
  aroma: { kind: string; color: string; glint?: string };
  accent: string;
}
export declare const brewFilmTeas: Record<
  "osmanthus" | "puer" | "mint" | "jasmine" | "black" | "chamomile" | "lavender" | "hojicha",
  BrewFilmTea
>;
export declare const brewFilm: {
  fps: number;
  frames: number;
  shots: { id: string; label: string; from: number; to: number }[];
};
export type BrewFilmGarnish = "apple" | "caramel" | "lemon" | "honey";
export declare const brewFilmGarnishes: Record<
  BrewFilmGarnish,
  { name: string; teas: ("osmanthus" | "puer" | "mint" | "jasmine" | "black" | "chamomile" | "lavender" | "hojicha")[] }
>;
