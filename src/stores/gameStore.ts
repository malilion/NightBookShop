import { defineStore } from "pinia";
import { computed, ref, toRaw } from "vue";
import { StoryBridge } from "../story/storyBridge";
import {
  newTea,
  newLetter,
  snapshotSchema,
  STORY_VERSION,
  type StoryVersion,
  type GameSnapshot,
  type StoryFrame,
  type SaveGame,
  type TeaDraft,
  type LetterDraft,
} from "../types/game";
import { database, type CollectionEntry } from "../db/database";
import { saves } from "../db/saveRepository";
import { scoreTea } from "../services/teaScoring";
import { scoreLetter } from "../services/letterScoring";
export const useGameStore = defineStore("game", () => {
  const frame = ref<StoryFrame | null>(null);
  const tea = ref(newTea());
  const letter = ref(newLetter());
  const saveList = ref<SaveGame[]>([]);
  const collection = ref<CollectionEntry[]>([]);
  const busy = ref(false);
  const saving = ref(false);
  const error = ref("");
  const notice = ref("");
  let bridge: StoryBridge | null = null;
  const compiled = new Map<StoryVersion, string>();
  const activeStoryVersion = ref<StoryVersion>(STORY_VERSION);
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
  async function start() {
    if (busy.value) return false;
    busy.value = true;
    try {
      await queue;
      bridge = new StoryBridge(await storyJson());
      activeStoryVersion.value = STORY_VERSION;
      tea.value = newTea();
      letter.value = newLetter();
      frame.value = bridge.next();
      await persist();
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
      notice.value = "已回到留下的那一頁。";
      error.value = "";
      return true;
    } catch {
      error.value = "這份存檔無法讀取，或與目前故事版本不相容。原檔已保留。";
      return false;
    } finally {
      busy.value = false;
    }
  }
  function advance(choice?: number) {
    if (!bridge || busy.value || frame.value?.mode !== "dialogue") return;
    if (choice === undefined && !frame.value.canContinue) return;
    frame.value = choice === undefined ? bridge.next() : bridge.choose(choice);
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
  function finishTea() {
    if (!bridge || frame.value?.mode !== "tea" || tea.value.step !== "serve")
      return;
    frame.value = bridge.finishTea(scoreTea(tea.value));
    void persist();
  }
  function finishLetter() {
    if (!bridge || frame.value?.mode !== "letter") return;
    frame.value = bridge.finishLetter({
      ...scoreLetter(letter.value),
      alternate: letter.value.alternate,
    });
    void persist();
  }
  return {
    activeStoryVersion,
    frame,
    tea,
    letter,
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
    updateTea,
    updateLetter,
    finishTea,
    finishLetter,
    persist,
  };
});
