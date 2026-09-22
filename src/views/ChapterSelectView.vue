<script setup lang="ts">
import { chapters } from "../data/catalog";
import { assets } from "../data/assets";
import PageHeader from "../components/common/PageHeader.vue";
import GameIcon from "../components/common/GameIcon.vue";
import StartStoryButton from "../components/common/StartStoryButton.vue";
</script>
<template>
  <main id="main" tabindex="-1" class="library-page">
    <PageHeader
      title="今夜的訪客"
      subtitle="每一次門鈴響起，都有人帶著還沒說完的話。"
    />
    <div class="chapter-list">
      <article
        v-for="(chapter, index) in chapters"
        :key="chapter.id"
        class="chapter-entry"
        :class="{ locked: !chapter.available }"
      >
        <div class="chapter-number">
          {{ String(index + 1).padStart(2, "0") }}
        </div>
        <img
          v-if="chapter.available"
          :src="assets.scenes.jinglan"
          alt="靜蘭在書店燈下讀信"
        />
        <div v-else class="chapter-silhouette">
          <GameIcon name="lock" :size="26" />
        </div>
        <div class="chapter-info">
          <p>{{ chapter.visitor }}</p>
          <h2>{{ chapter.name }}</h2>
          <span>{{ chapter.theme }}</span>
        </div>
        <StartStoryButton v-if="chapter.available" label="翻開第一夜" /><span
          v-else
          class="subtle"
          >故事尚在書寫</span
        >
      </article>
    </div>
  </main>
</template>
