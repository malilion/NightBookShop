import type { StoryFrame } from "../types/game";

export type MemorySection = "school" | "hospital" | "platform";
export type MemoryObject = {
  label: string;
  choice: string;
};
export type MemoryEvidence = {
  leave: string;
  objects: readonly [MemoryObject, MemoryObject, MemoryObject];
};

export const memoryEvidence: Record<MemorySection, MemoryEvidence> = {
  school: {
    leave: "翻到夾著月亮圖案的那一頁",
    objects: [
      { label: "校刊名單", choice: "查看校刊的編輯名單" },
      { label: "稿紙改字", choice: "辨認稿紙邊緣的改字" },
      { label: "獎學金便條", choice: "讀獎學金通知旁的便條" },
    ],
  },
  hospital: {
    leave: "把病房門口那片信紙收好",
    objects: [
      { label: "病房", choice: "先陪她看看病房裡的人" },
      { label: "繳費單", choice: "拾起長椅旁的繳費單" },
      { label: "公用電話", choice: "查看公用電話下的紙條" },
    ],
  },
  platform: {
    leave: "拾起詩集裡最後一角信紙",
    objects: [
      { label: "長椅紙角", choice: "查看長椅底下的紙角" },
      { label: "末班時刻", choice: "對照票根與末班車的時間" },
      { label: "藍色詩集", choice: "翻開岳川留下的詩集" },
    ],
  },
};

export function memorySection(
  section: StoryFrame["section"],
): MemorySection | null {
  if (section === "school" || section === "hospital" || section === "platform")
    return section;
  return null;
}
