import Dexie, { type Table } from "dexie";
import type { GameSnapshot, SaveGame } from "../types/game";
import { migrateSnapshot } from "../types/saveMigrations";
export interface CollectionEntry {
  id: string;
  unlockedAt: string;
  golden?: boolean;
}
// 資料庫裡的列可能來自舊版：createdAt 與快照版本要等讀取時遷移。
export interface StoredSave extends Omit<SaveGame, "createdAt" | "snapshot"> {
  createdAt?: string;
  snapshot: Omit<GameSnapshot, "version" | "playTimeSeconds"> & {
    version: number;
    playTimeSeconds?: number;
  };
}
export interface PreferenceEntry {
  id: string;
  value: unknown;
}
export class BookshopDatabase extends Dexie {
  saves!: Table<StoredSave, string>;
  collection!: Table<CollectionEntry, string>;
  preferences!: Table<PreferenceEntry, string>;
  constructor(name = "night-bookshop") {
    super(name);
    this.version(1).stores({
      saves: "id, kind, updatedAt",
      collection: "id",
      preferences: "id",
    });
    // 第 2 版：存檔多了 createdAt 與快照的遊玩秒數。舊列逐筆遷移；遷移不了的列
    // 原樣保留（讀取時會被略過），收藏與結局在另一張表，不受影響。
    this.version(2)
      .stores({ saves: "id, kind, updatedAt", collection: "id", preferences: "id" })
      .upgrade((tx) =>
        tx
          .table("saves")
          .toCollection()
          .modify((row: Record<string, unknown>) => {
            try {
              row.snapshot = migrateSnapshot(row.snapshot);
              row.createdAt ??= row.updatedAt;
            } catch {
              // 保留原列。
            }
          }),
      );
  }
}
export const database = new BookshopDatabase();
