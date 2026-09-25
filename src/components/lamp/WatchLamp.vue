<script setup lang="ts">
import { computed, ref } from "vue";
import { useGameStore } from "../../stores/gameStore";
import { scoreLamp } from "../../services/lampScoring";
import type { LampDraft } from "../../types/game";

const game = useGameStore();
const beat = computed(() => game.lamp.turns.length);
const result = computed(() => scoreLamp(game.lamp));
const feedback = ref("");
const prompts = [
  "海明說起暴風夜救回的漁船，卻停在自己錯過的出生那一天。桌上的燈正照著兩行不同的日誌。",
  "夏天的塔頂有一只沒飛起來的風箏。他記得風向，卻一時想不起兒子當時幾歲。",
  "兒子的婚禮邀請夾在颱風警報裡。海明看向燈火，問自己還能不能說那晚曾經害怕。",
] as const;
const actions: { id: LampDraft["turns"][number]; label: string; message: string }[] = [
  { id: "brighten", label: "把燈調得更亮", message: "強光照出功績，陰影裡的猶豫反而看不清。" },
  { id: "dim", label: "把燈調得更暗", message: "光退得太遠，日誌的細節也慢慢消失。" },
  { id: "steady", label: "守住柔和的燈光", message: "妳沒有替他修掉停頓。柔光還能照見兩種說法。" },
];
function choose(action: (typeof actions)[number]) {
  if (beat.value >= 3) return;
  game.updateLamp({ turns: [...game.lamp.turns, action.id] });
  feedback.value = action.message;
}
</script>

<template>
  <section class="lamp-panel paper-frame" aria-label="守住燈光">
    <div class="panel-heading"><span class="lamp-mark" aria-hidden="true">✧</span><div><p class="subtle">第六夜 · 顧海明</p><h2>讓燈照見真實的海</h2></div></div>
    <p class="tea-clue">強光會把故事只照成英雄事蹟；光太暗，細節也會消失。讓柔光留在他的話旁邊。</p>
    <div class="lamp-visual">
      <div class="lamp-glow" :style="{ opacity: `${Math.max(0.15, result.brightness / 100)}`, transform: `scale(${0.65 + result.brightness / 170})` }" aria-hidden="true">✦</div>
      <div class="hearth-heat"><span>暗</span><div class="hearth-gauge" role="meter" aria-label="燈光亮度" :aria-valuenow="result.brightness" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: `${result.brightness}%` }"></span></div><span>刺眼</span></div>
      <p>{{ result.brightness < 30 ? "字快看不清了。" : result.brightness > 70 ? "強光只留下漂亮的輪廓。" : "柔光下，矛盾和細節都還在。" }}</p>
    </div>
    <p class="hearth-prompt">{{ beat < 3 ? prompts[beat] : "三次守燈以後，海明把日誌翻到下一頁。" }}</p>
    <div v-if="beat < 3" class="lamp-actions"><button v-for="action in actions" :key="action.id" class="quiet-button" type="button" @click="choose(action)">{{ action.label }}</button></div>
    <p class="tea-action-feedback" role="status">{{ feedback || "今晚還有時間聽他說。" }}</p>
    <div class="button-row"><span class="subtle">守燈 {{ beat }}/3</span><button v-if="beat" class="text-link" type="button" @click="game.updateLamp({ turns: [] })">重新調燈</button><button class="ornate-button" type="button" :disabled="beat < 3" @click="game.finishLamp">聽他接著說</button></div>
  </section>
</template>
