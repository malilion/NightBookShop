<script setup lang="ts">
import { computed, ref } from "vue";
import { signatureRecipes } from "../../data/teaHouse";
import type { TeaHouseSession } from "../../types/teaHouse";
import { resolveOrder, shareText, starLine } from "../../services/teaHouse";
import { nightTotals } from "../../services/teaHouseProgress";
const props = defineProps<{
  session: TeaHouseSession;
  rank: string;
  records: { nightBest: boolean; dailyBest: boolean };
}>();
const emit = defineEmits<{ again: []; lobby: [] }>();
const copied = ref("");
const rows = computed(() =>
  props.session.results.map((result, i) => ({
    ...result,
    name: resolveOrder(result.orderId)?.name ?? `第 ${i + 1} 位客人`,
    recipe: signatureRecipes.find((recipe) => recipe.id === result.recipeId)?.name ?? "",
  })),
);
const totals = computed(() => nightTotals(props.session));
const text = computed(() =>
  shareText({ daily: props.session.kind === "daily" ? props.session.date : null, results: props.session.results, rank: props.rank }),
);
async function share() {
  try {
    await navigator.clipboard.writeText(text.value);
    copied.value = "已複製成績，可以貼給朋友。";
  } catch {
    copied.value = "無法直接複製；可以選取下方文字。";
  }
}
</script>
<template>
  <section class="night-summary paper-frame" aria-labelledby="night-summary-title">
    <p class="subtle">{{ session.kind === "daily" ? `今日茶單 · ${session.date}` : "夜間營業" }}</p>
    <h2 id="night-summary-title">今晚打烊了。</h2>
    <p class="night-total" :aria-label="`共 ${totals.stars} 顆星，滿分 ${session.results.length * 3} 顆`">
      <span>★</span> {{ totals.stars }}<small>／{{ session.results.length * 3 }}</small>
      <em>{{ totals.score }} 分</em>
    </p>
    <p v-if="records.dailyBest || records.nightBest" class="night-records">
      <span v-if="records.dailyBest">今日茶單新紀錄</span>
      <span v-if="records.nightBest">個人最佳一夜</span>
    </p>
    <ol class="night-rows">
      <li v-for="(row, i) in rows" :key="i">
        <span class="night-guest">{{ row.name }}</span>
        <span class="night-stars" :aria-label="`${row.stars} 顆星`">{{ starLine(row.stars) }}</span>
        <span class="night-score">{{ row.score }} 分</span>
        <span class="night-recipe">{{ row.recipe }}</span>
      </li>
    </ol>
    <p class="subtle">目前稱號：{{ rank }}</p>
    <div class="button-row">
      <button class="ornate-button" @click="emit('again')">{{ session.kind === "daily" ? "再挑戰今日茶單" : "再開一夜" }}</button>
      <button class="quiet-button" @click="share">複製成績</button>
      <button class="quiet-button" @click="emit('lobby')">回到茶席入口</button>
    </div>
    <p v-if="copied" class="night-copied" role="status">{{ copied }}</p>
    <pre v-if="copied" class="night-share">{{ text }}</pre>
  </section>
</template>
<style scoped>
.night-summary {
  width: min(760px, 100%);
  margin: 0 auto;
  text-align: center;
}
.night-summary h2 {
  margin: 6px 0 10px;
  font-size: 32px;
  font-weight: 400;
  letter-spacing: 0.16em;
}
.night-total {
  margin: 0 0 8px;
  font-size: 44px;
  color: var(--ink);
}
.night-total > span {
  color: #ffd98e;
}
.night-total small {
  font-size: 20px;
  color: var(--muted);
}
.night-total em {
  display: block;
  font-size: 15px;
  font-style: normal;
  color: var(--muted);
}
.night-records {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 8px 0 14px;
}
.night-records span {
  padding: 4px 12px;
  border: 1px solid #ffd98e;
  color: #ffd98e;
  font-size: 14px;
}
.night-rows {
  margin: 18px 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--line);
  text-align: left;
}
.night-rows li {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) auto 4.5em minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  padding: 10px 4px;
  border-bottom: 1px solid var(--line);
}
.night-stars {
  color: #ffd98e;
  letter-spacing: 0.1em;
}
.night-score {
  color: var(--muted);
  text-align: right;
}
.night-recipe {
  color: #f4dca5;
  font-size: 14px;
}
.night-copied {
  margin: 14px 0 0;
  color: var(--gold);
}
.night-share {
  display: inline-block;
  margin: 10px auto 0;
  padding: 12px 16px;
  border: 1px dashed var(--line);
  text-align: left;
  font-family: inherit;
  white-space: pre-wrap;
  user-select: all;
}
@media (max-width: 640px) {
  .night-rows li {
    grid-template-columns: 1fr auto;
  }
  .night-score,
  .night-recipe {
    text-align: left;
  }
  .night-summary .button-row > * {
    width: 100%;
  }
}
</style>
