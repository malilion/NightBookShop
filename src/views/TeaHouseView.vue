<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useTeaHouseStore, type ServedCup } from "../stores/teaHouseStore";
import { useSettingsStore } from "../stores/settingsStore";
import { assets } from "../data/assets";
import { ingredients } from "../data/teaFlavor";
import { signatureRecipes } from "../data/teaHouse";
import { newTea, type IngredientId, type TeaDraft } from "../types/game";
import type { TeaHouseKind } from "../types/teaHouse";
import { analyzeBrew, roundToFive, tastingNotes } from "../services/teaFlavor";
import { brewCompletion, brewWindow, recipeFor, starLine } from "../services/teaHouse";
import { audio } from "../audio/audioManager";
import GameIcon from "../components/common/GameIcon.vue";
import TeaTable from "../components/tea/TeaTable.vue";
import FlavorRadar from "../components/tea/FlavorRadar.vue";
import TeaOrderTicket from "../components/tea/TeaOrderTicket.vue";
import TeaServeResult from "../components/tea/TeaServeResult.vue";
import TeaNightSummary from "../components/tea/TeaNightSummary.vue";
import TeaRecipeBook from "../components/tea/TeaRecipeBook.vue";
import BrewCompletion from "../components/tea/BrewCompletion.vue";
import IngredientTray from "../components/tea/IngredientTray.vue";
import StovePanel from "../components/tea/StovePanel.vue";
import { useTeaBrew } from "../components/tea/useTeaBrew";
withDefaults(defineProps<{ /** Served as its own page, outside the bookshop. */ standalone?: boolean }>(), {
  standalone: false,
});
const house = useTeaHouseStore(),
  settings = useSettingsStore();
const draft = reactive(newTea());
const message = ref(""),
  table = ref<InstanceType<typeof TeaTable> | null>(null),
  book = ref<HTMLDialogElement>(),
  bookOpen = ref(false),
  guideDismissed = ref(false),
  confirmLeave = ref<HTMLDialogElement>(),
  served = ref<ServedCup | null>(null),
  records = ref({ nightBest: false, dailyBest: false });
const { selected, secondary, totalLeaves, idealTemperature, idealSeconds, phase, readyToServe, infusion } =
  useTeaBrew(draft);
const analysis = computed(() => analyzeBrew(draft));
const projected = computed(() => (totalLeaves.value > 0 ? analyzeBrew(draft, true).profile : null));
const notes = computed(() => tastingNotes(analysis.value, draft));
const recipe = computed(() => recipeFor(draft));
const target = computed(() => roundToFive(idealTemperature.value));
// The guest's best moment to lift the pot. It depends on the leaves, water,
// heat and ingredients, not on the running clock, so it is not recomputed
// every frame while the hourglass runs.
const liftWindow = computed(() =>
  brewWindow(
    {
      ...newTea(),
      teaId: draft.teaId,
      leaves: draft.leaves,
      blendTeaId: draft.blendTeaId,
      blendLeaves: draft.blendLeaves,
      water: Math.round(draft.water),
      temperature: Math.round(draft.temperature),
      overBoil: Math.round(draft.overBoil),
      ingredients: draft.ingredients.map((unit) => ({ ...unit })),
    },
    house.order,
  ),
);
const completion = computed(() => brewCompletion(draft, house.order, { window: liftWindow.value }));
const ingredientTarget = computed<"pot" | "cup" | null>(() =>
  draft.step === "select" ? null : phase.value <= 3 ? "pot" : draft.cupWater > 0 ? "cup" : null,
);
const ingredientReason = computed(() =>
  draft.step === "select" ? "先選一罐茶，再來加料。" : "提起茶壺了；先把茶倒進杯裡，再加進杯中。",
);
const screen = computed(() =>
  !house.loaded ? "loading" : !house.session ? "lobby" : house.nightDone ? "summary" : "service",
);
const session = computed(() => house.session);
const free = computed(() => session.value?.kind === "free");
const cupName = computed(() =>
  recipe.value && house.discovered.has(recipe.value.id)
    ? recipe.value.name
    : secondary.value && draft.blendLeaves > 0 && draft.leaves > 0
      ? `${selected.value.name}・${secondary.value.name}`
      : selected.value.name,
);
const nextRank = computed(() => {
  const next = house.rank.next;
  return next ? `再 ${next.stars - house.progress.stars} 顆星，成為「${next.title}」` : "已是最高的稱號";
});
const kindLabel = computed(() =>
  session.value?.kind === "daily" ? `今日茶單 · ${session.value.date}` : free.value ? "自由茶席" : "夜間營業",
);
const serveLabel = computed(() => (free.value ? "品嚐這一杯" : `奉茶給${house.order?.name ?? "客人"}`));
const nextLabel = computed(() =>
  free.value
    ? "再泡一杯"
    : session.value && session.value.index + 1 >= session.value.orders.length
      ? "看今晚的成績"
      : "迎接下一位客人",
);
function syncDraft() {
  // A plain copy: the stored draft is reactive and holds nested ingredient units.
  Object.assign(draft, session.value ? (JSON.parse(JSON.stringify(session.value.draft)) as TeaDraft) : newTea());
  if (draft.step === "scoop") draft.step = "water";
  if (draft.step === "serve" && !draft.cupWater) draft.cupWater = Math.min(70, draft.water);
}
function flush() {
  void house.saveDraft(draft);
}
async function start(kind: TeaHouseKind) {
  served.value = null;
  records.value = { nightBest: false, dailyBest: false };
  Object.assign(draft, newTea());
  await house.start(kind);
  syncDraft();
  message.value = kind === "free" ? "茶席是妳的。慢慢試，香氣會告訴妳答案。" : "";
  if (kind !== "free") audio.cue("bell");
}
function addIngredient(id: IngredientId) {
  const where = ingredientTarget.value;
  if (!where) return;
  draft.ingredients.push({ id, where, at: Math.round(draft.seconds * 10) / 10 });
  audio.cue("drop");
  const spec = ingredients[id];
  message.value = `${where === "pot" ? "放進茶壺" : "加進茶杯"}：一${spec.unit}${spec.name}。${spec.note}`;
  flush();
}
function removeIngredient(id: IngredientId) {
  if (draft.water > 0) return;
  const index = draft.ingredients.map((unit) => unit.id === id && unit.where === "pot").lastIndexOf(true);
  if (index < 0) return;
  draft.ingredients.splice(index, 1);
  message.value = `${ingredients[id].name}拿回小碟了。`;
  flush();
}
function setFire(level: number) {
  draft.fire = level;
  flush();
}
function refillKettle() {
  if (draft.water > 0) return;
  Object.assign(draft, { kettleTemp: 45, kettleOverBoil: 0 });
  message.value = "換上一壺新水。慢慢煮，別讓它滾老了。";
  flush();
}
function restart() {
  table.value?.cancel();
  Object.assign(draft, newTea());
  message.value = "茶席整理好了。重新挑一罐，慢慢來。";
  flush();
}
async function serve() {
  if (!readyToServe.value || served.value) return;
  table.value?.cancel();
  draft.step = "serve";
  served.value = await house.serve(draft);
}
async function next() {
  served.value = null;
  // Clear the table first: the table keeps saving while the fire is lit, and a
  // save during the switch must not carry the served cup to the next guest.
  Object.assign(draft, newTea());
  records.value = await house.nextGuest();
  syncDraft();
  message.value = "";
  if (screen.value === "service" && !free.value) audio.cue("bell");
}
function openBook() {
  bookOpen.value = true;
  book.value?.showModal();
}
function askLeave() {
  if (free.value || !session.value) void leave();
  else confirmLeave.value?.showModal();
}
async function leave() {
  book.value?.close();
  confirmLeave.value?.close();
  served.value = null;
  await house.leave();
  syncDraft();
}
onMounted(async () => {
  await house.init();
  // A cup served right before a reload has its result saved; move on to the next guest.
  if (session.value && session.value.kind !== "free" && session.value.results.length > session.value.index)
    records.value = await house.nextGuest();
  syncDraft();
});
</script>
<template>
  <main id="main" tabindex="-1" class="tea-house" :class="`tea-house-${screen}`">
    <picture class="tea-house-art" aria-hidden="true"><img :src="assets.scenes.counter" alt="" /></picture>
    <div class="tea-house-shade"></div>
    <header class="tea-house-header">
      <button
        v-if="standalone"
        type="button"
        class="text-link"
        :aria-pressed="!settings.values.muted"
        @click="settings.update('muted', !settings.values.muted)"
      >
        <GameIcon :name="settings.values.muted ? 'muted' : 'sound'" />{{ settings.values.muted ? "聲音：關" : "聲音：開" }}
      </button>
      <RouterLink v-else to="/" class="text-link"><GameIcon name="back" />回到門前</RouterLink>
      <p class="tea-house-brand">午夜茶席<span>The Midnight Tea Table</span></p>
      <p class="tea-house-rank"><GameIcon name="moon" />{{ house.rank.title }} · ★ {{ house.progress.stars }}</p>
    </header>
    <p v-if="screen === 'loading'" class="tea-house-loading">正在擺好茶席……</p>
    <section v-else-if="screen === 'lobby'" class="tea-lobby" aria-labelledby="tea-lobby-title">
      <div class="tea-lobby-hero">
        <h1 id="tea-lobby-title">午夜茶席</h1>
        <p class="tea-lobby-quote">八罐茶、四種配料，五位深夜來客。<br />替每個人，泡一杯剛剛好的茶。</p>
        <dl class="tea-lobby-stats">
          <div><dt>稱號</dt><dd>{{ house.rank.title }}</dd></div>
          <div><dt>星星</dt><dd>★ {{ house.progress.stars }}</dd></div>
          <div><dt>奉茶</dt><dd>{{ house.progress.served }} 杯</dd></div>
          <div><dt>月下神品</dt><dd>{{ house.progress.perfect }} 杯</dd></div>
          <div><dt>茶譜</dt><dd>{{ house.recipeCount }}／{{ signatureRecipes.length }}</dd></div>
          <div><dt>連續營業</dt><dd>{{ house.streak }} 天</dd></div>
        </dl>
        <p class="subtle">{{ nextRank }}</p>
        <p v-if="standalone" class="subtle">
          這張茶席來自《夜行書店》。<a class="tea-story-link" href="/">讀一讀客人們的故事</a>，他們會回來當常客。
        </p>
      </div>
      <div class="tea-modes">
        <article class="tea-mode tea-mode-daily">
          <p class="tea-mode-kicker">今日茶單 · {{ house.today }}</p>
          <h2>同一張茶單</h2>
          <p>每天一份，所有人迎來同樣五位客人。讀懂他們的口味，拿下十五顆星。</p>
          <p class="tea-mode-record">
            {{ house.todayRecord ? `今日最佳 ★ ${house.todayRecord.stars}／15` : "今天還沒開張" }}
          </p>
          <button class="ornate-button" @click="start('daily')">開始今日茶單<GameIcon name="arrow" /></button>
        </article>
        <article class="tea-mode">
          <p class="tea-mode-kicker">夜間營業</p>
          <h2>五位隨機來客</h2>
          <p>
            每晚的客人都不同。讀完故事的訪客會回來當常客，也有熟客指名茶譜上的特調。
            <template v-if="house.regulars.length">目前有 {{ house.regulars.length }} 位常客。</template>
          </p>
          <p class="tea-mode-record">最佳一夜 ★ {{ house.progress.bestNight }}／15</p>
          <button class="ornate-button" @click="start('night')">開門營業<GameIcon name="arrow" /></button>
        </article>
        <article class="tea-mode">
          <p class="tea-mode-kicker">自由茶席</p>
          <h2>沒有客人，只有茶</h2>
          <p>調配兩種茶與配料，看風味雷達慢慢長出形狀，找出茶譜裡藏著名字的組合。</p>
          <p class="tea-mode-record">已發現 {{ house.recipeCount }} 款特調</p>
          <button class="quiet-button" @click="start('free')"><GameIcon name="leaf" />獨自泡茶</button>
        </article>
      </div>
      <div class="tea-lobby-book paper-frame">
        <TeaRecipeBook :progress="house.progress" />
      </div>
    </section>
    <section v-else-if="screen === 'service' && session" class="tea-service paper-frame" :aria-label="kindLabel">
      <div class="tea-service-bar">
        <div>
          <p class="subtle">{{ kindLabel }}</p>
          <ol v-if="!free" class="guest-dots" aria-label="今晚的客人">
            <li
              v-for="(id, i) in session.orders"
              :key="id + i"
              :class="{ current: i === session.index, done: i < session.results.length }"
              :aria-label="i < session.results.length ? `第 ${i + 1} 位：${session.results[i]!.stars} 顆星` : `第 ${i + 1} 位`"
            >
              {{ i < session.results.length ? starLine(session.results[i]!.stars) : i === session.index ? "奉茶中" : "・" }}
            </li>
          </ol>
        </div>
        <div class="tea-service-actions">
          <button class="quiet-button" @click="openBook"><GameIcon name="book" />茶譜</button>
          <button class="quiet-button" @click="restart">重新整理茶席</button>
          <button class="quiet-button" @click="askLeave">{{ free ? "離開茶席" : "結束今晚" }}</button>
        </div>
      </div>
      <Transition name="ticket" mode="out-in">
        <TeaOrderTicket
          v-if="house.order"
          :key="`${session.startedAt}-${session.index}`"
          :order="house.order"
          :index="session.index"
          :total="session.orders.length"
          :discovered="house.discovered"
        />
        <article v-else class="free-ticket">
          <h2>自由茶席</h2>
          <p>沒有客人的夜晚。試試不同的茶與配料；泡出有名字的組合，就會收進茶譜（{{ house.recipeCount }}／{{ signatureRecipes.length }}）。</p>
        </article>
      </Transition>
      <ol v-if="!free && house.progress.served === 0 && !guideDismissed" class="tea-house-guide" aria-label="第一次營業">
        <li><strong>讀茶單</strong>客人想要的口味，會在風味雷達上標成金色區段。</li>
        <li><strong>選茶與配料</strong>雷達的虛線，會預告這樣配泡好時的味道。</li>
        <li><strong>看準時機</strong>沙漏外環的金色弧線亮起，就提起茶壺。</li>
        <li><button type="button" class="text-link" @click="guideDismissed = true">知道了</button></li>
      </ol>
      <BrewCompletion :steps="completion.steps" :percent="completion.percent" />
      <div class="tea-table-layout tea-house-layout">
        <div class="tea-house-main">
          <TeaTable
            ref="table"
            v-model:message="message"
            :draft="draft"
            :recipient="free ? '' : '客人'"
            :allow-pause="free"
            :window="liftWindow"
            boiling
            @flush="flush"
          />
          <IngredientTray
            :units="draft.ingredients"
            :target="ingredientTarget"
            :removable="draft.water === 0"
            :reason="ingredientReason"
            @add="addIngredient"
            @remove="removeIngredient"
          />
        </div>
        <aside class="tea-house-aside" aria-label="茶湯與調配">
          <FlavorRadar
            :profile="analysis.profile"
            :projected="projected"
            :wishes="house.order?.wishes ?? []"
            :color="infusion.color"
            :bitterness="analysis.bitterness"
          />
          <p class="radar-legend"><span class="legend-fill"></span>現在的茶湯<span class="legend-dash"></span>照茶方泡好時<span v-if="house.order?.wishes.length" class="legend-band"></span>{{ house.order?.wishes.length ? "客人期望" : "" }}</p>
          <h3 class="tea-house-cup">{{ draft.step === "select" ? "今晚，什麼香氣？" : cupName }}</h3>
          <p v-if="recipe" class="recipe-teaser" :class="{ known: house.discovered.has(recipe.id) }">
            {{ house.discovered.has(recipe.id) ? `茶譜：${recipe.name}` : "✦ 這個組合似乎有名字……泡好它，就能收進茶譜。" }}
          </p>
          <div v-if="draft.water > 0 && totalLeaves > 0" class="tea-house-notes">
            <p>{{ notes.aroma }}</p>
            <p>{{ notes.palate }}</p>
            <p v-if="notes.finish">{{ notes.finish }}</p>
          </div>
          <StovePanel
            :kettle-temp="draft.kettleTemp"
            :fire="draft.fire"
            :over-boil="draft.kettleOverBoil"
            :target="target"
            :pot-water="draft.water"
            :pot-temp="draft.temperature"
            :can-refill="draft.water === 0 && draft.step !== 'select'"
            @fire="setFire"
            @refill="refillKettle"
          />
          <p class="subtle">茶方：{{ target }}°C · {{ idealSeconds }} 秒 · 三匙 · 七分水<br />{{ house.order?.wishes.length ? "這位客人" : "這杯" }}最佳提壺：{{ Math.round(liftWindow[0]) }}–{{ Math.round(liftWindow[1]) }} 秒</p>
          <dl class="tea-house-stats">
            <div><dt>茶葉</dt><dd>{{ totalLeaves }} / 3 匙</dd></div>
            <div><dt>水量</dt><dd>{{ Math.round(draft.water) }}%</dd></div>
            <div><dt>浸泡</dt><dd>{{ Math.floor(draft.seconds) }} 秒</dd></div>
            <div v-if="draft.spilled > 1"><dt>灑出</dt><dd>{{ Math.round(draft.spilled) }}%</dd></div>
          </dl>
          <p class="tea-action-feedback" role="status">{{ message || table?.hint }}</p>
          <button class="ornate-button tea-serve-button" :disabled="!readyToServe" @click="serve">{{ serveLabel }}</button>
          <details class="tea-keyboard-help">
            <summary>玩法與鍵盤操作</summary>
            <p>讀懂茶單上的口味，選茶、調配、加配料；雷達上的金色區段是客人想要的範圍。點風爐或右側火力鈕煮水，到這杯要的溫度再注水，別讓水滾老。浸泡越久，花香與清爽先散、醇厚與焙香越重；沙漏外環的金色弧線是這位客人最好的時機。蜂蜜、牛奶、檸檬適合倒茶後加進杯裡；蘋果乾、肉桂、薑片要跟茶一起泡。</p>
            <p>Tab 選器具，Enter 拿起／放下，方向鍵移動，E 傾倒、Q 收水，Esc 放回。滑鼠提壺時也能用滾輪調整角度。</p>
          </details>
        </aside>
      </div>
    </section>
    <TeaNightSummary
      v-else-if="screen === 'summary' && session"
      :session="session"
      :rank="house.rank.title"
      :records="records"
      @again="start(session.kind)"
      @lobby="leave"
    />
    <TeaServeResult
      v-if="served"
      :grade="served.grade"
      :order="house.order"
      :draft="draft"
      :liquor-color="infusion.color"
      :new-recipe="served.newRecipe"
      :rank-up="served.rankUp"
      :next-label="nextLabel"
      @next="next"
    />
    <dialog ref="confirmLeave" class="modal-panel" aria-labelledby="leave-title">
      <h2 id="leave-title">提早結束今晚？</h2>
      <p>已經奉出的茶會保留星星，但這一夜不會列入最佳紀錄與今日茶單。</p>
      <div class="button-row">
        <button class="quiet-button" @click="leave">結束營業</button>
        <button class="ornate-button" autofocus @click="confirmLeave?.close()">繼續奉茶</button>
      </div>
    </dialog>
    <dialog ref="book" class="modal-panel tea-book-dialog" aria-label="茶譜" @close="bookOpen = false">
      <template v-if="bookOpen">
        <TeaRecipeBook :progress="house.progress" />
        <div class="button-row">
          <button class="ornate-button" autofocus @click="book?.close()">回到茶席</button>
        </div>
      </template>
    </dialog>
    <p v-if="house.error" class="tea-house-error" role="alert">{{ house.error }}</p>
  </main>
</template>
<style scoped>
.tea-house {
  position: relative;
  isolation: isolate;
  min-height: 100dvh;
  padding: 0 max(16px, calc((100% - 1360px) / 2)) 60px;
}
.tea-house-art {
  position: fixed;
  inset: 0;
  z-index: -2;
}
.tea-house-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.tea-house-shade {
  position: fixed;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(ellipse at 30% 10%, #1a263bcc, transparent 70%),
    linear-gradient(180deg, #070d17d9, #070d17f2);
}
.tea-house-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0;
  font-size: 14px;
}
.tea-house-brand {
  margin: 0;
  font-family: "Kaiti TC", "STKaiti", "BiauKai", "Songti TC", serif;
  font-size: 24px;
  letter-spacing: 0.2em;
  color: #f1dfbd;
  text-align: center;
}
.tea-house-brand span {
  display: block;
  font-family: Georgia, serif;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--muted);
}
.tea-house-rank {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: var(--gold);
}
.tea-story-link {
  color: var(--gold);
  text-decoration: underline;
  text-underline-offset: 4px;
}
.tea-house-loading {
  padding: 80px 0;
  text-align: center;
  color: var(--muted);
}
.tea-lobby {
  display: grid;
  gap: 28px;
}
.tea-lobby-hero {
  padding: 24px 0 8px;
}
.tea-lobby-hero h1 {
  margin: 0;
  font-family: "Kaiti TC", "STKaiti", "BiauKai", "Songti TC", serif;
  font-size: clamp(52px, 6vw, 88px);
  font-weight: 400;
  letter-spacing: 0.1em;
  text-shadow: 0 3px 24px #060a15;
}
.tea-lobby-quote {
  margin: 14px 0 22px;
  font-size: 19px;
  line-height: 2;
  letter-spacing: 0.16em;
  color: #e9e0d1;
}
.tea-lobby-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 28px;
  margin: 0 0 8px;
}
.tea-lobby-stats div {
  display: grid;
  gap: 2px;
}
.tea-lobby-stats dt {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.1em;
}
.tea-lobby-stats dd {
  margin: 0;
  font-size: 20px;
  color: #f4dca5;
}
.tea-modes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}
.tea-mode {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px;
  border: 1px solid var(--line);
  background: #101825ee;
  box-shadow: 0 20px 60px #05091060;
}
.tea-mode-daily {
  border-color: #d7b681;
  background:
    radial-gradient(ellipse at 80% 0, #d7b68126, transparent 60%),
    #101825f2;
}
.tea-mode h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 400;
  letter-spacing: 0.12em;
}
.tea-mode p {
  margin: 0;
  line-height: 1.8;
  color: #d8ccb2;
  font-size: 15px;
}
.tea-mode .tea-mode-kicker {
  color: var(--gold);
  font-size: 13px;
  letter-spacing: 0.1em;
}
.tea-mode .tea-mode-record {
  margin-top: auto;
  color: #f4dca5;
}
.tea-mode .ornate-button,
.tea-mode .quiet-button {
  align-self: flex-start;
}
.tea-service {
  display: grid;
  gap: 16px;
  padding: 22px;
}
.tea-service-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.tea-service-bar .subtle {
  margin: 0 0 6px;
}
.guest-dots {
  display: flex;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
  flex-wrap: wrap;
}
.guest-dots li {
  min-width: 64px;
  padding: 4px 8px;
  border: 1px solid #d7b68140;
  text-align: center;
  font-size: 13px;
  color: #8f8677;
}
.guest-dots li.done {
  color: #ffd98e;
  border-color: #d7b68180;
}
.guest-dots li.current {
  color: var(--ink);
  border-color: var(--gold);
  background: #d7b6811a;
}
.tea-service-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.ticket-enter-active,
.ticket-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}
.ticket-enter-from {
  opacity: 0;
  transform: translateY(-10px) rotate(-0.6deg);
}
.ticket-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
.reduce-motion .ticket-enter-active,
.reduce-motion .ticket-leave-active {
  transition: none;
}
.tea-house-guide {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr)) auto;
  gap: 14px;
  align-items: center;
  margin: 0;
  padding: 12px 16px;
  list-style: none;
  border: 1px solid #d7b68166;
  background: #d7b68112;
  font-size: 14px;
  line-height: 1.7;
  color: #e0d0b5;
  counter-reset: guide;
}
.tea-house-guide li:not(:last-child)::before {
  counter-increment: guide;
  content: counter(guide);
  display: inline-grid;
  place-items: center;
  width: 22px;
  height: 22px;
  margin-right: 8px;
  border: 1px solid var(--gold);
  border-radius: 50%;
  color: var(--gold);
  font-size: 12px;
}
.tea-house-guide strong {
  margin-right: 6px;
  color: #f4dca5;
  font-weight: 400;
}
.free-ticket {
  padding: 16px 22px;
  border: 1px dashed var(--line);
}
.free-ticket h2 {
  margin: 0 0 4px;
  font-size: 21px;
  font-weight: 400;
  letter-spacing: 0.12em;
}
.free-ticket p {
  margin: 0;
  color: var(--muted);
  line-height: 1.8;
}
.tea-service .table-phases {
  margin: 0;
  padding: 10px 0;
}
.tea-house-layout {
  grid-template-columns: minmax(0, 1fr) 300px;
}
.tea-house-aside {
  display: grid;
  gap: 12px;
  align-content: start;
  line-height: 1.7;
}
.radar-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: -4px 0 0;
  font-size: 12px;
  color: var(--muted);
}
.radar-legend span {
  display: inline-block;
  width: 16px;
  height: 8px;
  margin-left: 6px;
}
.legend-fill {
  background: #d7a95888;
  border: 1px solid #f0d69c;
}
.legend-dash {
  border-top: 1px dashed #efe3c2;
  height: 0 !important;
}
.legend-band {
  background: #d7b68166;
  border-radius: 4px;
}
.tea-house-cup {
  margin: 0;
  font-size: 23px;
  font-weight: 400;
  color: #ecd1a3;
}
.recipe-teaser {
  margin: 0;
  padding: 8px 12px;
  border: 1px dashed #d7b68188;
  color: #f4dca5;
  font-size: 14px;
}
.recipe-teaser.known {
  border-style: solid;
}
.tea-house-notes {
  padding-left: 12px;
  border-left: 2px solid #bc986680;
  font-size: 14px;
  color: #e0d0b5;
}
.tea-house-notes p {
  margin: 0;
}
.tea-house-main {
  min-width: 0;
}
.tea-house-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px 16px;
  margin: 0;
  padding: 10px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.tea-house-stats div {
  display: flex;
  justify-content: space-between;
}
.tea-house-stats dt {
  color: #acaa9e;
}
.tea-house-stats dd {
  margin: 0;
  color: #efdfbd;
}
.tea-serve-button {
  width: 100%;
}
.tea-book-dialog {
  width: min(1040px, calc(100vw - 32px));
  max-width: 1040px;
  max-height: calc(100dvh - 32px);
}
.tea-book-dialog .button-row {
  margin-top: 20px;
}
.tea-house-error {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: 16px;
  margin: 0;
  padding: 12px 16px;
  border: 1px solid #c0613f;
  background: #1a1414f0;
  color: #f4d4c4;
}
@media (max-width: 1050px) {
  .tea-modes {
    grid-template-columns: 1fr;
  }
  .tea-house-layout {
    grid-template-columns: minmax(0, 1fr) 260px;
  }
}
@media (max-width: 760px) {
  .tea-house-header {
    flex-wrap: wrap;
  }
  .tea-house-brand {
    order: -1;
    width: 100%;
  }
  .tea-service {
    padding: 12px;
  }
  .tea-house-layout {
    grid-template-columns: 1fr;
  }
  .tea-service-actions .quiet-button {
    font-size: 13px;
    padding: 8px 10px;
  }
  .tea-house-guide {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  .tea-service-bar > div:first-child {
    width: 100%;
  }
  .guest-dots {
    flex-wrap: nowrap;
    gap: 4px;
  }
  .guest-dots li {
    flex: 1;
    min-width: 0;
    padding: 4px 2px;
    font-size: 11px;
    white-space: nowrap;
  }
  .tea-lobby-quote {
    font-size: 16px;
  }
}
</style>
