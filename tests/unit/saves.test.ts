import { afterEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { BookshopDatabase } from "../../src/db/database";
import { SaveRepository } from "../../src/db/saveRepository";
import { StoryBridge } from "../../src/story/storyBridge";
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
  STORY_VERSION,
  type GameSnapshot,
  snapshotSchema,
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
    melody: newMelody(),
    hearth: newHearth(),
    route: newRoute(),
    lamp: newLamp(),
    archive: newArchive(),
    notifications: newNotifications(),
    opening: newOpening(),
  };
}
afterEach(async () => {
  await db.saves.clear();
  await db.collection.clear();
});
describe("local saves", () => {
  it("restores opening tasks and treats older saves as already opened", async () => {
    const data = snapshot();
    data.opening.inspected = ["counter", "weather"];
    await repo.write(data, "manual", 1);
    expect((await repo.get("manual-1"))?.snapshot.opening).toEqual({
      inspected: ["counter", "weather"], complete: false,
    });
    expect(snapshotSchema.parse({ ...data, opening: undefined }).opening).toEqual({
      inspected: ["counter", "weather", "tea"], complete: true,
    });
    expect(snapshotSchema.parse({ ...data, notifications: undefined }).notifications).toEqual(newNotifications());
  });
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
  it("restores a two-tea draft and defaults older single-tea saves", async () => {
    const mixed = snapshot();
    mixed.frame.mode = "tea";
    mixed.tea = { ...newTea(), step: "water", teaId: "osmanthus", blendTeaId: "puer", leaves: 2, blendLeaves: 1, leafOrder: ["osmanthus", "puer", "osmanthus"], jarOpen: true, blendJarOpen: true };
    await repo.write(mixed, "manual", 1);
    expect((await repo.get("manual-1"))?.snapshot.tea).toEqual(mixed.tea);
    const { blendTeaId: _id, blendLeaves: _leaves, blendJarOpen: _open, spoonTeaId: _spoon, leafOrder: _order, ...oldTea } = newTea();
    const old = snapshot();
    await db.saves.put({ id: "manual-2", kind: "manual", updatedAt: new Date().toISOString(), snapshot: { ...old, tea: oldTea } as unknown as GameSnapshot });
    expect((await repo.get("manual-2"))?.snapshot.tea).toEqual(newTea());
    void [_id, _leaves, _open, _spoon, _order];
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
      snapshot: {
        ...data,
        letter: oldLetter,
        melody: undefined,
      } as unknown as GameSnapshot,
    });
    expect((await repo.get("manual-1"))?.snapshot.letter).toEqual(newLetter());
    expect((await repo.get("manual-1"))?.snapshot.melody).toEqual(newMelody());
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
  it("upgrades a collected ending to gold after resonant tea and never downgrades it", async () => {
    const ordinary = snapshot();
    ordinary.frame.mode = "ending";
    ordinary.frame.endingId = "moonlight";
    await repo.write(ordinary);
    const first = await db.collection.get("moonlight");
    expect(first?.golden).toBe(false);

    const resonant = snapshot();
    resonant.frame.mode = "ending";
    resonant.frame.endingId = "moonlight";
    resonant.frame.resonanceFragment = "jinglan";
    resonant.letter.resonanceInspected = true;
    await repo.write(resonant);
    expect(await db.collection.get("moonlight")).toEqual({ ...first, golden: true });
    expect((await repo.get("auto-2"))?.snapshot.letter.resonanceInspected).toBe(true);

    await repo.write(ordinary);
    expect((await db.collection.get("moonlight"))?.golden).toBe(true);
    expect(snapshotSchema.parse({ ...ordinary, frame: { ...ordinary.frame, resonanceFragment: undefined }, letter: { ...ordinary.letter, resonanceInspected: undefined } }).frame.resonanceFragment).toBeNull();
  });
  it.each([
    ["jinglan", "moonlight"],
    ["boyan", "boyan-rest"],
    ["ruoyin", "ruoyin-one"],
    ["yenuan", "yenuan-share"],
    ["yuhang", "yuhang-today"],
    ["haiming", "haiming-light"],
  ] as const)("stores a gold bookmark for %s", async (chapter, ending) => {
    const data = snapshot();
    data.frame.mode = "ending";
    data.frame.endingId = ending;
    data.frame.resonanceFragment = chapter;
    await repo.write(data);
    expect((await db.collection.get(ending))?.golden).toBe(true);
  });
  it("stores a separate second-night bookmark and chapter snapshot", async () => {
    const data = snapshot();
    data.storyVersion = "boyan-chapter-1";
    data.frame.mode = "ending";
    data.frame.endingId = "boyan-rest";
    data.letter = {
      ...newLetter(),
      slots: ["status", "boundary", "handoff", "next"],
      angles: [0, 0, 0, 0],
      flipped: [false, false, false, false],
    };
    await repo.write(data);
    expect((await repo.get("chapter-boyan"))?.snapshot.frame.endingId).toBe(
      "boyan-rest",
    );
    expect((await db.collection.get("boyan-rest"))?.id).toBe("boyan-rest");
    expect(await repo.get("chapter-jinglan")).toBeUndefined();
  });
  it("stores the third-night bookmark without overwriting prior chapter snapshots", async () => {
    const data = snapshot();
    data.storyVersion = "ruoyin-chapter-1";
    data.frame.mode = "ending";
    data.frame.endingId = "ruoyin-one";
    data.letter = {
      ...newLetter(),
      slots: ["greeting", "fear", "music"],
      reverseSlots: ["greeting", "fear", "music"],
      inspected: true,
    };
    data.melody.notes = [0, 1, 3, 2];
    await repo.write(data);
    expect(
      (await repo.get("chapter-ruoyin"))?.snapshot.letter.reverseSlots,
    ).toEqual(["greeting", "fear", "music"]);
    expect((await db.collection.get("ruoyin-one"))?.id).toBe("ruoyin-one");
    expect(await repo.get("chapter-jinglan")).toBeUndefined();
    expect(await repo.get("chapter-boyan")).toBeUndefined();
  });
  it("loads older saves without hearth data and stores the fourth-night bookmark", async () => {
    const withoutHearth = { ...snapshot(), hearth: undefined };
    expect(snapshotSchema.parse(withoutHearth).hearth).toEqual(newHearth());
    const data = snapshot();
    data.storyVersion = "yenuan-chapter-1";
    data.frame.mode = "ending";
    data.frame.endingId = "yenuan-share";
    data.hearth.responses = ["wait", "ask", "wait"];
    data.letter = {
      ...newLetter(),
      slots: ["flour", "apple", "waiting"],
      reverseSlots: ["flour", "apple", "waiting"],
      inspected: true,
    };
    await repo.write(data);
    expect((await repo.get("chapter-yenuan"))?.snapshot.hearth.responses).toEqual(["wait", "ask", "wait"]);
    expect((await db.collection.get("yenuan-share"))?.id).toBe("yenuan-share");
  });
  it("loads older saves without route or stamp and stores the fifth-night bookmark", async () => {
    const old = snapshot();
    const parsed = snapshotSchema.parse({ ...old, route: undefined, letter: { ...old.letter, stamp: undefined } });
    expect(parsed.route).toEqual(newRoute());
    expect(parsed.letter.stamp).toBe("none");
    const data = snapshot();
    data.storyVersion = "yuhang-chapter-1";
    data.frame.mode = "ending";
    data.frame.endingId = "yuhang-today";
    data.route.stops = ["post-office", "last-bus", "empty-shop"];
    data.letter = {
      ...newLetter(),
      slots: ["tomorrow", "admit", "without-her", "begin"],
      angles: [0, 0, 0, 0],
      flipped: [false, false, false, false],
      inspected: true,
      stamp: "present",
    };
    await repo.write(data);
    expect((await repo.get("chapter-yuhang"))?.snapshot.route.stops).toEqual(["post-office", "last-bus", "empty-shop"]);
    expect((await db.collection.get("yuhang-today"))?.id).toBe("yuhang-today");
  });
  it("loads older saves without lamp state and stores the sixth-night bookmark", async () => {
    const parsed = snapshotSchema.parse({ ...snapshot(), lamp: undefined });
    expect(parsed.lamp).toEqual(newLamp());
    const data = snapshot();
    data.storyVersion = "haiming-chapter-1";
    data.frame.mode = "ending";
    data.frame.endingId = "haiming-light";
    data.lamp.turns = ["steady", "steady", "steady"];
    data.letter = {
      ...newLetter(), slots: ["light", "shore", "return", "remember"],
      angles: [0, 0, 0, 0], flipped: [false, false, false, false], inspected: true,
    };
    await repo.write(data);
    expect((await repo.get("chapter-haiming"))?.snapshot.lamp.turns).toEqual(["steady", "steady", "steady"]);
    expect((await db.collection.get("haiming-light"))?.id).toBe("haiming-light");
  });
  it("loads older saves without archive data and stores the finale bookmark", async () => {
    const parsed = snapshotSchema.parse({ ...snapshot(), archive: undefined });
    expect(parsed.archive).toEqual(newArchive());
    expect(snapshotSchema.parse({ ...snapshot(), archive: { inspected: ["jinglan"] } }).archive.connections).toEqual([]);
    const data = snapshot();
    data.storyVersion = "lincheng-chapter-1";
    data.frame.mode = "ending";
    data.frame.endingId = "lincheng-dawn";
    data.archive.inspected = ["jinglan", "boyan", "ruoyin", "yenuan", "yuhang", "haiming"];
    data.letter = {
      ...newLetter(), slots: ["kept", "afraid", "two-wishes", "embrace"],
      angles: [0, 0, 0, 0], flipped: [false, false, false, false], inspected: true,
    };
    await repo.write(data);
    expect((await repo.get("chapter-lincheng"))?.snapshot.archive.inspected).toHaveLength(6);
    expect((await db.collection.get("lincheng-dawn"))?.id).toBe("lincheng-dawn");
  });
});
