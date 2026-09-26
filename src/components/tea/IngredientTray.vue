<script setup lang="ts">
import { computed } from "vue";
import { flavorAxes, flavorLabels, ingredientIds, ingredients, maxIngredientUnits, maxUnitsPerIngredient } from "../../data/teaFlavor";
import type { IngredientId, IngredientUnit } from "../../types/game";
const props = defineProps<{
  units: IngredientUnit[];
  /** Where a new unit goes right now; null when nothing can be added. */
  target: "pot" | "cup" | null;
  /** Pot units can still come out (no water poured yet). */
  removable: boolean;
  reason: string;
}>();
const emit = defineEmits<{ add: [id: IngredientId]; remove: [id: IngredientId] }>();
const cards = computed(() =>
  ingredientIds.map((id) => {
    const spec = ingredients[id];
    const inPot = props.units.filter((unit) => unit.id === id && unit.where === "pot").length;
    const inCup = props.units.filter((unit) => unit.id === id && unit.where === "cup").length;
    const effects = flavorAxes
      .filter((axis) => Math.abs(spec.flavor[axis] ?? 0) >= 1)
      .map((axis) => `${flavorLabels[axis]}${(spec.flavor[axis] ?? 0) > 0 ? "↑" : "↓"}`);
    if (spec.soften) effects.push("抑苦");
    return {
      id,
      spec,
      inPot,
      inCup,
      effects: effects.join(" "),
      canAdd:
        props.target !== null &&
        inPot + inCup < maxUnitsPerIngredient &&
        props.units.length < maxIngredientUnits,
      canRemove: props.removable && inPot > 0,
    };
  }),
);
</script>
<template>
  <section class="ingredient-tray" aria-labelledby="ingredient-tray-title">
    <header>
      <h3 id="ingredient-tray-title">配料盤</h3>
      <p :class="{ muted: !target }">
        {{ target === "pot" ? "加進茶壺：和茶一起浸泡，越泡越濃" : target === "cup" ? "加進茶杯：直接調味，不再浸泡" : reason }}
      </p>
      <small>{{ units.length }}／{{ maxIngredientUnits }} 份</small>
    </header>
    <ul>
      <li v-for="card in cards" :key="card.id" :class="{ used: card.inPot + card.inCup > 0 }" :data-ingredient="card.id">
        <img :src="`/images/tea-ingredients/${card.id}.webp`" alt="" width="44" height="44" decoding="async" />
        <div class="ingredient-info">
          <strong>{{ card.spec.name }}</strong>
          <small>{{ card.effects }} · 宜{{ card.spec.best === "pot" ? "壺中" : "杯中" }}</small>
          <small v-if="card.inPot + card.inCup" class="ingredient-placed">
            {{ card.inPot ? `壺中 ${card.inPot} ${card.spec.unit}` : "" }}{{ card.inPot && card.inCup ? " · " : "" }}{{ card.inCup ? `杯中 ${card.inCup} ${card.spec.unit}` : "" }}
          </small>
        </div>
        <div class="ingredient-actions">
          <button
            type="button"
            class="ingredient-button"
            :aria-label="`加入${card.spec.name}`"
            :title="card.spec.note"
            :disabled="!card.canAdd"
            @click="emit('add', card.id)"
          >
            ＋
          </button>
          <button
            type="button"
            class="ingredient-button"
            :aria-label="`取出${card.spec.name}`"
            :disabled="!card.canRemove"
            @click="emit('remove', card.id)"
          >
            －
          </button>
        </div>
      </li>
    </ul>
  </section>
</template>
<style scoped>
.ingredient-tray {
  margin-top: 14px;
}
.ingredient-tray header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.ingredient-tray h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 0.12em;
  color: #ecd1a3;
}
.ingredient-tray header p {
  margin: 0;
  flex: 1;
  font-size: 13px;
  color: #e0d0b5;
}
.ingredient-tray header p.muted {
  color: var(--muted);
}
.ingredient-tray header small {
  color: var(--muted);
}
.ingredient-tray ul {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.ingredient-tray li {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding: 8px;
  border: 1px solid var(--line);
  background: #111a2780;
}
.ingredient-tray li.used {
  border-color: #e7bb78;
  background: #b7783b1f;
}
.ingredient-tray img {
  width: 44px;
  height: 44px;
  object-fit: contain;
  filter: drop-shadow(0 2px 5px #0008);
}
.ingredient-info {
  display: grid;
  min-width: 0;
}
.ingredient-info strong {
  font-weight: 400;
  font-size: 15px;
}
.ingredient-info small {
  font-size: 11px;
  line-height: 1.5;
  color: #bdb49f;
}
.ingredient-info .ingredient-placed {
  color: #f4dca5;
}
.ingredient-actions {
  display: flex;
  gap: 4px;
}
.ingredient-button {
  min-width: 40px;
  min-height: 40px;
  border: 1px solid var(--line);
  background: #111a27;
  font-size: 16px;
  line-height: 1;
}
.ingredient-button:not(:disabled):hover {
  border-color: var(--gold);
  background: #d7b68118;
}
@media (max-width: 1050px) {
  .ingredient-tray ul {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .ingredient-tray ul {
    grid-template-columns: 1fr;
  }
}
@media (pointer: coarse) {
  .ingredient-button {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
