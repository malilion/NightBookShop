import { computed } from "vue";
import { teas } from "../../data/catalog";
import { teaInfusion } from "../../services/teaInfusion";
import type { TeaDraft } from "../../types/game";

export const brewPhases = ["選第一罐茶", "舀茶與調配", "提壺注水", "靜候茶香", "倒茶入杯"];
const stepPhase: Record<TeaDraft["step"], number> = {
  select: 0,
  leaves: 1,
  scoop: 1,
  water: 2,
  steep: 3,
  serving: 4,
  serve: 4,
};

/** Derived brewing state shared by the tea table and each sidebar. */
export function useTeaBrew(draft: TeaDraft) {
  const selected = computed(() => teas[draft.teaId]);
  const secondary = computed(() => (draft.blendTeaId ? teas[draft.blendTeaId] : null));
  const totalLeaves = computed(() => draft.leaves + draft.blendLeaves);
  const blendRatio = computed(() => (totalLeaves.value > 0 ? draft.blendLeaves / totalLeaves.value : 0));
  const idealTemperature = computed(() =>
    Math.round(selected.value.temperature * (1 - blendRatio.value) + (secondary.value?.temperature ?? 0) * blendRatio.value),
  );
  const idealSeconds = computed(() =>
    Math.round(selected.value.seconds * (1 - blendRatio.value) + (secondary.value?.seconds ?? 0) * blendRatio.value),
  );
  const phase = computed(() => stepPhase[draft.step]);
  const canChooseJar = computed(() => draft.water === 0 && phase.value <= 2);
  const potRemaining = computed(() => Math.max(0, draft.water + draft.blackTea - draft.cupWater - draft.teaLost));
  const readyToServe = computed(
    () =>
      draft.cupWater >= Math.min(25, draft.water * 0.7) &&
      draft.cupWater > 0 &&
      ["serving", "serve"].includes(draft.step),
  );
  const infusion = computed(() => teaInfusion(draft));
  return {
    selected,
    secondary,
    totalLeaves,
    blendRatio,
    idealTemperature,
    idealSeconds,
    phase,
    canChooseJar,
    potRemaining,
    readyToServe,
    infusion,
  };
}
