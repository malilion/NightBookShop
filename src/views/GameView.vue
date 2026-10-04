<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "../stores/gameStore";
import { sections, clues } from "../data/notebook";
import { memoryEvidence, memorySection, supportsMemoryEvidence } from "../data/memoryEvidence";
import { assets } from "../data/assets";
import { bookmarkArt } from "../data/bookmarkArt";
import {
  endings,
  chapters,
  nightName,
  playableChapters,
} from "../data/catalog";
import { audio } from "../audio/audioManager";
import { portraitCues } from "../data/portraits";
import GameIcon from "../components/common/GameIcon.vue";
import DialoguePanel from "../components/dialogue/DialoguePanel.vue";
import TeaBrewingScene from "../components/tea/TeaBrewingScene.vue";
import LetterPuzzle from "../components/letter/LetterPuzzle.vue";
import MelodyPuzzle from "../components/melody/MelodyPuzzle.vue";
import HearthScene from "../components/hearth/HearthScene.vue";
import DeliveryRoute from "../components/route/DeliveryRoute.vue";
import WatchLamp from "../components/lamp/WatchLamp.vue";
import QuietCarriage from "../components/notifications/QuietCarriage.vue";
import ArchiveMap from "../components/archive/ArchiveMap.vue";
import OpeningPrep from "../components/opening/OpeningPrep.vue";
const game = useGameStore(),
  router = useRouter(),
  menu = ref<HTMLDialogElement>(),
  notebook = ref<HTMLDialogElement>(),
  dialogue = ref<InstanceType<typeof DialoguePanel> | null>(null);
const currentChapter = computed(() =>
  chapters.find((chapter) => chapter.id === game.chapterId)!,
);
const nightLabel = computed(
  () => `${nightName(game.chapterId)} · ${currentChapter.value.visitor}`,
);
const nightTitle = computed(() => currentChapter.value.name);
const fragmentTotal = computed(() => (["boyan", "yuhang", "haiming", "lincheng"].includes(game.chapterId) ? 4 : 3));
const nextChapter = computed(
  () => playableChapters[playableChapters.indexOf(game.chapterId) + 1] ?? null,
);
async function nextNight() {
  if (nextChapter.value && (await game.start(nextChapter.value)))
    await router.push("/game");
}
const background = computed(() => {
  const frame = game.frame;
  if (!frame || !game.opening.complete || frame.mode === "tea") return assets.scenes.counter;
  if (frame.mode === "ending") return assets.scenes[game.chapterId];
  if (frame.scene === "memory") {
    if (frame.section === "school") return assets.memories.school;
    if (frame.section === "hospital") return assets.memories.hospital;
    if (frame.section === "platform") return assets.memories.platform;
    if (frame.section === "office") return assets.memories.office;
    if (frame.section === "clinic") return assets.memories.clinic;
    if (frame.section === "train") return assets.memories.train;
    if (frame.section === "hidden-room") return assets.memories.hiddenRoom;
    if (frame.section === "storm-tower") return assets.memories.lighthouse;
    if (frame.section === "summer-visit") return assets.memories.summerVisit;
    if (frame.section === "last-watch") return assets.memories.lastWatch;
    if (frame.section === "white-room") return assets.memories.whiteRoom;
    if (frame.section === "childhood" && game.chapterId === "ruoyin") return assets.memories.practiceRoom;
    if (frame.section === "backstage") return assets.memories.backstage;
    if (frame.section === "banquet") return assets.memories.banquet;
    if (frame.section === "grandstage") return assets.memories.grandstage;
    if (frame.section === "dawn-kitchen") return assets.memories.bakery;
    if (frame.section === "anniversary") return assets.memories.anniversary;
    if (frame.section === "hospital-return") return assets.memories.hospitalReturn;
    if (frame.section === "old-oven") return assets.memories.oldOven;
    if (frame.section === "old-post-office") return assets.memories.postOffice;
    if (frame.section === "last-bus") return assets.memories.lastBus;
    if (frame.section === "empty-shop") return assets.memories.emptyShop;
    if (frame.section === "bookshop-door") return assets.memories.bookshopDoor;
    if (frame.section === "child-home") return assets.memories.childHome;
    if (frame.section === "hidden-envelope") return assets.memories.childBookshop;
  }
  return assets.scenes[frame.scene];
});
const mobileBackground = computed(() => {
  const frame = game.frame;
  if (!game.opening.complete) return assets.scenes.counter;
  if (frame?.mode === "ending") return assets.mobileScenes[game.chapterId];
  if (frame?.mode === "dialogue" && frame.scene in assets.mobileScenes)
    return assets.mobileScenes[frame.scene as keyof typeof assets.mobileScenes];
  if (frame?.scene === "memory") {
    if (frame.section === "school") return assets.mobileMemories.school;
    if (frame.section === "hospital") return assets.mobileMemories.hospital;
    if (frame.section === "platform") return assets.mobileMemories.platform;
    if (frame.section === "office") return assets.mobileMemories.office;
    if (frame.section === "clinic") return assets.mobileMemories.clinic;
    if (frame.section === "train") return assets.mobileMemories.train;
    if (frame.section === "hidden-room") return assets.mobileMemories.hiddenRoom;
    if (frame.section === "storm-tower") return assets.mobileMemories.lighthouse;
    if (frame.section === "summer-visit") return assets.mobileMemories.summerVisit;
    if (frame.section === "last-watch") return assets.mobileMemories.lastWatch;
    if (frame.section === "white-room") return assets.mobileMemories.whiteRoom;
    if (frame.section === "childhood" && game.chapterId === "ruoyin") return assets.mobileMemories.practiceRoom;
    if (frame.section === "backstage") return assets.mobileMemories.backstage;
    if (frame.section === "banquet") return assets.mobileMemories.banquet;
    if (frame.section === "grandstage") return assets.mobileMemories.grandstage;
    if (frame.section === "dawn-kitchen") return assets.mobileMemories.bakery;
    if (frame.section === "anniversary") return assets.mobileMemories.anniversary;
    if (frame.section === "hospital-return") return assets.mobileMemories.hospitalReturn;
    if (frame.section === "old-oven") return assets.mobileMemories.oldOven;
    if (frame.section === "old-post-office") return assets.mobileMemories.postOffice;
    if (frame.section === "last-bus") return assets.mobileMemories.lastBus;
    if (frame.section === "empty-shop") return assets.mobileMemories.emptyShop;
    if (frame.section === "bookshop-door") return assets.mobileMemories.bookshopDoor;
    if (frame.section === "child-home") return assets.mobileMemories.childHome;
    if (frame.section === "hidden-envelope") return assets.mobileMemories.childBookshop;
  }
  return background.value;
});
const ending = computed(() =>
  game.frame?.endingId ? endings[game.frame.endingId] : null,
);
const portrait = computed(() => {
  const frame = game.frame;
  if (frame?.mode !== "dialogue") return null;
  if (frame.portrait !== "none") return portraitCues[frame.portrait];
  return frame.scene in assets.characters
    ? { src: assets.characters[frame.scene as keyof typeof assets.characters], kind: "visitor" }
    : null;
});
const memoryHub = computed(() => {
  const frame = game.frame;
  if (
    !frame ||
    frame.mode !== "dialogue" ||
    frame.scene !== "memory" ||
    !supportsMemoryEvidence(game.activeStoryVersion)
  )
    return null;
  const section = memorySection(frame.section);
  if (!section) return null;
  const evidence = memoryEvidence[section];
  if (!frame.choices.some((choice) => choice.text === evidence.leave))
    return null;
  const objects = evidence.objects.map((object) => ({
    ...object,
    index:
      frame.choices.find((choice) => choice.text === object.choice)?.index ??
      null,
  }));
  const objectIndexes = new Set(objects.map((object) => object.index));
  return {
    section,
    objects,
    dialogueIndexes: frame.choices
      .filter((choice) => !objectIndexes.has(choice.index))
      .map((choice) => choice.index),
  };
});
const showMemoryObjects = computed(
  () => memoryHub.value !== null && dialogue.value?.revealing === false,
);
function inspectMemory(index: number) {
  if (dialogue.value?.reveal()) return;
  audio.cue("paper");
  void game.advance(index);
}
function keyboard(event: KeyboardEvent) {
  if (
    menu.value?.open ||
    notebook.value?.open ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    event.repeat
  )
    return;
  if (event.key === "Escape") {
    event.preventDefault();
    menu.value?.showModal();
    return;
  }
  if (
    (event.target as HTMLElement).closest("button, a, input, select, textarea")
  )
    return;
  if (!game.opening.complete) return;
  if (game.frame?.mode !== "dialogue") return;
  if (
    (/^[1-4]$/.test(event.key) || event.key === "Enter" || event.key === " ") &&
    dialogue.value?.reveal()
  ) {
    event.preventDefault();
    return;
  }
  if (/^[1-4]$/.test(event.key)) {
    const index = Number(event.key) - 1;
    if (game.frame.choices.some((c) => c.index === index)) {
      event.preventDefault();
      game.advance(index);
    }
  }
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    game.advance();
  }
}
onMounted(async () => {
  window.addEventListener("keydown", keyboard);
  if (!game.frame && !(await game.load())) await router.replace("/");
});
onBeforeUnmount(() => window.removeEventListener("keydown", keyboard));
</script>
<template>
  <main
    id="main"
    tabindex="-1"
    class="game-page"
    :class="'mode-' + (game.opening.complete ? game.frame?.mode : 'opening')"
  >
    <Transition name="scene-fade">
      <picture :key="background" class="scene-art" aria-hidden="true">
        <source :srcset="mobileBackground" media="(max-width: 640px)" />
        <img :src="background" alt="" />
      </picture>
    </Transition>
    <div class="scene-shade"></div>
    <header class="game-header">
      <RouterLink to="/" class="game-brand"
        >夜行書店<span>The Midnight Bookshop</span></RouterLink
      >
      <div class="night-indicator">
        <GameIcon name="moon" /><span
          >{{ nightName(game.chapterId) }}<span class="night-divider">／</span
          >{{ nightTitle }}</span
        >
      </div>
      <button
        class="icon-button"
        aria-label="開啟遊戲選單"
        @click="menu?.showModal()"
      >
        <GameIcon name="book" :size="24" />
      </button>
    </header>
    <div v-if="game.frame" class="game-content">
      <OpeningPrep v-if="!game.opening.complete" />
      <template v-else-if="game.frame.mode === 'dialogue'"
        ><div class="scene-caption">
          <span>{{ sections[game.frame.section] }}</span
          ><small>{{
            game.activeStoryVersion === "jinglan-prototype-1"
              ? "舊版短篇存檔"
              : nightLabel
          }}</small>
        </div>
        <img v-if="portrait" :key="portrait.src" :src="portrait.src" class="character-portrait" :class="{ 'character-portrait-child': portrait.kind === 'child' }" :data-portrait="portrait.kind" :data-expression="game.frame.portrait === 'haiming-searching' ? 'searching' : game.frame.portrait === 'haiming-warm' ? 'warm' : undefined" alt="" aria-hidden="true" />
        <div
          v-if="showMemoryObjects && memoryHub"
          class="memory-evidence"
          :class="`memory-evidence-${memoryHub.section}`"
          role="group"
          aria-label="記憶中的物件"
        >
          <span class="memory-evidence-hint">觸碰記憶裡留下的物件</span>
          <template
            v-for="(object, position) in memoryHub.objects"
            :key="object.choice"
          >
            <button
              v-if="object.index !== null"
              type="button"
              class="memory-object"
              :class="`memory-object-${position + 1}`"
              :aria-label="`探索物件：${object.label}`"
              @click="inspectMemory(object.index)"
            >
              <span class="memory-object-number">0{{ object.index + 1 }}</span>
              <span>{{ object.label }}</span>
            </button>
            <span
              v-else
              class="memory-object memory-object-seen"
              :class="`memory-object-${position + 1}`"
              aria-hidden="true"
            >
              <span class="memory-object-number">✓</span>
              <span>{{ object.label }}</span>
            </span>
          </template>
        </div>
        <DialoguePanel :key="'dialogue'" ref="dialogue" :visible-choice-indexes="memoryHub?.dialogueIndexes" /></template
      ><TeaBrewingScene v-else-if="game.frame.mode === 'tea'" /><MelodyPuzzle
        v-else-if="game.frame.mode === 'melody'"
      /><HearthScene v-else-if="game.frame.mode === 'hearth'" /><DeliveryRoute v-else-if="game.frame.mode === 'route'" /><WatchLamp v-else-if="game.frame.mode === 'lamp'" /><ArchiveMap v-else-if="game.frame.mode === 'archive'" /><LetterPuzzle v-else-if="game.frame.mode === 'letter'" />
      <QuietCarriage v-else-if="game.frame.mode === 'notifications'" />
      <section v-else-if="ending" class="ending-panel paper-frame">
        <img
          class="ending-illustration"
          :src="bookmarkArt[game.frame.endingId as keyof typeof bookmarkArt]"
          :alt="`${ending.bookmark}結局插畫`"
        />
        <div class="ending-copy">
          <GameIcon name="bookmark" :size="36" />
          <p class="subtle">{{ nightLabel }} · 故事已收進書頁</p>
          <h1>{{ ending.title }}</h1>
          <p class="ending-quote">「{{ ending.quote }}」</p>
          <p>{{ game.frame.text }}</p>
          <div class="ending-bookmark" :class="{ 'ending-bookmark-golden': game.frame.resonanceFragment === game.chapterId }">
            <GameIcon name="leaf" /><span
              >{{ game.frame.resonanceFragment === game.chapterId ? '獲得金色書籤 · 共鳴之茶' : '獲得書籤' }}<br /><strong>{{ ending.bookmark }}</strong></span
            >
          </div>
          <div class="button-row">
            <button v-if="nextChapter" class="ornate-button" @click="nextNight">
              翻開{{ nightName(nextChapter) }}<GameIcon name="arrow" />
            </button>
            <RouterLink class="ornate-button" to="/collection"
              >翻開故事收藏<GameIcon name="arrow" /></RouterLink
            ><RouterLink class="quiet-button" to="/">回到門前</RouterLink>
          </div>
        </div>
      </section>
    </div>
    <footer class="game-footer">
      <span v-if="!game.opening.complete">開店準備 · {{ game.opening.inspected.length }}/3</span>
      <button v-else class="text-link" @click="notebook?.showModal()">
        守夜手記 · 信紙 {{ game.frame?.fragments.length || 0 }}/{{
          fragmentTotal
        }}</button
      ><span role="status" aria-label="存檔狀態">{{
        game.error
          ? "尚未儲存"
          : game.saving
            ? "正在保存這一頁……"
            : "進度自動保存在此瀏覽器"
      }}</span>
    </footer>
    <dialog ref="notebook" class="modal-panel notebook-panel">
      <div class="modal-heading">
        <h2>林澄的守夜手記</h2>
        <button
          class="icon-button"
          aria-label="關閉手記"
          @click="notebook?.close()"
        >
          <GameIcon name="close" />
        </button>
      </div>
      <p class="subtle">
        {{ game.frame ? sections[game.frame.section] : nightLabel }} · 已找到
        {{ game.frame?.fragments.length || 0 }} / {{ fragmentTotal }} 片信紙
      </p>
      <p v-if="!game.frame?.clues.length">
        先聽對方說。看見的細節，會留在這裡。
      </p>
      <article v-for="clue in game.frame?.clues" :key="clue">
        <h3>{{ clues[clue][0] }}</h3>
        <p>{{ clues[clue][1] }}</p>
      </article>
      <button class="ornate-button" @click="notebook?.close()">收起手記</button>
    </dialog>
    <dialog ref="menu" class="modal-panel game-menu">
      <div class="modal-heading">
        <h2>暫停在這一頁</h2>
        <button
          class="icon-button"
          aria-label="關閉選單"
          @click="menu?.close()"
        >
          <GameIcon name="close" />
        </button>
      </div>
      <nav aria-label="遊戲選單">
        <RouterLink to="/saves"><GameIcon name="save" />存檔與讀檔</RouterLink
        ><RouterLink to="/collection"
          ><GameIcon name="bookmark" />故事收藏</RouterLink
        ><RouterLink to="/settings"
          ><GameIcon name="settings" />閱讀設定</RouterLink
        ><RouterLink to="/"><GameIcon name="moon" />回到門前</RouterLink>
      </nav>
      <button class="ornate-button" autofocus @click="menu?.close()">
        繼續傾聽<GameIcon name="arrow" />
      </button>
    </dialog>
  </main>
</template>
