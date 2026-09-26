import type { TeaId } from "../types/game";
import type { TeaHouseProgress, TeaHouseSession } from "../types/teaHouse";
import { rankFor, type BrewGrade } from "./teaHouse";

/** A named recipe joins the book once it is brewed into a drinkable cup. */
export function canDiscover(grade: BrewGrade) {
  return (
    grade.recipeId !== null &&
    grade.analysis.extraction > 0 &&
    !grade.analysis.thin &&
    grade.balance >= 50
  );
}

export interface BrewOutcome {
  progress: TeaHouseProgress;
  newRecipe: string | null;
  newTeas: TeaId[];
  rankUp: string | null;
}
/**
 * Records one cup. Service cups earn stars; free and story cups only fill
 * the tea and recipe records.
 */
export function applyBrew(
  progress: TeaHouseProgress,
  grade: BrewGrade,
  source: "service" | "free" | "story",
  at = new Date().toISOString(),
): BrewOutcome {
  const next: TeaHouseProgress = JSON.parse(JSON.stringify(progress));
  const newTeas: TeaId[] = [];
  for (const id of grade.analysis.teas) {
    const record = next.teas[id];
    if (!record) newTeas.push(id);
    next.teas[id] = {
      brewed: (record?.brewed ?? 0) + 1,
      best: Math.max(record?.best ?? 0, grade.brewScore),
    };
  }
  let newRecipe: string | null = null;
  if (canDiscover(grade)) {
    const id = grade.recipeId!;
    const record = next.recipes[id];
    if (!record) newRecipe = id;
    next.recipes[id] = { at: record?.at ?? at, best: Math.max(record?.best ?? 0, grade.brewScore) };
  }
  if (source !== "story") next.served += 1;
  if (source === "service") {
    next.stars += grade.stars;
    if (grade.stars === 3) next.perfect += 1;
  }
  const before = rankFor(progress.stars),
    after = rankFor(next.stars);
  return { progress: next, newRecipe, newTeas, rankUp: after.level > before.level ? after.title : null };
}

export function nightTotals(session: Pick<TeaHouseSession, "results">) {
  return {
    stars: session.results.reduce((sum, result) => sum + result.stars, 0),
    score: session.results.reduce((sum, result) => sum + result.score, 0),
  };
}

/** Closes a finished night; returns which personal records it set. */
export function applyNightEnd(progress: TeaHouseProgress, session: TeaHouseSession) {
  const next: TeaHouseProgress = JSON.parse(JSON.stringify(progress));
  const { stars, score } = nightTotals(session);
  next.nights += 1;
  const nightBest = stars > next.bestNight;
  next.bestNight = Math.max(next.bestNight, stars);
  let dailyBest = false;
  if (session.kind === "daily" && session.date) {
    const previous = next.daily[session.date];
    if (!previous || stars > previous.stars || (stars === previous.stars && score > previous.score)) {
      next.daily[session.date] = { stars, score };
      dailyBest = true;
    }
    const keep = Object.keys(next.daily).sort().slice(-60);
    next.daily = Object.fromEntries(keep.map((key) => [key, next.daily[key]!]));
  }
  return { progress: next, nightBest, dailyBest };
}

/** Consecutive days with a finished daily ticket, ending today or yesterday. */
export function dailyStreak(daily: TeaHouseProgress["daily"], today: string) {
  const day = new Date(`${today}T12:00:00`);
  const key = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  if (!daily[key(day)]) day.setDate(day.getDate() - 1);
  let streak = 0;
  while (daily[key(day)]) {
    streak++;
    day.setDate(day.getDate() - 1);
  }
  return streak;
}
