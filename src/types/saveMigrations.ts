// 存檔格式的版本遷移。每次改動快照欄位就把 SAVE_VERSION 加一，並在 migrations
// 補上「從上一版到這一版」的轉換；舊存檔逐版升到目前版本，不直接拒讀。
// 故事本身的相容性另由 storyVersion 與保留的舊編譯 JSON 負責。
export const SAVE_VERSION = 2;
type Raw = Record<string, unknown>;
const migrations: Record<number, (snapshot: Raw) => Raw> = {
  // 第 2 版：快照帶上累計遊玩秒數。
  1: (snapshot) => ({ ...snapshot, playTimeSeconds: 0 }),
};
export class SaveMigrationError extends Error {}
export function migrateSnapshot(input: unknown): unknown {
  if (!input || typeof input !== "object") return input;
  let snapshot = { ...(input as Raw) };
  let version = typeof snapshot.version === "number" ? snapshot.version : 1;
  if (version > SAVE_VERSION)
    throw new SaveMigrationError("這份存檔來自較新的版本。");
  while (version < SAVE_VERSION) {
    const step = migrations[version];
    if (!step) throw new SaveMigrationError(`缺少第 ${version} 版的存檔遷移。`);
    snapshot = { ...step(snapshot), version: version + 1 };
    version++;
  }
  return snapshot;
}
