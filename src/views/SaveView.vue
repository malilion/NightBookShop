<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useGameStore } from "../stores/gameStore";
import type { SaveGame } from "../types/game";
import PageHeader from "../components/common/PageHeader.vue";
import GameIcon from "../components/common/GameIcon.vue";
const game = useGameStore(),
  router = useRouter();
const confirm = ref<HTMLDialogElement>();
const action = ref<
  { kind: "save"; slot: number } | { kind: "load"; id: string }
>();
const tab = ref<"manual" | "auto">("manual");
const slot = (n: number) =>
  game.saveList.find((s) => s.id === `${tab.value}-${n}`);
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
async function perform() {
  confirm.value?.close();
  if (action.value?.kind === "save")
    await game.persist("manual", action.value.slot);
  else if (action.value?.kind === "load" && (await game.load(action.value.id)))
    await router.push("/game");
}
const modeLabel = (save?: SaveGame) =>
  save
    ? { dialogue: "傾聽", tea: "製茶", letter: "拼信", ending: "夜末" }[
        save.snapshot.frame.mode
      ]
    : "";
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
        自動存檔
      </button>
    </div>
    <p v-if="game.notice" role="status" class="save-notice">
      {{ game.notice }}
    </p>
    <div class="save-grid">
      <article
        v-for="n in tab === 'manual' ? 10 : 3"
        :key="n"
        class="save-slot"
      >
        <span class="slot-number">{{ String(n).padStart(2, "0") }}</span>
        <div>
          <h2>
            {{ slot(n) ? `第一夜 · ${modeLabel(slot(n))}` : "尚未寫下的頁面" }}
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
          <time v-if="slot(n)">{{
            new Date(slot(n)!.updatedAt).toLocaleString("zh-TW")
          }}</time>
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
            <GameIcon name="save" />儲存
          </button>
        </div>
      </article>
    </div>
    <dialog ref="confirm" class="modal-panel">
      <h2>{{ action?.kind === "save" ? "覆寫這一頁？" : "回到這份存檔？" }}</h2>
      <p>
        {{
          action?.kind === "save"
            ? "這格手動存檔會換成目前的進度，其他存檔與收藏會保留。"
            : "目前畫面將切換到選定的存檔。最近的自動存檔會保留。"
        }}
      </p>
      <div class="button-row">
        <button class="ornate-button" @click="perform">
          {{ action?.kind === "save" ? "確定覆寫" : "讀取這一頁" }}</button
        ><button class="quiet-button" autofocus @click="confirm?.close()">
          取消
        </button>
      </div>
    </dialog>
  </main>
</template>
