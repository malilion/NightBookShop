<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "../stores/gameStore";
import type { SaveGame } from "../types/game";
import { chapterForVersion, nightName, endings, playableChapters } from "../data/catalog";
import { sceneBackground } from "../data/sceneArt";
import { BACKUP_ID } from "../db/saveRepository";
import PageHeader from "../components/common/PageHeader.vue";
import GameIcon from "../components/common/GameIcon.vue";
const game = useGameStore(),
  router = useRouter();
const confirm = ref<HTMLDialogElement>();
const action = ref<
  | { kind: "save"; slot: number }
  | { kind: "load"; id: string }
  | { kind: "delete"; id: string; slot: number }
>();
const tab = ref<"manual" | "auto" | "chapter">("manual");
const slot = (n: number) =>
  game.saveList.find((s) => s.id === `${tab.value}-${n}`);
// 章節頁：各夜首次完成時的快照，以及安裝新版前留下的相容性快照。
const archived = computed(() => [
  ...playableChapters.flatMap((chapter) => {
    const save = game.saveList.find((s) => s.id === `chapter-${chapter}`);
    return save ? [save] : [];
  }),
  ...game.saveList.filter((s) => s.id === BACKUP_ID),
]);
function requestSave(n: number) {
  if (slot(n)) {
    action.value = { kind: "save", slot: n };
    confirm.value?.showModal();
  } else void game.persist("manual", n);
}
function requestLoad(save: SaveGame) {
  action.value = { kind: "load", id: save.id };
  if (game.frame) confirm.value?.showModal();
  else void perform();
}
function requestDelete(save: SaveGame, n: number) {
  action.value = { kind: "delete", id: save.id, slot: n };
  confirm.value?.showModal();
}
async function perform() {
  confirm.value?.close();
  if (action.value?.kind === "save")
    await game.persist("manual", action.value.slot);
  else if (action.value?.kind === "delete") await game.removeSave(action.value.id);
  else if (action.value?.kind === "load" && (await game.load(action.value.id)))
    await router.push("/game");
}
const modeLabel = (save?: SaveGame) =>
  save
    ? {
        dialogue: "傾聽",
        tea: "製茶",
        letter: "拼信",
        melody: "旋律",
        hearth: "爐火",
        route: "投遞路線",
        lamp: "守燈",
        archive: "六夜地圖",
        notifications: "整理通知",
        ending: "夜末",
      }[save.snapshot.frame.mode]
    : "";
const title = (save: SaveGame) => {
  const night = nightName(chapterForVersion(save.snapshot.storyVersion));
  if (save.kind === "backup") return `更新前備份 · ${night}`;
  const ending = save.snapshot.frame.endingId;
  if (save.kind === "chapter" && ending) return `${night} · 〈${endings[ending].title}〉`;
  return `${night} · ${modeLabel(save)}`;
};
const thumbnail = (save: SaveGame) =>
  sceneBackground(
    save.snapshot.frame,
    chapterForVersion(save.snapshot.storyVersion),
    save.snapshot.opening.complete,
  );
function playTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) return "不到一分鐘";
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours} 小時 ${minutes % 60} 分` : `${minutes} 分鐘`;
}
const when = (iso: string) => new Date(iso).toLocaleString("zh-TW");
const dialogTitle = computed(() =>
  action.value?.kind === "save"
    ? "覆寫這一頁？"
    : action.value?.kind === "delete"
      ? `刪除第 ${action.value.slot} 格？`
      : "回到這份存檔？",
);
const dialogText = computed(() =>
  action.value?.kind === "save"
    ? "這格手動存檔會換成目前的進度，其他存檔與收藏會保留。"
    : action.value?.kind === "delete"
      ? "這格手動存檔會被移除，無法復原。自動存檔、章節快照與收藏都會保留。"
      : "目前畫面將切換到選定的存檔。最近的自動存檔會保留。",
);
const dialogConfirm = computed(() =>
  action.value?.kind === "save"
    ? "確定覆寫"
    : action.value?.kind === "delete"
      ? "確定刪除"
      : "讀取這一頁",
);
</script>
<template>
  <main id="main" tabindex="-1" class="library-page">
    <PageHeader
      title="留下這一頁"
      subtitle="把今晚的故事，留給下次回來的自己。"
    />
    <div class="tabs">
      <button :aria-pressed="tab === 'manual'" @click="tab = 'manual'">
        手動存檔</button
      ><button :aria-pressed="tab === 'auto'" @click="tab = 'auto'">
        自動存檔</button
      ><button :aria-pressed="tab === 'chapter'" @click="tab = 'chapter'">
        章節快照
      </button>
    </div>
    <p v-if="game.notice" role="status" class="save-notice">
      {{ game.notice }}
    </p>
    <div v-if="tab !== 'chapter'" class="save-grid">
      <article
        v-for="n in tab === 'manual' ? 10 : 3"
        :key="n"
        class="save-slot"
      >
        <span class="slot-number">{{ String(n).padStart(2, "0") }}</span>
        <div>
          <img
            v-if="slot(n)"
            class="save-thumb"
            :src="thumbnail(slot(n)!)"
            alt=""
            loading="lazy"
          />
          <h2>
            {{ slot(n) ? title(slot(n)!) : "尚未寫下的頁面" }}
          </h2>
          <p>
            {{
              slot(n)?.snapshot.frame.text ||
              "在書店裡，隨時可以留下目前的進度。"
            }}
          </p>
          <span
            v-if="slot(n)?.snapshot.storyVersion === 'jinglan-prototype-1'"
            class="subtle"
            >舊版短篇 · 保留原進度</span
          >
          <time v-if="slot(n)" :datetime="slot(n)!.updatedAt">{{
            when(slot(n)!.updatedAt)
          }}</time>
          <span v-if="slot(n)" class="save-meta"
            >本夜遊玩 {{ playTime(slot(n)!.snapshot.playTimeSeconds) }}</span
          >
        </div>
        <div class="save-actions">
          <button
            v-if="slot(n)"
            class="quiet-button"
            :disabled="game.busy || game.saving"
            @click="requestLoad(slot(n)!)"
          >
            讀取</button
          ><button
            v-if="tab === 'manual'"
            class="quiet-button"
            :disabled="!game.frame || game.saving"
            @click="requestSave(n)"
          >
            <GameIcon name="save" />儲存</button
          ><button
            v-if="tab === 'manual' && slot(n)"
            class="quiet-button"
            :aria-label="`刪除第 ${n} 格`"
            :disabled="game.busy || game.saving"
            @click="requestDelete(slot(n)!, n)"
          >
            刪除
          </button>
        </div>
      </article>
    </div>
    <template v-else>
      <p class="save-explain">
        每一夜第一次走到結局時，書店會留下一份快照，可以回去重讀那一夜的結尾；它也記著後面幾夜會想起的事，不會被新的存檔覆蓋。安裝新版前另留的備份也在這裡。
      </p>
      <p v-if="!archived.length" class="save-explain">還沒有完成的一夜。</p>
      <div class="save-grid">
        <article v-for="save in archived" :key="save.id" class="save-slot">
          <span class="slot-number"><GameIcon :name="save.kind === 'backup' ? 'save' : 'bookmark'" /></span>
          <div>
            <img class="save-thumb" :src="thumbnail(save)" alt="" loading="lazy" />
            <h2>{{ title(save) }}</h2>
            <p>{{ save.snapshot.frame.text }}</p>
            <time :datetime="save.createdAt">{{
              save.kind === "backup" ? `備份於 ${when(save.createdAt)}` : `首次完成於 ${when(save.createdAt)}`
            }}</time>
            <span class="save-meta"
              >本夜遊玩 {{ playTime(save.snapshot.playTimeSeconds) }}</span
            >
          </div>
          <div class="save-actions">
            <button
              class="quiet-button"
              :disabled="game.busy || game.saving"
              @click="requestLoad(save)"
            >
              {{ save.kind === "backup" ? "讀取" : "重讀結局" }}
            </button>
          </div>
        </article>
      </div>
    </template>
    <dialog ref="confirm" class="modal-panel">
      <h2>{{ dialogTitle }}</h2>
      <p>{{ dialogText }}</p>
      <div class="button-row">
        <button class="ornate-button" @click="perform">
          {{ dialogConfirm }}</button
        ><button class="quiet-button" autofocus @click="confirm?.close()">
          取消
        </button>
      </div>
    </dialog>
  </main>
</template>
