<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useGameStore } from "./stores/gameStore";
import { useSettingsStore } from "./stores/settingsStore";
import { registerSW } from "virtual:pwa-register";
const game = useGameStore();
const settings = useSettingsStore();
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
});
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
