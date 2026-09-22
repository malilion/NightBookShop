import { database, type BookshopDatabase } from "./database";
import {
  saveSchema,
  snapshotSchema,
  type GameSnapshot,
  type SaveGame,
} from "../types/game";
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
      async () => {
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
              : "chapter-jinglan";
        const latest = (await this.db.saves.orderBy("updatedAt").last())
          ?.updatedAt;
        const now = new Date(
          Math.max(Date.now(), latest ? Date.parse(latest) + 1 : 0),
        ).toISOString();
        await this.db.saves.put({ id, kind, updatedAt: now, snapshot: clean });
        const ending = clean.frame.endingId;
        if (ending) {
          if (!(await this.db.collection.get(ending)))
            await this.db.collection.put({ id: ending, unlockedAt: now });
          if (!(await this.db.saves.get("chapter-jinglan")))
            await this.db.saves.put({
              id: "chapter-jinglan",
              kind: "chapter",
              updatedAt: now,
              snapshot: clean,
            });
        }
      },
    );
  }
}
export const saves = new SaveRepository();
