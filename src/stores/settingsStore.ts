import { defineStore } from "pinia";
import { ref } from "vue";
import { z } from "zod";
import { database } from "../db/database";
const schema = z.object({ largeText: z.boolean(), reducedMotion: z.boolean() });
export const useSettingsStore = defineStore("settings", () => {
  const values = ref({
    largeText: false,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
  });
  const error = ref("");
  async function init() {
    try {
      const row = await database.preferences.get("settings");
      if (row) values.value = schema.parse(row.value);
    } catch {
      error.value = "閱讀偏好暫時無法讀取。";
    }
  }
  async function update(key: "largeText" | "reducedMotion", value: boolean) {
    values.value[key] = value;
    try {
      await database.preferences.put({
        id: "settings",
        value: { ...values.value },
      });
      error.value = "";
    } catch {
      error.value = "偏好已套用，但無法保存在此瀏覽器。";
    }
  }
  return { values, error, init, update };
});
