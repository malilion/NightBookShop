<script setup lang="ts">
import { computed, ref } from "vue";
import { useGameStore } from "../../stores/gameStore";
import { scoreHearth } from "../../services/hearthScoring";
import type { HearthDraft } from "../../types/game";

const game = useGameStore();
const result = computed(() => scoreHearth(game.hearth));
const beat = computed(() => game.hearth.responses.length);
const feedback = ref("");
const prompts = [
  "葉暖把焦掉的麵包藏進籃底，說「只是烤過頭」。她正在等妳如何回應。",
  "她說活動那晚電話一直響，自己一次次想「再五分鐘」。爐火正慢慢變旺。",
  "她看見母親最後一則語音，手停在播放鍵上。烤箱裡只剩微弱的光。",
] as const;
const actions: { id: HearthDraft["responses"][number]; label: string; response: string }[] = [
  { id: "rush", label: "催她快點說完", response: "妳催她說下去。火舌竄高，她的話也急急收住。" },
  { id: "silence", label: "一直不回應", response: "妳沒有出聲，也沒有給她停頓的邊界。火漸漸低下來。" },
  { id: "wait", label: "陪她等一口氣", response: "妳讓她先把麵包放好。火小了一點，還留著暖意。" },
  { id: "ask", label: "問她願不願意接著說", response: "妳問她想不想繼續。她看著火光，自己挑了下一句。" },
];
function choose(action: (typeof actions)[number]) {
  if (beat.value >= 3) return;
  game.updateHearth({ responses: [...game.hearth.responses, action.id] });
  feedback.value = action.response;
}
function restart() {
  game.updateHearth({ responses: [] });
  feedback.value = "妳把爐火調回溫火，重新聽她說。";
}
</script>

<template>
  <section class="hearth-panel paper-frame" aria-label="爐邊傾聽">
    <div class="panel-heading">
      <span class="hearth-mark" aria-hidden="true">♨</span>
      <div>
        <p class="subtle">第四夜 · 葉暖</p>
        <h2>替這段話留一點火</h2>
      </div>
    </div>
    <p class="tea-clue">
      催促會讓火過旺；長久不回應，火也會熄。陪她停一下，再問她願不願意說，讓火保持溫暖。
    </p>
    <div class="hearth-visual" :data-heat="result.heat">
      <div class="hearth-window">
        <span class="hearth-flame" :style="{ height: `${Math.max(12, result.heat)}%` }" aria-hidden="true"></span>
      </div>
      <div class="hearth-heat">
        <span>微火</span>
        <div class="hearth-gauge" role="meter" aria-label="爐火溫度" :aria-valuenow="result.heat" aria-valuemin="0" aria-valuemax="100">
          <span :style="{ width: `${result.heat}%` }"></span>
        </div>
        <span>過旺</span>
      </div>
      <p>{{ result.heat < 30 ? "火快熄了，葉暖把話收回去。" : result.heat > 70 ? "火太旺了，她急著把話說成沒事。" : "爐火還暖著，她可以照自己的步調說。" }}</p>
    </div>
    <p class="hearth-prompt">
      {{ beat < 3 ? prompts[beat] : "三次停頓以後，葉暖看了看爐裡的光。接下來，讓她自己決定要不要打開食譜。" }}
    </p>
    <div v-if="beat < 3" class="hearth-actions">
      <button
        v-for="action in actions"
        :key="action.id"
        type="button"
        class="quiet-button"
        @click="choose(action)"
      >{{ action.label }}</button>
    </div>
    <p class="tea-action-feedback" role="status">{{ feedback || "還有時間聽她說。" }}</p>
    <div class="button-row">
      <span class="subtle">談話 {{ beat }}/3</span>
      <button v-if="beat" class="text-link" type="button" @click="restart">重新聽這段</button>
      <button class="ornate-button" type="button" :disabled="beat < 3" @click="game.finishHearth">讓她繼續說</button>
    </div>
  </section>
</template>
