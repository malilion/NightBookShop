import Dexie, { type Table } from "dexie";
import type { SaveGame } from "../types/game";
export interface CollectionEntry {
  id: string;
  unlockedAt: string;
  golden?: boolean;
}
export interface PreferenceEntry {
  id: string;
  value: unknown;
}
export class BookshopDatabase extends Dexie {
  saves!: Table<SaveGame, string>;
  collection!: Table<CollectionEntry, string>;
  preferences!: Table<PreferenceEntry, string>;
  constructor(name = "night-bookshop") {
    super(name);
    this.version(1).stores({
      saves: "id, kind, updatedAt",
      collection: "id",
      preferences: "id",
    });
  }
}
export const database = new BookshopDatabase();
