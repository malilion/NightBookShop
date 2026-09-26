<script setup lang="ts">
import { computed, ref } from "vue";
import { useGameStore } from "../../stores/gameStore";
import { archiveConnections, connectionBetween, scoreArchive } from "../../services/archiveScoring";
import type { ArchiveDraft } from "../../types/game";

const game = useGameStore();
const score = computed(() => scoreArchive(game.archive));
const selected = ref<ArchiveDraft["inspected"][number] | null>(null);
const feedback = ref("先翻看紙背，再依共同的人、地點或旋律，依序選取相連的兩張紙。");
const records: { id: ArchiveDraft["inspected"][number]; name: string; front: string; back: string }[] = [
  { id: "jinglan", name: "靜蘭 · 舊信", front: "五十年前的藍色信封", back: "水痕指向書店舊門牌。她曾在校刊室聽見四個音。" },
  { id: "boyan", name: "柏言 · 草稿", front: "早了七年的草稿日期", back: "摺線剛好接上靜蘭的信；柏言的母親保存過她的舊校刊。" },
  { id: "ruoyin", name: "若音 · 樂譜", front: "八音盒的四個音", back: "譜角的月亮與書店相同；她曾在柏言公司的尾牙演奏，那段旋律後來又出現在燈塔。" },
  { id: "yenuan", name: "葉暖 · 食譜", front: "比葉暖出生更早的日期", back: "油漬與下一封信的雨痕相合；卡片曾由雨航的父親投遞。" },
  { id: "yuhang", name: "雨航 · 郵戳", front: "七年後的郵戳", back: "郵戳中心是書店門牌；妹妹旅行時曾到海明的燈塔。" },
  { id: "haiming", name: "海明 · 照片", front: "海上倒映的書店", back: "岸邊有小時候的林澄，照片背後仍留著同一段旋律。" },
];
const recordName = (id: ArchiveDraft["inspected"][number]) => records.find((record) => record.id === id)!.name;
function inspect(id: ArchiveDraft["inspected"][number]) {
  if (!game.archive.inspected.includes(id)) {
    game.updateArchive({ inspected: [...game.archive.inspected, id] });
    feedback.value = `翻開了${recordName(id)}。再選一次，可拿它與另一張紙比對。`;
    return;
  }
  if (!selected.value) {
    selected.value = id;
    feedback.value = `已拿起${recordName(id)}。選另一張紙，看看線索能否接上。`;
    return;
  }
  if (selected.value === id) {
    selected.value = null;
    feedback.value = "已放回這張紙。可以重新選擇。";
    return;
  }
  const connection = connectionBetween(selected.value, id);
  selected.value = null;
  if (!connection) {
    feedback.value = "這兩張紙的痕跡還接不起來。看看背面的名字、地點與旋律，再試另一組。";
    return;
  }
  if (game.archive.connections.includes(connection.id)) {
    feedback.value = "這一組已經接上了。再找其他紙背的共同線索。";
    return;
  }
  game.updateArchive({ connections: [...game.archive.connections, connection.id] });
  feedback.value = connection.explanation;
}
</script>

<template>
  <section class="archive-panel paper-frame" aria-label="六夜故事地圖">
    <div class="panel-heading"><span class="route-mark" aria-hidden="true">☾</span><div><p class="subtle">終章 · 林澄</p><h2>把六夜的痕跡攤開</h2></div></div>
    <p class="tea-clue">翻看六位訪客留下的紙，再選兩張有共同線索的紙接起來。五段關係連成一條路，才找得到地圖中心；翻頁與連線都會保存。</p>
    <div class="archive-grid">
      <button v-for="record in records" :key="record.id" class="archive-record" :class="{ inspected: game.archive.inspected.includes(record.id), selected: selected === record.id }" type="button" :aria-pressed="selected === record.id" @click="inspect(record.id)">
        <span class="archive-record-name">{{ record.name }}</span>
        <strong>{{ record.front }}</strong>
        <span v-if="game.archive.inspected.includes(record.id)" class="archive-record-back">{{ record.back }}</span>
        <span v-else class="archive-record-hint">翻到背面</span>
      </button>
    </div>
    <p class="archive-feedback" role="status" aria-live="polite">{{ feedback }}</p>
    <div class="archive-connections" aria-label="已接上的紙背線索">
      <p class="subtle">已接上的線索 · {{ score.connected }}/5</p>
      <ol v-if="score.connected">
        <li v-for="connection in archiveConnections.filter((item) => game.archive.connections.includes(item.id))" :key="connection.id">
          <strong>{{ recordName(connection.first) }} ↔ {{ recordName(connection.second) }}</strong>
          <span>{{ connection.explanation }}</span>
        </li>
      </ol>
      <p v-else class="subtle">還沒有接上的紙。選兩張已翻面的紙比對。</p>
    </div>
    <figure v-if="score.complete" class="archive-map-reveal">
      <svg class="archive-map-art" viewBox="0 0 720 330" role="img" aria-label="六張紙背的摺痕拼成城市地圖，夜行書店位於中心">
        <g fill="#d9c8a7" stroke="#9e8764" stroke-width="2">
          <rect x="12" y="12" width="228" height="150" /><rect x="246" y="12" width="228" height="150" /><rect x="480" y="12" width="228" height="150" />
          <rect x="12" y="168" width="228" height="150" /><rect x="246" y="168" width="228" height="150" /><rect x="480" y="168" width="228" height="150" />
        </g>
        <g fill="none" stroke="#8c7354" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".7">
          <path d="M35 88 L150 77 L254 116 L360 165 L466 124 L581 81 L685 96" />
          <path d="M57 266 L150 230 L250 205 L360 165 L468 215 L568 244 L676 272" />
          <path d="M150 38 L176 132 L158 230 L173 295 M558 33 L544 128 L568 244 L550 301" />
        </g>
        <g fill="none" stroke="#b29365" stroke-width="2" stroke-dasharray="6 6" opacity=".85">
          <path d="M41 150 L225 40 M284 32 L447 140 M506 146 L682 40 M38 286 L207 185 M282 303 L450 185 M501 188 L683 294" />
        </g>
        <circle cx="360" cy="165" r="32" fill="#30403c" stroke="#f6d18a" stroke-width="4" />
        <text x="360" y="158" text-anchor="middle" fill="#f7d99e" font-size="23">☾</text>
        <text x="360" y="179" text-anchor="middle" fill="#f7d99e" font-size="11">夜行書店</text>
      </svg>
      <figcaption>六封信的水痕、油漬與摺線在這裡會合。書店一直在這座城的中心。</figcaption>
    </figure>
    <p class="archive-center" :class="{ complete: score.complete }">{{ score.complete ? "五段線索連起六封信，中心正是夜行書店。" : `已查看 ${score.count}/6 張，接上 ${score.connected}/5 段。地圖的中心還藏在摺線裡。` }}</p>
    <div class="button-row"><span class="subtle">{{ score.count }} / 6 張記錄 · {{ score.connected }} / 5 段連線</span><button class="ornate-button" type="button" :disabled="!score.complete" @click="game.finishArchive">走進地圖中心</button></div>
  </section>
</template>
