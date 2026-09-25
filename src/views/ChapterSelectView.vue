<script setup lang="ts">
import {
  chapters,
  playableChapters,
  previousChapter,
  nightName,
  type PlayableChapterId,
} from "../data/catalog";
import { assets } from "../data/assets";
import PageHeader from "../components/common/PageHeader.vue";
import GameIcon from "../components/common/GameIcon.vue";
import StartStoryButton from "../components/common/StartStoryButton.vue";
import { useGameStore } from "../stores/gameStore";
const game = useGameStore();
function unlocked(chapter: (typeof chapters)[number]) {
  if (!chapter.available) return false;
  const prerequisite = previousChapter[chapter.id as PlayableChapterId];
  return !prerequisite || game.completedChapters.has(prerequisite);
}
function chapterPortrait(id: string) {
  return id in assets.characters
    ? assets.characters[id as keyof typeof assets.characters]
    : null;
}
</script>
<template>
  <main id="main" tabindex="-1" class="library-page">
    <PageHeader
      title="今夜的訪客與最後一封信"
      subtitle="六次門鈴之後，林澄也可以坐到訪客席。"
    />
    <div class="chapter-list">
      <article
        v-for="(chapter, index) in chapters"
        :key="chapter.id"
        class="chapter-entry"
        :class="{ locked: !unlocked(chapter), 'final-chapter': chapter.id === 'lincheng' }"
      >
        <div class="chapter-number">
          {{ chapter.id === 'lincheng' ? '終' : String(index + 1).padStart(2, "0") }}
        </div>
        <div v-if="unlocked(chapter)" class="chapter-art" aria-hidden="true">
          <img :src="chapter.id === 'jinglan' ? assets.scenes.jinglan : assets.scenes.counter" alt="" />
          <img v-if="chapterPortrait(chapter.id)" class="chapter-art-portrait" :src="chapterPortrait(chapter.id)!" alt="" />
        </div>
        <div v-else class="chapter-silhouette">
          <GameIcon name="lock" :size="26" />
        </div>
        <div class="chapter-info">
          <p>{{ chapter.visitor }}</p>
          <h2>{{ chapter.name }}</h2>
          <span>{{ chapter.theme }}</span>
        </div>
        <StartStoryButton
          v-if="unlocked(chapter)"
          :chapter="playableChapters[index]"
          :label="`翻開${nightName(chapter.id)}`"
        /><span v-else class="subtle">{{
          chapter.available
            ? `完成${nightName(previousChapter[chapter.id as PlayableChapterId] || "")}後解鎖`
            : "故事尚在書寫"
        }}</span>
      </article>
    </div>
  </main>
</template>
