import { defineStore } from "pinia";
import { ref } from "vue";
import { z } from "zod";
import { database } from "../db/database";
const textSpeedSchema = z.enum(["instant", "fast", "normal", "slow"]);
export type TextSpeed = z.infer<typeof textSpeedSchema>;
const schema = z.object({
  largeText: z.boolean(),
  reducedMotion: z.boolean(),
  textSpeed: textSpeedSchema.default("normal"),
  muted: z.boolean().default(false),
  bgmVolume: z.number().int().min(0).max(100).default(25),
  ambienceVolume: z.number().int().min(0).max(100).default(40),
  sfxVolume: z.number().int().min(0).max(100).default(45),
});
type Settings = z.infer<typeof schema>;
export const useSettingsStore = defineStore("settings", () => {
  const values = ref<Settings>({
    largeText: false,
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
    textSpeed: "normal",
    muted: false,
    bgmVolume: 25,
    ambienceVolume: 40,
    sfxVolume: 45,
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
  async function update<K extends keyof Settings>(key: K, value: Settings[K]) {
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
