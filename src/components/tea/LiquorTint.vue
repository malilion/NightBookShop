<script setup lang="ts">
import { computed, useId } from "vue";
import { rgbChannels } from "../../services/teaInfusion";
const props = defineProps<{
  color: string;
  region?: { x: number; y: number; width: number; height: number };
}>();
const id = `liquor-${useId()}`;
const channels = computed(() =>
  rgbChannels(props.color).map((value) => value / 255),
);
</script>
<template>
  <g :data-liquor-color="color">
    <defs>
      <filter
        :id="id"
        :filterUnits="region ? 'userSpaceOnUse' : 'objectBoundingBox'"
        :x="region?.x ?? '0%'"
        :y="region?.y ?? '0%'"
        :width="region?.width ?? '100%'"
        :height="region?.height ?? '100%'"
        color-interpolation-filters="sRGB"
      >
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="linear" :slope="channels[0]" />
          <feFuncG type="linear" :slope="channels[1]" />
          <feFuncB type="linear" :slope="channels[2]" />
        </feComponentTransfer>
      </filter>
    </defs>
    <g :filter="`url(#${id})`"><slot /></g>
  </g>
</template>
