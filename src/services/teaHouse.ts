import { teas } from "../data/catalog";
import { flavorLabels, ingredients, teaFlavors, type FlavorAxis } from "../data/teaFlavor";
import {
  guestOrders,
  nightLength,
  regularOrders,
  signatureRecipes,
  teaHouseRanks,
  type FlavorWish,
  type GuestOrder,
  type OrderRequirement,
  type SignatureRecipe,
  type WishLevel,
} from "../data/teaHouse";
import type { PlayableChapterId } from "../data/catalog";
import type { IngredientId, TeaDraft, TeaId } from "../types/game";
import {
  analyzeBrew,
  brewShares,
  heatFactor,
  ingredientUnits,
  roundToFive,
  type BrewAnalysis,
  type BrewInput,
} from "./teaFlavor";

export const wishRanges: Record<WishLevel, [number, number]> = {
  low: [0, 3],
  mid: [4, 6],
  high: [7, 10],
};
export const wishWords: Record<WishLevel, string> = { low: "淡一點", mid: "適中", high: "濃一點" };

/** A quarter point of slack keeps a cup sitting on a band edge counted as met. */
export function wishScore(value: number, level: WishLevel) {
  const [low, high] = wishRanges[level];
  const miss = Math.max(0, (value < low ? low - value : value > high ? value - high : 0) - 0.25);
  return Math.max(0, Math.round(100 - miss * 35));
}
const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

type RecipeInput = Pick<BrewInput, "teaId" | "leaves" | "garnish" | "blendTeaId" | "blendLeaves" | "ingredients">;
/** A named recipe is its set of teas and its set of ingredients, in any amounts. */
export function recipeFor(draft: RecipeInput): SignatureRecipe | null {
  const inPot = new Set<TeaId>();
  if (draft.leaves > 0) inPot.add(draft.teaId);
  if (draft.blendTeaId && draft.blendTeaId !== draft.teaId && (draft.blendLeaves ?? 0) > 0)
    inPot.add(draft.blendTeaId);
  if (!inPot.size) return null;
  const added = new Set<IngredientId>(ingredientUnits(draft).map((unit) => unit.id));
  return (
    signatureRecipes.find(
      (recipe) =>
        recipe.teas.length === inPot.size &&
        recipe.teas.every((id) => inPot.has(id)) &&
        recipe.ingredients.length === added.size &&
        recipe.ingredients.every((id) => added.has(id)),
    ) ?? null
  );
}

// 完成度: seven steps, each scored 0–100 and weighted into the cup's score.
export const stepWeights = { recipe: 45, leaves: 6, boil: 11, fill: 6, steep: 17, pour: 5, balance: 10 } as const;
export type StepKey = keyof typeof stepWeights;
export const stepKeys = Object.keys(stepWeights) as StepKey[];
export const stepLabels: Record<StepKey, string> = {
  recipe: "配方",
  leaves: "份量",
  boil: "煮水",
  fill: "注水",
  steep: "浸泡",
  pour: "倒茶",
  balance: "茶湯",
};

export function leavesScore(total: number) {
  return [0, 35, 70, 100, 70, 35][total] ?? 0;
}
/** Water on target, and not boiled until it goes flat (水老). */
export function boilScore(temperature: number, target: number, overBoil = 0) {
  const stale = overBoil > 10 ? Math.min(40, (overBoil - 10) * 2) : 0;
  return Math.round(clamp(100 - Math.abs(temperature - target) * 5 - stale, 0, 100));
}
export function fillScore(draft: Pick<TeaDraft, "water" | "spilled" | "teaLost">) {
  const miss = Math.abs(draft.water - 70);
  const kettleSpill = Math.max(0, draft.spilled - draft.teaLost);
  return Math.round(clamp((miss <= 3 ? 100 : 100 - (miss - 3) * 3) - kettleSpill * 2.5, 0, 100));
}
export function steepScore(seconds: number, window: [number, number]) {
  const miss = seconds < window[0] ? window[0] - seconds : seconds > window[1] ? seconds - window[1] : 0;
  return Math.round(clamp(100 - miss * 5, 0, 100));
}
export function pourScore(draft: Pick<TeaDraft, "teaLost">) {
  return Math.round(clamp(100 - draft.teaLost * 4, 0, 100));
}
export function balanceScore(analysis: BrewAnalysis, units: number) {
  return Math.round(
    clamp(100 - analysis.bitterness * 12 - (analysis.thin ? 30 : 0) - Math.max(0, units - 3) * 8, 0, 100),
  );
}

/**
 * The moment to lift the pot: where this cup best meets the guest's wishes
 * without turning astringent, or the recipe time adjusted for water heat.
 * The pot's water and heat are used once poured; before that, the plan.
 */
export function brewWindow(draft: TeaDraft, order: GuestOrder | null): [number, number] {
  const { idealSeconds, idealTemperature, total } = brewShares(draft);
  const temperature = draft.water > 0 ? draft.temperature : roundToFive(idealTemperature);
  const heat = heatFactor(temperature, idealTemperature);
  const tidy = (value: number) => Math.round(value * 2) / 2;
  const recipe: [number, number] = [tidy(Math.max(0, (idealSeconds - 4) / heat)), tidy((idealSeconds + 4) / heat)];
  if (!order?.wishes.length || total === 0) return recipe;
  const trial = { ...draft, water: draft.water > 0 ? draft.water : 70, temperature };
  const samples: { at: number; score: number; drinkable: boolean }[] = [];
  for (let at = 0.5; at <= 120; at += 0.5) {
    const cup = analyzeBrew({ ...trial, seconds: at });
    samples.push({
      at,
      score: average(order.wishes.map((wish) => wishScore(cup.profile[wish.axis], wish.level))),
      // Lifting before the tea has steeped is only hot water, and too late turns astringent.
      drinkable: !cup.thin && cup.bitterness < 1.5,
    });
  }
  const pool = samples.filter((sample) => sample.drinkable);
  if (!pool.length) return recipe;
  const best = Math.max(...pool.map((sample) => sample.score));
  const good = new Set(pool.filter((sample) => sample.score >= best - 0.5).map((sample) => sample.at));
  const center = (recipe[0] + recipe[1]) / 2;
  let low = [...good].reduce((a, b) => (Math.abs(b - center) < Math.abs(a - center) ? b : a));
  let high = low;
  while (good.has(low - 0.5)) low -= 0.5;
  while (good.has(high + 0.5)) high += 0.5;
  if (high - low < 4) {
    const middle = (low + high) / 2;
    [low, high] = [middle - 2, middle + 2];
  }
  return [tidy(Math.max(0, low)), tidy(Math.min(120, high))];
}

export interface WishResult extends FlavorWish {
  value: number;
  score: number;
}
export interface BrewGrade {
  score: number;
  /** Brewing alone (every step but the recipe), used for tea and recipe records. */
  brewScore: number;
  stars: 0 | 1 | 2 | 3;
  title: string;
  steps: Record<StepKey, number | null>;
  /** Null when brewing freely without a guest order. */
  flavor: number | null;
  balance: number;
  window: [number, number];
  wishes: WishResult[];
  requirementMet: boolean | null;
  recipeId: string | null;
  favoriteHit: boolean;
  tip: string;
  analysis: BrewAnalysis;
}

export const starsFor = (score: number): BrewGrade["stars"] =>
  score >= 90 ? 3 : score >= 75 ? 2 : score >= 55 ? 1 : 0;
export const gradeTitles = ["還差一點", "尚可入口", "溫潤上品", "月下神品"] as const;

function weightedScore(steps: Partial<Record<StepKey, number | null>>, keys = stepKeys) {
  let sum = 0,
    weight = 0;
  for (const key of keys) {
    const value = steps[key];
    if (value === null || value === undefined) continue;
    sum += value * stepWeights[key];
    weight += stepWeights[key];
  }
  return weight ? sum / weight : 0;
}

function requirementMet(require: OrderRequirement | undefined, draft: TeaDraft, analysis: BrewAnalysis, boil: number) {
  if (!require) return null;
  const recipe = recipeFor(draft);
  const units = ingredientUnits(draft);
  if (require.kind === "blend") return analysis.teas.length === 2;
  if (require.kind === "garnish") return units.length > 0;
  if (require.kind === "ingredient") return units.some((unit) => unit.id === require.id);
  if (require.kind === "boil") return boil >= 90;
  return require.recipeId ? recipe?.id === require.recipeId : recipe !== null;
}

function requirementTip(require: OrderRequirement, target: number) {
  if (require.kind === "blend") return "這位客人想要兩種茶一起調和。注水前把第二罐放到另一個圓墊。";
  if (require.kind === "garnish") return "試著加一樣配料。";
  if (require.kind === "ingredient") return `客人想要${ingredients[require.id].name}。從配料盤加進茶壺或茶杯。`;
  if (require.kind === "boil") return `這位客人講究水溫：看著壺中水溫，到 ${target}°C 就提壺，別讓水滾太久。`;
  const named = signatureRecipes.find((recipe) => recipe.id === require.recipeId);
  return named
    ? `客人點的是「${named.name}」，可以翻翻茶譜。`
    : "客人想要一款有名字的特調。茶譜裡的組合都算數。";
}

function suggestion(axis: FlavorAxis, raise: boolean) {
  const tea = (Object.keys(teaFlavors) as TeaId[]).reduce((best, id) =>
    raise ? (teaFlavors[id][axis] > teaFlavors[best][axis] ? id : best) : teaFlavors[id][axis] < teaFlavors[best][axis] ? id : best,
  );
  const extra = raise
    ? (Object.values(ingredients).find((item) => (item.flavor[axis] ?? 0) >= 2)?.name ?? null)
    : null;
  return `${teas[tea].name}${extra ? `或${extra}` : ""}`;
}

function tipFor(grade: Omit<BrewGrade, "tip" | "title" | "stars" | "score" | "brewScore">, draft: TeaDraft, order: GuestOrder | null) {
  const { analysis, steps, window } = grade;
  const target = roundToFive(analysis.idealTemperature);
  const units = ingredientUnits(draft);
  if (!analysis.teas.length) return "先舀幾匙茶葉，再注水。";
  if (order?.require && grade.requirementMet === false) return requirementTip(order.require, target);
  const missed = grade.wishes.filter((wish) => wish.score < 100).sort((a, b) => a.score - b.score)[0];
  if (missed) {
    // If the same pot meets every wish at another moment, the fix is timing.
    const at = (window[0] + window[1]) / 2;
    const later = analyzeBrew({ ...draft, seconds: at });
    if (order!.wishes.every((wish) => wishScore(later.profile[wish.axis], wish.level) === 100))
      return `配方沒問題，差在時機：${draft.seconds < window[0] ? "再多泡一會兒" : "早一點提壺"}，最佳約 ${Math.round(window[0])}–${Math.round(window[1])} 秒。`;
    const raise = missed.value < wishRanges[missed.level][0];
    return `客人想要${flavorLabels[missed.axis]}${raise ? "更明顯" : "收斂一些"}；${raise ? `試試${suggestion(missed.axis, true)}` : `少一點${flavorLabels[missed.axis]}重的茶，例如改用${suggestion(missed.axis, false)}調和`}。`;
  }
  if (analysis.masked) return "配料放太多，茶自己的味道被蓋過了；三份以內剛好。";
  if (analysis.bitterness >= 1.5) {
    const steepedLemon = units.some((unit) => unit.id === "lemon" && unit.where === "pot");
    if (steepedLemon) return "檸檬片在壺裡泡太久，果皮發苦；倒茶入杯後再加會更清亮。";
    return draft.temperature > analysis.idealTemperature + 3
      ? `水太燙了，茶湯發澀；這杯的水到 ${target}°C 就好。`
      : "泡得太濃，尾韻發澀；少一匙茶葉或早一點提壺。";
  }
  if (analysis.stale) return "水滾太久變老了，香氣變鈍；到溫度就提壺，或換一壺水重煮。";
  if (units.some((unit) => unit.id === "honey" && unit.where === "pot"))
    return "蜂蜜倒進杯裡再加，蜜香才留得住。";
  if (units.some((unit) => unit.id === "milk" && unit.where === "pot")) return "牛奶加進杯裡更鮮，也更圓潤。";
  if (analysis.thin) return "茶湯偏淡；多泡一會兒，或別讓水超過七分。";
  const craft = (["leaves", "boil", "fill", "steep", "pour"] as const).reduce((low, key) =>
    (steps[key] ?? 100) < (steps[low] ?? 100) ? key : low,
  );
  if ((steps[craft] ?? 100) >= 95) return "每一步都剛剛好。這就是月下的一杯。";
  if (craft === "steep")
    return draft.seconds > window[1]
      ? `晚了 ${Math.round(draft.seconds - window[1])} 秒提壺；看沙漏金色弧線亮起就提起茶壺。`
      : `早了 ${Math.round(window[0] - draft.seconds)} 秒提壺；再等沙漏走到金色弧線。`;
  if (craft === "boil")
    return draft.temperature < target
      ? `水溫只有 ${Math.round(draft.temperature)}°C；讓水再滾一會兒，到 ${target}°C 再注水。`
      : `水溫 ${Math.round(draft.temperature)}°C 偏高；轉成文火，或稍等再注水，${target}°C 最好。`;
  if (craft === "fill") return draft.water > 70 ? "水多了一點，七分滿最剛好。" : draft.water < 70 ? "水少了一點，注到七分滿。" : "提壺對準壺口再傾倒，就不會灑出來。";
  if (craft === "leaves") return "三匙茶葉最平衡。";
  return "倒茶時對準杯口慢慢傾斜，別讓茶灑出來。";
}

/** Grades a served cup for a guest order, or freely when `order` is null. */
export function gradeBrew(draft: TeaDraft, order: GuestOrder | null): BrewGrade {
  const analysis = analyzeBrew(draft);
  const units = ingredientUnits(draft).length;
  const { total } = brewShares(draft);
  const window = brewWindow(draft, order);
  const recipe = recipeFor(draft);
  const boil = boilScore(draft.temperature, roundToFive(analysis.idealTemperature), draft.overBoil);
  const wishes = (order?.wishes ?? []).map((wish) => ({
    ...wish,
    value: analysis.profile[wish.axis],
    score: wishScore(analysis.profile[wish.axis], wish.level),
  }));
  const met = requirementMet(order?.require, draft, analysis, boil);
  const flavorParts = [...wishes.map((wish) => wish.score), ...(met === null ? [] : [met ? 100 : 0])];
  const steps: Record<StepKey, number | null> = {
    recipe: order ? Math.round(flavorParts.length ? average(flavorParts) : 100) : null,
    leaves: leavesScore(total),
    boil,
    fill: fillScore(draft),
    steep: steepScore(draft.seconds, window),
    pour: pourScore(draft),
    balance: balanceScore(analysis, units),
  };
  const favoriteHit =
    !!order?.favorite &&
    (recipe?.id === order.favorite || (analysis.teas.length === 1 && analysis.teas[0] === order.favorite && units === 0));
  const brewing = analysis.teas.length > 0 && analysis.extraction > 0;
  const score = brewing ? Math.min(100, Math.round(weightedScore(steps) + (favoriteHit ? 8 : 0))) : 0;
  const brewScore = brewing ? Math.round(weightedScore(steps, stepKeys.filter((key) => key !== "recipe"))) : 0;
  const base = {
    steps,
    flavor: steps.recipe,
    balance: steps.balance!,
    window,
    wishes,
    requirementMet: met,
    recipeId: recipe?.id ?? null,
    favoriteHit,
    analysis,
  };
  // Three stars need every wish lit on the radar and any special request met;
  // the score is held below the three-star line so both tell the same story.
  const complete = wishes.every((wish) => wish.score === 100) && met !== false;
  const shown = complete ? score : Math.min(89, score);
  const stars = starsFor(shown);
  return { ...base, score: shown, brewScore, stars, title: gradeTitles[stars], tip: tipFor(base, draft, order) };
}

export type StepState = "pending" | "live" | "done";
export interface StepStatus {
  key: StepKey;
  label: string;
  weight: number;
  state: StepState;
  score: number | null;
  note: string;
}
/**
 * Live 完成度 while brewing: each step lights up as it happens, and the total
 * counts only finished steps, so it grows toward the cup's final score.
 */
export function brewCompletion(
  draft: TeaDraft,
  order: GuestOrder | null,
  options: { boiling?: boolean; window?: [number, number] } = {},
) {
  const boiling = options.boiling ?? true;
  const analysis = analyzeBrew(draft);
  const { total, idealTemperature } = brewShares(draft);
  const target = roundToFive(idealTemperature);
  const window = options.window ?? brewWindow(draft, order);
  const units = ingredientUnits(draft).length;
  const poured = draft.water > 0;
  const served = draft.step === "serve";
  const lifted = served || draft.step === "serving";
  const steeping = lifted || draft.step === "steep";
  const status = (key: StepKey, state: StepState, score: number | null, note: string): StepStatus => ({
    key,
    label: stepLabels[key],
    weight: stepWeights[key],
    state,
    score: state === "pending" ? null : score,
    note,
  });
  const steps: StepStatus[] = [];
  if (order) {
    const planned = analyzeBrew({
      ...draft,
      water: poured ? draft.water : 70,
      temperature: poured ? draft.temperature : target,
      seconds: served ? draft.seconds : (window[0] + window[1]) / 2,
    });
    const scores = order.wishes.map((wish) => wishScore(planned.profile[wish.axis], wish.level));
    const lit = scores.filter((score) => score === 100).length;
    steps.push(
      status(
        "recipe",
        total === 0 ? "pending" : served ? "done" : "live",
        Math.round(scores.length ? average(scores) : 100),
        order.wishes.length ? `${lit}／${order.wishes.length} 項口味${served ? "" : "（預估）"}` : "照客人的要求",
      ),
    );
  }
  steps.push(status("leaves", total === 0 ? "pending" : poured ? "done" : "live", leavesScore(total), `${total} 匙`));
  const kettle = boiling && !poured;
  steps.push(
    status(
      "boil",
      steeping ? "done" : draft.step === "select" ? "pending" : kettle || poured ? "live" : "pending",
      kettle ? boilScore(draft.kettleTemp, target, draft.kettleOverBoil) : boilScore(draft.temperature, target, draft.overBoil),
      `${kettle ? "壺中" : "茶壺"} ${Math.round(kettle ? draft.kettleTemp : draft.temperature)}°C／${target}°C`,
    ),
  );
  steps.push(status("fill", !poured ? "pending" : steeping ? "done" : "live", fillScore(draft), `${Math.round(draft.water)}%`));
  const early = draft.seconds < window[0];
  steps.push(
    status(
      "steep",
      !steeping ? "pending" : lifted ? "done" : "live",
      steepScore(draft.seconds, window),
      draft.step === "steep" && early
        ? `還差 ${Math.ceil(window[0] - draft.seconds)} 秒`
        : `${Math.floor(draft.seconds)} 秒／最佳 ${Math.round(window[0])}–${Math.round(window[1])}`,
    ),
  );
  steps.push(status("pour", !lifted ? "pending" : served ? "done" : "live", pourScore(draft), draft.teaLost > 0.5 ? `灑出 ${Math.round(draft.teaLost)}%` : "穩穩倒入"));
  steps.push(
    status(
      "balance",
      !steeping ? "pending" : served ? "done" : "live",
      balanceScore(analysis, units),
      analysis.masked ? "配料蓋過茶味" : analysis.bitterness >= 1.5 ? "帶澀" : analysis.thin ? "偏淡" : "平衡",
    ),
  );
  const weight = steps.reduce((sum, step) => sum + step.weight, 0);
  const done = steps.reduce((sum, step) => sum + (step.state === "done" ? step.weight * (step.score ?? 0) : 0), 0);
  return { steps, window, percent: Math.round(done / weight) };
}

// Deterministic nights: a daily ticket shared by every player, or a random one.
export function hashSeed(text: string) {
  let hash = 2166136261;
  for (const char of text) {
    hash ^= char.codePointAt(0)!;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
export function seededRandom(seed: number) {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function dateKey(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
function shuffled<T>(items: readonly T[], random: () => number) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/**
 * Five order ids rising in difficulty. Daily tickets use only the shared
 * guest list; ordinary nights may add story regulars and named orders.
 */
export function buildNight(
  seed: number,
  options: { daily?: boolean; regulars?: readonly PlayableChapterId[]; discovered?: readonly string[] } = {},
) {
  const random = seededRandom(seed);
  const byTier = (tier: number) => shuffled(guestOrders.filter((order) => order.tier === tier), random);
  const tiers = [byTier(1), byTier(2), byTier(3)];
  const ids = [1, 1, 2, 2, 3].map((tier) => `guest:${tiers[tier - 1]!.shift()!.id}`);
  if (!options.daily) {
    const regulars = regularOrders.filter((order) => order.chapter && options.regulars?.includes(order.chapter));
    if (regulars.length && random() < 0.6)
      ids[2 + Math.floor(random() * 2)] = `regular:${regulars[Math.floor(random() * regulars.length)]!.id}`;
    const known = signatureRecipes.filter((recipe) => options.discovered?.includes(recipe.id));
    if (known.length && random() < 0.5) ids[4] = `named:${known[Math.floor(random() * known.length)]!.id}`;
  }
  return ids.slice(0, nightLength);
}

export function resolveOrder(id: string): GuestOrder | null {
  const [kind, key] = id.split(":");
  if (kind === "guest") return guestOrders.find((order) => order.id === key) ?? null;
  if (kind === "regular") return regularOrders.find((order) => order.id === key) ?? null;
  if (kind === "named") {
    const recipe = signatureRecipes.find((item) => item.id === key);
    if (!recipe) return null;
    return {
      id,
      name: "指名點茶的熟客",
      seal: "譜",
      line: `聽說這裡有一款「${recipe.name}」。可以替我泡一杯嗎？`,
      wishes: [],
      require: { kind: "recipe", recipeId: recipe.id },
      favorite: recipe.id,
      tier: 3,
      reactions: [
        `就是「${recipe.name}」！比傳聞裡的還要好。`,
        `這就是「${recipe.name}」啊。謝謝，我會再來。`,
        `這杯很好，但好像不是「${recipe.name}」。`,
      ],
    };
  }
  return null;
}

export function reactionFor(order: GuestOrder, stars: BrewGrade["stars"]) {
  return order.reactions[stars === 3 ? 0 : stars > 0 ? 1 : 2];
}

export function rankFor(stars: number) {
  const index = teaHouseRanks.reduce((found, rank, i) => (stars >= rank.stars ? i : found), 0);
  const next = teaHouseRanks[index + 1] ?? null;
  return { title: teaHouseRanks[index]!.title, level: index, next };
}

export function starLine(stars: number) {
  return "★".repeat(stars) + "☆".repeat(3 - stars);
}
export function shareText(options: { daily: string | null; results: { stars: number }[]; rank: string }) {
  const total = options.results.reduce((sum, result) => sum + result.stars, 0);
  return [
    "夜行書店・午夜茶席",
    options.daily ? `今日茶單 ${options.daily}` : "夜間營業",
    options.results.map((result) => starLine(result.stars)).join(" "),
    `${total}／${options.results.length * 3} 顆星 · ${options.rank}`,
  ].join("\n");
}
