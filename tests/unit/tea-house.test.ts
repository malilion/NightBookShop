import { describe, expect, it } from "vitest";
import { teas } from "../../src/data/catalog";
import { flavorAxes, ingredients, teaFlavors } from "../../src/data/teaFlavor";
import { guestOrders, regularOrders, signatureRecipes, type GuestOrder } from "../../src/data/teaHouse";
import { analyzeBrew, brewShares, roundToFive, tastingNotes } from "../../src/services/teaFlavor";
import {
  balanceScore,
  boilScore,
  brewCompletion,
  brewWindow,
  buildNight,
  dateKey,
  fillScore,
  gradeBrew,
  hashSeed,
  leavesScore,
  pourScore,
  rankFor,
  recipeFor,
  resolveOrder,
  shareText,
  starsFor,
  steepScore,
  wishScore,
} from "../../src/services/teaHouse";
import { boilStage, heatTick, minPourTemperature, pourTick, steepWindow } from "../../src/services/teaInteraction";
import { applyBrew, applyNightEnd, canDiscover, dailyStreak } from "../../src/services/teaHouseProgress";
import { newTea, teaSchema, type IngredientUnit, type TeaDraft, type TeaId } from "../../src/types/game";
import { newTeaHouseProgress, newTeaHouseSession, teaHouseProgressSchema } from "../../src/types/teaHouse";

const teaIds = Object.keys(teas) as TeaId[];
const order = (id: string) => resolveOrder(id)!;
/** A cup brewed exactly on recipe: three spoons, 70% water, recipe heat and time. */
function brew(patch: Partial<TeaDraft> = {}): TeaDraft {
  const draft = { ...newTea(), teaId: "osmanthus" as TeaId, leaves: 3, ...patch };
  const { idealSeconds, idealTemperature } = brewShares(draft);
  return {
    ...draft,
    water: 70,
    seconds: idealSeconds,
    temperature: roundToFive(idealTemperature),
    step: "serve",
    cupWater: 50,
    ...patch,
  };
}
/** The same cup, lifted in the middle of the guest's best window. */
function served(patch: Partial<TeaDraft>, guest: GuestOrder | null) {
  const cup = brew(patch);
  const [start, end] = brewWindow(cup, guest);
  return { ...cup, seconds: (start + end) / 2 };
}
const pot = (id: IngredientUnit["id"], at = 0): IngredientUnit => ({ id, where: "pot", at });
const cup = (id: IngredientUnit["id"]): IngredientUnit => ({ id, where: "cup", at: 0 });

describe("tea flavor model", () => {
  it("reads each tea's own profile when brewed on recipe", () => {
    for (const teaId of teaIds) {
      const analysis = analyzeBrew(brew({ teaId }));
      expect(analysis.extraction).toBeCloseTo(1, 1);
      expect(analysis.progress).toBeCloseTo(1, 1);
      expect(analysis.bitterness).toBe(0);
      for (const axis of flavorAxes) expect(analysis.profile[axis]).toBeCloseTo(teaFlavors[teaId][axis], 0);
    }
  });
  it("stays empty until leaves meet water, and previews a composition on recipe", () => {
    expect(analyzeBrew({ ...newTea(), leaves: 3 }).extraction).toBe(0);
    expect(analyzeBrew({ ...newTea(), water: 70 }).teas).toEqual([]);
    const justPoured = { ...newTea(), teaId: "hojicha" as const, leaves: 3, water: 70, temperature: 95 };
    expect(analyzeBrew(justPoured).profile.roast).toBe(0);
    expect(analyzeBrew(justPoured, true).profile.roast).toBeCloseTo(teaFlavors.hojicha.roast, 0);
  });
  it("shapes the cup over time: top notes bloom first, body and roast keep building", () => {
    const at = (seconds: number) => analyzeBrew({ ...brew({ teaId: "osmanthus" }), seconds });
    const early = at(15),
      recipe = at(45),
      late = at(100);
    expect(early.profile.floral / early.profile.body).toBeGreaterThan(recipe.profile.floral / recipe.profile.body);
    expect(late.profile.body).toBeGreaterThan(recipe.profile.body);
    expect(late.profile.floral).toBeLessThan(recipe.profile.floral);
    // Hotter water runs the same clock faster.
    expect(analyzeBrew({ ...brew({ teaId: "osmanthus" }), seconds: 30, temperature: 100 }).progress).toBeGreaterThan(
      at(30).progress,
    );
  });
  it("turns bitter when too hot or steeped too long, and thin when rushed", () => {
    const jasmine = brew({ teaId: "jasmine" });
    expect(analyzeBrew({ ...jasmine, temperature: 100 }).bitterness).toBeGreaterThan(2);
    const stewed = analyzeBrew({ ...jasmine, seconds: 120, leaves: 5 });
    expect(stewed.strong).toBe(true);
    expect(stewed.bitterness).toBeGreaterThan(4);
    expect(analyzeBrew({ ...jasmine, seconds: 5 }).thin).toBe(true);
    expect(analyzeBrew({ ...brew({ teaId: "puer" }), temperature: 100, seconds: 90 }).bitterness).toBeLessThan(
      analyzeBrew({ ...jasmine, temperature: 100, seconds: 60 }).bitterness,
    );
  });
  it("weights blends by spoons and keeps the story's single garnish", () => {
    const blend = analyzeBrew(brew({ teaId: "osmanthus", blendTeaId: "black", leaves: 2, blendLeaves: 1 }));
    expect(blend.teas).toEqual(["osmanthus", "black"]);
    expect(blend.profile.floral).toBeCloseTo((8 * 2 + 3) / 3, 0);
    const plain = analyzeBrew(brew({ teaId: "hojicha" }));
    const caramel = analyzeBrew(brew({ teaId: "hojicha", garnish: "caramel" }));
    expect(caramel.profile.sweet - plain.profile.sweet).toBeCloseTo(4, 0);
    expect(caramel.profile.roast).toBe(10);
  });
  it("releases pot ingredients as they steep and adds cup ingredients at once", () => {
    const base = brew({ teaId: "black" });
    const sweet = (patch: Partial<TeaDraft>) => analyzeBrew({ ...base, ...patch }).profile.sweet;
    // Apple needs time in the pot; stirred into the cup it barely shows.
    expect(sweet({ ingredients: [pot("apple")], seconds: 45 })).toBeGreaterThan(sweet({ ingredients: [pot("apple", 40)], seconds: 45 }));
    expect(sweet({ ingredients: [pot("apple")] })).toBeGreaterThan(sweet({ ingredients: [cup("apple")] }));
    // Honey keeps its floral lift only in the cup.
    const floral = (units: IngredientUnit[]) => analyzeBrew({ ...base, ingredients: units }).profile.floral;
    expect(floral([cup("honey")])).toBeGreaterThan(floral([pot("honey")]));
    // Lemon peel turns bitter when steeped long; in the cup it stays bright.
    const long = { ...base, seconds: 80 };
    expect(analyzeBrew({ ...long, ingredients: [pot("lemon")] }).bitterness).toBeGreaterThan(
      analyzeBrew({ ...long, ingredients: [cup("lemon")] }).bitterness + 1,
    );
    // Milk softens astringency; rose fades when stewed.
    const harsh = { ...base, temperature: 100, seconds: 90 };
    expect(analyzeBrew({ ...harsh, ingredients: [cup("milk")] }).bitterness).toBeLessThan(analyzeBrew(harsh).bitterness);
    const rose = (seconds: number) => analyzeBrew({ ...brew({ teaId: "puer" }), seconds, ingredients: [pot("rose")] }).profile.floral;
    expect(rose(60)).toBeGreaterThan(rose(118));
    // Too much hides the tea.
    const crowded = analyzeBrew({ ...base, ingredients: [cup("honey"), cup("honey"), cup("milk"), cup("milk"), pot("cinnamon")] });
    expect(crowded.masked).toBe(true);
    expect(() => teaSchema.parse({ ...base, ingredients: [cup("honey"), cup("honey"), cup("honey"), cup("honey")] })).toThrow();
  });
  it("goes flat when the water boils too long", () => {
    const fresh = analyzeBrew(brew({ teaId: "jasmine" }));
    const flat = analyzeBrew({ ...brew({ teaId: "jasmine" }), overBoil: 50 });
    expect(flat.stale).toBe(true);
    expect(flat.profile.floral).toBeLessThan(fresh.profile.floral);
  });
  it("writes tasting notes from the cup", () => {
    const notes = tastingNotes(analyzeBrew(brew({ teaId: "osmanthus" })));
    expect(notes.aroma).toContain("桂花");
    expect(notes.palate).toContain("花香");
    const withMilk = brew({ teaId: "black", ingredients: [cup("milk")] });
    expect(tastingNotes(analyzeBrew(withMilk), withMilk).aroma).toContain("牛奶");
    const bitter = tastingNotes(analyzeBrew({ ...brew({ teaId: "jasmine" }), temperature: 100, seconds: 110 }));
    expect(bitter.finish).toContain("澀");
  });
});

describe("stove and kettle", () => {
  it("heats faster on a stronger fire, slows near the boil and counts a long boil", () => {
    const step = (fire: number, seconds: number, onStove = true) => {
      let kettle = { kettleTemp: 45, kettleOverBoil: 0 };
      for (let t = 0; t < seconds; t += 0.1) kettle = heatTick(kettle, fire, onStove, 0.1);
      return kettle;
    };
    expect(step(3, 4).kettleTemp).toBeGreaterThan(step(2, 4).kettleTemp);
    expect(step(2, 4).kettleTemp).toBeGreaterThan(step(1, 4).kettleTemp);
    expect(step(0, 4).kettleTemp).toBeLessThan(45);
    expect(step(3, 4, false).kettleTemp).toBeLessThan(45);
    const boiled = step(3, 30);
    expect(boiled.kettleTemp).toBe(100);
    expect(boiled.kettleOverBoil).toBeGreaterThan(10);
    expect(boilStage(boiled.kettleTemp, boiled.kettleOverBoil)).toBe("水老");
    expect([boilStage(50), boilStage(75), boilStage(90), boilStage(96), boilStage(100)]).toEqual(["初溫", "蟹眼", "魚眼", "連珠", "鼓浪"]);
  });
  it("mixes kettle water into the pot at its own temperature and age", () => {
    const first = pourTick({ ...newTea(), water: 0 }, 0.1, 60, true, "kettle", { temp: 88, overBoil: 0 });
    expect(first.temperature).toBe(88);
    const topped = pourTick({ ...newTea(), water: 50, temperature: 90 }, 0.1, 60, true, "kettle", { temp: 70, overBoil: 30 });
    expect(topped.temperature).toBeLessThan(90);
    expect(topped.temperature).toBeGreaterThan(88);
    expect(topped.overBoil).toBeGreaterThan(0);
    expect(topped.overBoil).toBeLessThan(30);
    expect(pourTick({ ...newTea(), water: 50, temperature: 90 }, 0.1, 60, true, "kettle").temperature).toBeUndefined();
    expect(minPourTemperature).toBe(60);
  });
});

describe("tea house grading", () => {
  it("rewards the right composition brewed with care", () => {
    const perfect = gradeBrew(served({ teaId: "black" }, order("guest:nurse")), order("guest:nurse"));
    expect(perfect.stars).toBe(3);
    expect(perfect.score).toBeGreaterThanOrEqual(95);
    expect(perfect.steps).toMatchObject({ recipe: 100, leaves: 100, boil: 100, fill: 100, steep: 100, pour: 100 });
    const wrong = gradeBrew(served({ teaId: "mint" }, order("guest:nurse")), order("guest:nurse"));
    expect(wrong.stars).toBeLessThanOrEqual(1);
    expect(wrong.tip).toContain("甘甜");
  });
  it("scores each brewing step", () => {
    expect([0, 1, 2, 3, 4, 5].map(leavesScore)).toEqual([0, 35, 70, 100, 70, 35]);
    expect(boilScore(90, 90)).toBe(100);
    expect(boilScore(80, 90)).toBe(50);
    expect(boilScore(90, 90, 30)).toBe(60);
    expect(fillScore({ water: 72, spilled: 0, teaLost: 0 })).toBe(100);
    expect(fillScore({ water: 70, spilled: 10, teaLost: 0 })).toBe(75);
    expect(steepScore(45, [41, 49])).toBe(100);
    expect(steepScore(55, [41, 49])).toBe(70);
    expect(pourScore({ teaLost: 5 })).toBe(80);
    expect(balanceScore(analyzeBrew(brew()), 5)).toBe(84);
    expect(steepWindow(45)).toEqual([41, 49]);
  });
  it("lets sloppy brewing cost stars even with the right tea", () => {
    const guest = order("guest:barista");
    const good = served({ teaId: "hojicha" }, guest);
    const sloppy = gradeBrew({ ...good, temperature: 80, water: 92, spilled: 20, overBoil: 40 }, guest);
    expect(sloppy.stars).toBeLessThan(3);
    expect(sloppy.steps.boil).toBeLessThan(60);
    expect(sloppy.steps.fill).toBeLessThan(60);
    // Cooler, fuller pots steep slower, so the best moment moves later.
    expect(sloppy.window[0]).toBeGreaterThan(brewWindow(good, guest)[0]);
    expect(gradeBrew({ ...good, seconds: 120 }, guest).steps.steep).toBeLessThan(60);
  });
  it("moves the best moment with the guest and the water", () => {
    const recipe = brewWindow(brew({ teaId: "chamomile" }), null);
    expect(recipe).toEqual([56, 64]);
    const hotter = brewWindow(brew({ teaId: "chamomile", temperature: 100 }), null);
    expect(hotter[1]).toBeLessThan(recipe[1]);
    // A child who wants it sweet but light is best served early.
    const light = brewWindow(brew({ teaId: "chamomile", ingredients: [cup("honey")] }), order("guest:child"));
    expect(light[1]).toBeLessThan(recipe[0]);
    // Hojicha reaches the rider's full body only with a longer steep.
    const full = brewWindow(brew({ teaId: "hojicha" }), order("guest:rider"));
    expect(full[0]).toBeGreaterThan(64);
    const early = gradeBrew({ ...brew({ teaId: "chamomile", ingredients: [cup("honey")] }), seconds: (light[0] + light[1]) / 2 }, order("guest:child"));
    expect(early.stars).toBe(3);
    const onRecipe = gradeBrew(brew({ teaId: "chamomile", ingredients: [cup("honey")] }), order("guest:child"));
    expect(onRecipe.stars).toBeLessThan(3);
    expect(onRecipe.tip).toContain("時機");
  });
  it("checks special requests and names recipes by their ingredients", () => {
    const perfumer = order("guest:perfumer");
    expect(gradeBrew(served({ teaId: "osmanthus" }, perfumer), perfumer).requirementMet).toBe(false);
    expect(gradeBrew(served({ teaId: "osmanthus" }, perfumer), perfumer).tip).toContain("兩種茶");
    expect(gradeBrew(served({ teaId: "osmanthus", blendTeaId: "jasmine", leaves: 2, blendLeaves: 1 }, perfumer), perfumer).stars).toBe(3);
    const driver = order("guest:driver");
    expect(gradeBrew(served({ teaId: "black" }, driver), driver).requirementMet).toBe(false);
    expect(gradeBrew(served({ teaId: "black", ingredients: [cup("milk")] }, driver), driver).stars).toBe(3);
    const connoisseur = order("guest:connoisseur");
    expect(gradeBrew(served({ teaId: "osmanthus" }, connoisseur), connoisseur).stars).toBe(3);
    const flat = gradeBrew({ ...served({ teaId: "osmanthus" }, connoisseur), overBoil: 40 }, connoisseur);
    expect(flat.requirementMet).toBe(false);
    expect(flat.tip).toContain("水溫");
    expect(recipeFor(brew({ teaId: "black", blendTeaId: "osmanthus", leaves: 1, blendLeaves: 2 }))?.id).toBe("golden-osmanthus");
    expect(recipeFor(brew({ teaId: "hojicha", garnish: "caramel" }))?.id).toBe("lighthouse-caramel");
    expect(recipeFor(brew({ teaId: "hojicha", ingredients: [cup("caramel"), cup("caramel")] }))?.id).toBe("lighthouse-caramel");
    expect(recipeFor(brew({ teaId: "hojicha" }))).toBeNull();
    expect(recipeFor(brew({ teaId: "lavender", ingredients: [cup("milk"), cup("honey")] }))?.id).toBe("night-fog");
    expect(recipeFor(brew({ teaId: "lavender", ingredients: [cup("milk")] }))).toBeNull();
    const named = order("named:hearth-apple");
    expect(named.require).toEqual({ kind: "recipe", recipeId: "hearth-apple" });
    expect(gradeBrew(served({ teaId: "hojicha", ingredients: [pot("apple")] }, named), named).stars).toBe(3);
    expect(gradeBrew(served({ teaId: "hojicha" }, named), named).requirementMet).toBe(false);
  });
  it("grades free brewing on the steps alone, and an empty cup as nothing", () => {
    const free = gradeBrew(brew({ teaId: "chamomile" }), null);
    expect(free.flavor).toBeNull();
    expect(free.steps.recipe).toBeNull();
    expect(free.score).toBe(100);
    expect(gradeBrew({ ...newTea(), step: "serve" }, null).score).toBe(0);
    expect([starsFor(89), starsFor(90), starsFor(75), starsFor(55), starsFor(54)]).toEqual([2, 3, 2, 1, 0]);
    expect(wishScore(6, "mid")).toBe(100);
    expect(wishScore(6.2, "mid")).toBe(100);
    expect(wishScore(7, "mid")).toBe(74);
  });
  it("keeps score and stars in step when a wish is missed", () => {
    const vendor = order("guest:vendor");
    const plain = gradeBrew(served({ teaId: "hojicha" }, vendor), vendor);
    expect(plain.wishes.find((wish) => wish.axis === "sweet")!.score).toBeLessThan(100);
    expect(plain.stars).toBeLessThan(3);
    expect(plain.score).toBeLessThan(90);
  });
  it("gives every guest a three-star cup, and regulars their favorite", () => {
    const solutions: Record<string, Partial<TeaDraft>> = {
      nurse: { teaId: "black" },
      student: { teaId: "mint" },
      birthday: { teaId: "chamomile", ingredients: [cup("honey")] },
      librarian: { teaId: "osmanthus", blendTeaId: "jasmine", leaves: 2, blendLeaves: 1 },
      guard: { teaId: "puer" },
      traveler: { teaId: "osmanthus" },
      writer: { teaId: "lavender" },
      teacher: { teaId: "chamomile" },
      barista: { teaId: "hojicha" },
      heartbroken: { teaId: "puer" },
      runner: { teaId: "mint", ingredients: [pot("honey")] },
      engineer: { teaId: "lavender" },
      rider: { teaId: "hojicha", blendTeaId: "puer", leaves: 2, blendLeaves: 1 },
      vendor: { teaId: "hojicha", ingredients: [pot("caramel")] },
      perfumer: { teaId: "osmanthus", blendTeaId: "jasmine", leaves: 2, blendLeaves: 1 },
      voyager: { teaId: "osmanthus", blendTeaId: "black", leaves: 2, blendLeaves: 1 },
      "cat-boy": { teaId: "chamomile" },
      driver: { teaId: "black", ingredients: [cup("milk")] },
      child: { teaId: "chamomile", ingredients: [cup("honey")] },
      connoisseur: { teaId: "osmanthus" },
      singer: { teaId: "black", ingredients: [pot("ginger"), cup("honey")] },
    };
    for (const guest of guestOrders) {
      const solution = solutions[guest.id];
      expect(solution, guest.id).toBeTruthy();
      expect(gradeBrew(served(solution!, guest), guest).stars, guest.id).toBe(3);
    }
    for (const regular of regularOrders) {
      const favorite = signatureRecipes.find((recipe) => recipe.id === regular.favorite);
      const patch: Partial<TeaDraft> = favorite
        ? {
            teaId: favorite.teas[0],
            blendTeaId: favorite.teas[1] ?? null,
            leaves: favorite.teas[1] ? 2 : 3,
            blendLeaves: favorite.teas[1] ? 1 : 0,
            ingredients: favorite.ingredients.map((id) => ({ id, where: ingredients[id].best, at: 0 })),
          }
        : { teaId: regular.favorite as TeaId };
      const grade = gradeBrew(served(patch, regular), regular);
      expect(grade.favoriteHit, regular.id).toBe(true);
      expect(grade.stars, regular.id).toBe(3);
    }
  });
  it("grows 完成度 step by step to the served score", () => {
    const guest = order("guest:barista");
    const done = served({ teaId: "hojicha" }, guest);
    const stages: TeaDraft[] = [
      { ...newTea() },
      { ...newTea(), teaId: "hojicha", step: "water", leaves: 3, jarOpen: true, kettleTemp: 80 },
      { ...done, step: "water", seconds: 0, cupWater: 0 },
      { ...done, step: "steep", seconds: 20, cupWater: 0 },
      { ...done, step: "serving", cupWater: 10 },
      { ...done, step: "serve" },
    ];
    const reports = stages.map((draft) => brewCompletion(draft, guest));
    const percents = reports.map((report) => report.percent);
    expect(percents[0]).toBe(0);
    for (let i = 1; i < percents.length; i++) expect(percents[i]!).toBeGreaterThanOrEqual(percents[i - 1]!);
    expect(reports[0]!.steps.find((step) => step.key === "boil")!.state).toBe("pending");
    expect(reports[1]!.steps.find((step) => step.key === "boil")).toMatchObject({ state: "live", note: "壺中 80°C／95°C" });
    expect(reports[3]!.steps.find((step) => step.key === "steep")!.note).toContain("還差");
    expect(reports.at(-1)!.steps.every((step) => step.state === "done")).toBe(true);
    expect(reports.at(-1)!.percent).toBe(gradeBrew(done, guest).score);
  });
});

describe("tea house nights", () => {
  it("builds the same rising night from the same seed", () => {
    const seed = hashSeed("night-bookshop:2026-09-26");
    const night = buildNight(seed, { daily: true });
    expect(buildNight(seed, { daily: true })).toEqual(night);
    expect(new Set(night).size).toBe(5);
    expect(night.map((id) => order(id).tier)).toEqual([1, 1, 2, 2, 3]);
    expect(night.every((id) => id.startsWith("guest:"))).toBe(true);
    expect(buildNight(hashSeed("night-bookshop:2026-09-27"), { daily: true })).not.toEqual(night);
  });
  it("brings story regulars and named orders only to ordinary nights", () => {
    const options = { regulars: ["jinglan", "yenuan"] as const, discovered: ["golden-osmanthus"] };
    const nights = Array.from({ length: 40 }, (_, seed) => buildNight(seed + 1, options));
    const ids = nights.flat();
    expect(ids.some((id) => id === "regular:jinglan" || id === "regular:yenuan")).toBe(true);
    expect(ids).toContain("named:golden-osmanthus");
    expect(ids.some((id) => id === "regular:haiming")).toBe(false);
    expect(Array.from({ length: 40 }, (_, seed) => buildNight(seed + 1, { ...options, daily: true })).flat().some((id) => !id.startsWith("guest:"))).toBe(false);
    for (const id of ids) expect(resolveOrder(id), id).not.toBeNull();
    expect(resolveOrder("guest:nobody")).toBeNull();
    expect(resolveOrder("named:nothing")).toBeNull();
  });
  it("formats dates locally and a shareable ticket", () => {
    expect(dateKey(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
    expect(
      shareText({ daily: "2026-09-26", results: [{ stars: 3 }, { stars: 2 }, { stars: 0 }, { stars: 3 }, { stars: 1 }], rank: "夜班茶師" }),
    ).toBe("夜行書店・午夜茶席\n今日茶單 2026-09-26\n★★★ ★★☆ ☆☆☆ ★★★ ★☆☆\n9／15 顆星 · 夜班茶師");
    expect(rankFor(0).title).toBe("見習茶童");
    expect(rankFor(12)).toMatchObject({ title: "夜班茶師", level: 1 });
    expect(rankFor(500).next).toBeNull();
  });
});

describe("tea house progress", () => {
  it("earns stars only in service and writes drinkable recipes into the book", () => {
    const start = { ...newTeaHouseProgress(), stars: 10 };
    const vendor = order("guest:vendor");
    const cup = gradeBrew(served({ teaId: "hojicha", garnish: "caramel" }, vendor), vendor);
    const first = applyBrew(start, cup, "service", "2026-09-26T00:00:00.000Z");
    expect(first.progress).toMatchObject({ stars: 13, served: 1, perfect: 1 });
    expect(first.newRecipe).toBe("lighthouse-caramel");
    expect(first.newTeas).toEqual(["hojicha"]);
    expect(first.rankUp).toBe("夜班茶師");
    expect(start.stars).toBe(10);
    const again = applyBrew(first.progress, cup, "service");
    expect(again.newRecipe).toBeNull();
    expect(again.progress.teas.hojicha!.brewed).toBe(2);
    const story = applyBrew(start, cup, "story");
    expect(story.progress).toMatchObject({ stars: 10, served: 0 });
    expect(story.newRecipe).toBe("lighthouse-caramel");
    const thin = gradeBrew({ ...brew({ teaId: "hojicha", garnish: "apple" }), seconds: 4 }, null);
    expect(canDiscover(thin)).toBe(false);
    expect(applyBrew(start, thin, "free").newRecipe).toBeNull();
  });
  it("keeps the best daily ticket, prunes old days and counts streaks", () => {
    const session = {
      ...newTeaHouseSession("daily", 1, ["guest:nurse"], "2026-09-26"),
      results: [{ orderId: "guest:nurse", score: 90, stars: 3, recipeId: null }],
    };
    const first = applyNightEnd(newTeaHouseProgress(), session);
    expect(first).toMatchObject({ nightBest: true, dailyBest: true });
    expect(first.progress.daily["2026-09-26"]).toEqual({ stars: 3, score: 90 });
    const worse = applyNightEnd(first.progress, { ...session, results: [{ ...session.results[0]!, stars: 1, score: 60 }] });
    expect(worse.dailyBest).toBe(false);
    expect(worse.progress.daily["2026-09-26"]!.stars).toBe(3);
    expect(worse.progress.nights).toBe(2);
    const daily = { "2026-09-24": { stars: 9, score: 1 }, "2026-09-25": { stars: 9, score: 1 }, "2026-09-26": { stars: 9, score: 1 } };
    expect(dailyStreak(daily, "2026-09-26")).toBe(3);
    expect(dailyStreak(daily, "2026-09-27")).toBe(3);
    expect(dailyStreak(daily, "2026-09-28")).toBe(0);
  });
  it("validates stored progress and restores new defaults", () => {
    expect(teaHouseProgressSchema.parse({ version: 1 })).toEqual(newTeaHouseProgress());
    expect(teaHouseProgressSchema.safeParse({ version: 2 }).success).toBe(false);
    const saved = JSON.parse(JSON.stringify({ ...newTeaHouseProgress(), session: newTeaHouseSession("night", 7, ["guest:nurse"], null) }));
    expect(teaHouseProgressSchema.parse(saved).session?.draft).toEqual(newTea());
  });
});
