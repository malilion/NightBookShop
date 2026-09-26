<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "../stores/gameStore";
import {
  endings,
  chapterForEnding,
  chapters,
  nightName,
  playableChapters,
  type EndingId,
  type PlayableChapterId,
} from "../data/catalog";
import { chapterArchive, collectionAchievements } from "../data/collectionArchive";
import { assets } from "../data/assets";
import PageHeader from "../components/common/PageHeader.vue";
import GameIcon from "../components/common/GameIcon.vue";
const game = useGameStore();
const entries = computed(() =>
  game.collection
    .filter((e) => e.id in endings)
    .map((e) => ({ ...endings[e.id as EndingId], ...e })),
);
const collected = computed(() => new Set(entries.value.map((entry) => entry.id as EndingId)));
const bookmarkShelf = computed(() => chapters.map((chapter) => ({
  ...chapter,
  slots: (Object.keys(endings) as EndingId[]).filter((id) => chapterForEnding(id) === chapter.id),
})));
const archiveEntries = computed(() => chapters.map((chapter) => {
  const id = chapter.id as PlayableChapterId;
  return {
    ...chapter,
    archive: chapterArchive[id],
    unlocked: game.completedChapters.has(id),
    afterwordUnlocked: collected.value.has(chapterArchive[id].afterword.ending),
  };
}));
const achievements = computed(() => collectionAchievements.map((achievement) => ({
  ...achievement,
  unlocked: achievement.id === "first"
    ? collected.value.size > 0
    : achievement.id === "seven"
      ? playableChapters.every((id) => game.completedChapters.has(id))
      : achievement.id === "understanding"
        ? playableChapters.every((id) => collected.value.has(chapterArchive[id].afterword.ending))
        : collected.value.size === Object.keys(endings).length,
})));
</script>
<template>
  <main id="main" tabindex="-1" class="library-page collection-page">
    <PageHeader
      title="故事收藏"
      subtitle="那些在夜裡相遇的靈魂，仍在這裡閃閃發光。"
    />
    <div class="collection-heading">
      <span><GameIcon name="bookmark" />故事書籤</span
      ><span
        >{{ entries.length }} ／ {{ Object.keys(endings).length }}
        <span class="subtle">已收存結局</span></span
      >
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
      <article v-for="entry in entries" :key="entry.id" class="bookmark-entry" :class="{ 'bookmark-entry-golden': entry.golden }">
        <div
          class="bookmark-art"
          :class="{ cracked: entry.id === 'intervention', golden: entry.golden }"
        >
          <img
            :src="assets.scenes['moon-sea']"
            alt="月光與漂浮的信，映照著海邊的書店"
          /><span>{{ entry.bookmark }}</span>
        </div>
        <div>
          <p class="subtle">
            {{
              chapters.find(
                (chapter) =>
                  chapter.id === chapterForEnding(entry.id as EndingId),
              )?.visitor
            }}
            · {{ nightName(chapterForEnding(entry.id as EndingId)) }}
          </p>
          <h2>{{ entry.title }}</h2>
          <p v-if="entry.golden" class="golden-bookmark-label">共鳴之茶 · 金色書籤</p>
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
    <section class="archive-section" aria-labelledby="bookmark-shelf-title">
      <div class="collection-heading"><h2 id="bookmark-shelf-title">書籤書架</h2><span>缺頁不顯示取得方式</span></div>
      <div class="bookmark-shelf">
        <div v-for="chapter in bookmarkShelf" :key="chapter.id" class="bookmark-shelf-row">
          <h3>{{ chapter.visitor }}</h3>
          <ol>
            <li v-for="(id, index) in chapter.slots" :key="id" :class="{ 'bookmark-slot-locked': !collected.has(id), 'bookmark-slot-golden': entries.some((entry) => entry.id === id && entry.golden) }">
              <GameIcon :name="collected.has(id) ? 'bookmark' : 'lock'" :size="18" />
              <span>{{ collected.has(id) ? endings[id].bookmark : `缺頁 ${index + 1}` }}</span>
            </li>
          </ol>
        </div>
      </div>
    </section>
    <section class="archive-section" aria-labelledby="archive-title">
      <div class="collection-heading">
        <h2 id="archive-title">七夜回顧</h2>
        <span>{{ game.completedChapters.size }} ／ {{ chapters.length }} 夜已收存</span>
      </div>
      <div class="archive-grid">
        <article
          v-for="(chapter, index) in archiveEntries"
          :key="chapter.id"
          class="archive-card"
          :class="{ 'archive-card-locked': !chapter.unlocked }"
        >
          <p class="archive-kicker">{{ chapter.id === 'lincheng' ? '終章' : `第${index + 1}夜` }} · {{ chapter.visitor }}</p>
          <h3>{{ chapter.name }}</h3>
          <template v-if="chapter.unlocked">
            <p class="archive-label">故事句</p>
            <blockquote>{{ chapter.archive.sentence }}</blockquote>
            <dl>
              <div><dt>主線線索</dt><dd>{{ chapter.archive.clue }}</dd></div>
              <div><dt>茶方與留存</dt><dd><strong>{{ chapter.archive.recipe.title }}</strong><br />{{ chapter.archive.recipe.text }}</dd></div>
            </dl>
            <details v-if="chapter.afterwordUnlocked" class="archive-afterword">
              <summary>閱讀後日談 · {{ chapter.archive.afterword.title }}</summary>
              <p>{{ chapter.archive.afterword.text }}</p>
            </details>
            <p v-else class="archive-missing">後日談仍是一張缺頁。</p>
          </template>
          <p v-else class="archive-missing"><GameIcon name="lock" :size="20" />這一夜尚未收存。</p>
        </article>
      </div>
    </section>
    <section class="archive-section" aria-labelledby="achievement-title">
      <div class="collection-heading"><h2 id="achievement-title">書店徽章</h2><span>{{ achievements.filter((item) => item.unlocked).length }} ／ {{ achievements.length }} 已點亮</span></div>
      <div class="achievement-grid">
        <article v-for="achievement in achievements" :key="achievement.id" class="achievement-card" :class="{ 'achievement-card-locked': !achievement.unlocked }">
          <GameIcon :name="achievement.unlocked ? 'moon' : 'lock'" :size="28" />
          <div>
            <h3>{{ achievement.unlocked ? achievement.title : '尚未點亮的徽章' }}</h3>
            <p>{{ achievement.unlocked ? achievement.text : '仍有故事等待被讀完。' }}</p>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>
