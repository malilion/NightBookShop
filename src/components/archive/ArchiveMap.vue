<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "../../stores/gameStore";
import { scoreArchive } from "../../services/archiveScoring";
import type { ArchiveDraft } from "../../types/game";

const game = useGameStore();
const score = computed(() => scoreArchive(game.archive));
const records: { id: ArchiveDraft["inspected"][number]; name: string; front: string; back: string }[] = [
  { id: "jinglan", name: "靜蘭 · 舊信", front: "五十年前的藍色信封", back: "水痕指向書店舊門牌。她曾在校刊室聽見四個音。" },
  { id: "boyan", name: "柏言 · 草稿", front: "早了七年的草稿日期", back: "摺線剛好接上靜蘭的信；柏言的母親保存過她的舊校刊。" },
  { id: "ruoyin", name: "若音 · 樂譜", front: "八音盒的四個音", back: "譜角的月亮與書店相同；她曾在柏言公司的尾牙演奏。" },
  { id: "yenuan", name: "葉暖 · 食譜", front: "比葉暖出生更早的日期", back: "油漬與下一封信的雨痕相合；卡片曾由雨航的父親投遞。" },
  { id: "yuhang", name: "雨航 · 郵戳", front: "七年後的郵戳", back: "郵戳中心是書店門牌；妹妹旅行時曾到海明的燈塔。" },
  { id: "haiming", name: "海明 · 照片", front: "海上倒映的書店", back: "岸邊有小時候的林澄，照片背後仍留著同一段旋律。" },
];
function inspect(id: ArchiveDraft["inspected"][number]) {
  if (game.archive.inspected.includes(id)) return;
  game.updateArchive({ inspected: [...game.archive.inspected, id] });
}
</script>

<template>
  <section class="archive-panel paper-frame" aria-label="六夜故事地圖">
    <div class="panel-heading"><span class="route-mark" aria-hidden="true">☾</span><div><p class="subtle">終章 · 林澄</p><h2>把六夜的痕跡攤開</h2></div></div>
    <p class="tea-clue">翻看六位訪客留下的紙，水痕、油漬與摺線會慢慢接成地圖。每張紙都由妳親手查看，進度會保存。</p>
    <div class="archive-grid">
      <button v-for="record in records" :key="record.id" class="archive-record" :class="{ inspected: game.archive.inspected.includes(record.id) }" type="button" @click="inspect(record.id)">
        <span class="archive-record-name">{{ record.name }}</span>
        <strong>{{ record.front }}</strong>
        <span v-if="game.archive.inspected.includes(record.id)" class="archive-record-back">{{ record.back }}</span>
        <span v-else class="archive-record-hint">翻到背面</span>
      </button>
    </div>
    <p class="archive-center" :class="{ complete: score.complete }">{{ score.complete ? "六條痕跡接在一起，中心正是夜行書店。" : `已查看 ${score.count}/6 張。地圖的中心還藏在摺線裡。` }}</p>
    <div class="button-row"><span class="subtle">{{ score.count }} / 6 張記錄</span><button class="ornate-button" type="button" :disabled="!score.complete" @click="game.finishArchive">走進地圖中心</button></div>
  </section>
</template>
