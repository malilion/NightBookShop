<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useGameStore } from "./stores/gameStore";
import { useSettingsStore } from "./stores/settingsStore";
import { audio } from "./audio/audioManager";
import { registerSW } from "virtual:pwa-register";
const game = useGameStore();
const settings = useSettingsStore();
const route = useRoute();
const ready = ref(false);
const updateAvailable = ref(false);
const update = registerSW({
  onNeedRefresh() {
    updateAvailable.value = true;
  },
});
onMounted(async () => {
  await Promise.all([game.init(), settings.init()]);
  ready.value = true;
  window.addEventListener("pointerdown", enableAudio, { capture: true });
  window.addEventListener("keydown", enableAudio, { capture: true });
  document.addEventListener("visibilitychange", updateVisibility);
  updateVisibility();
});
onBeforeUnmount(() => {
  window.removeEventListener("pointerdown", enableAudio, true);
  window.removeEventListener("keydown", enableAudio, true);
  document.removeEventListener("visibilitychange", updateVisibility);
  audio.setScene(null);
  audio.setMusic(null);
});
function enableAudio() {
  audio.start();
}
function updateVisibility() {
  audio.setVisible(!document.hidden);
}
watch(
  () => settings.values,
  (values) =>
    audio.setPreferences({
      muted: values.muted,
      bgmVolume: values.bgmVolume,
      ambienceVolume: values.ambienceVolume,
      sfxVolume: values.sfxVolume,
    }),
  { deep: true, immediate: true },
);
watch(
  () => [route.name, game.frame?.scene],
  () => {
    if (route.name === "tea") audio.setScene("rain");
    else if (route.name !== "game" || !game.frame) audio.setScene(null);
    else
      audio.setScene(
        game.frame.scene === "memory" || game.frame.scene === "moon-sea"
          ? "room"
          : "rain",
      );
  },
  { immediate: true },
);
// 書店主題曲在標題與選單；每夜有自己的曲子，記憶與結局的月海各有一首，午夜茶席另一首。
watch(
  () => [route.name, game.frame?.scene, game.chapterId],
  () => {
    if (route.name === "tea") audio.setMusic("midnight-tea");
    else if (route.name !== "game" || !game.frame) audio.setMusic("theme");
    else if (game.frame.scene === "memory") audio.setMusic("memory");
    else if (game.frame.scene === "moon-sea") audio.setMusic("ending");
    else audio.setMusic(game.chapterId);
  },
  { immediate: true },
);
watch(
  () => game.frame?.section,
  (section, previous) => {
    if (previous === "prologue" && section === "arrival") audio.cue("bell");
  },
);
function focusMain() {
  document.getElementById("main")?.focus();
}
// 音效字幕：最近一個聲音停留兩秒半；同時有好幾個聲音時保留最新的兩則。
const captions = ref<{ id: number; text: string }[]>([]);
let captionId = 0;
const stopCaptions = audio.onCaption((text) => {
  if (!settings.values.captions) return;
  const id = ++captionId;
  captions.value = [...captions.value.filter((c) => c.text !== text), { id, text }].slice(-2);
  window.setTimeout(() => {
    captions.value = captions.value.filter((c) => c.id !== id);
  }, 2500);
});
onBeforeUnmount(stopCaptions);
// 徽章提示：一次顯示一枚，數秒後自行收起；不攔截滑鼠與觸控，也不搶焦點。
let toastTimer = 0;
watch(
  () => game.achievementToast[0]?.id,
  (id) => {
    window.clearTimeout(toastTimer);
    if (id)
      toastTimer = window.setTimeout(() => {
        game.achievementToast = game.achievementToast.slice(1);
      }, 6000);
  },
);
async function installUpdate() {
  await game.backupBeforeUpdate();
  if (!game.error) await update(true);
}
</script>
<template>
  <div
    class="app"
    :class="{
      'large-text': settings.values.largeText,
      'high-contrast': settings.values.highContrast,
      'reduce-motion': settings.values.reducedMotion,
    }"
  >
    <a href="#main" class="skip-link" @click.prevent="focusMain"
      >前往主要內容</a
    >
    <RouterView v-if="ready" />
    <main v-else id="main" class="loading-page">
      <span class="loading-moon">☾</span>
      <p>正在點亮書店的燈……</p>
    </main>
    <aside v-if="game.error" class="error-banner" role="alert">
      {{ game.error
      }}<button aria-label="關閉提示" @click="game.error = ''">×</button>
    </aside>
    <div v-if="settings.values.captions" class="sound-captions" aria-hidden="true">
      <p v-for="caption in captions" :key="caption.id">［{{ caption.text }}］</p>
    </div>
    <div class="achievement-toast-region" aria-live="polite" aria-atomic="true">
      <p v-if="game.achievementToast[0]" class="achievement-toast">
        <strong>徽章點亮 · {{ game.achievementToast[0].title }}</strong>
        <span>{{ game.achievementToast[0].text }}</span>
      </p>
    </div>
    <aside v-if="updateAvailable" class="update-banner">
      新的一頁已準備好。<button @click="installUpdate">儲存並更新</button
      ><button @click="updateAvailable = false">稍後</button>
    </aside>
  </div>
</template>
