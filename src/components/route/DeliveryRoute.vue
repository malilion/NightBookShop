<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "../../stores/gameStore";
import { scoreRoute } from "../../services/routeScoring";
import type { RouteDraft } from "../../types/game";

const game = useGameStore();
const stage = computed(() => game.route.stops.length);
const score = computed(() => scoreRoute(game.route));
const prompts = [
  { clue: "郵戳上的舊區碼", text: "郵戳刻著已停用的區碼。收件地址被雨沖淡，只剩一個「郵」字。" },
  { clue: "長長的雨痕", text: "第二道雨痕像末班車的路線。派送簿裡，休假申請被一條線又一條線劃掉。" },
  { clue: "背面的字跡", text: "第三個地址用雨航自己的筆跡寫成。那是一間七年前就租下、卻沒有開門的店。" },
] as const;
const stops: { id: RouteDraft["stops"][number]; label: string; detour: string }[] = [
  { id: "post-office", label: "已拆除的老郵局", detour: "郵局的牆早已拆去；他曾和妹妹在這裡寫開店計畫。" },
  { id: "last-bus", label: "末班公車站", detour: "車站的站牌還在，他有七年沒有搭車去旅行。" },
  { id: "empty-shop", label: "鎖住的空店面", detour: "租約早過期了，他卻一直留著那把鑰匙。" },
  { id: "bookshop-door", label: "夜行書店門外", detour: "書店門邊有他的簽收印章。他一直記得別人的地址。" },
];
function choose(id: RouteDraft["stops"][number]) {
  if (stage.value >= 3) return;
  game.updateRoute({ stops: [...game.route.stops, id] });
}
</script>

<template>
  <section class="route-panel paper-frame" aria-label="藍色信的投遞路線">
    <div class="panel-heading">
      <span class="route-mark" aria-hidden="true">✉</span>
      <div><p class="subtle">第五夜 · 程雨航</p><h2>沿著郵戳，找三個地址</h2></div>
    </div>
    <p class="tea-clue">每個線索選一個投遞地點。走錯路也會找到他曾經避開的生活；路線會保存在這個瀏覽器。</p>
    <div class="route-map" role="img" aria-label="雨夜裡的城市投遞地圖">
      <span v-for="stop in stops" :key="stop.id" class="route-map-stop">{{ stop.label }}</span>
    </div>
    <p v-if="stage < 3" class="route-clue"><strong>{{ prompts[stage]!.clue }}</strong> {{ prompts[stage]!.text }}</p>
    <p v-else class="route-clue">三段地址走完了。信封又把你們帶回夜行書店。</p>
    <div v-if="stage < 3" class="route-actions">
      <button v-for="stop in stops" :key="stop.id" class="quiet-button" type="button" @click="choose(stop.id)">{{ stop.label }}</button>
    </div>
    <ol class="route-log" aria-live="polite">
      <li v-for="(id, index) in game.route.stops" :key="index">
        <strong>第 {{ index + 1 }} 站 · {{ stops.find((stop) => stop.id === id)?.label }}</strong>
        <span>{{ stops.find((stop) => stop.id === id)?.detour }}</span>
      </li>
    </ol>
    <div class="button-row">
      <span class="subtle">已選 {{ stage }}/3 · 找到 {{ score.correct }} 條地址線索</span>
      <button v-if="stage" class="text-link" type="button" @click="game.updateRoute({ stops: [] })">重新看地圖</button>
      <button class="ornate-button" type="button" :disabled="stage < 3" @click="game.finishRoute">帶著信回到書店</button>
    </div>
  </section>
</template>
