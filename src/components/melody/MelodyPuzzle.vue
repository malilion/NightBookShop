<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { useGameStore } from "../../stores/gameStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { cupMotif, matchesCupMotif } from "../../services/melodyScoring";

const game = useGameStore();
const settings = useSettingsStore();
const notes = [
  { label: "雨", frequency: 261.63 },
  { label: "步", frequency: 293.66 },
  { label: "燈", frequency: 329.63 },
  { label: "歸", frequency: 392 },
] as const;
const feedback = ref("");
const showHint = ref(false);
let context: AudioContext | null = null;
const timers: number[] = [];

function tone(index: number) {
  if (settings.values.muted || settings.values.sfxVolume === 0) return;
  try {
    context ??= new window.AudioContext();
    const oscillator = context.createOscillator();
    const volume = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = notes[index]!.frequency;
    volume.gain.setValueAtTime(0.0001, context.currentTime);
    volume.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, 0.12 * (settings.values.sfxVolume / 100)),
      context.currentTime + 0.02,
    );
    volume.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime + 0.36,
    );
    oscillator.connect(volume).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.38);
  } catch {
    // The written note names keep this interaction usable without audio output.
  }
}
function replay() {
  for (const timer of timers) window.clearTimeout(timer);
  timers.length = 0;
  cupMotif.forEach((note, index) => {
    timers.push(window.setTimeout(() => tone(note), index * 420));
  });
  feedback.value = "若音敲了四下杯緣。可以再聽，或看文字提示。";
}
function choose(index: number) {
  if (game.melody.notes.length >= 4) return;
  tone(index);
  game.updateMelody({ notes: [...game.melody.notes, index] });
  feedback.value = `已選第 ${game.melody.notes.length} 個音。`;
}
function clear() {
  game.updateMelody({ notes: [] });
  feedback.value = "音序已清空，可以重新回應。";
}
function submit() {
  if (game.melody.notes.length !== 4) {
    feedback.value = "先選滿四個音，或帶著尚未記牢的旋律繼續。";
    return;
  }
  if (matchesCupMotif(game.melody.notes)) game.finishMelody(true);
  else feedback.value = "音序與若音敲的不一樣。可以再聽一次，重新試。";
}
onBeforeUnmount(() => {
  for (const timer of timers) window.clearTimeout(timer);
  void context?.close();
});
</script>

<template>
  <section class="melody-panel paper-frame" aria-label="杯緣旋律">
    <div class="panel-heading">
      <span class="melody-mark" aria-hidden="true">♫</span>
      <div>
        <p class="subtle">第三夜 · 沈若音</p>
        <h2>接住那四個音</h2>
      </div>
    </div>
    <p class="tea-clue">
      若音在杯緣敲了一段童年旋律。聽她示範，再依順序選四個音。也可打開文字提示。
    </p>
    <div class="melody-actions">
      <button class="quiet-button" type="button" @click="replay">
        聽若音敲杯緣
      </button>
      <button class="text-link" type="button" @click="showHint = !showHint">
        {{ showHint ? "收起文字提示" : "看文字提示" }}
      </button>
    </div>
    <p v-if="showHint" class="melody-hint">順序：雨 → 步 → 歸 → 燈</p>
    <div class="melody-input" role="group" aria-label="選擇四個音">
      <button
        v-for="(note, index) in notes"
        :key="note.label"
        type="button"
        class="melody-key"
        :disabled="game.melody.notes.length >= 4"
        :aria-label="`音符：${note.label}`"
        @click="choose(index)"
      >
        <span>♪</span>{{ note.label }}
      </button>
    </div>
    <div class="melody-sequence" aria-live="polite">
      <span v-for="slot in 4" :key="slot">{{
        game.melody.notes[slot - 1] === undefined
          ? "—"
          : notes[game.melody.notes[slot - 1]!]!.label
      }}</span>
    </div>
    <p class="tea-action-feedback" role="status">
      {{ feedback || "她還在等妳的回應。" }}
    </p>
    <div class="button-row">
      <button
        class="quiet-button"
        type="button"
        :disabled="!game.melody.notes.length"
        @click="clear"
      >
        重來
      </button>
      <button class="ornate-button" type="button" @click="submit">
        回應這段旋律
      </button>
      <button class="text-link" type="button" @click="game.finishMelody(false)">
        先聽她說下去
      </button>
    </div>
  </section>
</template>
