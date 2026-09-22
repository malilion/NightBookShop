<script setup lang="ts">
import {
  PhMoon,
  PhBookOpen,
  PhBookmarkSimple,
  PhGearSix,
  PhArrowRight,
  PhArrowLeft,
  PhFloppyDisk,
  PhX,
  PhEnvelopeSimple,
  PhLeaf,
  PhDrop,
  PhClock,
  PhLockSimple,
  PhCheck,
  PhMagnifyingGlass,
} from "@phosphor-icons/vue";
defineProps<{
  name:
    | "moon"
    | "book"
    | "bookmark"
    | "settings"
    | "arrow"
    | "back"
    | "save"
    | "close"
    | "letter"
    | "leaf"
    | "drop"
    | "clock"
    | "lock"
    | "check"
    | "search";
  size?: number;
}>();
const icons = {
  moon: PhMoon,
  book: PhBookOpen,
  bookmark: PhBookmarkSimple,
  settings: PhGearSix,
  arrow: PhArrowRight,
  back: PhArrowLeft,
  save: PhFloppyDisk,
  close: PhX,
  letter: PhEnvelopeSimple,
  leaf: PhLeaf,
  drop: PhDrop,
  clock: PhClock,
  lock: PhLockSimple,
  check: PhCheck,
  search: PhMagnifyingGlass,
};
</script>
<template>
  <component
    :is="icons[name]"
    :size="size || 20"
    weight="light"
    aria-hidden="true"
  />
</template>
