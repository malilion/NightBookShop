import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { BookshopDatabase } from "../../src/db/database";
import { SaveRepository } from "../../src/db/saveRepository";
import { StoryBridge } from "../../src/story/storyBridge";
import {
  newTea,
  newLetter,
  STORY_VERSION,
  type GameSnapshot,
} from "../../src/types/game";
const db = new BookshopDatabase("test-bookshop");
const repo = new SaveRepository(db);
function snapshot(): GameSnapshot {
  const story = new StoryBridge(
    readFileSync("public/story/compiled/main.json", "utf8"),
  );
  return {
    version: 1,
    storyVersion: STORY_VERSION,
    inkState: story.serialize(),
    frame: story.next(),
    tea: newTea(),
    letter: newLetter(),
  };
}
afterEach(async () => {
  await db.saves.clear();
  await db.collection.clear();
});
describe("local saves", () => {
  it("rotates three auto slots with monotonic ordering and preserves ten manual slots", async () => {
    for (let i = 0; i < 5; i++) {
      const data = snapshot();
      data.frame.text = `line ${i}`;
      await repo.write(data);
    }
    expect((await repo.list()).map((s) => s.snapshot.frame.text)).toEqual([
      "line 4",
      "line 3",
      "line 2",
    ]);
    for (let slot = 1; slot <= 10; slot++)
      await repo.write(snapshot(), "manual", slot);
    expect(await repo.list()).toHaveLength(13);
    await expect(repo.write(snapshot(), "manual", 11)).rejects.toThrow();
  });
  it("preserves mid-minigame drafts, and rejects unsupported version without deleting data", async () => {
    const data = snapshot();
    data.frame.mode = "tea";
    data.tea = { ...newTea(), step: "water", water: 62 };
    data.letter.slots = ["address", null, null];
    await repo.write(data, "manual", 1);
    expect((await repo.get("manual-1"))?.snapshot).toEqual(data);
    await db.saves.update("manual-1", {
      snapshot: { ...data, version: 2 } as unknown as GameSnapshot,
    });
    await expect(repo.get("manual-1")).rejects.toThrow();
    expect(await db.saves.count()).toBe(1);
  });
  it("loads letter drafts saved before rotation and flip were added", async () => {
    const data = snapshot();
    const oldLetter = {
      slots: data.letter.slots,
      inspected: data.letter.inspected,
      alternate: data.letter.alternate,
    };
    await db.saves.put({
      id: "manual-1",
      kind: "manual",
      updatedAt: new Date().toISOString(),
      snapshot: { ...data, letter: oldLetter } as GameSnapshot,
    });
    expect((await repo.get("manual-1"))?.snapshot.letter).toEqual(newLetter());
  });
  it("commits collection once, preserves it across new games, and retains first chapter snapshot", async () => {
    const data = snapshot();
    data.frame.mode = "ending";
    data.frame.endingId = "moonlight";
    await repo.write(data);
    const entry = await db.collection.get("moonlight");
    await repo.write(data);
    await repo.write(snapshot());
    expect(await db.collection.toArray()).toEqual([entry]);
    expect((await repo.get("chapter-jinglan"))?.snapshot.frame.endingId).toBe(
      "moonlight",
    );
  });
});
