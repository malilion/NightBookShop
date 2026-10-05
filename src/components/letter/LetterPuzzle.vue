<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useGameStore } from "../../stores/gameStore";
import {
  letterPieces,
  boyanLetterPieces,
  ruoyinLetterPieces,
  yenuanLetterPieces,
  yuhangLetterPieces,
  haimingLetterPieces,
  linchengLetterPieces,
} from "../../data/catalog";
import { audio } from "../../audio/audioManager";
import { resonanceFragments } from "../../data/resonanceFragments";
import GameIcon from "../common/GameIcon.vue";

const game = useGameStore();
const pieces = computed(() =>
  game.chapterId === "boyan"
    ? boyanLetterPieces
    : game.chapterId === "lincheng"
      ? linchengLetterPieces
    : game.chapterId === "haiming"
      ? haimingLetterPieces
    : game.chapterId === "yuhang"
      ? yuhangLetterPieces
    : game.chapterId === "ruoyin"
      ? ruoyinLetterPieces
      : game.chapterId === "yenuan"
        ? yenuanLetterPieces
      : letterPieces,
);
const isBoyan = computed(() => game.chapterId === "boyan");
const isRuoyin = computed(() => game.chapterId === "ruoyin");
const isYenuan = computed(() => game.chapterId === "yenuan");
const isYuhang = computed(() => game.chapterId === "yuhang");
const isHaiming = computed(() => game.chapterId === "haiming");
const isLincheng = computed(() => game.chapterId === "lincheng");
const hasTwoSides = computed(() => isRuoyin.value || isYenuan.value);
const resonanceFragment = computed(() => game.frame?.resonanceFragment ? resonanceFragments[game.frame.resonanceFragment] : null);
const activeSlots = computed(() =>
  hasTwoSides.value && game.letter.activeSide === "back"
    ? game.letter.reverseSlots
    : game.letter.slots,
);
const selected = ref<string | null>(null);
const feedback = ref("");
const workspaceZoom = ref(1);
let pinch: { distance: number; zoom: number } | null = null;
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
// 墨光：拿著碎片靠近它原本的位置時，那一格會微微發亮（拖曳經過、或選取後指向／聚焦該格）。
const hoverSlot = ref<number | null>(null);
const heldPiece = computed(() => drag.value?.moved ? drag.value.id : selected.value);
const glowSlot = computed(() =>
  heldPiece.value !== null &&
  hoverSlot.value !== null &&
  pieces.value[hoverSlot.value]?.id === heldPiece.value
    ? hoverSlot.value
    : null,
);
watch(glowSlot, (index) => {
  if (index !== null) feedback.value = `墨跡在第 ${index + 1} 格微微發亮。`;
});

function clampZoom(value: number) {
  return Math.round(Math.min(1.75, Math.max(1, value)) * 100) / 100;
}
function changeZoom(value: number) {
  workspaceZoom.value = clampZoom(value);
}
function touchDistance(touches: TouchList) {
  const first = touches.item(0)!;
  const second = touches.item(1)!;
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
}
function beginWorkspaceTouch(event: TouchEvent) {
  if (event.touches.length !== 2) return;
  pinch = { distance: touchDistance(event.touches), zoom: workspaceZoom.value };
  drag.value = null;
  ignoreClick = true;
}
function moveWorkspaceTouch(event: TouchEvent) {
  if (!pinch || event.touches.length !== 2) return;
  event.preventDefault();
  changeZoom(pinch.zoom * touchDistance(event.touches) / Math.max(1, pinch.distance));
}
function endWorkspaceTouch(event: TouchEvent) {
  if (event.touches.length > 0) return;
  pinch = null;
  window.setTimeout(() => { ignoreClick = false; }, 250);
}

function pieceIndex(id: string) {
  return pieces.value.findIndex((piece) => piece.id === id);
}
function pieceText(id: string) {
  const index = pieceIndex(id);
  if (index < 0) return "";
  if (hasTwoSides.value)
    return game.letter.activeSide === "back"
      ? pieces.value[index]!.back
      : pieces.value[index]!.text;
  if (isHaiming.value && game.letter.alternate)
    return haimingLetterPieces[index]!.polished;
  return game.letter.flipped[index]
    ? pieces.value[index]!.back
    : id === "wait" && game.letter.alternate
      ? "請原諒我。"
      : pieces.value[index]!.text;
}
function placePiece(id: string, index: number) {
  const slots = [...activeSlots.value];
  const existing = slots.indexOf(id);
  if (existing !== -1) slots[existing] = null;
  slots[index] = id;
  const angles = [...game.letter.angles];
  angles[pieceIndex(id)] = 0;
  game.updateLetter({
    [hasTwoSides.value && game.letter.activeSide === "back"
      ? "reverseSlots"
      : "slots"]: slots,
    angles,
  });
  audio.cue("paper");
  selected.value = null;
  feedback.value = `碎片已吸附在第 ${index + 1} 格。`;
}
function onSlotClick(index: number) {
  if (ignoreClick) return;
  const slots = [...activeSlots.value];
  if (!selected.value) {
    if (slots[index]) {
      selected.value = slots[index];
      slots[index] = null;
      game.updateLetter({
        [hasTwoSides.value && game.letter.activeSide === "back"
          ? "reverseSlots"
          : "slots"]: slots,
      });
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
function focusSlot(index: number) {
  document.querySelector<HTMLElement>(`[data-letter-slot="${index}"]`)?.focus();
}
function moveByKeyboard(id: string, from: number | null, direction: number) {
  const slots = [...activeSlots.value];
  const target = from === null
    ? direction > 0 ? slots.findIndex((slot) => !slot) : slots.findLastIndex((slot) => !slot)
    : (from + direction + slots.length) % slots.length;
  const index = target < 0 ? direction > 0 ? 0 : slots.length - 1 : target;
  const displaced = slots[index];
  if (from !== null) slots[from] = displaced;
  slots[index] = id;
  game.updateLetter({
    [hasTwoSides.value && game.letter.activeSide === "back" ? "reverseSlots" : "slots"]: slots,
  });
  selected.value = null;
  feedback.value = `碎片已移到第 ${index + 1} 格。`;
  audio.cue("paper");
  focusSlot(index);
}
function onSlotKeydown(event: KeyboardEvent, index: number, id: string | null) {
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
  event.preventDefault();
  const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
  if (id) moveByKeyboard(id, index, direction);
  else if (selected.value) moveByKeyboard(selected.value, null, direction);
  else focusSlot((index + direction + activeSlots.value.length) % activeSlots.value.length);
}
function onFragmentKeydown(event: KeyboardEvent, id: string) {
  if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
  event.preventDefault();
  moveByKeyboard(id, null, event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1);
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
    inspected: true,
  });
  feedback.value = flipped[index]
    ? "翻到背面，看見紙上的另一道痕跡。"
    : "翻回正面。";
}
function turnLetter() {
  game.updateLetter({
    activeSide: game.letter.activeSide === "front" ? "back" : "front",
    inspected: true,
  });
  selected.value = null;
  feedback.value =
    game.letter.activeSide === "back"
      ? isYenuan.value ? "翻到背面。母親留下的短箋還在。" : "翻到背面。這一面是寫給年輕若音的信。"
      : isYenuan.value ? "翻回正面。這一面是蘋果麵包食譜。" : "翻回正面。這一面寫給季晴。";
  audio.cue("paper");
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
  if (drag.value.moved) {
    const over = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-letter-slot]");
    hoverSlot.value = over ? Number(over.dataset.letterSlot) : null;
  }
}
function endDrag(event: PointerEvent) {
  const current = drag.value;
  if (!current || current.pointerId !== event.pointerId) return;
  drag.value = null;
  hoverSlot.value = null;
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
    const slots = [...activeSlots.value];
    slots[current.source] = null;
    game.updateLetter({
      [hasTwoSides.value && game.letter.activeSide === "back"
        ? "reverseSlots"
        : "slots"]: slots,
    });
    selected.value = null;
    feedback.value = "碎片已放回桌上。";
  } else {
    feedback.value = "把碎片拖到信紙格，或放回右側桌面。";
  }
}
function cancelDrag() {
  drag.value = null;
  hoverSlot.value = null;
}
</script>

<template>
  <section class="letter-panel paper-frame" aria-label="拼信">
    <div class="panel-heading">
      <GameIcon name="letter" :size="28" />
      <div>
        <p class="subtle">
          {{
            isLincheng
              ? "最後一位訪客"
              : isHaiming
              ? "留在煤油燈裡的紙船"
              : isYuhang
              ? "收件人是七年後的自己"
              : isYenuan
              ? "留在烤箱旁的食譜"
              : isRuoyin
              ? "在最後一個音符之後"
              : isBoyan
                ? "明日之前，請讓我停一下"
                : "月下未寄出的信"
          }}
        </p>
        <h2>{{ isYenuan ? "把食譜的兩面拼回來" : isYuhang ? "把藍色信拼回來" : isHaiming ? "展開紙船，留下他的字" : isLincheng ? "把自己的信拼回來" : "把未完的話，放回信裡" }}</h2>
      </div>
    </div>
    <p class="tea-clue">
      {{
        isLincheng
          ? "四片信紙是小時候的妳寫給如今的自己。可以慢慢排好、看紙背，再決定想取回多少細節。"
          : isHaiming
          ? "四片紙船留著海明反覆修改的話。查看筆跡後，可保留停頓與矛盾，或修成流暢的英雄敘述。"
          : isYuhang
          ? "四片信紙有每年重寫的痕跡。排好順序，查看墨跡，再選一枚郵票決定送往哪一個時間。"
          : isYenuan
          ? "正面是蘋果麵包的做法，背面是母親留給葉暖的話。兩面各自排列，可拖曳或先選碎片再選格子。"
          : isRuoyin
          ? "同一組碎片有兩面：正面寫給季晴，背面寫給年輕的若音。兩面各自排列，可拖曳或先選碎片再選格子。"
          : "拖動碎片到信上的位置，或先選碎片再選格子。鍵盤可用 Tab 聚焦、方向鍵移動碎片；選中碎片可旋轉、翻面，也可以留白。"
      }}
    </p>
    <div v-if="hasTwoSides" class="letter-side-buttons button-row">
      <button class="quiet-button" type="button" @click="turnLetter">
        {{
          isYenuan
            ? game.letter.activeSide === "front" ? "翻到背面 · 給葉暖的短箋" : "翻回正面 · 蘋果麵包食譜"
            : game.letter.activeSide === "front" ? "翻到背面 · 給年輕的自己" : "翻回正面 · 給季晴"
        }}
      </button>
      <span class="subtle"
        >正面 {{ game.letter.slots.filter(Boolean).length }}/3 · 背面
        {{ game.letter.reverseSlots.filter(Boolean).length }}/3</span
      >
    </div>
    <div class="letter-zoom-controls" role="group" aria-label="拼信工作區縮放">
      <span>工作區縮放</span>
      <button type="button" :disabled="workspaceZoom <= 1" aria-label="縮小拼信工作區" @click="changeZoom(workspaceZoom - 0.15)">−</button>
      <output aria-live="polite">{{ Math.round(workspaceZoom * 100) }}%</output>
      <button type="button" :disabled="workspaceZoom >= 1.75" aria-label="放大拼信工作區" @click="changeZoom(workspaceZoom + 0.15)">＋</button>
      <span class="subtle">手機可雙指縮放</span>
    </div>
    <div class="letter-layout" :class="{ 'letter-layout-zoomed': workspaceZoom > 1 }" :style="{ '--letter-zoom': workspaceZoom }" @touchstart="beginWorkspaceTouch" @touchmove="moveWorkspaceTouch" @touchend="endWorkspaceTouch" @touchcancel="endWorkspaceTouch">
      <div class="letter-paper">
        <p class="letter-date">
          {{
            isLincheng
              ? "給長大後的林澄 · 沒有寄出日期"
              : isHaiming
              ? "給小川 · 煤油燈內的紙船"
              : isYuhang
              ? "七年後仍在送信的程雨航 · 寄件人：現在的自己"
              : isYenuan
              ? game.letter.activeSide === "front" ? "晨麥 · 蘋果麵包" : "給葉暖 · 媽媽寫"
              : isRuoyin
              ? game.letter.activeSide === "front"
                ? "給季晴 · 未寄出"
                : "給十歲的若音 · 未寄出"
              : isBoyan
                ? "今晚 · 尚未寄出"
                : "一九七六年 · 未寄出"
          }}
        </p>
        <button
          v-for="(id, i) in activeSlots"
          :key="i"
          class="letter-slot"
          :class="{ filled: id, 'ink-glow': glowSlot === i }"
          :data-letter-slot="i"
          :aria-label="`信紙第 ${i + 1} 格${id ? '：' + pieceText(id) : '，空白'}`"
          @click="onSlotClick(i)"
          @keydown="onSlotKeydown($event, i, id)"
          @pointerdown="id && beginDrag($event, id, i)"
          @pointermove="moveDrag"
          @pointerup="endDrag"
          @pointercancel="cancelDrag"
          @pointerenter="!drag && (hoverSlot = i)"
          @pointerleave="!drag && hoverSlot === i && (hoverSlot = null)"
          @focus="hoverSlot = i"
          @blur="hoverSlot === i && (hoverSlot = null)"
        >
          <span v-if="id">{{ pieceText(id) }}</span>
          <span v-else class="empty-slot"
            >{{
              (isLincheng
                ? ["我藏起了信", "我害怕的事", "兩個願望", "寫給自己的話"]
                : isHaiming
                ? ["一直守著的燈", "岸上的等待", "回家的路", "想留下的話"]
                : isYuhang
                ? ["如果又說明年", "先承認", "不敢面對", "我們的夢"]
                : isYenuan
                ? game.letter.activeSide === "front" ? ["材料", "第二次發酵", "烤箱溫度"] : ["起筆", "想告訴妳", "留給妳的"]
                : isRuoyin
                ? ["起筆", "沒有說出口的", "仍想留下的"]
                : isBoyan
                  ? ["目前狀態", "需要的界線", "能交接的事", "下一步"]
                  : ["起筆", "那一晚", "沒說完的話"])[i]
            }}<small>放入碎片</small></span
          >
        </button>
        <span class="letter-signature">{{
          isLincheng ? "林澄" : isHaiming ? "海明" : isYuhang ? "雨航" : isYenuan ? "葉暖" : isRuoyin ? "若音" : isBoyan ? "柏言" : "靜蘭"
        }}</span>
      </div>
      <div class="letter-fragments">
        <div v-if="resonanceFragment" class="resonance-fragment">
          <p class="resonance-fragment-label">共鳴之茶 · 特殊信件碎片</p>
          <button
            type="button"
            class="resonance-fragment-button"
            :aria-expanded="game.letter.resonanceInspected"
            @click="game.updateLetter({ resonanceInspected: !game.letter.resonanceInspected })"
          >
            <GameIcon name="letter" :size="21" />
            {{ game.letter.resonanceInspected ? '摺起' : '展開' }}{{ resonanceFragment.title }}
          </button>
          <p v-if="game.letter.resonanceInspected" class="resonance-fragment-text">{{ resonanceFragment.text }}</p>
        </div>
        <button
          v-for="piece in [...pieces].reverse()"
          :key="piece.id"
          class="fragment"
          :disabled="activeSlots.includes(piece.id)"
          :aria-pressed="selected === piece.id"
          :aria-label="pieceText(piece.id)"
          @click="onFragmentClick(piece.id)"
          @keydown="onFragmentKeydown($event, piece.id)"
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
          <GameIcon v-if="activeSlots.includes(piece.id)" name="check" />
        </button>
        <div v-if="!hasTwoSides" class="letter-tools">
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
          v-if="!hasTwoSides"
          class="text-link inspect-ink"
          @click="game.updateLetter({ inspected: true })"
        >
          <GameIcon name="search" />{{
            isLincheng ? "查看童年的筆跡" : isHaiming ? "查看海明的原句" : isYuhang ? "查看每年的墨跡" : isBoyan ? "查看三版草稿" : "查看不同的墨跡"
          }}
        </button>
        <div v-if="game.letter.inspected && !hasTwoSides" class="ink-note">
          <p>
            {{
              isLincheng
                ? "紙角的小月亮是妳自己畫的；信不是店主替妳寫的，也沒有要求妳必須一次讀完。"
                : isHaiming
                ? "有些句子重複、停住，甚至互相矛盾；這些痕跡也是海明正在說話的證據。"
                : isYuhang
                ? "郵戳每年不同，字卻是雨航自己的。他一再改寫日期，從未真正寄出。"
                : isBoyan
                ? "第一版只道歉，第二版只列交接，第三版終於寫下「我真的很累」。現在的四句話讓他自己說出需要。"
                : "「請原諒我」的墨色更深，是多年後補上的。年輕時的她，寫的是「請不要等我」。"
            }}
          </p>
          <label v-if="!isBoyan && !isYuhang && !isLincheng"
            ><input
              type="checkbox"
              :checked="game.letter.alternate"
              @change="
                game.updateLetter({
                  alternate: ($event.target as HTMLInputElement).checked,
                })
              "
            />{{ isHaiming ? "修成流暢的英雄敘述" : "使用多年後補寫的句子" }}</label
          >
        </div>
        <fieldset v-if="isYuhang" class="letter-stamps">
          <legend>選一枚郵票 · 只能貼一枚</legend>
          <label v-for="stamp in [{ id: 'past', label: '過去' }, { id: 'present', label: '現在' }, { id: 'future', label: '未來' }]" :key="stamp.id">
            <input type="radio" name="letter-stamp" :checked="game.letter.stamp === stamp.id" @change="game.updateLetter({ stamp: stamp.id as 'past' | 'present' | 'future' })" />
            {{ stamp.label }}
          </label>
        </fieldset>
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
        {{
          isLincheng
            ? "把信放在自己面前"
            : isHaiming
            ? "把紙船交還給他"
            : isYuhang
            ? "把藍色信交還給他"
            : hasTwoSides
            ? isYenuan ? "把食譜交還給她" : "把兩面的信交還給她"
            : game.letter.slots.every(Boolean)
              ? isBoyan
                ? "把信交還給他"
                : "把信交還給她"
              : "先保留這些空白"
        }}<GameIcon name="arrow" />
      </button>
    </div>
  </section>
</template>
