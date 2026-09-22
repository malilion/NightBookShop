<script setup lang="ts">
import { ref } from "vue";
import { useGameStore } from "../../stores/gameStore";
import { letterPieces } from "../../data/catalog";
import GameIcon from "../common/GameIcon.vue";
const game = useGameStore(),
  selected = ref<string | null>(null),
  feedback = ref("");
function place(index: number) {
  const slots = [...game.letter.slots];
  if (!selected.value) {
    if (slots[index]) {
      selected.value = slots[index];
      slots[index] = null;
      game.updateLetter({ slots });
    }
    return;
  }
  const existing = slots.indexOf(selected.value);
  if (existing !== -1) slots[existing] = null;
  slots[index] = selected.value;
  game.updateLetter({ slots });
  selected.value = null;
  feedback.value = "碎片已放回信中。";
}
function text(id: string | null) {
  return letterPieces.find((p) => p.id === id)?.text;
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
      先選一枚碎片，再選信上的位置。點選已放好的碎片可以移動，也可以留白。
    </p>
    <div class="letter-layout">
      <div class="letter-paper">
        <p class="letter-date">一九七六年 · 未寄出</p>
        <button
          v-for="(id, i) in game.letter.slots"
          :key="i"
          class="letter-slot"
          :class="{ filled: id }"
          :aria-label="`信紙第 ${i + 1} 格${id ? '：' + text(id) : '，空白'}`"
          @click="place(i)"
        >
          <span v-if="id">{{
            id === "wait" && game.letter.alternate ? "請原諒我。" : text(id)
          }}</span
          ><span v-else class="empty-slot"
            >{{ ["起筆", "那一晚", "沒說完的話"][i]
            }}<small>放入碎片</small></span
          ></button
        ><span class="letter-signature">靜蘭</span>
      </div>
      <div class="letter-fragments">
        <button
          v-for="piece in [...letterPieces].reverse()"
          :key="piece.id"
          class="fragment"
          :disabled="game.letter.slots.includes(piece.id)"
          :aria-pressed="selected === piece.id"
          @click="selected = piece.id"
        >
          <span>{{ piece.text }}</span
          ><GameIcon
            v-if="game.letter.slots.includes(piece.id)"
            name="check"
          /></button
        ><button
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
            />
            使用多年後補寫的句子</label
          >
        </div>
      </div>
    </div>
    <div class="panel-footer">
      <span class="subtle" aria-live="polite">{{
        feedback || "每一道摺痕，都留著不同的時間。"
      }}</span
      ><button class="ornate-button" @click="game.finishLetter">
        {{ game.letter.slots.every(Boolean) ? "把信交還給她" : "先保留這些空白"
        }}<GameIcon name="arrow" />
      </button>
    </div>
  </section>
</template>
