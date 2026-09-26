<script setup lang="ts">
import { computed } from "vue";
import { boilStage, fireNames, minPourTemperature } from "../../services/teaInteraction";
const props = defineProps<{
  kettleTemp: number;
  fire: number;
  overBoil: number;
  /** The temperature this cup wants. */
  target: number;
  /** Water already in the teapot, and its temperature. */
  potWater: number;
  potTemp: number;
  canRefill: boolean;
}>();
const emit = defineEmits<{ fire: [level: number]; refill: [] }>();
const low = 25,
  high = 100;
const at = (temp: number) => `${((Math.min(high, Math.max(low, temp)) - low) / (high - low)) * 100}%`;
const stage = computed(() => boilStage(props.kettleTemp, props.overBoil));
const advice = computed(() => {
  const temp = props.kettleTemp;
  if (props.potWater > 0)
    return temp >= 99.5
      ? "茶壺已經注好水；水壺還在滾，不必補水就熄火吧。"
      : "茶壺已經注好水。要補水再提水壺，不然可以熄火了。";
  if (props.overBoil > 10) return "水滾太久，已經老了：香氣會變鈍，最好換一壺水。";
  if (temp >= 99.5) return "水正在滾。再滾下去就老了，快提壺或熄火。";
  if (temp < minPourTemperature) return `水還涼，${minPourTemperature}°C 以下倒不出來。`;
  if (Math.abs(temp - props.target) <= 2) return "正是這杯要的溫度，提起水壺注水。";
  return temp < props.target
    ? `還差 ${Math.round(props.target - temp)}°C。快到了就轉文火，比較好停。`
    : `比這杯要的高了 ${Math.round(temp - props.target)}°C；熄火等它降一點。`;
});
</script>
<template>
  <section class="stove-panel" aria-labelledby="stove-title">
    <header>
      <h3 id="stove-title">爐火與水溫</h3>
      <span class="stove-stage" :class="`stage-${stage}`">{{ stage }}</span>
    </header>
    <p class="stove-reading">
      <strong data-testid="kettle-temp">{{ Math.round(kettleTemp) }}°C</strong>
      <span>這杯要 {{ target }}°C</span>
    </p>
    <div
      class="stove-gauge"
      role="meter"
      :aria-valuenow="Math.round(kettleTemp)"
      aria-valuemin="25"
      aria-valuemax="100"
      :aria-valuetext="`壺中 ${Math.round(kettleTemp)} 度，目標 ${target} 度`"
      aria-label="壺中水溫"
    >
      <span class="gauge-target" :style="{ left: at(target - 2), width: `calc(${at(target + 2)} - ${at(target - 2)})` }"></span>
      <span class="gauge-fill" :style="{ width: at(kettleTemp) }"></span>
      <span class="gauge-mark" :style="{ left: at(minPourTemperature) }" aria-hidden="true"></span>
    </div>
    <div class="stove-fire" role="group" aria-label="爐火火力">
      <button
        v-for="(name, level) in fireNames"
        :key="name"
        type="button"
        :aria-pressed="fire === level"
        :class="`fire-button fire-${level}`"
        @click="emit('fire', level)"
      >
        <span aria-hidden="true">{{ "▴".repeat(level) || "·" }}</span>{{ name }}
      </button>
    </div>
    <p class="stove-advice" :class="{ warn: overBoil > 10 || kettleTemp >= 99.5 }">{{ advice }}</p>
    <p v-if="potWater > 0" class="stove-pot">茶壺裡的水 {{ Math.round(potTemp) }}°C · {{ Math.round(potWater) }}%</p>
    <button type="button" class="quiet-button stove-refill" :disabled="!canRefill" @click="emit('refill')">換一壺水</button>
  </section>
</template>
<style scoped>
.stove-panel {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--line);
  background: #d7b68108;
}
.stove-panel header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.stove-panel h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0.1em;
  color: #ecd1a3;
}
.stove-stage {
  padding: 2px 10px;
  border: 1px solid #d7b68166;
  font-size: 13px;
  color: #e0d0b5;
}
.stove-stage.stage-連珠,
.stove-stage.stage-鼓浪 {
  border-color: #ffd98e;
  color: #ffd98e;
}
.stove-stage.stage-水老 {
  border-color: #e49a78;
  color: #e49a78;
}
.stove-reading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin: 0;
}
.stove-reading strong {
  font-size: 28px;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  color: var(--ink);
}
.stove-reading span {
  font-size: 13px;
  color: var(--muted);
}
.stove-gauge {
  position: relative;
  height: 10px;
  border-radius: 5px;
  background: #d7b68120;
  overflow: hidden;
}
.gauge-fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: linear-gradient(90deg, #6f8ea0, #d9a55a 60%, #e0673a);
  opacity: 0.85;
  transition: width 0.2s linear;
}
.gauge-target {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 1;
  border-inline: 2px solid #ffe7ad;
  background: #ffe7ad33;
}
.gauge-mark {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #ffffff55;
}
.stove-fire {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
}
.fire-button {
  display: grid;
  justify-items: center;
  min-height: 44px;
  padding: 4px 2px;
  border: 1px solid var(--line);
  background: #111a2780;
  font-size: 13px;
}
.fire-button span {
  font-size: 10px;
  line-height: 1;
  color: #e08a4a;
}
.fire-button[aria-pressed="true"] {
  border-color: #e7bb78;
  background: #b7783b33;
}
.stove-advice {
  margin: 0;
  min-height: 2.6em;
  font-size: 13px;
  line-height: 1.6;
  color: #e0d0b5;
}
.stove-advice.warn {
  color: #efb39a;
}
.stove-pot {
  margin: 0;
  font-size: 13px;
  color: var(--muted);
}
.stove-refill {
  justify-self: start;
  font-size: 13px;
}
</style>
