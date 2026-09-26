import { teas } from "../data/catalog";
import type { TeaDraft, TeaId } from "../types/game";

// Art-directed infusion stages, measured against each recipe's in-game timer.
// These are visual game rules, not a laboratory extraction model.
const profiles: Record<
  TeaId,
  { colors: [string, string, string]; name: string }
> = {
  osmanthus: { colors: ["#eadca0", "#d7a958", "#8c4920"], name: "金黃" },
  puer: { colors: ["#d9b090", "#a85c35", "#51251c"], name: "栗紅" },
  mint: { colors: ["#e2e4b8", "#b5ba78", "#73783d"], name: "草木黃綠" },
  jasmine: { colors: ["#eeedbb", "#d1c278", "#969042"], name: "嫩黃" },
  black: { colors: ["#ecd2a1", "#cb8740", "#743419"], name: "橙紅" },
  chamomile: { colors: ["#f0e6b7", "#e0bf69", "#a27a30"], name: "蜜黃" },
  lavender: { colors: ["#e3ccaa", "#bd8648", "#724221"], name: "紅茶琥珀" },
  hojicha: { colors: ["#ded0a8", "#b78c52", "#765029"], name: "焙茶褐金" },
};
export const clearWaterColor = "#dae1d8";
export function rgbChannels(hex: string): [number, number, number] {
  return [1, 3, 5].map((start) =>
    parseInt(hex.slice(start, start + 2), 16),
  ) as [number, number, number];
}
function mix(a: string, b: string, progress: number) {
  const first = rgbChannels(a),
    second = rgbChannels(b);
  return (
    "#" +
    first
      .map((channel, i) =>
        Math.round(channel + (second[i]! - channel) * progress)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
export function teaInfusion(
  draft: Pick<TeaDraft, "teaId" | "seconds" | "leaves" | "water"> & Partial<Pick<TeaDraft, "blackTea" | "blendTeaId" | "blendLeaves">>,
) {
  const profile = profiles[draft.teaId];
  const blendTeaId = draft.blendTeaId !== draft.teaId && (draft.blendLeaves ?? 0) > 0 ? draft.blendTeaId : null;
  const blendLeaves = blendTeaId ? draft.blendLeaves ?? 0 : 0;
  const totalLeaves = draft.leaves + blendLeaves;
  const blendRatio = totalLeaves > 0 ? blendLeaves / totalLeaves : 0;
  const idealSeconds = teas[draft.teaId].seconds * (1 - blendRatio) + (blendTeaId ? teas[blendTeaId].seconds * blendRatio : 0);
  const ratio =
    draft.water > 0 && totalLeaves > 0
      ? Math.max(0, draft.seconds) / idealSeconds
      : 0;
  const stages = [clearWaterColor, ...profile.colors.map((color, index) =>
    blendTeaId ? mix(color, profiles[blendTeaId].colors[index]!, blendRatio) : color,
  )];
  const times = [0, 0.2, 1, 2.4];
  const capped = Math.min(2.4, ratio);
  const index = capped < 0.2 ? 0 : capped < 1 ? 1 : 2;
  const progress =
    (capped - times[index]!) / (times[index + 1]! - times[index]!);
  const base = mix(stages[index]!, stages[index + 1]!, progress);
  const blackRatio = draft.teaId === "mint"
    ? Math.min(0.55, (draft.blackTea ?? 0) / Math.max(30, draft.water + (draft.blackTea ?? 0)))
    : 0;
  return {
    color: blackRatio ? mix(base, profiles.black.colors[1], blackRatio) : base,
    strength: Math.max(Math.min(1, ratio / 0.2), blackRatio * 2),
    label:
      blackRatio > 0
        ? draft.water === 0 ? "備好的淡紅茶"
          : `${ratio < 0.45 ? "淡" : ratio > 1.25 ? "濃" : "透亮"}薄荷紅茶${blendTeaId && draft.leaves > 0 ? `與${teas[blendTeaId].name}` : ""}`
        : ratio === 0
        ? "清水初注"
        : `${ratio < 0.45 ? "淡" : ratio > 1.25 ? "濃" : "透亮"}${blendTeaId && draft.leaves > 0 ? `${teas[draft.teaId].name}與${teas[blendTeaId].name}` : blendTeaId ? profiles[blendTeaId].name : profile.name}`,
  };
}
