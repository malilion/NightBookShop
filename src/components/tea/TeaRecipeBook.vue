<script setup lang="ts">
import { computed } from "vue";
import { teas } from "../../data/catalog";
import { flavorAxes, flavorLabels, ingredients, teaFlavors } from "../../data/teaFlavor";
import { signatureRecipes } from "../../data/teaHouse";
import type { TeaId } from "../../types/game";
import type { TeaHouseProgress } from "../../types/teaHouse";
import { analyzeBrew } from "../../services/teaFlavor";
const props = defineProps<{ progress: TeaHouseProgress }>();
const recipes = computed(() =>
  signatureRecipes.map((recipe) => {
    const record = props.progress.recipes[recipe.id];
    const [first, second] = recipe.teas as [TeaId, TeaId | undefined];
    const profile = analyzeBrew(
      {
        teaId: first,
        leaves: second ? 2 : 3,
        blendTeaId: second ?? null,
        blendLeaves: second ? 1 : 0,
        water: 70,
        temperature: 90,
        seconds: 45,
        garnish: "none",
        ingredients: recipe.ingredients.map((id) => ({ id, where: ingredients[id].best, at: 0 })),
      },
      true,
    ).profile;
    const notes = flavorAxes
      .filter((axis) => profile[axis] >= 6.5)
      .map((axis) => flavorLabels[axis]);
    return {
      ...recipe,
      record,
      parts: [...recipe.teas.map((id) => teas[id].name), ...recipe.ingredients.map((id) => ingredients[id].name)],
      notes,
    };
  }),
);
const teaRecords = computed(() =>
  (Object.keys(teas) as TeaId[]).map((id) => {
    const top = [...flavorAxes].sort((a, b) => teaFlavors[id][b] - teaFlavors[id][a]).slice(0, 2);
    return { id, tea: teas[id], record: props.progress.teas[id], top: top.map((axis) => flavorLabels[axis]) };
  }),
);
const found = computed(() => recipes.value.filter((recipe) => recipe.record).length);
const brewedTeas = computed(() => teaRecords.value.filter((item) => item.record).length);
</script>
<template>
  <section class="recipe-book" aria-labelledby="recipe-book-title">
    <header class="recipe-book-heading">
      <h2 id="recipe-book-title">茶譜</h2>
      <p>特調 {{ found }}／{{ recipes.length }} · 茶罐 {{ brewedTeas }}／{{ teaRecords.length }}</p>
    </header>
    <ol class="recipe-grid">
      <li v-for="recipe in recipes" :key="recipe.id" class="recipe-card" :class="{ locked: !recipe.record }" :data-recipe="recipe.id">
        <template v-if="recipe.record">
          <p class="recipe-parts">{{ recipe.parts.join(" ＋ ") }}</p>
          <h3>{{ recipe.name }}</h3>
          <p class="recipe-text">{{ recipe.text }}</p>
          <p class="recipe-meta">
            <span v-if="recipe.notes.length">{{ recipe.notes.join("・") }}</span>
            <span>最佳 {{ recipe.record.best }} 分</span>
          </p>
        </template>
        <template v-else>
          <p class="recipe-parts">尚未發現的特調</p>
          <h3>？？？</h3>
          <p class="recipe-text">線索：{{ recipe.hint }}</p>
        </template>
      </li>
    </ol>
    <h3 class="recipe-subheading">茶罐紀錄</h3>
    <ol class="tea-record-grid">
      <li v-for="item in teaRecords" :key="item.id" :class="{ locked: !item.record }">
        <span class="tea-record-swatch" :style="{ background: item.tea.color }" aria-hidden="true"></span>
        <div>
          <strong>{{ item.tea.name }}</strong>
          <small>{{ item.tea.temperature }}°C · {{ item.tea.seconds }} 秒 · {{ item.top.join("、") }}</small>
          <small>{{ item.record ? `泡過 ${item.record.brewed} 次 · 最佳 ${item.record.best} 分` : "還沒泡過" }}</small>
        </div>
      </li>
    </ol>
  </section>
</template>
<style scoped>
.recipe-book-heading {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 18px;
}
.recipe-book-heading h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 400;
  letter-spacing: 0.14em;
}
.recipe-book-heading p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}
.recipe-grid,
.tea-record-grid {
  display: grid;
  gap: 14px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.recipe-grid {
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
}
.recipe-card {
  padding: 16px 18px;
  border: 1px solid #b79b7188;
  background: linear-gradient(180deg, #f4d19a12, #f4d19a05);
}
.recipe-card.locked {
  border-style: dashed;
  border-color: #b79b7155;
  background: transparent;
}
.recipe-card h3 {
  margin: 4px 0 8px;
  font-size: 21px;
  font-weight: 400;
  letter-spacing: 0.1em;
  color: #f4dca5;
}
.recipe-card.locked h3 {
  color: #8f8677;
}
.recipe-parts {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.06em;
  color: #bca77f;
}
.recipe-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: #d8ccb2;
}
.recipe-card.locked .recipe-text {
  color: #a79e8d;
}
.recipe-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin: 10px 0 0;
  font-size: 12px;
  color: #bdb49f;
}
.recipe-subheading {
  margin: 26px 0 12px;
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 0.12em;
}
.tea-record-grid {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}
.tea-record-grid li {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid var(--line);
}
.tea-record-grid li.locked {
  opacity: 0.6;
}
.tea-record-grid div {
  display: grid;
  gap: 2px;
}
.tea-record-grid small {
  color: #bdb49f;
  font-size: 12px;
}
.tea-record-swatch {
  flex: none;
  width: 14px;
  height: 36px;
  border-radius: 2px;
  box-shadow: inset 0 0 0 1px #0004;
}
@media (max-width: 640px) {
  .recipe-grid,
  .tea-record-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .recipe-card {
    padding: 12px;
  }
  .recipe-card h3 {
    font-size: 17px;
  }
  .recipe-text {
    font-size: 13px;
  }
  .recipe-meta {
    flex-direction: column;
    gap: 2px;
  }
  .tea-record-grid li {
    padding: 8px;
  }
}
</style>
