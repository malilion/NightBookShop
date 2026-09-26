import {
  archiveItemSchema,
  archiveSchema,
  type ArchiveDraft,
} from "../types/game";

type ArchiveItem = ArchiveDraft["inspected"][number];
type ArchiveConnection = ArchiveDraft["connections"][number];

export const archiveConnections: {
  id: ArchiveConnection;
  first: ArchiveItem;
  second: ArchiveItem;
  explanation: string;
}[] = [
  { id: "jinglan-boyan", first: "jinglan", second: "boyan", explanation: "柏言母親保存了靜蘭的舊校刊。" },
  { id: "boyan-ruoyin", first: "boyan", second: "ruoyin", explanation: "若音曾在柏言公司的尾牙演奏。" },
  { id: "ruoyin-haiming", first: "ruoyin", second: "haiming", explanation: "若音未完成的四個音也留在海明的燈塔記憶裡。" },
  { id: "haiming-yuhang", first: "haiming", second: "yuhang", explanation: "雨航妹妹的照片拍下了海明守望的燈塔。" },
  { id: "yuhang-yenuan", first: "yuhang", second: "yenuan", explanation: "葉暖母親的食譜卡曾由雨航父親投遞。" },
];

export function connectionBetween(first: ArchiveItem, second: ArchiveItem) {
  return archiveConnections.find((connection) =>
    (connection.first === first && connection.second === second) ||
    (connection.first === second && connection.second === first),
  );
}

export function scoreArchive(input: ArchiveDraft) {
  const draft = archiveSchema.parse(input);
  const unique = new Set(draft.inspected);
  const connections = new Set(draft.connections.filter((id) => {
    const pair = archiveConnections.find((connection) => connection.id === id)!;
    return unique.has(pair.first) && unique.has(pair.second);
  }));
  return {
    count: unique.size,
    connected: connections.size,
    complete: unique.size === archiveItemSchema.options.length && connections.size === archiveConnections.length,
  };
}
