<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useGameStore } from "../../stores/gameStore";
import { chapters, nightName } from "../../data/catalog";
import { newTea } from "../../types/game";
import { scoreTea } from "../../services/teaScoring";
import { audio } from "../../audio/audioManager";
import TeaTable from "./TeaTable.vue";
import TeaCompletion from "./TeaCompletion.vue";
import FlavorRadar from "./FlavorRadar.vue";
import { analyzeBrew, tastingNotes } from "../../services/teaFlavor";
import { brewCompletion, starsFor } from "../../services/teaHouse";
import { steepWindow } from "../../services/teaInteraction";
import { teas } from "../../data/catalog";
import { brewPhases as phases, useTeaBrew } from "./useTeaBrew";
const game = useGameStore();
const draft = reactive({ ...game.tea });
if (draft.step === "scoop") draft.step = "water";
if (draft.step === "serve" && !draft.cupWater)
  draft.cupWater = Math.min(70, draft.water);
const message = ref(""),
  table = ref<InstanceType<typeof TeaTable> | null>(null);
const {
  selected,
  secondary,
  totalLeaves,
  idealTemperature,
  idealSeconds,
  phase,
  readyToServe,
  infusion,
} = useTeaBrew(draft);
const hint = computed(() => table.value?.hint ?? "");
const teaName = computed(() =>
  secondary.value && draft.blendLeaves > 0 && draft.leaves === 0
    ? secondary.value.name
    : secondary.value && draft.blendLeaves > 0
    ? `${selected.value.name}・${secondary.value.name}調和茶`
    : (game.chapterId === "yenuan" || game.chapterId === "yuhang") && draft.teaId === "hojicha" && draft.garnish === "apple"
    ? "焙茶蘋果茶"
    : game.chapterId === "yuhang" && draft.teaId === "mint" && draft.garnish === "lemon" && draft.blackTea >= 15
    ? "薄荷檸檬紅茶"
    : (game.chapterId === "boyan" || game.chapterId === "yuhang") && draft.teaId === "chamomile" && draft.garnish === "honey"
    ? "洋甘菊蜂蜜茶"
    : game.chapterId === "haiming" && draft.teaId === "hojicha" && draft.garnish === "caramel"
    ? "海鹽焦糖焙茶"
    : selected.value.name,
);
const recipientLabel = computed(() => game.chapterId === "lincheng" ? "自己" : ["boyan", "yuhang", "haiming"].includes(game.chapterId) ? "他" : "她");
const showCompletion = ref(false);
let resultDelivered = false;
const scored = computed(() => scoreTea(draft, game.chapterId));
const quality = computed(() => scored.value.quality);
// The brew film follows the tea the story answers to: the larger share.
const filmTea = computed(() => scored.value.teaId);
// Its garnish too: one added to a tea that a blend outweighs is not shown.
const filmGarnish = computed(() => scored.value.garnish ?? "none");
// HUD：風味雷達、浸泡計時與完成度（故事茶席用爐上水溫，不需要煮水）。
const analysis = computed(() => analyzeBrew(draft));
const notes = computed(() => tastingNotes(analysis.value, draft));
const completion = computed(() =>
  brewCompletion(draft, null, { boiling: false, window: steepWindow(idealSeconds.value) }),
);
const stars = computed(() => starsFor(completion.value.percent));
const starMarks = [55, 75, 90];
const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
// 浸泡圈：滿一圈是理想時間的 1.6 倍，金色弧線是最好的提壺時機。
const steepTurn = computed(() => idealSeconds.value * 1.6);
const ringLength = 2 * Math.PI * 44;
const steepDash = computed(() => `${Math.min(1, draft.seconds / steepTurn.value) * ringLength} ${ringLength}`);
const windowDash = computed(() => {
  const [from, to] = steepWindow(idealSeconds.value);
  return {
    dasharray: `${((to - from) / steepTurn.value) * ringLength} ${ringLength}`,
    dashoffset: `${-(from / steepTurn.value) * ringLength}`,
  };
});
const steepNote = computed(() =>
  draft.step === "select" || draft.water === 0
    ? "注水後，沙漏才開始走。"
    : draft.seconds < idealSeconds.value - 8
      ? "茶香還在慢慢展開。"
      : draft.seconds < idealSeconds.value + 10
        ? "香氣正好。可以提壺了。"
        : "茶湯漸濃，試著收住這一泡。",
);
const garnishName = computed(() =>
  ({ apple: "蘋果乾", lemon: "檸檬片", honey: "蜂蜜", caramel: "海鹽焦糖", none: "" })[draft.garnish] ?? "",
);
function flush() {
  if (game.frame?.mode === "tea") game.updateTea({ ...draft });
}
function toggleApple() {
  if (!["yenuan", "yuhang"].includes(game.chapterId) || draft.teaId !== "hojicha" || phase.value > 2) return;
  draft.garnish = draft.garnish === "apple" ? "none" : "apple";
  message.value = draft.garnish === "apple" ? "一片蘋果乾放進焙茶壺，等香氣一起展開。" : "蘋果乾回到小碟；這杯先泡原味焙茶。";
  flush();
}
function toggleHoney() {
  if (!["boyan", "yuhang"].includes(game.chapterId) || draft.teaId !== "chamomile" || phase.value > 2) return;
  draft.garnish = draft.garnish === "honey" ? "none" : "honey";
  message.value = draft.garnish === "honey" ? "攪入一小匙蜂蜜，洋甘菊的香氣慢慢變得柔和。" : "蜂蜜留在小罐裡；這杯先泡原味洋甘菊。";
  flush();
}
function toggleLemon() {
  if (game.chapterId !== "yuhang" || draft.teaId !== "mint" || phase.value > 2) return;
  draft.garnish = draft.garnish === "lemon" ? "none" : "lemon";
  message.value = draft.garnish === "lemon" ? "檸檬片放進薄荷茶壺；也可以再倒入淡紅茶。" : "檸檬片回到小碟。";
  flush();
}
function setBlackTea(event: Event) {
  if (game.chapterId !== "yuhang" || draft.teaId !== "mint" || phase.value > 3) return;
  draft.blackTea = Number((event.target as HTMLInputElement).value);
  message.value = draft.blackTea > 0
    ? `從備好的小壺倒入 ${draft.blackTea} 毫升淡紅茶，茶湯漸漸轉暖。`
    : "淡紅茶留在小壺裡，這杯只用薄荷。";
  flush();
}
function toggleCaramel() {
  if (game.chapterId !== "haiming" || draft.teaId !== "hojicha" || phase.value > 2) return;
  draft.garnish = draft.garnish === "caramel" ? "none" : "caramel";
  message.value = draft.garnish === "caramel" ? "放入一小塊海鹽焦糖，焙茶漸漸帶上鹹甜香。" : "焦糖回到小碟；這杯先留原味焙茶。";
  flush();
}
function finish() {
  if (!readyToServe.value) return;
  audio.cue("porcelain");
  draft.step = "serve";
  flush();
  showCompletion.value = true;
}
function completeTea() {
  if (resultDelivered) return;
  resultDelivered = true;
  showCompletion.value = false;
  // Story cups also fill the tea house recipe book; it loads on demand and never blocks the story.
  const cup = { ...draft, leafOrder: [...draft.leafOrder] };
  void import("../../stores/teaHouseStore")
    .then(({ useTeaHouseStore }) => useTeaHouseStore().recordStoryBrew(cup))
    .catch(() => undefined);
  game.finishTea();
}
function restart() {
  table.value?.cancel();
  Object.assign(draft, newTea());
  message.value = "茶席整理好了。重新挑一罐，慢慢來。";
  flush();
}
</script>
<template>
  <section class="hands-on-tea paper-frame" aria-label="製茶">
    <header class="tea-table-heading">
      <div>
        <p class="subtle">
          {{ nightName(game.chapterId) }} ·
          {{
            chapters.find((chapter) => chapter.id === game.chapterId)?.visitor
          }}的茶
        </p>
        <h2>慢慢來，親手泡一杯。</h2>
      </div>
      <button class="quiet-button" @click="restart">重新整理茶席</button>
    </header>
    <ol class="table-phases" aria-label="製茶步驟">
      <li
        v-for="(label, i) in phases"
        :key="label"
        :class="{ active: i === phase, done: i < phase }"
      >
        {{ String(i + 1).padStart(2, "0") }} <span>{{ label }}</span>
      </li>
    </ol>
    <div class="tea-hud-layout">
      <section class="tea-hud-card tea-hud-temp" aria-labelledby="tea-hud-temp-title">
        <h3 id="tea-hud-temp-title" class="tea-hud-title"><span class="tea-hud-icon" aria-hidden="true">🌡</span>水溫</h3>
        <label class="range-label tea-thermo"
          ><span class="tea-thermo-name">爐上水溫</span> <output>{{ draft.temperature }}°C</output
          ><input
            v-model.number="draft.temperature"
            aria-label="水溫"
            type="range"
            min="60"
            max="100"
            step="5"
            :disabled="phase > 2"
            @change="flush"
        /></label>
        <div class="tea-thermo-ticks" aria-hidden="true">
          <span v-for="tick in [60, 70, 80, 90, 100]" :key="tick" :class="{ ideal: Math.abs(tick - idealTemperature) < 5 }">{{ tick }}</span>
        </div>
        <p class="tea-hud-hint">{{ teaName }}：{{ idealTemperature }}°C · {{ idealSeconds }} 秒</p>
      </section>
      <section class="tea-hud-card tea-hud-steep" aria-labelledby="tea-hud-steep-title">
        <h3 id="tea-hud-steep-title" class="tea-hud-title"><span class="tea-hud-icon" aria-hidden="true">⧗</span>浸泡</h3>
        <div class="tea-steep-clock" :class="{ ready: draft.water > 0 && Math.abs(draft.seconds - idealSeconds) <= 4 }">
          <svg viewBox="-56 -56 112 112" aria-hidden="true">
            <circle r="44" class="steep-clock-track" />
            <circle r="44" class="steep-clock-window" :stroke-dasharray="windowDash.dasharray" :stroke-dashoffset="windowDash.dashoffset" transform="rotate(-90)" />
            <circle r="44" class="steep-clock-progress" :stroke-dasharray="steepDash" transform="rotate(-90)" />
          </svg>
          <p><strong>{{ clock(draft.seconds) }}</strong><small>／ {{ clock(idealSeconds) }}</small></p>
        </div>
        <p class="tea-hud-hint">{{ steepNote }}<br />沙漏以三倍流速走動。</p>
      </section>
      <section class="tea-hud-card tea-hud-flavor" aria-labelledby="tea-hud-flavor-title">
        <h3 id="tea-hud-flavor-title" class="tea-hud-title"><span class="tea-hud-icon" aria-hidden="true">❦</span>風味</h3>
        <FlavorRadar compact :profile="analysis.profile" :color="infusion.color" :bitterness="analysis.bitterness" />
        <p class="tea-hud-note">{{ notes.aroma }}<template v-if="notes.palate">{{ notes.palate }}</template></p>
      </section>
      <div class="tea-hud-board">
        <TeaTable
          ref="table"
          v-model:message="message"
          :draft="draft"
          :recipient="recipientLabel"
          @flush="flush"
        />
      </div>
      <section class="tea-hud-card tea-hud-recipe tea-recipe-note" aria-labelledby="tea-hud-recipe-title">
        <h3 id="tea-hud-recipe-title" class="tea-hud-title"><span class="tea-hud-icon" aria-hidden="true">✿</span>配方</h3>
          <p class="subtle">
            {{
              game.chapterId === "lincheng"
                ? "妳終於坐到櫃台另一側。"
                : game.chapterId === "haiming"
                ? "他仔細擦拭不能點亮的煤油燈。"
                : game.chapterId === "yuhang"
                ? "他站在門口，仍說自己只是來送信。"
                : game.chapterId === "yenuan"
                ? "她把烤焦的麵包藏在籃底。"
                : game.chapterId === "ruoyin"
                ? "她聽見杯緣的四個音。"
                : game.chapterId === "boyan"
                  ? "他仍在數未讀訊息。"
                  : "她說起五十年前的校刊室。"
            }}
          </p>
          <h4 class="tea-hud-cup">{{ draft.step === "select" ? "今晚，什麼香氣？" : teaName }}</h4>
          <p class="tea-hud-desc">
            {{
              draft.step === "select"
                ? game.chapterId === "lincheng"
                  ? "今晚沒有訪客需要妳先決定。替自己選一罐茶，慢慢泡好。"
                  : game.chapterId === "haiming"
                  ? "海明看著煤油燈。焙茶配一點海鹽焦糖香，也許會喚起燈塔廚房。"
                  : game.chapterId === "yuhang"
                  ? "雨航把郵袋放在腳邊。薄荷檸檬紅茶能讓他清醒；洋甘菊可加蜂蜜，焙茶可加蘋果乾。"
                  : game.chapterId === "yenuan"
                  ? "葉暖看著蘋果乾。炭焙焙茶的香氣也許能讓她說起母親。"
                  : game.chapterId === "ruoyin"
                  ? "若音的琴弓放在桌上。薰衣草伯爵也許能讓她想起普通的星期三。"
                  : game.chapterId === "boyan"
                    ? "讓柏言先放下手機。洋甘菊的香氣也許能陪他緩一口氣。"
                    : "她摩挲著舊信封。或許，窗邊的桂花香還在。"
                : selected.note
            }}
          </p>
          <ul class="tea-recipe-slots">
            <li :class="{ filled: draft.step !== 'select' }">
              <span class="tea-slot-swatch" :style="{ background: draft.step === 'select' ? undefined : teas[draft.teaId].color }" aria-hidden="true"></span>
              <span class="tea-slot-name">{{ draft.step === "select" ? "茶葉" : selected.name }}</span>
              <small>{{ draft.leaves }}/3 匙</small>
            </li>
            <li v-if="secondary" class="filled">
              <span class="tea-slot-swatch" :style="{ background: secondary.color }" aria-hidden="true"></span>
              <span class="tea-slot-name">{{ secondary.name }}</span>
              <small>{{ draft.blendLeaves }} 匙</small>
            </li>
            <li :class="{ filled: draft.water > 0 }">
              <span class="tea-slot-swatch water" :style="{ background: draft.water > 0 ? infusion.color : undefined }" aria-hidden="true"></span>
              <span class="tea-slot-name">{{ draft.water > 0 ? infusion.label : "熱水" }}</span>
              <small>{{ Math.round(draft.water) }}%<span v-if="draft.spilled > 1"> · 灑 {{ Math.round(draft.spilled) }}%</span></small>
            </li>
            <li :class="['tea-slot-extra', { filled: draft.garnish !== 'none' }]">
              <span class="tea-slot-plus" aria-hidden="true">{{ draft.garnish !== "none" ? "✓" : "+" }}</span>
              <span class="tea-slot-name">{{ garnishName || "配料" }}</span>
              <small>{{ draft.garnish !== "none" ? "1/1" : "—" }}</small>
            </li>
          </ul>
          <p v-if="secondary" class="tea-blend-split">{{ selected.name }} {{ draft.leaves }}，{{ secondary.name }} {{ draft.blendLeaves }}</p>
          <dl class="screen-reader-only">
            <div><dt>茶葉</dt><dd>{{ totalLeaves }} / 3 匙</dd></div>
            <div><dt>水量</dt><dd>{{ Math.round(draft.water) }}%</dd></div>
            <div><dt>浸泡</dt><dd>{{ Math.floor(draft.seconds) }} / {{ idealSeconds }} 秒</dd></div>
          </dl>
          <p v-if="draft.step !== 'select' && draft.water === 0" class="tea-blend-hint">
            可把另一罐茶放到茶桌的第二個圓墊，打開罐蓋後分別舀取；兩種茶葉共三匙最合適。
          </p>
          <p v-if="secondary && draft.blendLeaves > 0" class="tea-blend-hint">
            兩種茶材各自的份量會改變茶色、合適水溫、浸泡時間與訪客反應。
          </p>
          <div v-if="game.chapterId === 'yenuan' && draft.step !== 'select' && draft.teaId === 'hojicha'" class="tea-garnish">
            <p>葉暖的焙茶蘋果茶</p>
            <button type="button" class="quiet-button" :aria-pressed="draft.garnish === 'apple'" :disabled="phase > 2" @click="toggleApple">
              {{ draft.garnish === "apple" ? "✓ 已加入蘋果乾" : "加入一片蘋果乾" }}
            </button>
            <small>{{ draft.garnish === "apple" ? "烘香裡有蘋果的甜味。" : "蘋果乾仍在碟裡；也可以泡原味焙茶。" }}</small>
          </div>
          <div v-if="game.chapterId === 'yuhang' && draft.step !== 'select' && draft.teaId === 'mint'" class="tea-garnish">
            <p>雨航的薄荷檸檬紅茶</p>
            <button type="button" class="quiet-button" :aria-pressed="draft.garnish === 'lemon'" :disabled="phase > 2" @click="toggleLemon">
              {{ draft.garnish === "lemon" ? "✓ 已加入檸檬片" : "加入一片檸檬" }}
            </button>
            <label class="range-label">倒入備好的淡紅茶 <output>{{ draft.blackTea }} 毫升</output>
              <input :value="draft.blackTea" aria-label="淡紅茶混合量" type="range" min="0" max="30" step="5" :disabled="phase > 3" @input="setBlackTea" />
            </label>
            <small>{{ draft.garnish === "lemon" && draft.blackTea >= 15 ? "薄荷、檸檬與淡紅茶都在壺裡。" : draft.blackTea > 0 ? "茶湯已混入淡紅茶；也能加入檸檬片。" : "淡紅茶還在小壺裡；可選原味薄荷。" }}</small>
          </div>
          <div v-if="(game.chapterId === 'boyan' || game.chapterId === 'yuhang') && draft.step !== 'select' && draft.teaId === 'chamomile'" class="tea-garnish">
            <p>{{ game.chapterId === 'boyan' ? '柏言' : '雨航' }}的洋甘菊蜂蜜茶</p>
            <button type="button" class="quiet-button" :aria-pressed="draft.garnish === 'honey'" :disabled="phase > 2" @click="toggleHoney">
              {{ draft.garnish === "honey" ? "✓ 已加入蜂蜜" : "加入一小匙蜂蜜" }}
            </button>
            <small>{{ draft.garnish === "honey" ? "蜂蜜在茶裡化開，也許能陪他短暫休息。" : "蜂蜜仍在小罐裡；也可以泡原味洋甘菊。" }}</small>
          </div>
          <div v-if="game.chapterId === 'yuhang' && draft.step !== 'select' && draft.teaId === 'hojicha'" class="tea-garnish">
            <p>雨航的焙茶蘋果茶</p>
            <button type="button" class="quiet-button" :aria-pressed="draft.garnish === 'apple'" :disabled="phase > 2" @click="toggleApple">
              {{ draft.garnish === "apple" ? "✓ 已加入蘋果乾" : "加入一片蘋果乾" }}
            </button>
            <small>{{ draft.garnish === "apple" ? "烘香裡有蘋果的甜味。" : "蘋果乾仍在碟裡；也可以泡原味焙茶。" }}</small>
          </div>
          <div v-if="game.chapterId === 'haiming' && draft.step !== 'select' && draft.teaId === 'hojicha'" class="tea-garnish">
            <p>海明的海鹽焦糖焙茶</p>
            <button type="button" class="quiet-button" :aria-pressed="draft.garnish === 'caramel'" :disabled="phase > 2" @click="toggleCaramel">
              {{ draft.garnish === "caramel" ? "✓ 已加入海鹽焦糖" : "加入一小塊海鹽焦糖" }}
            </button>
            <small>{{ draft.garnish === "caramel" ? "焙茶裡留著燈塔廚房的鹹甜。" : "焦糖仍在碟裡；也可以泡原味焙茶。" }}</small>
          </div>
      </section>
      <section class="tea-hud-card tea-hud-done" aria-labelledby="tea-hud-done-title">
        <h3 id="tea-hud-done-title" class="tea-hud-title"><span class="tea-hud-icon" aria-hidden="true">☕</span>完成度</h3>
        <div class="tea-done-meter" role="meter" aria-label="完成度" :aria-valuenow="completion.percent" aria-valuemin="0" aria-valuemax="100" :aria-valuetext="`${completion.percent}%，${stars} 顆星`">
          <span class="tea-done-track" aria-hidden="true">
            <span class="tea-done-fill" :style="{ width: `${completion.percent}%` }"></span>
            <span v-for="(mark, i) in starMarks" :key="mark" class="tea-done-star" :class="{ lit: stars > i }" :style="{ left: `${mark}%` }"></span>
          </span>
          <strong>{{ completion.percent }}%</strong>
        </div>
        <p class="tea-action-feedback" role="status">{{ message || hint }}</p>
        <template v-if="readyToServe"
          ><p class="tea-hud-hint">
            {{
              quality >= 85
                ? "茶香停在杯緣，這一杯很溫柔。"
                : `泡法與原先想的不同，仍然可以陪${recipientLabel}說說話。`
            }}
          </p>
          <button class="ornate-button" @click="finish">
            將茶遞給{{ recipientLabel }}
          </button></template
        >
      <details class="tea-keyboard-help">
          <summary>鍵盤操作與茶席說明</summary>
          <p>
            Tab 選器具，Enter 拿起／放下，方向鍵移動，E 傾倒、Q 收水，Esc
            放回。滑鼠提壺時也能用滾輪調整角度。
          </p>
          <p>
            茶葉太多時，把空茶匙放進壺裡取回最後加入的一匙，再放回原來的茶罐。注水前可選第二罐，從兩罐分別舀茶；總量最多五匙。水不足可以分次補；壺口未對準或太滿會灑水。離開分頁會停下操作與沙漏，隨時可重新整理茶席。
          </p>
        </details>
      </section>
    </div>
    <TeaCompletion
      v-if="showCompletion"
      :tea-name="teaName"
      :tea-id="filmTea"
      :garnish="filmGarnish"
      :liquor-color="infusion.color"
      :recipient-label="recipientLabel"
      @done="completeTea"
    />
  </section>
</template>
