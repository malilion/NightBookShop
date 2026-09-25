<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { useGameStore } from "../../stores/gameStore";
import { useSettingsStore, type TextSpeed } from "../../stores/settingsStore";
import { audio } from "../../audio/audioManager";
import GameIcon from "../common/GameIcon.vue";

const game = useGameStore();
const props = defineProps<{ visibleChoiceIndexes?: number[] }>();
const settings = useSettingsStore();
const visibleChoices = computed(() =>
  props.visibleChoiceIndexes
    ? game.frame?.choices.filter((choice) => props.visibleChoiceIndexes!.includes(choice.index)) ?? []
    : game.frame?.choices ?? [],
);
const units = ref<string[]>([]);
const visibleCount = ref(0);
const visibleText = computed(() =>
  units.value.slice(0, visibleCount.value).join(""),
);
const revealing = computed(() => visibleCount.value < units.value.length);
const speedMs: Record<TextSpeed, number> = {
  instant: 0,
  fast: 12,
  normal: 28,
  slow: 65,
};
let timer: ReturnType<typeof setTimeout> | undefined;

function stopTimer() {
  if (timer !== undefined) clearTimeout(timer);
  timer = undefined;
}
function scheduleNext() {
  stopTimer();
  if (!revealing.value || settings.values.reducedMotion) return;
  const delay = speedMs[settings.values.textSpeed];
  if (!delay) {
    visibleCount.value = units.value.length;
    return;
  }
  timer = setTimeout(() => {
    visibleCount.value++;
    scheduleNext();
  }, delay);
}
function reveal() {
  if (!revealing.value) return false;
  stopTimer();
  visibleCount.value = units.value.length;
  return true;
}
function continueStory() {
  if (!reveal()) game.advance();
}
function choose(index: number) {
  if (!reveal()) {
    audio.cue("paper");
    game.advance(index);
  }
}
watch(
  () => game.frame,
  (frame) => {
    stopTimer();
    units.value = Array.from(frame?.text || "");
    visibleCount.value =
      settings.values.reducedMotion || settings.values.textSpeed === "instant"
        ? units.value.length
        : 0;
    scheduleNext();
  },
  { immediate: true },
);
watch(
  () => [settings.values.textSpeed, settings.values.reducedMotion],
  () => {
    if (
      settings.values.reducedMotion ||
      settings.values.textSpeed === "instant"
    )
      reveal();
    else scheduleNext();
  },
);
onBeforeUnmount(stopTimer);
defineExpose({ reveal, revealing });
</script>
<template>
  <section v-if="game.frame" class="dialogue-panel" aria-label="故事對話">
    <div class="speaker-line">
      <span class="speaker">{{ game.frame.speaker }}</span
      ><span class="speaker-rule"></span><GameIcon name="moon" :size="16" />
    </div>
    <p
      class="dialogue-text"
      :data-full-text="game.frame.text"
      aria-hidden="true"
    >
      <span>{{ visibleText }}</span>
    </p>
    <p class="screen-reader-only" aria-live="polite">{{ game.frame.text }}</p>
    <div
      v-if="!revealing && visibleChoices.length"
      class="dialogue-choices"
    >
      <button
        v-for="choice in visibleChoices"
        :key="choice.index"
        @click="choose(choice.index)"
      >
        <span class="choice-number">{{
          String(choice.index + 1).padStart(2, "0")
        }}</span>
        {{ choice.text }}<GameIcon name="arrow" :size="16" />
      </button>
    </div>
    <button
      v-else-if="revealing || game.frame.canContinue"
      class="continue-button"
      @click="continueStory"
    >
      <span>{{ revealing ? "顯示全文" : "繼續" }}</span>
      <GameIcon name="arrow" :size="18" />
    </button>
    <span class="keyboard-hint">{{
      revealing ? "Enter／空白鍵顯示全文" : "Enter 繼續 · 數字鍵選擇"
    }}</span>
  </section>
</template>
