import { defineStore } from "pinia";
import { computed, ref, toRaw } from "vue";
import { StoryBridge } from "../story/storyBridge";
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
} from "../types/game";
import { database, type CollectionEntry } from "../db/database";
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
    saveList.value.find((s) => s.kind !== "chapter"),
  );
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
  async function refreshSaves() {
    saveList.value = await saves.list();
    collection.value = await database.collection.toArray();
  }
  async function init() {
    try {
      await refreshSaves();
    } catch {
      error.value = "無法讀取本機存檔。資料仍保留，請確認瀏覽器允許本機儲存。";
    }
  }
  function snapshot(): GameSnapshot {
    if (!bridge || !frame.value) throw new Error("尚未開始故事。");
    return snapshotSchema.parse({
      version: 1,
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
        chapter === "jinglan" ? STORY_VERSION : chapter === "boyan" ? "boyan-chapter-7" : chapter === "ruoyin" ? "ruoyin-chapter-5" : chapter === "yenuan" ? "yenuan-chapter-5" : chapter === "yuhang" || chapter === "lincheng" ? `${chapter}-chapter-6` : chapter === "haiming" ? "haiming-chapter-7" : `${chapter}-chapter-4`;
      const previousEnding = prerequisite
        ? saveList.value.find((save) => save.id === `chapter-${prerequisite}`)?.snapshot.frame.endingId || ""
        : "";
      bridge = new StoryBridge(await storyJson(version), previousEnding);
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
    frame.value = bridge.finishTea(scoreTea(tea.value, chapterId.value));
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
  };
});
