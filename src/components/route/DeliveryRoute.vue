<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "../../stores/gameStore";
import { scoreRoute } from "../../services/routeScoring";
import { deliveryRouteScene, deliveryRouteScenes } from "../../data/deliveryRouteNarrative";
import type { RouteDraft } from "../../types/game";

const game = useGameStore();
const stage = computed(() => game.route.stops.length);
const score = computed(() => scoreRoute(game.route));
const stops: { id: RouteDraft["stops"][number]; label: string }[] = [
  { id: "post-office", label: "已拆除的老郵局" },
  { id: "last-bus", label: "末班公車站" },
  { id: "empty-shop", label: "鎖住的空店面" },
  { id: "bookshop-door", label: "夜行書店門外" },
];
function choose(id: RouteDraft["stops"][number]) {
  if (stage.value >= 3 || game.route.stops.includes(id)) return;
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
    <p v-if="stage < 3" class="route-clue"><strong>{{ deliveryRouteScenes[stage]!.clue }}</strong> {{ deliveryRouteScenes[stage]!.prompt }}</p>
    <p v-else class="route-clue">三段地址走完了。信封又把你們帶回夜行書店。</p>
    <div v-if="stage < 3" class="route-actions">
      <button v-for="stop in stops" :key="stop.id" class="quiet-button" type="button" :disabled="game.route.stops.includes(stop.id)" @click="choose(stop.id)">{{ stop.label }}</button>
    </div>
    <ol class="route-log" aria-live="polite">
      <li v-for="(id, index) in game.route.stops" :key="index">
        <strong>第 {{ index + 1 }} 站 · {{ stops.find((stop) => stop.id === id)?.label }} · {{ deliveryRouteScene(index, id).matchesClue ? "線索吻合" : "另一種可能" }}</strong>
        <span>{{ deliveryRouteScene(index, id).text }}</span>
      </li>
    </ol>
    <div class="button-row">
      <span class="subtle">已選 {{ stage }}/3 · 找到 {{ score.correct }} 條地址線索</span>
      <button v-if="stage" class="text-link" type="button" @click="game.updateRoute({ stops: [] })">重新看地圖</button>
      <button class="ornate-button" type="button" :disabled="stage < 3" @click="game.finishRoute">帶著信回到書店</button>
    </div>
  </section>
</template>
