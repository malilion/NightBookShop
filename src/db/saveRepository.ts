import { database, type BookshopDatabase } from "./database";
import {
  saveSchema,
  snapshotSchema,
  type GameSnapshot,
  type SaveGame,
} from "../types/game";
import { chapterForEnding } from "../data/catalog";
import { CLUE_JOURNAL_ID, mergeClues, parseJournal } from "../services/clueJournal";
export class SaveRepository {
  constructor(private db: BookshopDatabase = database) {}
  async list() {
    return (
      await this.db.saves.orderBy("updatedAt").reverse().toArray()
    ).flatMap((row) => {
      const result = saveSchema.safeParse(row);
      return result.success ? [result.data] : [];
    });
  }
  async get(id: string) {
    const row = await this.db.saves.get(id);
    return row ? saveSchema.parse(row) : undefined;
  }
  async write(
    snapshot: GameSnapshot,
    kind: SaveGame["kind"] = "auto",
    manualSlot = 1,
  ) {
    const clean = snapshotSchema.parse(snapshot);
    if (
      kind === "manual" &&
      (!Number.isInteger(manualSlot) || manualSlot < 1 || manualSlot > 10)
    )
      throw new Error("手動存檔格必須在 1 至 10 之間。");
    await this.db.transaction(
      "rw",
      this.db.saves,
      this.db.collection,
      this.db.preferences,
      async () => {
        const existingJournal = parseJournal((await this.db.preferences.get(CLUE_JOURNAL_ID))?.value);
        const journal = mergeClues(existingJournal, clean.frame.clues);
        await this.db.preferences.put({ id: CLUE_JOURNAL_ID, value: journal });
        const autos = (
          await this.db.saves.where("kind").equals("auto").toArray()
        ).sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
        const empty = [1, 2, 3].find(
          (n) => !autos.some((s) => s.id === `auto-${n}`),
        );
        const id =
          kind === "auto"
            ? empty
              ? `auto-${empty}`
              : autos[0]!.id
            : kind === "manual"
              ? `manual-${manualSlot}`
              : `chapter-${chapterForEnding(clean.frame.endingId || "moonlight")}`;
        const latest = (await this.db.saves.orderBy("updatedAt").last())
          ?.updatedAt;
        const now = new Date(
          Math.max(Date.now(), latest ? Date.parse(latest) + 1 : 0),
        ).toISOString();
        const createdAt = (await this.db.saves.get(id))?.createdAt;
        // 覆寫同一格時保留第一次寫下的時間；輪替到最舊的自動存檔則視為新的一份。
        await this.db.saves.put({
          id,
          kind,
          createdAt: kind === "manual" && createdAt ? createdAt : now,
          updatedAt: now,
          snapshot: clean,
        });
        const ending = clean.frame.endingId;
        if (ending) {
          const chapterId = chapterForEnding(ending);
          const existing = await this.db.collection.get(ending);
          const golden = clean.frame.resonanceFragment === chapterId;
          if (!existing)
            await this.db.collection.put({ id: ending, unlockedAt: now, golden });
          else if (golden && !existing.golden)
            await this.db.collection.update(ending, { golden: true });
          if (!(await this.db.saves.get(`chapter-${chapterId}`)))
            await this.db.saves.put({
              id: `chapter-${chapterId}`,
              kind: "chapter",
              createdAt: now,
              updatedAt: now,
              snapshot: clean,
            });
        }
      },
    );
  }
  // 只有玩家自己建立的手動存檔可以刪；自動存檔會自行輪替，章節快照承載跨夜結局。
  async remove(id: string) {
    const row = await this.db.saves.get(id);
    if (row?.kind !== "manual") throw new Error("只能刪除手動存檔。");
    await this.db.saves.delete(id);
  }
  // 安裝新版前，把最近一份可繼續的存檔另存為相容性快照。
  async backupLatest() {
    const latest = (await this.list()).find(
      (save) => save.kind === "auto" || save.kind === "manual",
    );
    if (!latest) return;
    await this.db.saves.put({
      ...latest,
      id: BACKUP_ID,
      kind: "backup",
      createdAt: new Date().toISOString(),
    });
  }
}
export const BACKUP_ID = "backup-before-update";
export const saves = new SaveRepository();
