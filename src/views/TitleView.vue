<script setup lang="ts">
import { useRouter } from "vue-router";
import { useGameStore } from "../stores/gameStore";
import { assets } from "../data/assets";
import GameIcon from "../components/common/GameIcon.vue";
import StartStoryButton from "../components/common/StartStoryButton.vue";
const game = useGameStore(),
  router = useRouter();
async function resume() {
  if (await game.load()) await router.push("/game");
}
</script>
<template>
  <main
    id="main"
    tabindex="-1"
    class="title-page"
    :style="{ '--scene-image': `url(${assets.title})` }"
  >
    <div class="title-scrim"></div>
    <header class="title-header">
      <span class="shop-seal"><GameIcon name="moon" /> 午夜開門・黎明打烊</span>
      <nav aria-label="書店選單">
        <RouterLink to="/collection"
          ><GameIcon name="bookmark" /><span>故事收藏</span></RouterLink
        ><RouterLink to="/settings"
          ><GameIcon name="settings" /><span>設定</span></RouterLink
        >
      </nav>
    </header>
    <section class="title-content">
      <div class="title-rule">
        <span></span><GameIcon name="moon" :size="28" /><span></span>
      </div>
      <h1>夜行書店</h1>
      <p class="english-title">The Midnight Bookshop</p>
      <p class="title-quote">有些故事，<br />只會在夜裡相遇。</p>
      <div class="title-actions">
        <button
          v-if="game.latest"
          class="ornate-button"
          :disabled="game.busy"
          @click="resume"
        >
          <GameIcon name="book" />繼續故事<GameIcon name="arrow" /></button
        ><StartStoryButton :secondary="!!game.latest" />
        <div class="title-submenu">
          <RouterLink to="/chapters">今夜的訪客</RouterLink><span>／</span
          ><RouterLink to="/saves">讀取存檔</RouterLink>
        </div>
      </div>
    </section>
    <div class="vertical-verse" aria-hidden="true">
      在夜裡，<br />每個人都能被聽見。
    </div>
    <footer class="title-footer">
      <span>一杯茶，一封信，一個未完的夜晚。</span
      ><span>第一夜 · 月下未寄出的信</span>
    </footer>
  </main>
</template>
