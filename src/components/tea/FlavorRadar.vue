<script setup lang="ts">
import { computed } from "vue";
import { flavorAxes, flavorLabels, type FlavorProfile } from "../../data/teaFlavor";
import type { FlavorWish } from "../../data/teaHouse";
import { wishRanges, wishScore, wishWords } from "../../services/teaHouse";
const props = withDefaults(
  defineProps<{
    profile: FlavorProfile;
    /** The same composition brewed on recipe, drawn as a dashed guide. */
    projected?: FlavorProfile | null;
    wishes?: FlavorWish[];
    color?: string;
    bitterness?: number;
    compact?: boolean;
  }>(),
  { projected: null, wishes: () => [], color: "#d7a958", bitterness: 0, compact: false },
);
const radius = 78;
const angle = (i: number) => ((-90 + i * 72) * Math.PI) / 180;
const at = (i: number, value: number) => {
  const r = (Math.max(0, Math.min(10, value)) / 10) * radius;
  return { x: r * Math.cos(angle(i)), y: r * Math.sin(angle(i)) };
};
const polygon = (profile: FlavorProfile) =>
  flavorAxes.map((axis, i) => at(i, profile[axis])).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
const rings = [2, 4, 6, 8, 10].map((value) => flavorAxes.map((_, i) => at(i, value)).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "));
const wishFor = (axis: string) => props.wishes.find((wish) => wish.axis === axis) ?? null;
const bands = computed(() =>
  props.wishes.map((wish) => {
    const i = flavorAxes.indexOf(wish.axis);
    const [low, high] = wishRanges[wish.level];
    return { axis: wish.axis, from: at(i, low), to: at(i, high), met: wishScore(props.profile[wish.axis], wish.level) === 100 };
  }),
);
const labels = computed(() =>
  flavorAxes.map((axis, i) => {
    const r = radius + 20;
    const x = r * Math.cos(angle(i)),
      y = r * Math.sin(angle(i));
    const wish = wishFor(axis);
    return {
      axis,
      x,
      y: y + (i === 0 ? -4 : 6),
      anchor: Math.abs(x) < 5 ? "middle" : x > 0 ? "start" : "end",
      text: flavorLabels[axis],
      wish: wish ? wishWords[wish.level] : "",
      met: wish ? wishScore(props.profile[axis], wish.level) === 100 : null,
    };
  }),
);
const summary = computed(() => {
  const values = flavorAxes.map((axis) => `${flavorLabels[axis]} ${props.profile[axis].toFixed(1)}`).join("，");
  const wanted = props.wishes
    .map((wish) => `${flavorLabels[wish.axis]}${wishWords[wish.level]}（${wishScore(props.profile[wish.axis], wish.level) === 100 ? "已符合" : "尚未符合"}）`)
    .join("，");
  return `風味雷達：${values}。苦澀 ${props.bitterness.toFixed(1)}。${wanted ? `客人期望：${wanted}。` : ""}`;
});
</script>
<template>
  <figure class="flavor-radar" :class="{ compact }">
    <svg viewBox="-150 -118 300 236" role="img" :aria-label="summary">
      <polygon v-for="(ring, i) in rings" :key="i" :points="ring" class="radar-ring" :class="{ outer: i === rings.length - 1 }" />
      <line
        v-for="(axis, i) in flavorAxes"
        :key="axis"
        x1="0"
        y1="0"
        :x2="at(i, 10).x"
        :y2="at(i, 10).y"
        class="radar-axis"
      />
      <line
        v-for="band in bands"
        :key="band.axis"
        :x1="band.from.x"
        :y1="band.from.y"
        :x2="band.to.x"
        :y2="band.to.y"
        class="radar-band"
        :class="{ met: band.met }"
      />
      <polygon v-if="projected" :points="polygon(projected)" class="radar-projected" />
      <polygon :points="polygon(profile)" class="radar-profile" :style="{ fill: color }" />
      <circle
        v-for="(axis, i) in flavorAxes"
        :key="`dot-${axis}`"
        :cx="at(i, profile[axis]).x"
        :cy="at(i, profile[axis]).y"
        r="3"
        class="radar-dot"
      />
      <text
        v-for="label in labels"
        :key="`label-${label.axis}`"
        :x="label.x"
        :y="label.y"
        :text-anchor="label.anchor"
        class="radar-label"
        :class="{ wished: label.wish, met: label.met === true, missed: label.met === false }"
      >
        {{ label.text }}<tspan v-if="label.wish" class="radar-wish"> {{ label.wish }}{{ label.met ? " ✓" : "" }}</tspan>
      </text>
    </svg>
    <figcaption class="radar-bitter">
      <span>苦澀</span>
      <span class="radar-bitter-track" aria-hidden="true"><span :style="{ width: `${Math.min(100, bitterness * 10)}%` }"></span></span>
      <span>{{ bitterness < 0.5 ? "無" : bitterness < 2 ? "微澀" : bitterness < 4 ? "偏澀" : "苦澀" }}</span>
    </figcaption>
  </figure>
</template>
<style scoped>
.flavor-radar {
  margin: 0;
}
.flavor-radar svg {
  display: block;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  overflow: visible;
}
.radar-ring {
  fill: none;
  stroke: #d7b68122;
}
.radar-ring.outer {
  stroke: #d7b68166;
}
.radar-axis {
  stroke: #d7b6812a;
}
.radar-band {
  stroke: #d7b681;
  stroke-opacity: 0.35;
  stroke-width: 11;
  stroke-linecap: round;
}
.radar-band.met {
  stroke: #ffd98e;
  stroke-opacity: 0.7;
}
.radar-projected {
  fill: none;
  stroke: #efe3c2;
  stroke-opacity: 0.55;
  stroke-dasharray: 4 4;
}
.radar-profile {
  fill-opacity: 0.5;
  stroke: #f0d69c;
  stroke-width: 1.6;
  transition: fill 0.4s;
}
.radar-dot {
  fill: #f6e7c4;
}
.radar-label {
  fill: #cbbd9f;
  font-size: 13px;
  font-family: var(--font-serif, serif);
}
.radar-label.wished {
  fill: #f4dca5;
}
.radar-label.met {
  fill: #cfe3b5;
}
.radar-wish {
  font-size: 11px;
}
.radar-bitter {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 10px;
  align-items: center;
  margin-top: 6px;
  font-size: 13px;
  color: #bdb49f;
}
.radar-bitter-track {
  height: 6px;
  border-radius: 3px;
  background: #d7b68120;
  overflow: hidden;
}
.radar-bitter-track > span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #b9a26b, #c0613f);
  transition: width 0.3s;
}
.compact svg {
  max-width: 220px;
}
.high-contrast .radar-ring,
.high-contrast .radar-axis {
  stroke: #ffdb8a66;
}
.high-contrast .radar-label {
  fill: #fff9e9;
}
</style>
