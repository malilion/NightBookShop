import { beforeEach, describe, expect, it } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { database } from "../../src/db/database";
import { useTeaHouseStore } from "../../src/stores/teaHouseStore";
import { brewShares } from "../../src/services/teaFlavor";
import { brewWindow, dateKey, resolveOrder } from "../../src/services/teaHouse";
import { newTea, type TeaDraft } from "../../src/types/game";
import { newTeaHouseProgress, newTeaHouseSession, teaHouseProgressSchema } from "../../src/types/teaHouse";

/** A cup brewed well for the guest: recipe water and heat, lifted in their best window. */
function cup(patch: Partial<TeaDraft>, guest = "guest:nurse"): TeaDraft {
  const draft = { ...newTea(), leaves: 3, ...patch };
  const { idealSeconds, idealTemperature } = brewShares(draft);
  const brewed = { ...draft, water: 70, seconds: idealSeconds, temperature: Math.round(idealTemperature / 5) * 5, step: "serve" as const, cupWater: 50 };
  const [start, end] = brewWindow(brewed, resolveOrder(guest));
  return { ...brewed, seconds: (start + end) / 2 };
}
async function stored() {
  const row = await database.preferences.get("tea-house");
  return row ? teaHouseProgressSchema.parse(row.value) : null;
}

describe("tea house store", () => {
  beforeEach(async () => {
    setActivePinia(createPinia());
    await database.preferences.clear();
    await database.collection.clear();
  });

  it("invites story visitors whose night is finished as regulars", async () => {
    const at = new Date().toISOString();
    await database.collection.bulkPut([
      { id: "moonlight", unlockedAt: at },
      { id: "recipient", unlockedAt: at },
      { id: "yenuan-share", unlockedAt: at },
      { id: "lincheng-dawn", unlockedAt: at },
      { id: "not-an-ending", unlockedAt: at },
    ]);
    const house = useTeaHouseStore();
    await house.init();
    expect(house.regulars).toEqual(["jinglan", "yenuan"]);
  });

  it("opens today's shared ticket and keeps it across a reload", async () => {
    const house = useTeaHouseStore();
    await house.init();
    await house.start("daily");
    expect(house.session).toMatchObject({ kind: "daily", date: dateKey(), index: 0 });
    expect(house.session!.orders).toHaveLength(5);
    const orders = [...house.session!.orders];
    await house.saveDraft({ ...newTea(), teaId: "puer", step: "leaves", jarOpen: true });
    await house.start("daily");
    expect(house.session!.orders).toEqual(orders);
    expect(house.session!.draft.teaId).toBe("osmanthus");
    await house.saveDraft({ ...newTea(), teaId: "puer", step: "leaves", jarOpen: true });
    setActivePinia(createPinia());
    const reloaded = useTeaHouseStore();
    await reloaded.init();
    expect(reloaded.session!.draft).toMatchObject({ teaId: "puer", jarOpen: true });
    expect(reloaded.order?.name).toBeTruthy();
  });

  it("serves each guest once, closes the night and records the best", async () => {
    await database.preferences.put({
      id: "tea-house",
      value: { ...newTeaHouseProgress(), session: newTeaHouseSession("night", 1, ["guest:nurse", "guest:vendor"], null) },
    });
    const house = useTeaHouseStore();
    await house.init();
    const first = await house.serve(cup({ teaId: "black" }));
    expect(first?.grade.stars).toBe(3);
    expect(await house.serve(cup({ teaId: "black" }))).toBeNull();
    await house.nextGuest();
    expect(house.order?.id).toBe("vendor");
    const second = await house.serve(cup({ teaId: "hojicha", ingredients: [{ id: "caramel", where: "pot", at: 0 }] }, "guest:vendor"));
    expect(second?.newRecipe).toBe("lighthouse-caramel");
    const records = await house.nextGuest();
    expect(records.nightBest).toBe(true);
    expect(house.nightDone).toBe(true);
    const saved = await stored();
    expect(saved).toMatchObject({ stars: 6, served: 2, perfect: 2, nights: 1, bestNight: 6 });
    expect(saved!.recipes["lighthouse-caramel"]).toBeTruthy();
    await house.leave();
    expect((await stored())!.session).toBeNull();
  });

  it("keeps its own copy of the table's draft", async () => {
    const house = useTeaHouseStore();
    await house.start("free");
    const draft: TeaDraft = { ...newTea(), teaId: "black", step: "leaves", ingredients: [{ id: "milk", where: "cup", at: 0 }] };
    await house.saveDraft(draft);
    draft.ingredients.push({ id: "honey", where: "cup", at: 0 });
    expect(house.session!.draft.ingredients).toHaveLength(1);
    expect(JSON.parse(JSON.stringify(house.session!.draft))).toEqual(house.session!.draft);
  });

  it("writes story cups into the book without stars", async () => {
    const house = useTeaHouseStore();
    expect(await house.recordStoryBrew(cup({ teaId: "chamomile", garnish: "honey" }))).toBe("honey-chamomile");
    expect(await stored()).toMatchObject({ stars: 0, served: 0 });
    expect(house.recipeCount).toBe(1);
  });

  it("keeps an unreadable record aside instead of overwriting it", async () => {
    await database.preferences.put({ id: "tea-house", value: { version: 9, stars: "many" } });
    const house = useTeaHouseStore();
    await house.init();
    expect(house.error).toContain("另存");
    const backups = (await database.preferences.toArray()).filter((row) => row.id.startsWith("tea-house-unreadable-"));
    expect(backups).toHaveLength(1);
    expect(backups[0]!.value).toEqual({ version: 9, stars: "many" });
    await house.start("free");
    expect((await stored())!.session?.kind).toBe("free");
  });
});
