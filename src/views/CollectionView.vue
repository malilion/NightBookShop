<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "../stores/gameStore";
import { endings, type EndingId } from "../data/catalog";
import { assets } from "../data/assets";
import PageHeader from "../components/common/PageHeader.vue";
import GameIcon from "../components/common/GameIcon.vue";
const game = useGameStore();
const entries = computed(() =>
  game.collection
    .filter((e) => e.id in endings)
    .map((e) => ({ ...endings[e.id as EndingId], ...e })),
);
</script>
<template>
  <main id="main" tabindex="-1" class="library-page collection-page">
    <PageHeader
      title="故事收藏"
      subtitle="那些在夜裡相遇的靈魂，仍在這裡閃閃發光。"
    />
    <div class="collection-heading">
      <span><GameIcon name="bookmark" />訪客書籤</span
      ><span>{{ entries.length }} ／ 4 <span class="subtle">第一夜</span></span>
    </div>
    <div v-if="!entries.length" class="empty-collection">
      <GameIcon name="book" :size="64" />
      <h2>第一頁，還留著空白。</h2>
      <p>完成一位訪客的故事，將那一夜的書籤收在這裡。</p>
      <RouterLink class="ornate-button" :to="game.frame ? '/game' : '/'"
        >{{ game.frame ? "回到那一夜" : "回到門前" }}<GameIcon name="arrow"
      /></RouterLink>
    </div>
    <div v-else class="bookmark-grid">
      <article v-for="entry in entries" :key="entry.id" class="bookmark-entry">
        <div
          class="bookmark-art"
          :class="{ cracked: entry.id === 'intervention' }"
        >
          <img
            :src="assets.scenes['moon-sea']"
            alt="月光與漂浮的信，映照著海邊的書店"
          /><span>{{ entry.bookmark }}</span>
        </div>
        <div>
          <p class="subtle">
            周靜蘭 · {{ entry.id === "unfinished" ? "尚未完成" : "第一夜" }}
          </p>
          <h2>{{ entry.title }}</h2>
          <p>{{ entry.note }}</p>
          <blockquote>{{ entry.quote }}</blockquote>
          <span class="collection-date"
            >{{
              new Date(entry.unlockedAt).toLocaleDateString("zh-TW")
            }}
            收藏</span
          >
        </div>
      </article>
    </div>
    <section v-if="entries.length" class="recipe-note">
      <GameIcon name="leaf" :size="28" />
      <div>
        <h2>靜蘭的桂花烏龍</h2>
        <p>茶葉三匙，九十度的水，浸泡四十五秒。留一點空間，讓香氣慢慢回來。</p>
      </div>
    </section>
  </main>
</template>
