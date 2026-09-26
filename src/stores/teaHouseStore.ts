import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { database } from "../db/database";
import { chapterForEnding, endings, type EndingId, type PlayableChapterId } from "../data/catalog";
import { signatureRecipes } from "../data/teaHouse";
import { newTea, type TeaDraft } from "../types/game";
import {
  newTeaHouseProgress,
  newTeaHouseSession,
  teaHouseProgressSchema,
  type TeaHouseKind,
  type TeaHouseProgress,
} from "../types/teaHouse";
import {
  buildNight,
  dateKey,
  gradeBrew,
  hashSeed,
  rankFor,
  resolveOrder,
  type BrewGrade,
} from "../services/teaHouse";
import { applyBrew, applyNightEnd, dailyStreak, nightTotals } from "../services/teaHouseProgress";

const key = "tea-house";
export interface ServedCup {
  grade: BrewGrade;
  orderId: string | null;
  newRecipe: string | null;
  rankUp: string | null;
}

export const useTeaHouseStore = defineStore("teaHouse", () => {
  const progress = ref<TeaHouseProgress>(newTeaHouseProgress());
  /** Story visitors whose night is finished; they may return as regulars. */
  const regulars = ref<PlayableChapterId[]>([]);
  const loaded = ref(false);
  const error = ref("");
  let loading: Promise<void> | null = null;
  let queue = Promise.resolve();
  // If the stored record cannot be read at all, play on without writing over it.
  let writable = true;

  const session = computed(() => progress.value.session);
  const order = computed(() => {
    const current = session.value;
    if (!current || current.kind === "free") return null;
    const id = current.orders[current.index];
    return id ? resolveOrder(id) : null;
  });
  const rank = computed(() => rankFor(progress.value.stars));
  const discovered = computed(() => new Set(Object.keys(progress.value.recipes)));
  const today = computed(() => dateKey());
  const todayRecord = computed(() => progress.value.daily[today.value] ?? null);
  const streak = computed(() => dailyStreak(progress.value.daily, today.value));
  const nightDone = computed(
    () => !!session.value && session.value.kind !== "free" && session.value.index >= session.value.orders.length,
  );

  async function loadRegulars() {
    try {
      const entries = await database.collection.toArray();
      const chapters = entries.filter((entry) => entry.id in endings).map((entry) => chapterForEnding(entry.id as EndingId));
      regulars.value = [...new Set(chapters)].filter((id) => id !== "lincheng");
    } catch {
      regulars.value = [];
    }
  }
  function init() {
    loading ??= (async () => {
      await loadRegulars();
      try {
        const row = await database.preferences.get(key);
        const parsed = row ? teaHouseProgressSchema.safeParse(row.value) : null;
        if (parsed?.success) progress.value = parsed.data;
        else if (row) {
          // Never overwrite a record we cannot read; keep a copy before starting fresh.
          await database.preferences.put({ id: `${key}-unreadable-${Date.now()}`, value: row.value });
          error.value = "茶席紀錄的格式無法辨識，已另存原資料並從新的茶單開始。";
        }
      } catch {
        writable = false;
        error.value = "茶席紀錄暫時無法讀取；這次泡的茶不會存檔，原紀錄仍保留。";
      } finally {
        loaded.value = true;
      }
    })();
    return loading;
  }
  function save() {
    if (!writable) return queue;
    const value = JSON.parse(JSON.stringify(progress.value)) as TeaHouseProgress;
    queue = queue
      .then(async () => {
        await database.preferences.put({ id: key, value });
        error.value = "";
      })
      .catch(() => {
        error.value = "茶席進度暫時無法保存；這一杯仍可繼續。";
      });
    return queue;
  }
  async function start(kind: TeaHouseKind) {
    await init();
    if (kind === "night") await loadRegulars();
    const date = kind === "daily" ? today.value : null;
    const seed = kind === "daily" ? hashSeed(`night-bookshop:${date}`) : Math.floor(Math.random() * 2 ** 31);
    const orders =
      kind === "free"
        ? []
        : buildNight(seed, {
            daily: kind === "daily",
            regulars: regulars.value,
            discovered: [...discovered.value],
          });
    progress.value = { ...progress.value, session: newTeaHouseSession(kind, seed, orders, date) };
    await save();
  }
  /** Stores a plain copy, so the table's draft and the saved one never share arrays. */
  const copy = (draft: TeaDraft) => JSON.parse(JSON.stringify(draft)) as TeaDraft;
  function saveDraft(draft: TeaDraft) {
    if (!progress.value.session) return queue;
    progress.value.session.draft = copy(draft);
    return save();
  }
  /** Grades the cup on the table and records it. */
  async function serve(draft: TeaDraft): Promise<ServedCup | null> {
    const current = progress.value.session;
    if (!current || nightDone.value || current.results.length > current.index) return null;
    const orderId = current.kind === "free" ? null : (current.orders[current.index] ?? null);
    draft = copy(draft);
    const grade = gradeBrew(draft, order.value);
    const outcome = applyBrew(progress.value, grade, current.kind === "free" ? "free" : "service");
    const next = outcome.progress;
    if (next.session && orderId)
      next.session.results.push({ orderId, score: grade.score, stars: grade.stars, recipeId: grade.recipeId });
    if (next.session) next.session.draft = draft;
    progress.value = next;
    await save();
    return { grade, orderId, newRecipe: outcome.newRecipe, rankUp: outcome.rankUp };
  }
  /** Clears the table for the next guest; closes the night after the last one. */
  async function nextGuest() {
    const current = progress.value.session;
    if (!current) return { nightBest: false, dailyBest: false };
    const next = JSON.parse(JSON.stringify(progress.value)) as TeaHouseProgress;
    const updated = next.session!;
    updated.draft = newTea();
    let records = { nightBest: false, dailyBest: false };
    if (updated.kind !== "free") {
      updated.index = Math.min(updated.orders.length, updated.index + 1);
      if (updated.index >= updated.orders.length) {
        const closed = applyNightEnd(next, updated);
        records = { nightBest: closed.nightBest, dailyBest: closed.dailyBest };
        progress.value = closed.progress;
        await save();
        return records;
      }
    }
    progress.value = next;
    await save();
    return records;
  }
  async function leave() {
    progress.value = { ...progress.value, session: null };
    await save();
  }
  /** Story cups fill the recipe book without touching stars or sessions. */
  async function recordStoryBrew(draft: TeaDraft) {
    try {
      await init();
      const outcome = applyBrew(progress.value, gradeBrew(draft, null), "story");
      progress.value = outcome.progress;
      await save();
      return outcome.newRecipe;
    } catch {
      return null;
    }
  }
  const totals = computed(() => (session.value ? nightTotals(session.value) : { stars: 0, score: 0 }));
  const recipeCount = computed(() => signatureRecipes.filter((recipe) => discovered.value.has(recipe.id)).length);
  return {
    progress,
    regulars,
    loaded,
    error,
    session,
    order,
    rank,
    discovered,
    today,
    todayRecord,
    streak,
    nightDone,
    totals,
    recipeCount,
    init,
    start,
    saveDraft,
    serve,
    nextGuest,
    leave,
    recordStoryBrew,
  };
});
