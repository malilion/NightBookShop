<script setup lang="ts">
import { computed } from "vue";
import type { StepStatus } from "../../services/teaHouse";
const props = defineProps<{ steps: StepStatus[]; percent: number }>();
// Finished steps are judged; a step in progress only shows whether it is on target yet.
const mark = (step: StepStatus) =>
  step.state === "pending" || step.score === null
    ? "○"
    : step.state === "live"
      ? step.score >= 90 ? "✓" : "…"
      : step.score >= 90 ? "✓" : step.score >= 60 ? "△" : "✗";
const tone = (step: StepStatus) =>
  step.state !== "done" || step.score === null ? "" : step.score >= 90 ? "good" : step.score >= 60 ? "fair" : "poor";
// Announce only finished steps, so the live region does not chatter while steeping.
const summary = computed(
  () =>
    `完成度 ${props.percent}%。` +
    props.steps
      .filter((step) => step.state === "done")
      .map((step) => `${step.label} ${step.score} 分`)
      .join("，"),
);
</script>
<template>
  <section class="brew-completion" aria-label="完成度">
    <div class="completion-total">
      <span class="completion-label">完成度</span>
      <strong>{{ percent }}<small>%</small></strong>
      <span class="completion-bar" aria-hidden="true"><span :style="{ width: `${percent}%` }"></span></span>
      <small class="completion-count">已完成 {{ steps.filter((step) => step.state === "done").length }}／{{ steps.length }} 步</small>
    </div>
    <ol class="completion-steps">
      <li
        v-for="step in steps"
        :key="step.key"
        :class="[`state-${step.state}`, tone(step), step.state === 'live' && (step.score ?? 0) >= 90 ? 'on-target' : '']"
        :data-step="step.key"
        :data-score="step.score ?? ''"
      >
        <span class="completion-mark" aria-hidden="true">{{ mark(step) }}</span>
        <span class="completion-name">{{ step.label }}</span>
        <span class="completion-score">{{ step.state === "pending" ? "—" : step.score }}</span>
        <small>{{ step.state === "pending" ? "" : step.note }}</small>
      </li>
    </ol>
    <p class="screen-reader-only" aria-live="polite">{{ summary }}</p>
  </section>
</template>
<style scoped>
.brew-completion {
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr);
  gap: 18px;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.completion-total {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: baseline;
  gap: 2px 10px;
}
.completion-label {
  color: var(--muted);
  font-size: 13px;
  letter-spacing: 0.1em;
}
.completion-total strong {
  justify-self: end;
  font-size: 30px;
  font-weight: 400;
  color: #f4dca5;
}
.completion-total small {
  font-size: 14px;
  color: var(--muted);
}
.completion-count {
  grid-column: 1 / -1;
  font-size: 11px;
  color: var(--muted);
}
.completion-bar {
  grid-column: 1 / -1;
  height: 6px;
  border-radius: 3px;
  background: #d7b68120;
  overflow: hidden;
}
.completion-bar > span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #a98a55, #f0d69c);
  transition: width 0.5s ease;
}
.completion-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.completion-steps li {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 2px 6px;
  min-width: 0;
  padding: 6px 8px;
  border: 1px solid #d7b68130;
  font-size: 13px;
  color: #8f8677;
  transition:
    border-color 0.3s,
    background 0.3s;
}
.completion-steps small {
  grid-column: 1 / -1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  color: #a79e8d;
}
.completion-steps .state-live {
  border-color: #d7b68199;
  background: #d7b68112;
  color: var(--ink);
}
.completion-steps .state-done {
  color: var(--ink);
}
.completion-steps .on-target .completion-mark {
  color: #cfe3b5;
}
.completion-steps .good .completion-mark,
.completion-steps .good .completion-score {
  color: #cfe3b5;
}
.completion-steps .fair .completion-mark,
.completion-steps .fair .completion-score {
  color: #f4dca5;
}
.completion-steps .poor .completion-mark,
.completion-steps .poor .completion-score {
  color: #efb39a;
}
.completion-score {
  font-variant-numeric: tabular-nums;
}
.screen-reader-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@media (max-width: 760px) {
  .brew-completion {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .completion-steps {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
  }
  .completion-steps li {
    padding: 5px 6px;
    font-size: 12px;
  }
}
</style>
