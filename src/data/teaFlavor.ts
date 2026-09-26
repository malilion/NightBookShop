import type { IngredientId, TeaDraft, TeaId } from "../types/game";

// Art-directed tasting model shared by the story table and the standalone
// tea house. Values describe a cup brewed on its own recipe (3 spoons, 70%
// water, recipe temperature and time); brewing then scales them.
export const flavorAxes = ["floral", "sweet", "roast", "fresh", "body"] as const;
export type FlavorAxis = (typeof flavorAxes)[number];
export type FlavorProfile = Record<FlavorAxis, number>;
export const flavorLabels: Record<FlavorAxis, string> = {
  floral: "花香",
  sweet: "甘甜",
  roast: "焙香",
  fresh: "清爽",
  body: "醇厚",
};
export const teaFlavors: Record<TeaId, FlavorProfile> = {
  osmanthus: { floral: 8, sweet: 5, roast: 3, fresh: 3, body: 5 },
  puer: { floral: 1, sweet: 3, roast: 6, fresh: 1, body: 9 },
  mint: { floral: 1, sweet: 1, roast: 0, fresh: 9, body: 2 },
  jasmine: { floral: 7, sweet: 3, roast: 0, fresh: 7, body: 3 },
  black: { floral: 3, sweet: 7, roast: 3, fresh: 2, body: 7 },
  chamomile: { floral: 5, sweet: 6, roast: 0, fresh: 3, body: 3 },
  lavender: { floral: 7, sweet: 3, roast: 2, fresh: 5, body: 6 },
  hojicha: { floral: 0, sweet: 3, roast: 9, fresh: 1, body: 6 },
};
/** How quickly each leaf turns astringent when too hot or over-extracted. */
export const bitterSensitivity: Record<TeaId, number> = {
  osmanthus: 1,
  puer: 0.4,
  mint: 0.9,
  jasmine: 1.6,
  black: 1.1,
  chamomile: 0.6,
  lavender: 1.1,
  hojicha: 0.5,
};
export type Garnish = Exclude<TeaDraft["garnish"], "none">;
export interface IngredientSpec {
  name: string;
  /** Counting word for one unit, e.g. 片 or 匙. */
  unit: string;
  note: string;
  color: string;
  /** One unit, fully released in the pot. */
  flavor: Partial<FlavorProfile>;
  /** How fast steeping releases it, per recipe length. */
  release: number;
  /** Share of the flavor when stirred straight into the cup. */
  cup: number;
  best: "pot" | "cup";
  /** Only in the cup: honey keeps its floral note away from boiling water. */
  cupBonus?: Partial<FlavorProfile>;
  /** Lemon peel: astringency per recipe length steeped past 0.8. */
  peel?: number;
  /** Rose: the scent fades when steeped past one recipe length. */
  fade?: number;
  /** Milk: multiplies astringency, per unit. */
  soften?: number;
}
export const ingredients: Record<IngredientId, IngredientSpec> = {
  honey: {
    name: "蜂蜜",
    unit: "匙",
    note: "甜潤柔和。倒進杯裡才留得住蜜香，滾水會把花蜜香煮散。",
    color: "#c98d3a",
    flavor: { sweet: 3, body: 1, fresh: -1 },
    release: 4,
    cup: 1,
    best: "cup",
    cupBonus: { floral: 0.8 },
  },
  lemon: {
    name: "檸檬片",
    unit: "片",
    note: "明亮的酸香。在壺裡泡久了，果皮會發苦。",
    color: "#e7cc67",
    flavor: { fresh: 3, floral: 1, sweet: -1 },
    release: 3,
    cup: 1,
    best: "cup",
    peel: 1.4,
  },
  apple: {
    name: "蘋果乾",
    unit: "片",
    note: "要和茶一起慢慢泡開，果甜才出得來。",
    color: "#b7783b",
    flavor: { sweet: 2, floral: 1, body: 0.5 },
    release: 1.4,
    cup: 0.35,
    best: "pot",
  },
  caramel: {
    name: "海鹽焦糖",
    unit: "塊",
    note: "遇熱就化，鹹甜焦香撐起厚度。",
    color: "#a46b3a",
    flavor: { sweet: 4, roast: 1.5, body: 1 },
    release: 4,
    cup: 0.85,
    best: "pot",
  },
  ginger: {
    name: "薑片",
    unit: "片",
    note: "辛暖要慢慢泡出來，越泡越暖。",
    color: "#d8b25d",
    flavor: { roast: 1, body: 1, fresh: 1, sweet: -0.3 },
    release: 1.1,
    cup: 0.4,
    best: "pot",
  },
  rose: {
    name: "玫瑰花瓣",
    unit: "朵",
    note: "花香來得快，也散得快；別泡太久。",
    color: "#c9607a",
    flavor: { floral: 2.5, sweet: 0.4 },
    release: 3,
    cup: 0.6,
    best: "pot",
    fade: 0.3,
  },
  milk: {
    name: "牛奶",
    unit: "份",
    note: "讓茶湯圓潤、蓋住苦澀；最好倒進杯裡，壺裡悶煮會失去鮮味。",
    color: "#efe6d2",
    flavor: { body: 2.2, sweet: 0.8, floral: -0.8, fresh: -1.2 },
    release: 4,
    cup: 1,
    best: "cup",
    soften: 0.65,
  },
  cinnamon: {
    name: "肉桂",
    unit: "枝",
    note: "木質甜香，和紅茶、蘋果最合。",
    color: "#8a5232",
    flavor: { roast: 1.5, sweet: 1.5, floral: -0.3 },
    release: 1.5,
    cup: 0.3,
    best: "pot",
  },
};
export const ingredientIds = Object.keys(ingredients) as IngredientId[];
/** The story's single garnish uses the same ingredient data. */
export const garnishes: Record<Garnish, IngredientSpec> = {
  honey: ingredients.honey,
  lemon: ingredients.lemon,
  apple: ingredients.apple,
  caramel: ingredients.caramel,
};
export const garnishIds = Object.keys(garnishes) as Garnish[];
export const maxIngredientUnits = 6;
export const maxUnitsPerIngredient = 3;

// Words the tasting notes pick from; each axis reads differently per tea.
export const aromaWords: Record<TeaId, string> = {
  osmanthus: "桂花的清甜",
  puer: "陳年木香",
  mint: "薄荷的涼意",
  jasmine: "茉莉的鮮香",
  black: "熟果與蜜香",
  chamomile: "洋甘菊的蘋果香",
  lavender: "佛手柑與薰衣草",
  hojicha: "穀物與炭焙香",
};
