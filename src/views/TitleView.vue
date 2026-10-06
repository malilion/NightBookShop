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
    :style="{ '--scene-image': `url(${assets.title})`, '--scene-image-mobile': `url(${assets.titleMobile})` }"
  >
    <div class="title-scrim"></div>
    <header class="title-header">
      <span class="shop-seal"><GameIcon name="moon" /> 午夜開門・黎明打烊</span>
      <nav aria-label="書店選單">
        <RouterLink to="/collection" aria-label="故事收藏"
          ><GameIcon name="bookmark" /><span>故事收藏</span></RouterLink
        ><RouterLink to="/settings" aria-label="設定"
          ><GameIcon name="settings" /><span>設定</span></RouterLink
        >
      </nav>
    </header>
    <section class="title-content">
      <div class="title-mark">
        <svg class="title-moon" viewBox="0 0 120 120" aria-hidden="true">
          <path d="M78 10a50 50 0 1 0 32 74A42 42 0 1 1 78 10Z" />
        </svg>
        <h1>夜行書店</h1>
        <p class="english-title">The Midnight Bookshop</p>
        <div class="title-rule" aria-hidden="true"><span></span><i></i><span></span></div>
      </div>
      <div class="title-actions">
        <button
          v-if="game.latest"
          class="ornate-button"
          :disabled="game.busy"
          @click="resume"
        >
          <GameIcon name="book" />繼續故事<GameIcon name="arrow" /></button
        ><StartStoryButton :secondary="!!game.latest" /><RouterLink
          to="/tea"
          class="quiet-button tea-house-entry"
          ><GameIcon name="leaf" />午夜茶席<GameIcon name="arrow" /></RouterLink
        >
      </div>
      <div class="title-submenu">
        <RouterLink to="/chapters">今夜的訪客</RouterLink><span>／</span
        ><RouterLink to="/saves">讀取存檔</RouterLink><span>／</span
        ><RouterLink to="/about">關於</RouterLink>
      </div>
    </section>
  </main>
</template>
