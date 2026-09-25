<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "../../stores/gameStore";
import { nightName } from "../../data/catalog";
import { openingNights, openingCounterNote, openingTeaNote } from "../../data/openingNight";
import type { OpeningTask } from "../../types/game";

const game = useGameStore();
const night = computed(() => openingNights[game.chapterId]);
const ready = computed(() => game.opening.inspected.length === 3);
const tasks: { id: OpeningTask; title: string; hint: string }[] = [
  { id: "counter", title: "整理櫃台", hint: "看看昨夜留下了什麼" },
  { id: "weather", title: "查看夜況", hint: "確認今晚能走進哪裡" },
  { id: "tea", title: "備好茶具", hint: "看看茶架還有什麼" },
];
function inspected(task: OpeningTask) {
  return game.opening.inspected.includes(task);
}
</script>

<template>
  <section class="opening-prep paper-frame" aria-label="每晚開店準備">
    <p class="opening-eyebrow">{{ nightName(game.chapterId) }} · 開店以前</p>
    <h1>先把燈留給今晚的人</h1>
    <p class="opening-lede">
      門鈴還沒響。妳可以先整理書店、看看窗外，再備好一杯茶。
    </p>
    <div class="opening-grid">
      <article v-for="task in tasks" :key="task.id" class="opening-task" :class="{ inspected: inspected(task.id) }">
        <button type="button" :aria-pressed="inspected(task.id)" @click="game.inspectOpening(task.id)">
          <span class="opening-task-count">{{ inspected(task.id) ? "✓" : `0${tasks.indexOf(task) + 1}` }}</span>
          <span><strong>{{ task.title }}</strong><small>{{ task.hint }}</small></span>
          <span class="opening-task-action">{{ inspected(task.id) ? "已查看" : "查看" }}</span>
        </button>
        <div v-if="inspected(task.id)" class="opening-reveal">
          <template v-if="task.id === 'counter'">
            <p>{{ openingCounterNote(game.previousEndingId) }}</p>
          </template>
          <template v-else-if="task.id === 'weather'">
            <p>{{ night.sky }}</p>
            <p>{{ night.area }}</p>
            <p>{{ night.event }}</p>
          </template>
          <template v-else>
            <p>{{ openingTeaNote(game.chapterId) }}</p>
          </template>
        </div>
      </article>
    </div>
    <div class="opening-footer">
      <p aria-live="polite">已準備 {{ game.opening.inspected.length }}/3 項</p>
      <button class="ornate-button" type="button" :disabled="!ready" @click="game.finishOpening()">
        開門迎接今晚的訪客
      </button>
    </div>
  </section>
</template>

<style scoped>
.opening-prep {
  position: relative;
  z-index: 1;
  width: min(900px, 100%);
  max-height: calc(100dvh - 155px);
  overflow: auto;
  margin: 6px auto 14px;
  padding: clamp(22px, 3vw, 36px);
}
.opening-eyebrow {
  margin: 0 0 8px;
  color: #d7b980;
  font-size: 12px;
  letter-spacing: .2em;
}
h1 {
  margin: 0;
  font-size: clamp(25px, 3.2vw, 38px);
  font-weight: 500;
  letter-spacing: .08em;
}
.opening-lede {
  margin: 10px 0 24px;
  color: #d3c8b8;
  line-height: 1.8;
}
.opening-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}
.opening-task {
  min-width: 0;
  border: 1px solid #b99b704e;
  background: #17202bcc;
}
.opening-task.inspected { border-color: #c8a36f; }
.opening-task button {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  min-height: 86px;
  padding: 16px 14px;
  border: 0;
  background: transparent;
  color: #f2e9db;
  text-align: left;
  cursor: pointer;
}
.opening-task button:focus-visible { outline: 2px solid #eed2a5; outline-offset: -4px; }
.opening-task-count { color: #d5b581; min-width: 25px; }
.opening-task strong { display: block; font-size: 17px; font-weight: 500; }
.opening-task small { display: block; margin-top: 5px; color: #bcb1a3; font-size: 11px; line-height: 1.5; }
.opening-task-action { margin-left: auto; color: #d5b581; font-size: 11px; white-space: nowrap; }
.opening-reveal {
  padding: 0 14px 15px;
  color: #e4d8c8;
  font-size: 13px;
  line-height: 1.8;
}
.opening-reveal p { margin: 0 0 8px; }
.opening-reveal p:last-child { margin-bottom: 0; }
.opening-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 22px;
}
.opening-footer p { margin: 0; color: #d6c4ac; font-size: 13px; }
.opening-footer .ornate-button:disabled { opacity: .45; cursor: not-allowed; }
@media (max-width: 700px) {
  .opening-prep { max-height: none; overflow: visible; }
  .opening-grid { grid-template-columns: 1fr; gap: 8px; }
  .opening-task button { min-height: 64px; }
  .opening-footer { align-items: stretch; flex-direction: column; }
  .opening-footer .ornate-button { justify-content: center; }
}
</style>
