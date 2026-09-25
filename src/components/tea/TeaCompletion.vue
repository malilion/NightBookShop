<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useSettingsStore } from "../../stores/settingsStore";
import { useGameStore } from "../../stores/gameStore";
import TeaFilm from "./TeaFilm.vue";
defineProps<{ teaName: string; liquorColor: string }>();
const emit = defineEmits<{ done: [] }>();
const settings = useSettingsStore();
const game = useGameStore();
const dialog = ref<HTMLDialogElement>();
let finished = false;
function finish() {
  if (finished) return;
  finished = true;
  dialog.value?.close();
  emit("done");
}
onMounted(() => dialog.value?.showModal());
</script>
<template>
  <dialog
    ref="dialog"
    class="tea-completion modal-panel"
    aria-labelledby="tea-completion-title"
    @cancel.prevent="finish"
    @keydown.stop
  >
    <header class="tea-completion-heading">
      <p class="subtle">{{ teaName }} · 茶已備好</p>
      <h2 id="tea-completion-title">把這一杯，放到{{ game.chapterId === "boyan" ? "他" : "她" }}面前。</h2>
    </header>
    <TeaFilm
      clip="complete"
      :loop="false"
      :liquor-color="liquorColor"
      @ended="finish"
    />
    <footer class="tea-completion-footer">
      <p>熱氣慢慢升起，故事還有時間。</p>
      <button class="ornate-button" autofocus @click="finish">
        {{ settings.values.reducedMotion ? "繼續故事" : "略過動畫，繼續故事" }}
      </button>
    </footer>
  </dialog>
</template>
