<script setup lang="ts">
import { useGameStore } from "../../stores/gameStore";
import GameIcon from "../common/GameIcon.vue";
const game = useGameStore();
</script>
<template>
  <section v-if="game.frame" class="dialogue-panel" aria-label="故事對話">
    <div class="speaker-line">
      <span class="speaker">{{ game.frame.speaker }}</span
      ><span class="speaker-rule"></span><GameIcon name="moon" :size="16" />
    </div>
    <p class="dialogue-text" aria-live="polite">{{ game.frame.text }}</p>
    <div v-if="game.frame.choices.length" class="dialogue-choices">
      <button
        v-for="choice in game.frame.choices"
        :key="choice.index"
        @click="game.advance(choice.index)"
      >
        <span class="choice-number">{{
          String(choice.index + 1).padStart(2, "0")
        }}</span
        >{{ choice.text }}<GameIcon name="arrow" :size="16" />
      </button>
    </div>
    <button
      v-else-if="game.frame.canContinue"
      class="continue-button"
      @click="game.advance()"
    >
      <span>繼續</span><GameIcon name="arrow" :size="18" /></button
    ><span class="keyboard-hint">Enter 繼續 · 數字鍵選擇</span>
  </section>
</template>
