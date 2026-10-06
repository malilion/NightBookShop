<script setup lang="ts">
// 信紙碎片上的小圖。每片紙有一個小圖，線索卡的縮圖畫出它們在信上的位置，
// 玩家可以照圖找位置；對讀屏只是裝飾，位置另有格子標籤說明。
export type LetterMotifName =
  | "moon"
  | "lantern"
  | "tree"
  | "clock"
  | "train"
  | "envelope"
  | "note"
  | "star"
  | "wheat"
  | "apple"
  | "house"
  | "stamp"
  | "sprig"
  | "lighthouse"
  | "wave"
  | "boat"
  | "cat";
withDefaults(defineProps<{ name: LetterMotifName; size?: number }>(), { size: 32 });
</script>

<template>
  <svg
    class="letter-motif"
    :data-motif="name"
    :width="size"
    :height="size"
    viewBox="0 0 32 32"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="name === 'moon'">
      <path d="M20 5a11 11 0 1 0 7 17A9 9 0 0 1 20 5Z" fill="currentColor" fill-opacity=".18" />
      <path d="M9 7l.8 1.6L11.4 9l-1.6.8L9 11.4l-.8-1.6L6.6 9l1.6-.4Z" />
    </template>
    <template v-else-if="name === 'lantern'">
      <path d="M16 3v3M12 6h8M11 9h10l-1 15H12Z" />
      <path d="M13 27h6M16 13c-2 2.5-2 5 0 7 2-2 2-4.5 0-7Z" fill="currentColor" fill-opacity=".25" />
    </template>
    <template v-else-if="name === 'tree'">
      <path d="M16 29V15M16 20l-5-4M16 18l5-5" />
      <path d="M6 14a10 7 0 0 1 20 0 6 5 0 0 1-6 5H12a6 5 0 0 1-6-5Z" fill="currentColor" fill-opacity=".18" />
      <path d="M8 29h16" />
    </template>
    <template v-else-if="name === 'clock'">
      <circle cx="16" cy="16" r="11" />
      <path d="M16 9v7l5 3" />
    </template>
    <template v-else-if="name === 'train'">
      <rect x="8" y="5" width="16" height="18" rx="4" />
      <path d="M8 14h16M12 27l2-4M20 27l-2-4" />
      <circle cx="12.5" cy="19" r="1" fill="currentColor" /><circle cx="19.5" cy="19" r="1" fill="currentColor" />
    </template>
    <template v-else-if="name === 'envelope'">
      <rect x="4" y="8" width="24" height="17" rx="1.5" />
      <path d="M4 9l12 9 12-9" />
      <circle cx="16" cy="19" r="2.4" fill="currentColor" fill-opacity=".35" />
    </template>
    <template v-else-if="name === 'note'">
      <path d="M12 24V7l13-3v17" />
      <ellipse cx="9" cy="24" rx="3.4" ry="2.6" fill="currentColor" fill-opacity=".3" />
      <ellipse cx="22" cy="21" rx="3.4" ry="2.6" fill="currentColor" fill-opacity=".3" />
    </template>
    <template v-else-if="name === 'star'">
      <path d="M16 4l3 8.5 9 .5-7 5.5 2.5 9L16 22l-7.5 5.5 2.5-9L4 13l9-.5Z" fill="currentColor" fill-opacity=".18" />
    </template>
    <template v-else-if="name === 'wheat'">
      <path d="M16 29V6" />
      <path d="M16 10c-3-1-4-3-4-5 3 0 4 2 4 5Zm0 0c3-1 4-3 4-5-3 0-4 2-4 5ZM16 16c-3-1-4-3-4-5 3 0 4 2 4 5Zm0 0c3-1 4-3 4-5-3 0-4 2-4 5ZM16 22c-3-1-4-3-4-5 3 0 4 2 4 5Zm0 0c3-1 4-3 4-5-3 0-4 2-4 5Z" fill="currentColor" fill-opacity=".2" />
    </template>
    <template v-else-if="name === 'apple'">
      <path d="M16 10c-4-3-11-1-10 7 1 7 5 11 10 9 5 2 9-2 10-9 1-8-6-10-10-7Z" fill="currentColor" fill-opacity=".18" />
      <path d="M16 10c0-3 1-5 3-6M17 7c3-1 5 0 6 2-3 1-5 0-6-2Z" />
    </template>
    <template v-else-if="name === 'house'">
      <path d="M5 15L16 6l11 9M8 13v14h16V13" />
      <path d="M14 27v-6h4v6M11 17h3v3h-3ZM18 17h3v3h-3Z" fill="currentColor" fill-opacity=".25" />
    </template>
    <template v-else-if="name === 'stamp'">
      <path d="M6 5h20v22H6Z" stroke-dasharray="2 2" />
      <rect x="9" y="8" width="14" height="16" />
      <path d="M19 12a4 4 0 1 0 2 6 3 3 0 0 1-2-6Z" fill="currentColor" fill-opacity=".35" />
    </template>
    <template v-else-if="name === 'sprig'">
      <path d="M8 28C12 20 18 12 26 5" />
      <path d="M12 21c-4 0-6-2-6-4 3-1 5 1 6 4ZM15 16c-1-4 1-6 3-7 1 3 0 5-3 7ZM18 13c4 0 6 2 6 4-3 1-5-1-6-4ZM21 9c-1-3 0-5 2-6 1 3 0 5-2 6Z" fill="currentColor" fill-opacity=".22" />
    </template>
    <template v-else-if="name === 'lighthouse'">
      <path d="M13 9h6l2 19H11ZM12 9l4-5 4 5M12 16h8M11.5 22h9" />
      <path d="M4 7l7 3M28 7l-7 3" stroke-dasharray="1.5 2" />
    </template>
    <template v-else-if="name === 'wave'">
      <path d="M3 13c3-3 6-3 9 0s6 3 9 0 5-3 8-1" />
      <path d="M3 20c3-3 6-3 9 0s6 3 9 0 5-3 8-1" />
      <path d="M3 27c3-3 6-3 9 0s6 3 9 0 5-3 8-1" />
    </template>
    <template v-else-if="name === 'boat'">
      <path d="M4 20h24l-4 6H8Z" fill="currentColor" fill-opacity=".2" />
      <path d="M16 20V4l9 13h-9M16 8l-7 9h7" />
    </template>
    <template v-else>
      <path d="M8 27c-1-6 1-11 5-13l-1-6 4 4h4l4-4-1 6c4 2 5 7 4 13Z" fill="currentColor" fill-opacity=".2" />
      <path d="M26 27c3 0 4-3 2-5" />
      <circle cx="14" cy="17" r=".9" fill="currentColor" /><circle cx="20" cy="17" r=".9" fill="currentColor" />
    </template>
  </svg>
</template>
