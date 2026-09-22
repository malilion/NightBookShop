<script setup lang="ts">
import { useGameStore } from "../../stores/gameStore";
import GameIcon from "./GameIcon.vue";
defineProps<{ title: string; subtitle?: string }>();
const game = useGameStore();
</script>
<template>
  <header class="page-header">
    <RouterLink :to="game.frame ? '/game' : '/'" class="text-link"
      ><GameIcon name="back" />{{
        game.frame ? "回到書店" : "回到門前"
      }}</RouterLink
    >
    <div>
      <h1>{{ title }}</h1>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <span class="header-moon"><GameIcon name="moon" :size="28" /></span>
  </header>
</template>
