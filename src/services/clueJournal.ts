import { z } from "zod";
import { database, type BookshopDatabase } from "../db/database";
import { archiveConnections, connectionBetween } from "./archiveScoring";
import { archiveConnectionSchema, archiveItemSchema, clueSchema, saveSchema } from "../types/game";

export const CLUE_JOURNAL_ID = "clue-journal";
const journalSchema = z.object({
  seen: z.array(clueSchema).default([]),
  connections: z.array(archiveConnectionSchema).default([]),
});
export type ClueJournal = z.infer<typeof journalSchema>;
export function parseJournal(value: unknown): ClueJournal {
  const parsed = journalSchema.safeParse(value);
  return parsed.success ? parsed.data : { seen: [], connections: [] };
}
type ClueId = z.infer<typeof clueSchema>;
type ArchiveItem = z.infer<typeof archiveItemSchema>;

const requiredClues: Record<z.infer<typeof archiveConnectionSchema>, ClueId[]> = {
  "jinglan-boyan": ["school-journal"],
  "boyan-ruoyin": ["company-recital"],
  "ruoyin-haiming": ["motif", "shared-melody"],
  "haiming-yuhang": ["lighthouse-postcard", "lighthouse-photo"],
  "yuhang-yenuan": ["recipe-postmark"],
};

export function mergeClues(journal: ClueJournal, clues: ClueId[]): ClueJournal {
  return { ...journal, seen: [...new Set([...journal.seen, ...clues])] };
}

export function compareClues(journal: ClueJournal, first: ArchiveItem, second: ArchiveItem, completed: Set<string>) {
  if (!completed.has(first) || !completed.has(second)) return { status: "unfinished" as const };
  const connection = connectionBetween(first, second);
  if (!connection) return { status: "unrelated" as const };
  if (journal.connections.includes(connection.id)) return { status: "already" as const, connection };
  const missing = requiredClues[connection.id].filter((id) => !journal.seen.includes(id));
  if (missing.length) return { status: "missing" as const, missing };
  return { status: "connected" as const, connection };
}

export function discoveredConnections(journal: ClueJournal) {
  return archiveConnections.filter((connection) => journal.connections.includes(connection.id));
}

export class ClueJournalRepository {
  constructor(private db: BookshopDatabase = database) {}

  async load(): Promise<ClueJournal> {
    return this.db.transaction("rw", this.db.saves, this.db.preferences, async () => {
      const original = parseJournal((await this.db.preferences.get(CLUE_JOURNAL_ID))?.value);
      let journal = original;
      // Existing profiles had no journal. Recover every clue still present in saved snapshots.
      for (const row of await this.db.saves.toArray()) {
        const parsed = saveSchema.safeParse(row);
        if (parsed.success) journal = mergeClues(journal, parsed.data.snapshot.frame.clues);
      }
      if (journal.seen.length !== original.seen.length)
        await this.db.preferences.put({ id: CLUE_JOURNAL_ID, value: journal });
      return journal;
    });
  }

  async connect(first: ArchiveItem, second: ArchiveItem, completed: Set<string>) {
    return this.db.transaction("rw", this.db.preferences, async () => {
      const journal = parseJournal((await this.db.preferences.get(CLUE_JOURNAL_ID))?.value);
      const result = compareClues(journal, first, second, completed);
      if (result.status !== "connected") return { result, journal };
      const updated = { ...journal, connections: [...journal.connections, result.connection.id] };
      await this.db.preferences.put({ id: CLUE_JOURNAL_ID, value: updated });
      return { result, journal: updated };
    });
  }
}

export const clueJournal = new ClueJournalRepository();
