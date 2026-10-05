import { describe, expect, it } from "vitest";
import { endings, type EndingId } from "../../src/data/catalog";
import { bookmarkRarity, crackedEndings } from "../../src/data/collectionArchive";
import { newlyUnlocked, unlockedAchievements } from "../../src/services/achievements";

const entry = (id: EndingId, golden = false) => ({ id, unlockedAt: new Date().toISOString(), golden });
const none = { connections: [] };
const threads = ["jinglan-boyan", "boyan-ruoyin", "ruoyin-haiming", "haiming-yuhang", "yuhang-yenuan"] as const;

describe("collection achievements", () => {
  it("starts dark and lights the first badge with any ending", () => {
    expect(unlockedAchievements([], none).size).toBe(0);
    expect([...unlockedAchievements([entry("recipient")], none)]).toEqual(["first"]);
  });
  it("lights the cracked, golden and thread badges from what was collected", () => {
    const unlocked = unlockedAchievements(
      [entry("intervention"), entry("boyan-rest", true)],
      { connections: [...threads] },
    );
    expect(unlocked).toEqual(new Set(["first", "crack", "golden", "threads"]));
  });
  it("needs a golden bookmark from all six visitors for the six lamps", () => {
    const six = (["moonlight", "boyan-rest", "ruoyin-one", "yenuan-share", "yuhang-today", "haiming-light"] as const).map((id) => entry(id, true));
    expect(unlockedAchievements(six, none).has("golden-all")).toBe(true);
    expect(unlockedAchievements(six.slice(1), none).has("golden-all")).toBe(false);
  });
  it("lights every badge when all endings and threads are found", () => {
    const all = (Object.keys(endings) as EndingId[]).map((id) => entry(id, id !== "lincheng-dawn"));
    const unlocked = unlockedAchievements(all, { connections: [...threads] });
    expect(unlocked.size).toBe(8);
  });
  it("reports only badges the player has not seen", () => {
    const unlocked = unlockedAchievements([entry("intervention")], none);
    expect(newlyUnlocked(unlocked, ["first"]).map((item) => item.id)).toEqual(["crack"]);
  });
});

describe("bookmark rarity", () => {
  it("gives every night one truth, two story and one cracked bookmark", () => {
    const counts = { truth: 0, story: 0, crack: 0 };
    for (const id of Object.keys(endings) as EndingId[]) counts[bookmarkRarity(id)]++;
    expect(counts).toEqual({ truth: 7, story: 14, crack: 7 });
    expect(crackedEndings.size).toBe(7);
  });
});
