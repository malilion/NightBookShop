import { chapterForEnding, endings, playableChapters, type EndingId, type PlayableChapterId } from "../data/catalog";
import { chapterArchive, collectionAchievements, crackedEndings, type AchievementId } from "../data/collectionArchive";
import type { CollectionEntry } from "../db/database";
import type { ClueJournal } from "./clueJournal";

// 徽章完全由收藏與手記推得，不另存「已解鎖」；只記下玩家已經看過哪些，用來提示新點亮的徽章。
export const SEEN_ACHIEVEMENTS_ID = "achievements-seen";
const resonanceChapters = playableChapters.filter((id) => id !== "lincheng");

export function unlockedAchievements(
  collection: CollectionEntry[],
  journal: Pick<ClueJournal, "connections">,
): Set<AchievementId> {
  const collected = collection.filter((entry) => entry.id in endings);
  const ids = new Set(collected.map((entry) => entry.id as EndingId));
  const chapters = new Set<PlayableChapterId>([...ids].map((id) => chapterForEnding(id)));
  const goldenChapters = new Set(
    collected.filter((entry) => entry.golden).map((entry) => chapterForEnding(entry.id as EndingId)),
  );
  const rules: Record<AchievementId, boolean> = {
    first: ids.size > 0,
    seven: playableChapters.every((id) => chapters.has(id)),
    understanding: playableChapters.every((id) => ids.has(chapterArchive[id].afterword.ending)),
    all: ids.size === Object.keys(endings).length,
    crack: [...ids].some((id) => crackedEndings.has(id)),
    golden: goldenChapters.size > 0,
    "golden-all": resonanceChapters.every((id) => goldenChapters.has(id)),
    threads: journal.connections.length >= 5,
  };
  return new Set(collectionAchievements.map((item) => item.id).filter((id) => rules[id]));
}

export function newlyUnlocked(unlocked: Set<AchievementId>, seen: readonly string[]) {
  return collectionAchievements.filter((item) => unlocked.has(item.id) && !seen.includes(item.id));
}
