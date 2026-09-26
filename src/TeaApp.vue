<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import { registerSW } from "virtual:pwa-register";
import { useSettingsStore } from "./stores/settingsStore";
import { audio } from "./audio/audioManager";
const settings = useSettingsStore();
const ready = ref(false);
registerSW();
onMounted(async () => {
  await settings.init();
  ready.value = true;
  audio.setScene("rain");
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
    <RouterView v-if="ready" />
    <main v-else id="main" class="loading-page">
      <span class="loading-moon">☾</span>
      <p>正在擺好茶席……</p>
    </main>
  </div>
</template>
