<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "../stores/gameStore";
import { sections, clues } from "../data/notebook";
import { memoryEvidence, memorySection } from "../data/memoryEvidence";
import { assets } from "../data/assets";
import { endings } from "../data/catalog";
import { audio } from "../audio/audioManager";
import { STORY_VERSION } from "../types/game";
import GameIcon from "../components/common/GameIcon.vue";
import DialoguePanel from "../components/dialogue/DialoguePanel.vue";
import TeaBrewingScene from "../components/tea/TeaBrewingScene.vue";
import LetterPuzzle from "../components/letter/LetterPuzzle.vue";
const game = useGameStore(),
  router = useRouter(),
  menu = ref<HTMLDialogElement>(),
  notebook = ref<HTMLDialogElement>(),
  dialogue = ref<InstanceType<typeof DialoguePanel> | null>(null);
const background = computed(() => {
  const frame = game.frame;
  if (!frame || frame.mode === "tea") return assets.scenes.counter;
  if (frame.scene === "memory") {
    if (frame.section === "school") return assets.memories.school;
    if (frame.section === "hospital") return assets.memories.hospital;
    if (frame.section === "platform") return assets.memories.platform;
  }
  return assets.scenes[frame.scene];
});
const mobileBackground = computed(() => {
  const frame = game.frame;
  if (frame?.scene === "memory") {
    if (frame.section === "school") return assets.mobileMemories.school;
    if (frame.section === "hospital") return assets.mobileMemories.hospital;
    if (frame.section === "platform") return assets.mobileMemories.platform;
  }
  return background.value;
});
const ending = computed(() =>
  game.frame?.endingId ? endings[game.frame.endingId] : null,
);
const memoryHub = computed(() => {
  const frame = game.frame;
  if (
    !frame ||
    frame.mode !== "dialogue" ||
    frame.scene !== "memory" ||
    game.activeStoryVersion !== STORY_VERSION
  )
    return null;
  const section = memorySection(frame.section);
  if (!section) return null;
  const evidence = memoryEvidence[section];
  if (!frame.choices.some((choice) => choice.text === evidence.leave))
    return null;
  return {
    section,
    objects: evidence.objects.map((object) => ({
      ...object,
      index:
        frame.choices.find((choice) => choice.text === object.choice)?.index ??
        null,
    })),
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
    :class="'mode-' + game.frame?.mode"
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
          >第一夜<span class="night-divider">／</span>月下未寄出的信</span
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
      <template v-if="game.frame.mode === 'dialogue'"
        ><div class="scene-caption">
          <span>{{ sections[game.frame.section] }}</span
          ><small>{{
            game.activeStoryVersion === "jinglan-prototype-1"
              ? "舊版短篇存檔"
              : "第一夜 · 周靜蘭"
          }}</small>
        </div>
        <div
          v-if="showMemoryObjects && memoryHub"
          class="memory-evidence"
          :class="`memory-evidence-${memoryHub.section}`"
          role="group"
          aria-label="記憶中的物件"
        >
          <span class="memory-evidence-hint">觸碰記憶裡留下的物件</span>
          <template v-for="(object, position) in memoryHub.objects" :key="object.choice">
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
        <DialoguePanel :key="'dialogue'" ref="dialogue" /></template
      ><TeaBrewingScene v-else-if="game.frame.mode === 'tea'" /><LetterPuzzle
        v-else-if="game.frame.mode === 'letter'"
      />
      <section v-else-if="ending" class="ending-panel paper-frame">
        <GameIcon name="bookmark" :size="36" />
        <p class="subtle">第一夜 · 故事已收進書頁</p>
        <h1>{{ ending.title }}</h1>
        <p class="ending-quote">「{{ ending.quote }}」</p>
        <p>{{ game.frame.text }}</p>
        <div class="ending-bookmark">
          <GameIcon name="leaf" /><span
            >獲得書籤<br /><strong>{{ ending.bookmark }}</strong></span
          >
        </div>
        <div class="button-row">
          <RouterLink class="ornate-button" to="/collection"
            >翻開故事收藏<GameIcon name="arrow" /></RouterLink
          ><RouterLink class="quiet-button" to="/">回到門前</RouterLink>
        </div>
      </section>
    </div>
    <footer class="game-footer">
      <button class="text-link" @click="notebook?.showModal()">
        守夜手記 · 信紙 {{ game.frame?.fragments.length || 0 }}/3</button
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
        {{ game.frame ? sections[game.frame.section] : "第一夜" }} · 已找到
        {{ game.frame?.fragments.length || 0 }} / 3 片信紙
      </p>
      <p v-if="!game.frame?.clues.length">先聽她說。看見的細節，會留在這裡。</p>
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
