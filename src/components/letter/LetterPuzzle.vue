<script setup lang="ts">
import { ref } from "vue";
import { useGameStore } from "../../stores/gameStore";
import { letterPieces } from "../../data/catalog";
import { audio } from "../../audio/audioManager";
import GameIcon from "../common/GameIcon.vue";

const game = useGameStore();
const selected = ref<string | null>(null);
const feedback = ref("");
const drag = ref<{
  id: string;
  source: number | null;
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  moved: boolean;
} | null>(null);
let ignoreClick = false;

function pieceIndex(id: string) {
  return letterPieces.findIndex((piece) => piece.id === id);
}
function pieceText(id: string) {
  const index = pieceIndex(id);
  if (index < 0) return "";
  return game.letter.flipped[index]
    ? letterPieces[index]!.back
    : id === "wait" && game.letter.alternate
      ? "請原諒我。"
      : letterPieces[index]!.text;
}
function placePiece(id: string, index: number) {
  const slots = [...game.letter.slots];
  const existing = slots.indexOf(id);
  if (existing !== -1) slots[existing] = null;
  slots[index] = id;
  const angles = [...game.letter.angles];
  angles[pieceIndex(id)] = 0;
  game.updateLetter({ slots, angles });
  audio.cue("paper");
  selected.value = null;
  feedback.value = `碎片已吸附在第 ${index + 1} 格。`;
}
function onSlotClick(index: number) {
  if (ignoreClick) return;
  const slots = [...game.letter.slots];
  if (!selected.value) {
    if (slots[index]) {
      selected.value = slots[index];
      slots[index] = null;
      game.updateLetter({ slots });
      feedback.value = "已取下碎片，選擇另一格放入。";
    }
    return;
  }
  placePiece(selected.value, index);
}
function onFragmentClick(id: string) {
  if (ignoreClick) return;
  selected.value = selected.value === id ? null : id;
  feedback.value = selected.value
    ? "已選取碎片，請選擇信紙上的位置。"
    : "已取消選取。";
}
function rotate() {
  if (!selected.value) return;
  const angles = [...game.letter.angles];
  const index = pieceIndex(selected.value);
  angles[index] = (angles[index]! + 1) % 4;
  game.updateLetter({ angles });
  feedback.value = `碎片已旋轉 ${angles[index]! * 90} 度。`;
}
function flip() {
  if (!selected.value) return;
  const flipped = [...game.letter.flipped];
  const index = pieceIndex(selected.value);
  flipped[index] = !flipped[index];
  game.updateLetter({
    flipped,
    inspected: game.letter.inspected || selected.value === "wait",
  });
  feedback.value = flipped[index]
    ? "翻到背面，看見紙上的另一道痕跡。"
    : "翻回正面。";
}
function beginDrag(event: PointerEvent, id: string, source: number | null) {
  if (event.pointerType === "mouse" && event.button !== 0) return;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  drag.value = {
    id,
    source,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    x: event.clientX,
    y: event.clientY,
    moved: false,
  };
}
function moveDrag(event: PointerEvent) {
  if (!drag.value || drag.value.pointerId !== event.pointerId) return;
  drag.value.x = event.clientX;
  drag.value.y = event.clientY;
  if (
    Math.hypot(
      event.clientX - drag.value.startX,
      event.clientY - drag.value.startY,
    ) > 8
  )
    drag.value.moved = true;
}
function endDrag(event: PointerEvent) {
  const current = drag.value;
  if (!current || current.pointerId !== event.pointerId) return;
  drag.value = null;
  if (!current.moved) return;
  ignoreClick = true;
  window.setTimeout(() => {
    ignoreClick = false;
  }, 0);
  const target = document
    .elementFromPoint(event.clientX, event.clientY)
    ?.closest<HTMLElement>("[data-letter-slot]");
  if (target) {
    placePiece(current.id, Number(target.dataset.letterSlot));
  } else if (
    current.source !== null &&
    document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest(".letter-fragments")
  ) {
    const slots = [...game.letter.slots];
    slots[current.source] = null;
    game.updateLetter({ slots });
    selected.value = null;
    feedback.value = "碎片已放回桌上。";
  } else {
    feedback.value = "把碎片拖到信紙格，或放回右側桌面。";
  }
}
function cancelDrag() {
  drag.value = null;
}
</script>

<template>
  <section class="letter-panel paper-frame" aria-label="拼信">
    <div class="panel-heading">
      <GameIcon name="letter" :size="28" />
      <div>
        <p class="subtle">月下未寄出的信</p>
        <h2>把未完的話，放回信裡</h2>
      </div>
    </div>
    <p class="tea-clue">
      拖動碎片到信上的位置，或先選碎片再選格子。選中碎片可旋轉、翻面；放入時會吸附擺正，也可以留白。
    </p>
    <div class="letter-layout">
      <div class="letter-paper">
        <p class="letter-date">一九七六年 · 未寄出</p>
        <button
          v-for="(id, i) in game.letter.slots"
          :key="i"
          class="letter-slot"
          :class="{ filled: id }"
          :data-letter-slot="i"
          :aria-label="`信紙第 ${i + 1} 格${id ? '：' + pieceText(id) : '，空白'}`"
          @click="onSlotClick(i)"
          @pointerdown="id && beginDrag($event, id, i)"
          @pointermove="moveDrag"
          @pointerup="endDrag"
          @pointercancel="cancelDrag"
        >
          <span v-if="id">{{ pieceText(id) }}</span>
          <span v-else class="empty-slot"
            >{{ ["起筆", "那一晚", "沒說完的話"][i]
            }}<small>放入碎片</small></span
          >
        </button>
        <span class="letter-signature">靜蘭</span>
      </div>
      <div class="letter-fragments">
        <button
          v-for="piece in [...letterPieces].reverse()"
          :key="piece.id"
          class="fragment"
          :disabled="game.letter.slots.includes(piece.id)"
          :aria-pressed="selected === piece.id"
          :aria-label="pieceText(piece.id)"
          @click="onFragmentClick(piece.id)"
          @pointerdown="beginDrag($event, piece.id, null)"
          @pointermove="moveDrag"
          @pointerup="endDrag"
          @pointercancel="cancelDrag"
        >
          <span
            class="fragment-paper"
            :style="{
              transform: `rotate(${game.letter.angles[pieceIndex(piece.id)]! * 90}deg)`,
            }"
            aria-hidden="true"
          ></span>
          <span>{{ pieceText(piece.id) }}</span>
          <GameIcon v-if="game.letter.slots.includes(piece.id)" name="check" />
        </button>
        <div class="letter-tools">
          <button
            type="button"
            class="quiet-button"
            :disabled="!selected"
            @click="rotate"
          >
            旋轉 90°
          </button>
          <button
            type="button"
            class="quiet-button"
            :disabled="!selected"
            @click="flip"
          >
            {{
              selected && game.letter.flipped[pieceIndex(selected)]
                ? "翻回正面"
                : "翻到背面"
            }}
          </button>
        </div>
        <button
          class="text-link inspect-ink"
          @click="game.updateLetter({ inspected: true })"
        >
          <GameIcon name="search" />查看不同的墨跡
        </button>
        <div v-if="game.letter.inspected" class="ink-note">
          <p>
            「請原諒我」的墨色更深，是多年後補上的。年輕時的她，寫的是「請不要等我」。
          </p>
          <label
            ><input
              type="checkbox"
              :checked="game.letter.alternate"
              @change="
                game.updateLetter({
                  alternate: ($event.target as HTMLInputElement).checked,
                })
              "
            />使用多年後補寫的句子</label
          >
        </div>
      </div>
    </div>
    <div
      v-if="drag?.moved"
      class="letter-drag-ghost"
      :style="{
        left: `${drag.x}px`,
        top: `${drag.y}px`,
        transform: `translate(-50%, -50%) rotate(${game.letter.angles[pieceIndex(drag.id)]! * 90}deg)`,
      }"
      aria-hidden="true"
    >
      {{ pieceText(drag.id) }}
    </div>
    <div class="panel-footer">
      <span class="subtle" aria-live="polite">{{
        feedback || "每一道摺痕，都留著不同的時間。"
      }}</span>
      <button class="ornate-button" @click="game.finishLetter">
        {{ game.letter.slots.every(Boolean) ? "把信交還給她" : "先保留這些空白"
        }}<GameIcon name="arrow" />
      </button>
    </div>
  </section>
</template>
