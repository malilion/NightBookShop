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
  PhSpeakerHigh,
  PhSpeakerSlash,
  PhCoffee,
  PhCompass,
  PhChatCircleDots,
  PhLightbulb,
  PhArrowsClockwise,
  PhSparkle,
  PhThermometerSimple,
  PhHourglassSimple,
  PhCaretDown,
  PhFlowerTulip,
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
    | "search"
    | "sound"
    | "muted"
    | "tea"
    | "compass"
    | "chat"
    | "bulb"
    | "reset"
    | "sparkle"
    | "thermometer"
    | "hourglass"
    | "caret"
    | "flower";
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
  sound: PhSpeakerHigh,
  muted: PhSpeakerSlash,
  tea: PhCoffee,
  compass: PhCompass,
  chat: PhChatCircleDots,
  bulb: PhLightbulb,
  reset: PhArrowsClockwise,
  sparkle: PhSparkle,
  thermometer: PhThermometerSimple,
  hourglass: PhHourglassSimple,
  caret: PhCaretDown,
  flower: PhFlowerTulip,
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
