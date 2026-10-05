<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useGameStore } from "../stores/gameStore";
import {
  endings,
  chapterForEnding,
  chapters,
  nightName,
  type EndingId,
  type PlayableChapterId,
} from "../data/catalog";
import { chapterArchive, collectionAchievements, bookmarkRarity, rarityLabel } from "../data/collectionArchive";
import { unlockedAchievements } from "../services/achievements";
import { scoreLetter } from "../services/letterScoring";
import { teas } from "../data/catalog";
import { bookmarkArt } from "../data/bookmarkArt";
import PageHeader from "../components/common/PageHeader.vue";
import GameIcon from "../components/common/GameIcon.vue";
import { clues } from "../data/notebook";
import { clueJournal, discoveredConnections, type ClueJournal } from "../services/clueJournal";
import { archiveItemSchema } from "../types/game";
const game = useGameStore();
type ArchiveItem = typeof archiveItemSchema.options[number];
const journal = ref<ClueJournal>({ seen: [], connections: [] });
const selectedNight = ref<ArchiveItem | null>(null);
const compareFeedback = ref("選兩位已完成故事的訪客，比對手記裡的共同痕跡。");
const comparing = ref(false);
const comparisonNights = computed(() => chapters.filter((chapter) => archiveItemSchema.safeParse(chapter.id).success).map((chapter) => ({
  id: chapter.id as ArchiveItem,
  visitor: chapter.visitor,
  complete: game.completedChapters.has(chapter.id as PlayableChapterId),
})));
const observedClues: Partial<Record<ArchiveItem, (keyof typeof clues)[]>> = {
  boyan: ["school-journal"],
  ruoyin: ["company-recital", "motif"],
  yenuan: ["recipe-postmark"],
  yuhang: ["lighthouse-postcard"],
  haiming: ["shared-melody", "lighthouse-photo"],
};
const foundClues = computed(() => comparisonNights.value.flatMap((night) =>
  night.complete ? (observedClues[night.id] ?? []).filter((id) => journal.value.seen.includes(id)).map((id) => ({ id, title: clues[id][0] })) : [],
));
onMounted(async () => { journal.value = await clueJournal.load(); });
async function selectNight(id: ArchiveItem) {
  if (comparing.value || !game.completedChapters.has(id as PlayableChapterId)) return;
  if (!selectedNight.value) {
    selectedNight.value = id;
    compareFeedback.value = `已選取${comparisonNights.value.find((night) => night.id === id)?.visitor}。再選另一夜。`;
    return;
  }
  if (selectedNight.value === id) { selectedNight.value = null; compareFeedback.value = "已放回這一夜。"; return; }
  comparing.value = true;
  try {
    const { result, journal: updated } = await clueJournal.connect(selectedNight.value, id, game.completedChapters);
    journal.value = updated;
    if (result.status === "connected") void game.checkAchievements();
    compareFeedback.value = result.status === "connected" ? result.connection.explanation
      : result.status === "already" ? "這兩夜的關係已記在手記裡。"
      : result.status === "missing" ? "這兩夜似乎有關，但手記裡還缺少能證實的線索。回到故事再仔細查看。"
      : "目前看不出這兩夜有直接相連的痕跡。試著比較其他訪客。";
  } finally { selectedNight.value = null; comparing.value = false; }
}
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
// 回顧玩家自己的那一夜：取自各夜第一次走到結局時留下的章節快照。
function firstRun(id: PlayableChapterId) {
  const save = game.saveList.find((s) => s.id === `chapter-${id}`);
  if (!save) return null;
  const { snapshot } = save;
  const ending = snapshot.frame.endingId;
  const tea = teas[snapshot.tea.teaId]?.name;
  const blend = snapshot.tea.blendTeaId && snapshot.tea.blendLeaves > 0 ? teas[snapshot.tea.blendTeaId]?.name : "";
  const minutes = Math.max(1, Math.round(snapshot.playTimeSeconds / 60));
  return {
    ending: ending ? endings[ending].title : "",
    tea: blend ? `${tea}與${blend}` : tea,
    letter: scoreLetter(snapshot.letter, id).completion,
    clues: snapshot.frame.clues.length,
    playTime: snapshot.playTimeSeconds ? `約 ${minutes} 分鐘` : "",
    date: new Date(save.createdAt).toLocaleDateString("zh-TW"),
  };
}
const archiveEntries = computed(() => chapters.map((chapter) => {
  const id = chapter.id as PlayableChapterId;
  return {
    ...chapter,
    run: firstRun(id),
    archive: chapterArchive[id],
    unlocked: game.completedChapters.has(id),
    afterwordUnlocked: collected.value.has(chapterArchive[id].afterword.ending),
  };
}));
const achievements = computed(() => {
  const unlocked = unlockedAchievements(game.collection, journal.value);
  return collectionAchievements.map((achievement) => ({
    ...achievement,
    unlocked: unlocked.has(achievement.id),
  }));
});
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
          :class="{ cracked: bookmarkRarity(entry.id as EndingId) === 'crack', golden: entry.golden }"
        >
          <img
            :src="bookmarkArt[entry.id as EndingId]"
            :alt="`${entry.bookmark}書籤插畫`"
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
          <p class="bookmark-rarity" :data-rarity="bookmarkRarity(entry.id as EndingId)">{{ rarityLabel[bookmarkRarity(entry.id as EndingId)] }}</p>
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
              <span v-if="!collected.has(id)" class="bookmark-silhouette" aria-hidden="true"></span>
              <GameIcon v-else name="bookmark" :size="18" />
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
            <div v-if="chapter.run" class="archive-run">
              <p class="archive-label">你的那一夜 · {{ chapter.run.date }}</p>
              <dl>
                <div><dt>第一次走到的結局</dt><dd>〈{{ chapter.run.ending }}〉</dd></div>
                <div><dt>泡給訪客的茶</dt><dd>{{ chapter.run.tea }}</dd></div>
                <div><dt>拼回的信</dt><dd>{{ chapter.run.letter }}%</dd></div>
                <div><dt>找到的線索</dt><dd>{{ chapter.run.clues }} 條</dd></div>
                <div v-if="chapter.run.playTime"><dt>這一夜花了</dt><dd>{{ chapter.run.playTime }}</dd></div>
              </dl>
            </div>
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
    <section class="archive-section clue-comparison" aria-labelledby="clue-comparison-title">
      <div class="collection-heading"><h2 id="clue-comparison-title">跨夜線索對照</h2><span>{{ journal.connections.length }} ／ 5 段關係已記下</span></div>
      <p class="subtle">完成故事並找到紙背的線索後，依序選兩位訪客。重訪時發現的痕跡也會留在手記裡。</p>
      <div class="clue-night-grid" aria-label="選擇要比對的兩夜">
        <button v-for="night in comparisonNights" :key="night.id" type="button" class="clue-night" :class="{ selected: selectedNight === night.id }" :disabled="!night.complete || comparing" :aria-pressed="selectedNight === night.id" @click="selectNight(night.id)">
          <GameIcon :name="night.complete ? 'book' : 'lock'" :size="20" />
          <span>{{ night.complete ? night.visitor : '尚未收存' }}</span>
        </button>
      </div>
      <p class="clue-comparison-feedback" role="status" aria-live="polite">{{ compareFeedback }}</p>
      <div v-if="foundClues.length" class="clue-comparison-evidence"><h3>手記裡的痕跡</h3><ul><li v-for="clue in foundClues" :key="clue.id">{{ clue.title }}</li></ul></div>
      <div v-if="discoveredConnections(journal).length" class="clue-comparison-results"><h3>已接上的故事</h3><ol><li v-for="connection in discoveredConnections(journal)" :key="connection.id">{{ connection.explanation }}</li></ol></div>
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
