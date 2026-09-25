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
    if (route.name !== "game" || !game.frame) audio.setScene(null);
    else
      audio.setScene(
        game.frame.scene === "memory" || game.frame.scene === "moon-sea"
          ? "room"
          : "rain",
      );
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
async function installUpdate() {
  if (game.frame) await game.persist();
  if (!game.error) await update(true);
}
</script>
<template>
  <div
    class="app"
    :class="{
      'large-text': settings.values.largeText,
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
    <aside v-if="updateAvailable" class="update-banner">
      新的一頁已準備好。<button @click="installUpdate">儲存並更新</button
      ><button @click="updateAvailable = false">稍後</button>
    </aside>
  </div>
</template>
