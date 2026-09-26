<script setup lang="ts">
import { computed } from "vue";
import { assets } from "../../data/assets";
import { teas } from "../../data/catalog";
import { flavorLabels, ingredients } from "../../data/teaFlavor";
import { signatureRecipes, type GuestOrder } from "../../data/teaHouse";
import { wishWords } from "../../services/teaHouse";
const props = defineProps<{
  order: GuestOrder;
  index: number;
  total: number;
  /** Recipe ids the player has already written into the book. */
  discovered: Set<string>;
}>();
const portrait = computed(() =>
  props.order.chapter && props.order.chapter in assets.characters
    ? assets.characters[props.order.chapter as keyof typeof assets.characters]
    : null,
);
const requirement = computed(() => {
  const require = props.order.require;
  if (!require) return "";
  if (require.kind === "blend") return "兩種茶調和";
  if (require.kind === "garnish") return "加一樣配料";
  if (require.kind === "ingredient") return `要有${ingredients[require.id].name}`;
  if (require.kind === "boil") return "水溫要剛好，不能煮老";
  if (!require.recipeId) return "茶譜裡有名字的特調";
  return `指名：${signatureRecipes.find((recipe) => recipe.id === require.recipeId)?.name ?? "特調"}`;
});
const favorite = computed(() => {
  const id = props.order.favorite;
  if (!id || props.order.require?.kind === "recipe") return "";
  if (id in teas) return `偏愛${teas[id as keyof typeof teas].name}`;
  const recipe = signatureRecipes.find((item) => item.id === id);
  if (!recipe) return "";
  return props.discovered.has(recipe.id) ? `偏愛「${recipe.name}」` : `偏愛一款茶譜上的茶：${recipe.hint}`;
});
</script>
<template>
  <article class="order-ticket" :aria-label="`第 ${index + 1} 位客人：${order.name}`">
    <div class="ticket-guest">
      <img v-if="portrait" :src="portrait" alt="" class="ticket-portrait" aria-hidden="true" />
      <span v-else class="ticket-seal" aria-hidden="true">{{ order.seal }}</span>
      <div>
        <p class="ticket-count">第 {{ index + 1 }} 位客人 · 共 {{ total }} 位</p>
        <h2>{{ order.name }}</h2>
      </div>
    </div>
    <blockquote class="ticket-line">「{{ order.line }}」</blockquote>
    <ul class="ticket-wishes" aria-label="客人的口味期望">
      <li v-for="wish in order.wishes" :key="wish.axis">
        <strong>{{ flavorLabels[wish.axis] }}</strong><span>{{ wishWords[wish.level] }}</span>
      </li>
      <li v-if="requirement" class="ticket-requirement"><strong>特別要求</strong><span>{{ requirement }}</span></li>
      <li v-if="favorite" class="ticket-favorite"><strong>偏好</strong><span>{{ favorite }}</span></li>
    </ul>
  </article>
</template>
<style scoped>
.order-ticket {
  position: relative;
  display: grid;
  grid-template-columns: minmax(220px, 0.9fr) minmax(0, 1.6fr) minmax(210px, 1fr);
  gap: 22px;
  align-items: center;
  padding: 18px 24px;
  color: #2b2520;
  background:
    radial-gradient(ellipse at 12% 0, #fffaf0 0, transparent 60%),
    linear-gradient(180deg, #f3e7d3, #e7d6b8);
  border-radius: 2px;
  box-shadow:
    0 12px 36px #03070e80,
    inset 0 0 0 1px #b99a6566;
}
.order-ticket::before,
.order-ticket::after {
  content: "";
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  margin-top: -7px;
  border-radius: 50%;
  background: #101825;
}
.order-ticket::before {
  left: -7px;
}
.order-ticket::after {
  right: -7px;
}
.ticket-guest {
  display: flex;
  align-items: center;
  gap: 14px;
}
.ticket-seal {
  display: grid;
  place-items: center;
  flex: none;
  width: 52px;
  height: 52px;
  border: 2px solid #a8412f;
  border-radius: 6px;
  color: #a8412f;
  font-family: "Kaiti TC", "STKaiti", "BiauKai", serif;
  font-size: 30px;
  transform: rotate(-6deg);
  box-shadow: inset 0 0 0 3px #f3e7d3, inset 0 0 0 4px #a8412f66;
}
.ticket-portrait {
  flex: none;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  object-position: 50% 8%;
  background: #1b2433;
  border: 2px solid #b99a65;
}
.ticket-count {
  margin: 0 0 4px;
  color: #7a6a55;
  font-size: 12px;
  letter-spacing: 0.08em;
}
.order-ticket h2 {
  margin: 0;
  font-size: 21px;
  font-weight: 600;
  letter-spacing: 0.06em;
}
.ticket-line {
  margin: 0;
  font-size: 17px;
  line-height: 1.8;
  color: #3a3028;
}
.ticket-wishes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.ticket-wishes li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 32px;
  padding: 4px 10px;
  border: 1px solid #8a6b44;
  border-radius: 2px;
  font-size: 14px;
  background: #fff8ea;
}
.ticket-wishes strong {
  color: #6b3f1f;
}
.ticket-requirement {
  border-color: #a8412f !important;
}
.ticket-favorite {
  border-style: dashed !important;
}
@media (max-width: 900px) {
  .order-ticket {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 16px 18px;
  }
  .ticket-line {
    font-size: 16px;
  }
}
.high-contrast .order-ticket {
  background: #fff9e9;
  color: #111;
}
</style>
