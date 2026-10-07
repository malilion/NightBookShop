import { defineStore } from "pinia";
import { computed, ref, toRaw } from "vue";
import { StoryBridge, readInkString, visitorQuestionVariables, type PriorChapterEndings } from "../story/storyBridge";
import {
  newTea,
  newLetter,
  newMelody,
  newHearth,
  newRoute,
  newLamp,
  newArchive,
  newNotifications,
  newOpening,
  snapshotSchema,
  STORY_VERSION,
  type StoryVersion,
  type GameSnapshot,
  type StoryFrame,
  type SaveGame,
  type TeaDraft,
  type LetterDraft,
  type MelodyDraft,
  type HearthDraft,
  type RouteDraft,
  type LampDraft,
  type ArchiveDraft,
  type NotificationsDraft,
  type OpeningTask,
  type ResonanceChapterId,
} from "../types/game";
import { database, type CollectionEntry } from "../db/database";
import { SAVE_VERSION } from "../types/saveMigrations";
import { CLUE_JOURNAL_ID, parseJournal } from "../services/clueJournal";
import { newlyUnlocked, SEEN_ACHIEVEMENTS_ID, unlockedAchievements } from "../services/achievements";
import { saves } from "../db/saveRepository";
import { scoreTea } from "../services/teaScoring";
import { scoreLetter } from "../services/letterScoring";
import { scoreHearth } from "../services/hearthScoring";
import { scoreRoute } from "../services/routeScoring";
import { scoreLamp } from "../services/lampScoring";
import { scoreArchive } from "../services/archiveScoring";
import { cacheChapterImages } from "../services/chapterAssetPack";
import {
  chapterForVersion,
  chapterForEnding,
  previousChapter,
  type PlayableChapterId,
} from "../data/catalog";
export const useGameStore = defineStore("game", () => {
  const frame = ref<StoryFrame | null>(null);
  const tea = ref(newTea());
  const letter = ref(newLetter());
  const melody = ref(newMelody());
  const hearth = ref(newHearth());
  const route = ref(newRoute());
  const lamp = ref(newLamp());
  const archive = ref(newArchive());
  const notifications = ref(newNotifications());
  const opening = ref(newOpening());
  const saveList = ref<SaveGame[]>([]);
  const collection = ref<CollectionEntry[]>([]);
  const busy = ref(false);
  const saving = ref(false);
  const error = ref("");
  const notice = ref("");
  let bridge: StoryBridge | null = null;
  const compiled = new Map<StoryVersion, string>();
  const activeStoryVersion = ref<StoryVersion>(STORY_VERSION);
  const chapterId = computed(() => chapterForVersion(activeStoryVersion.value));
  const completedChapters = computed(
    () =>
      new Set(
        collection.value.map((entry) =>
          chapterForEnding(entry.id as Parameters<typeof chapterForEnding>[0]),
        ),
      ),
  );
  const previousEndingId = computed(() => {
    const previous = previousChapter[chapterId.value];
    return previous
      ? saveList.value.find((save) => save.id === `chapter-${previous}`)?.snapshot.frame.endingId || null
      : null;
  });
  let queue = Promise.resolve();
  let pendingSaves = 0;
  const latest = computed(() =>
    saveList.value.find((s) => s.kind === "auto" || s.kind === "manual"),
  );
  // 遊玩時間：在每次存檔時累加距上次記錄的時間；分頁隱藏期間不算，
  // 單段最長只算五分鐘，避免離開電腦的時間被計入。
  const playTimeSeconds = ref(0);
  let playClock = 0;
  const MAX_PLAY_GAP = 5 * 60 * 1000;
  function tickPlayTime() {
    const now = Date.now();
    const visible = typeof document === "undefined" || document.visibilityState !== "hidden";
    if (playClock && visible)
      playTimeSeconds.value += Math.round(Math.min(now - playClock, MAX_PLAY_GAP) / 1000);
    playClock = visible ? now : 0;
  }
  if (typeof document !== "undefined")
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") tickPlayTime();
      else playClock = Date.now();
    });
  async function storyJson(version: StoryVersion = STORY_VERSION) {
    if (!compiled.has(version)) {
      const response = await fetch(
        `/story/compiled/${version === STORY_VERSION ? "main" : version}.json`,
      );
      if (!response.ok)
        throw new Error("故事暫時無法載入，請重新整理再試一次。");
      compiled.set(version, await response.text());
    }
    return compiled.get(version)!;
  }
  // 新點亮的徽章，由 App 以不攔截操作的提示顯示幾秒。
  const achievementToast = ref<{ id: string; title: string; text: string }[]>([]);
  async function checkAchievements(silent = false) {
    const journal = parseJournal((await database.preferences.get(CLUE_JOURNAL_ID))?.value);
    const unlocked = unlockedAchievements(collection.value, journal);
    const row = await database.preferences.get(SEEN_ACHIEVEMENTS_ID);
    const seen = Array.isArray(row?.value) ? (row.value as string[]) : null;
    // 第一次啟用徽章提示時，已點亮的徽章直接記為看過，不一次跳出一串。
    const fresh = seen && !silent ? newlyUnlocked(unlocked, seen) : [];
    if (!seen || fresh.length || silent)
      await database.preferences.put({ id: SEEN_ACHIEVEMENTS_ID, value: [...unlocked] });
    if (fresh.length) achievementToast.value = [...achievementToast.value, ...fresh];
  }
  async function refreshSaves() {
    const before = collection.value.length;
    saveList.value = await saves.list();
    collection.value = await database.collection.toArray();
    if (collection.value.length !== before) await checkAchievements().catch(() => undefined);
  }
  async function init() {
    try {
      await refreshSaves();
      await checkAchievements(!(await database.preferences.get(SEEN_ACHIEVEMENTS_ID))).catch(() => undefined);
    } catch {
      error.value = "無法讀取本機存檔。資料仍保留，請確認瀏覽器允許本機儲存。";
    }
  }
  function snapshot(): GameSnapshot {
    if (!bridge || !frame.value) throw new Error("尚未開始故事。");
    tickPlayTime();
    return snapshotSchema.parse({
      version: SAVE_VERSION,
      playTimeSeconds: playTimeSeconds.value,
      storyVersion: activeStoryVersion.value,
      inkState: bridge.serialize(),
      frame: toRaw(frame.value),
      tea: toRaw(tea.value),
      letter: toRaw(letter.value),
      melody: toRaw(melody.value),
      hearth: toRaw(hearth.value),
      route: toRaw(route.value),
      lamp: toRaw(lamp.value),
      archive: toRaw(archive.value),
      notifications: toRaw(notifications.value),
      opening: toRaw(opening.value),
    });
  }
  function persist(kind: "auto" | "manual" = "auto", slot = 1) {
    const data = snapshot();
    pendingSaves++;
    saving.value = true;
    queue = queue
      .then(async () => {
        try {
          await saves.write(data, kind, slot);
          await refreshSaves();
          error.value = "";
          notice.value = kind === "manual" ? `已存入第 ${slot} 格。` : "";
        } catch {
          error.value =
            "存檔未成功。請確認儲存空間與瀏覽器權限；目前仍可繼續遊玩。";
        }
      })
      .finally(() => {
        pendingSaves--;
        saving.value = pendingSaves > 0;
      });
    return queue;
  }
  async function start(chapter: PlayableChapterId = "jinglan") {
    if (busy.value) return false;
    busy.value = true;
    try {
      await queue;
      const prerequisite = previousChapter[chapter];
      if (prerequisite && !completedChapters.value.has(prerequisite))
        throw new Error("請先完成前一夜，再翻開這一章。");
      const version: StoryVersion =
        chapter === "jinglan" ? STORY_VERSION : chapter === "boyan" ? "boyan-chapter-23" : chapter === "ruoyin" ? "ruoyin-chapter-22" : chapter === "yenuan" ? "yenuan-chapter-20" : chapter === "yuhang" ? "yuhang-chapter-22" : chapter === "haiming" ? "haiming-chapter-26" : "lincheng-chapter-20";
      const previousEnding = prerequisite
        ? saveList.value.find((save) => save.id === `chapter-${prerequisite}`)?.snapshot.frame.endingId || ""
        : "";
      const priorEndings: PriorChapterEndings = {};
      const visitors = ["jinglan", "boyan", "ruoyin", "yenuan", "yuhang"] as const;
      // 每一章都收到更早各夜的首次結局；Ink 宣告了 ending_<訪客> 才會讀到。
      const earlierCount = chapter === "lincheng" || chapter === "haiming" ? visitors.length : (visitors as readonly string[]).indexOf(chapter);
      for (const visitor of visitors.slice(0, earlierCount)) {
        const ending = saveList.value.find((save) => save.id === `chapter-${visitor}`)?.snapshot.frame.endingId;
        if (ending && chapterForEnding(ending) === visitor) priorEndings[visitor] = ending;
      }
      // 終章讀各夜章節存檔裡林澄對訪客反問的回答。
      const carriedAnswers: Record<string, string> = {};
      if (chapter === "lincheng")
        for (const [visitor, variable] of Object.entries(visitorQuestionVariables)) {
          const inkState = saveList.value.find((save) => save.id === `chapter-${visitor}`)?.snapshot.inkState;
          const answer = inkState ? readInkString(inkState, variable) : "";
          if (answer) carriedAnswers[variable] = answer;
          // 那一夜林澄替訪客泡的茶，終章翻書籤時會想起（終章宣告 tea_<訪客>）。
          const tea = inkState ? readInkString(inkState, "tea_type") : "";
          if (tea) carriedAnswers[`tea_${visitor}`] = tea;
        }
      bridge = new StoryBridge(await storyJson(version), previousEnding, priorEndings, carriedAnswers);
      activeStoryVersion.value = version;
      tea.value = newTea();
      melody.value = newMelody();
      hearth.value = newHearth();
      route.value = newRoute();
      lamp.value = newLamp();
      archive.value = newArchive();
      notifications.value = newNotifications();
      opening.value = newOpening();
      letter.value =
        chapter === "boyan" || chapter === "yuhang" || chapter === "haiming" || chapter === "lincheng"
          ? {
              ...newLetter(),
              slots: [null, null, null, null],
              angles: [0, 0, 0, 0],
              flipped: [false, false, false, false],
            }
          : newLetter();
      frame.value = bridge.next();
      playTimeSeconds.value = 0;
      playClock = Date.now();
      await persist();
      void cacheChapterImages(chapter);
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "故事載入失敗。";
      return false;
    } finally {
      busy.value = false;
    }
  }
  async function load(id?: string) {
    if (busy.value) return false;
    busy.value = true;
    try {
      await queue;
      const save = id ? await saves.get(id) : latest.value;
      if (!save) throw new Error("目前沒有可以繼續的存檔。");
      const data = snapshotSchema.parse(save.snapshot);
      const restored = new StoryBridge(await storyJson(data.storyVersion));
      restored.restore(data.inkState, data.frame);
      bridge = restored;
      activeStoryVersion.value = data.storyVersion;
      frame.value = structuredClone(data.frame);
      tea.value = structuredClone(data.tea);
      letter.value = structuredClone(data.letter);
      melody.value = structuredClone(data.melody);
      hearth.value = structuredClone(data.hearth);
      route.value = structuredClone(data.route);
      lamp.value = structuredClone(data.lamp);
      archive.value = structuredClone(data.archive);
      notifications.value = structuredClone(data.notifications);
      opening.value = structuredClone(data.opening);
      playTimeSeconds.value = data.playTimeSeconds;
      playClock = Date.now();
      notice.value = "已回到留下的那一頁。";
      error.value = "";
      void cacheChapterImages(chapterForVersion(data.storyVersion));
      return true;
    } catch {
      error.value = "這份存檔無法讀取，或與目前故事版本不相容。原檔已保留。";
      return false;
    } finally {
      busy.value = false;
    }
  }
  async function removeSave(id: string) {
    await queue;
    try {
      await saves.remove(id);
      await refreshSaves();
      notice.value = "已刪除這一頁。";
    } catch {
      error.value = "這份存檔無法刪除。";
    }
  }
  // 安裝新版前：先存下目前進度，再另留一份相容性快照。
  async function backupBeforeUpdate() {
    if (frame.value) await persist();
    await queue;
    try {
      await saves.backupLatest();
      await refreshSaves();
    } catch {
      error.value = "更新前的備份未成功；為了保護進度，這次先不更新。";
    }
  }
  function advance(choice?: number) {
    if (!bridge || busy.value || !opening.value.complete || frame.value?.mode !== "dialogue") return;
    if (choice === undefined && !frame.value.canContinue) return;
    frame.value = choice === undefined ? bridge.next() : bridge.choose(choice);
    void persist();
  }
  function inspectOpening(task: OpeningTask) {
    if (!bridge || opening.value.complete || opening.value.inspected.includes(task)) return;
    opening.value = { ...opening.value, inspected: [...opening.value.inspected, task] };
    void persist();
  }
  function finishOpening() {
    if (!bridge || opening.value.complete || opening.value.inspected.length !== 3) return;
    opening.value = { ...opening.value, complete: true };
    void persist();
  }
  function updateTea(patch: Partial<TeaDraft>) {
    tea.value = { ...tea.value, ...patch };
    void persist();
  }
  function updateLetter(patch: Partial<LetterDraft>) {
    letter.value = { ...letter.value, ...patch };
    void persist();
  }
  function updateMelody(patch: Partial<MelodyDraft>) {
    melody.value = { ...melody.value, ...patch };
    void persist();
  }
  function updateHearth(patch: Partial<HearthDraft>) {
    hearth.value = { ...hearth.value, ...patch };
    void persist();
  }
  function updateRoute(patch: Partial<RouteDraft>) {
    route.value = { ...route.value, ...patch };
    void persist();
  }
  function updateLamp(patch: Partial<LampDraft>) {
    lamp.value = { ...lamp.value, ...patch };
    void persist();
  }
  function updateArchive(patch: Partial<ArchiveDraft>) {
    archive.value = { ...archive.value, ...patch };
    void persist();
  }
  function updateNotifications(patch: Partial<NotificationsDraft>) {
    notifications.value = { ...notifications.value, ...patch };
    void persist();
  }
  function finishTea() {
    if (!bridge || frame.value?.mode !== "tea" || tea.value.step !== "serve")
      return;
    frame.value = bridge.finishTea(
      scoreTea(tea.value, chapterId.value),
      chapterId.value === "lincheng" ? null : chapterId.value as ResonanceChapterId,
    );
    void persist();
  }
  function finishLetter() {
    if (!bridge || frame.value?.mode !== "letter") return;
    frame.value = bridge.finishLetter({
      ...scoreLetter(letter.value, chapterId.value),
      alternate: letter.value.alternate,
      stamp: letter.value.stamp,
    });
    void persist();
  }
  function finishMelody(correct: boolean) {
    if (!bridge || frame.value?.mode !== "melody") return;
    frame.value = bridge.finishMelody(correct);
    void persist();
  }
  function finishHearth() {
    if (!bridge || frame.value?.mode !== "hearth" || hearth.value.responses.length !== 3)
      return;
    frame.value = bridge.finishHearth(scoreHearth(hearth.value));
    void persist();
  }
  function finishRoute() {
    if (!bridge || frame.value?.mode !== "route" || route.value.stops.length !== 3) return;
    frame.value = bridge.finishRoute(scoreRoute(route.value));
    void persist();
  }
  function finishLamp() {
    if (!bridge || frame.value?.mode !== "lamp" || lamp.value.turns.length !== 3) return;
    frame.value = bridge.finishLamp(scoreLamp(lamp.value));
    void persist();
  }
  function finishArchive() {
    if (!bridge || frame.value?.mode !== "archive" || !scoreArchive(archive.value).complete) return;
    frame.value = bridge.finishArchive(scoreArchive(archive.value));
    void persist();
  }
  function finishNotifications() {
    if (!bridge || frame.value?.mode !== "notifications" || !(["manager", "teammate", "system"] as const).every((id) => notifications.value.paused.includes(id))) return;
    frame.value = bridge.finishNotifications({ allPaused: true, repliedMother: notifications.value.repliedMother });
    void persist();
  }
  return {
    activeStoryVersion,
    chapterId,
    completedChapters,
    frame,
    tea,
    letter,
    melody,
    hearth,
    route,
    lamp,
    archive,
    notifications,
    opening,
    previousEndingId,
    latest,
    saveList,
    collection,
    busy,
    saving,
    error,
    notice,
    init,
    start,
    load,
    advance,
    inspectOpening,
    finishOpening,
    updateTea,
    updateLetter,
    updateMelody,
    updateHearth,
    updateRoute,
    updateLamp,
    updateArchive,
    updateNotifications,
    finishTea,
    finishLetter,
    finishMelody,
    finishHearth,
    finishRoute,
    finishLamp,
    finishArchive,
    finishNotifications,
    persist,
    playTimeSeconds,
    achievementToast,
    checkAchievements,
    removeSave,
    backupBeforeUpdate,
  };
});
