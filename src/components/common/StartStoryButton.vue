<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "../../stores/gameStore";
import GameIcon from "./GameIcon.vue";
import type { PlayableChapterId } from "../../data/catalog";
const props = defineProps<{ label?: string; secondary?: boolean; chapter?: PlayableChapterId }>();
const game = useGameStore(),
  router = useRouter(),
  dialog = ref<HTMLDialogElement>();
async function start() {
  dialog.value?.close();
  if (await game.start(props.chapter)) await router.push("/game");
}
function ask() {
  if (game.latest) dialog.value?.showModal();
  else void start();
}
</script>
<template>
  <button
    :class="secondary ? 'quiet-button' : 'ornate-button'"
    :disabled="game.busy"
    @click="ask"
  >
    <GameIcon name="moon" />{{ game.busy ? "正在開門……" : label || "開始故事"
    }}<GameIcon name="arrow" />
  </button>
  <dialog ref="dialog" class="modal-panel">
    <h2>再從第一頁開始？</h2>
    <p>
      目前故事會重新開始。手動存檔與已收集的書籤會保留，自動存檔會隨新的進度輪替。
    </p>
    <div class="button-row">
      <button class="ornate-button" @click="start">開始新的一夜</button
      ><button class="quiet-button" autofocus @click="dialog?.close()">
        留在這一頁
      </button>
    </div>
  </dialog>
</template>
