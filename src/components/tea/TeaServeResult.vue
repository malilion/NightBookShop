<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { flavorLabels } from "../../data/teaFlavor";
import { signatureRecipes, type GuestOrder } from "../../data/teaHouse";
import { reactionFor, stepKeys, stepLabels, wishWords, type BrewGrade } from "../../services/teaHouse";
import { tastingNotes } from "../../services/teaFlavor";
import { audio } from "../../audio/audioManager";
import { useSettingsStore } from "../../stores/settingsStore";
import type { TeaDraft } from "../../types/game";
import TeaObject from "./TeaObject.vue";
import FlavorRadar from "./FlavorRadar.vue";
import { teas } from "../../data/catalog";
const props = defineProps<{
  grade: BrewGrade;
  order: GuestOrder | null;
  draft: TeaDraft;
  liquorColor: string;
  newRecipe: string | null;
  rankUp: string | null;
  nextLabel: string;
}>();
const emit = defineEmits<{ next: [] }>();
const settings = useSettingsStore();
const dialog = ref<HTMLDialogElement>();
const timers: ReturnType<typeof setTimeout>[] = [];
let closed = false;
const recipe = computed(() => signatureRecipes.find((item) => item.id === props.grade.recipeId) ?? null);
const notes = computed(() => tastingNotes(props.grade.analysis, props.draft));
const reaction = computed(() =>
  props.order
    ? reactionFor(props.order, props.grade.stars)
    : props.grade.stars === 3
      ? "茶香停在杯緣。這一杯，只屬於今晚的妳。"
      : props.grade.stars > 0
        ? "一杯安靜的茶。下一杯，也許能再靠近一點。"
        : "茶湯還沒說完它想說的話。再試一次吧。",
);
// 完成度: every step that applies to this cup, in brewing order.
const bars = computed(() =>
  stepKeys
    .filter((key) => props.grade.steps[key] !== null)
    .map((key) => ({ key, label: stepLabels[key], value: props.grade.steps[key]! })),
);
const cupColor = computed(() => teas[props.grade.analysis.teas[0] ?? props.draft.teaId].color);
function next() {
  if (closed) return;
  closed = true;
  dialog.value?.close();
  emit("next");
}
onMounted(() => {
  dialog.value?.showModal();
  audio.cue("porcelain");
  for (let i = 0; i < props.grade.stars; i++)
    timers.push(setTimeout(() => audio.cue("chime"), settings.values.reducedMotion ? 0 : 450 + i * 320));
});
onBeforeUnmount(() => timers.forEach(clearTimeout));
</script>
<template>
  <dialog
    ref="dialog"
    class="serve-result modal-panel"
    aria-labelledby="serve-result-title"
    :data-stars="grade.stars"
    :data-score="grade.score"
    @cancel.prevent="next"
    @keydown.stop
  >
    <div class="serve-result-grid">
      <div class="serve-cup">
        <svg viewBox="-90 -100 180 160" aria-hidden="true">
          <g class="serve-steam">
            <path v-for="i in 3" :key="i" :d="`M${-18 + i * 9} -40q-12-16 0-30t0-28`" />
          </g>
          <TeaObject kind="cup" :fill="80" :liquor-color="liquorColor" :liquor-strength="1" :color="cupColor" />
        </svg>
        <p class="serve-stars" :aria-label="`${grade.stars} 顆星`">
          <span v-for="i in 3" :key="i" :class="{ lit: i <= grade.stars }" :style="{ animationDelay: `${0.45 + (i - 1) * 0.32}s` }">★</span>
        </p>
        <p class="serve-score"><strong>{{ grade.score }}</strong> 分</p>
      </div>
      <div class="serve-body">
        <p class="subtle">{{ order ? order.name : "自由茶席" }}</p>
        <h2 id="serve-result-title">{{ grade.title }}</h2>
        <blockquote class="serve-reaction">「{{ reaction }}」</blockquote>
        <div v-if="recipe" class="serve-recipe" :class="{ fresh: newRecipe === recipe.id }">
          <p>
            <span>{{ newRecipe === recipe.id ? "新茶譜 · 已收進茶譜" : "茶譜" }}</span>
            <strong>{{ recipe.name }}</strong>
          </p>
          <small v-if="newRecipe === recipe.id">{{ recipe.text }}</small>
        </div>
        <p v-if="rankUp" class="serve-rank">稱號提升：<strong>{{ rankUp }}</strong></p>
        <p class="serve-bars-title">完成度</p>
        <ul class="serve-bars" aria-label="完成度">
          <li v-for="bar in bars" :key="bar.key" :data-step="bar.key">
            <span>{{ bar.label }}</span>
            <span class="serve-bar" aria-hidden="true"><span :style="{ width: `${bar.value}%` }"></span></span>
            <span>{{ bar.value }}</span>
          </li>
        </ul>
        <ul v-if="grade.wishes.length" class="serve-wishes" aria-label="口味期望">
          <li v-for="wish in grade.wishes" :key="wish.axis" :class="{ met: wish.score === 100 }">
            {{ flavorLabels[wish.axis] }}{{ wishWords[wish.level] }} · {{ wish.value.toFixed(1) }}{{ wish.score === 100 ? " ✓" : "" }}
          </li>
          <li v-if="grade.requirementMet !== null" :class="{ met: grade.requirementMet }">
            特別要求{{ grade.requirementMet ? " ✓" : "未達成" }}
          </li>
        </ul>
        <details class="serve-details">
          <summary>品飲筆記與手法細項</summary>
          <p>香氣：{{ notes.aroma }}</p>
          <p>口感：{{ notes.palate }}</p>
          <p v-if="notes.finish">尾韻：{{ notes.finish }}</p>
          <p>提壺：{{ Math.floor(draft.seconds) }} 秒（最佳 {{ Math.round(grade.window[0]) }}–{{ Math.round(grade.window[1]) }} 秒）· 水溫 {{ Math.round(draft.temperature) }}°C{{ grade.analysis.stale ? " · 水煮老了" : "" }}{{ grade.analysis.masked ? " · 配料搶味" : "" }}</p>
          <FlavorRadar
            compact
            :profile="grade.analysis.profile"
            :wishes="order?.wishes ?? []"
            :color="liquorColor"
            :bitterness="grade.analysis.bitterness"
          />
        </details>
        <p class="serve-tip"><span>下一杯</span>{{ grade.tip }}</p>
      </div>
    </div>
    <div class="button-row serve-actions">
      <button class="ornate-button" autofocus @click="next">{{ nextLabel }}</button>
    </div>
  </dialog>
</template>
<style scoped>
.serve-result {
  width: min(880px, calc(100vw - 32px));
  max-width: 880px;
  max-height: calc(100dvh - 32px);
  padding: 28px;
}
.serve-result::backdrop {
  background: #070d17dc;
  backdrop-filter: blur(5px);
}
.serve-result-grid {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}
.serve-cup {
  text-align: center;
  padding: 12px 0;
  border: 1px solid var(--line);
  background: radial-gradient(ellipse at 50% 30%, #2a3a44, #121c26 70%);
}
.serve-cup svg {
  width: 100%;
  max-width: 220px;
  display: block;
  margin: 0 auto;
}
.serve-steam path {
  fill: none;
  stroke: #e9eee4;
  stroke-opacity: 0.35;
  stroke-width: 3;
  stroke-linecap: round;
  animation: serve-steam 3.2s ease-in-out infinite alternate;
}
.serve-steam path:nth-child(2) {
  animation-delay: 0.6s;
}
.serve-steam path:nth-child(3) {
  animation-delay: 1.2s;
}
@keyframes serve-steam {
  from {
    opacity: 0.25;
    transform: translateY(4px);
  }
  to {
    opacity: 0.9;
    transform: translateY(-8px);
  }
}
.serve-stars {
  margin: 4px 0 0;
  font-size: 34px;
  letter-spacing: 0.12em;
  color: #4a4f57;
}
.serve-stars span {
  display: inline-block;
}
.serve-stars .lit {
  color: #ffd98e;
  text-shadow: 0 0 14px #ffcf7a99;
  animation: star-pop 0.5s cubic-bezier(0.3, 1.6, 0.5, 1) both;
}
@keyframes star-pop {
  from {
    transform: scale(0.2) rotate(-30deg);
    opacity: 0;
  }
  to {
    transform: scale(1) rotate(0);
    opacity: 1;
  }
}
.serve-score {
  margin: 0;
  color: var(--muted);
}
.serve-score strong {
  font-size: 30px;
  color: var(--ink);
  font-weight: 400;
}
.serve-body h2 {
  margin: 4px 0 10px;
  font-size: 30px;
  letter-spacing: 0.12em;
  color: #ecd1a3;
}
.serve-reaction {
  margin: 0 0 16px;
  padding-left: 14px;
  border-left: 2px solid #bc9866;
  font-size: 17px;
  line-height: 1.85;
  color: #efe2c8;
}
.serve-recipe {
  margin: 0 0 14px;
  padding: 10px 14px;
  border: 1px solid #b79b7166;
  background: #f4d19a0b;
}
.serve-recipe p {
  display: flex;
  gap: 12px;
  align-items: baseline;
  margin: 0;
  color: #cdbd9c;
  font-size: 14px;
}
.serve-recipe strong {
  font-size: 20px;
  font-weight: 400;
  color: #f4dca5;
}
.serve-recipe.fresh {
  border-color: #ffd98e;
  background: #ffd98e1a;
  box-shadow: 0 0 24px #ffd98e22;
}
.serve-recipe small {
  display: block;
  margin-top: 6px;
  color: #e0d0b5;
  line-height: 1.7;
}
.serve-rank {
  margin: 0 0 14px;
  color: #ffd98e;
}
.serve-bars-title {
  margin: 0 0 6px;
  font-size: 13px;
  letter-spacing: 0.1em;
  color: var(--muted);
}
.serve-bars {
  display: grid;
  gap: 8px;
  margin: 0 0 12px;
  padding: 0;
  list-style: none;
}
.serve-bars li {
  display: grid;
  grid-template-columns: 5.5em 1fr 2.5em;
  gap: 12px;
  align-items: center;
  font-size: 14px;
  color: #d8ccb2;
}
.serve-bar {
  height: 8px;
  border-radius: 4px;
  background: #d7b68120;
  overflow: hidden;
}
.serve-bar > span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #a98a55, #f0d69c);
  animation: bar-fill 0.8s ease-out both;
  transform-origin: left;
}
@keyframes bar-fill {
  from {
    transform: scaleX(0);
  }
}
.serve-wishes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 12px;
  padding: 0;
  list-style: none;
}
.serve-wishes li {
  padding: 4px 10px;
  border: 1px solid #c0613f99;
  font-size: 13px;
  color: #efc9b6;
}
.serve-wishes li.met {
  border-color: #9fbf86;
  color: #d6ebc4;
}
.serve-details {
  margin: 0 0 12px;
  font-size: 14px;
  color: #d8ccb2;
}
.serve-details summary {
  min-height: 44px;
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--gold);
  text-decoration: underline;
  text-underline-offset: 5px;
}
.serve-details p {
  margin: 4px 0;
  line-height: 1.8;
}
.serve-details dl {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 4px 18px;
  margin: 10px 0;
}
.serve-details dl div {
  display: flex;
  justify-content: space-between;
}
.serve-details dt {
  color: #acaa9e;
}
.serve-details dd {
  margin: 0;
}
.serve-tip {
  display: flex;
  gap: 12px;
  margin: 0;
  padding: 10px 13px;
  border-left: 2px solid #bda06a;
  background: #bda06a16;
  color: #e0d0b5;
  font-size: 15px;
  line-height: 1.75;
}
.serve-tip span {
  flex: none;
  color: var(--gold);
}
.serve-actions {
  margin-top: 22px;
}
.reduce-motion .serve-stars .lit,
.reduce-motion .serve-bar > span,
.reduce-motion .serve-steam path {
  animation: none;
}
@media (prefers-reduced-motion: reduce) {
  .serve-stars .lit,
  .serve-bar > span,
  .serve-steam path {
    animation: none;
  }
}
@media (max-width: 720px) {
  .serve-result {
    padding: 16px;
  }
  .serve-result-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .serve-cup svg {
    max-width: 160px;
  }
  .serve-body h2 {
    font-size: 25px;
  }
  .serve-actions .ornate-button {
    width: 100%;
  }
}
</style>
