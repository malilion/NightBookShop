<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "../../stores/gameStore";
import type { WorkNotification } from "../../types/game";

const game = useGameStore();
const messages: { id: WorkNotification; sender: string; subject: string; action: string }[] = [
  { id: "manager", sender: "主管", subject: "明早八點的簡報，記得先補最後三頁。", action: "暫停主管提醒" },
  { id: "teammate", sender: "同事", subject: "交接表還有一欄空白，今晚能幫我看嗎？", action: "暫停同事訊息" },
  { id: "system", sender: "工作系統", subject: "待回覆通知已累積至二十七則。", action: "暫停系統通知" },
];
const paused = computed(() => game.notifications.paused);
const allPaused = computed(() => paused.value.length === messages.length);

function pause(id: WorkNotification) {
  if (paused.value.includes(id)) return;
  game.updateNotifications({ paused: [...paused.value, id] });
}
</script>

<template>
  <section class="notification-panel paper-frame" aria-label="整理列車上的通知">
    <div class="panel-heading">
      <span class="notification-mark" aria-hidden="true">◌</span>
      <div><p class="subtle">第二夜 · 沒有終點的列車</p><h2>讓車廂安靜一會</h2></div>
    </div>
    <p class="tea-clue">這些工作訊息可以明天再處理。由柏言逐則暫停；母親的私人訊息留在原處，由他決定是否現在回覆。</p>
    <div class="notification-phone">
      <div class="notification-phone-header"><span>23:47</span><span>工作通知 {{ messages.length - paused.length }} 則</span></div>
      <div class="notification-list">
        <article v-for="message in messages" :key="message.id" class="notification-card" :class="{ 'notification-card-paused': paused.includes(message.id) }" role="group" :aria-label="`${message.sender}的工作通知`">
          <div><span class="notification-sender">{{ message.sender }}</span><p>{{ message.subject }}</p></div>
          <button class="quiet-button" type="button" :disabled="paused.includes(message.id)" @click="pause(message.id)">{{ paused.includes(message.id) ? "已暫停" : message.action }}</button>
        </article>
        <article class="notification-card notification-card-personal" role="group" aria-label="母親的私人訊息">
          <div><span class="notification-sender">母親</span><p>明天有空講電話嗎？</p></div>
          <button class="quiet-button" type="button" :disabled="game.notifications.repliedMother" @click="game.updateNotifications({ repliedMother: true })">{{ game.notifications.repliedMother ? "已回覆，明天先去看醫生" : "回覆：明天先去看醫生" }}</button>
        </article>
      </div>
    </div>
    <p class="tea-action-feedback" role="status">{{ allPaused ? "工作通知都安靜了。柏言終於看見車窗上的一行字。" : `已暫停 ${paused.length}／${messages.length} 則工作通知；母親的訊息不會被一起關掉。` }}</p>
    <div class="button-row"><span class="subtle">今晚的界線由柏言自己設定</span><button class="ornate-button" type="button" :disabled="!allPaused" @click="game.finishNotifications">收起手機，看向車窗</button></div>
  </section>
</template>
