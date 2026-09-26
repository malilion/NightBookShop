<script setup lang="ts">
import { computed, reactive, ref, onMounted, onBeforeUnmount } from "vue";
import { useGameStore } from "../../stores/gameStore";
import { useSettingsStore } from "../../stores/settingsStore";
import { teas } from "../../data/catalog";
import { chapters, nightName } from "../../data/catalog";
import { newTea, type TeaId } from "../../types/game";
import { scoreTea } from "../../services/teaScoring";
import { audio } from "../../audio/audioManager";
import {
  tableLayout,
  distance,
  clamp,
  spout,
  catchesWater,
  pourTick,
  pourAnchor,
  type Point,
} from "../../services/teaInteraction";
import { teaInfusion } from "../../services/teaInfusion";
import TeaObject from "./TeaObject.vue";
import TeaCompletion from "./TeaCompletion.vue";
const game = useGameStore(),
  settings = useSettingsStore();
const draft = reactive({ ...game.tea });
if (draft.step === "scoop") draft.step = "water";
if (draft.step === "serve" && !draft.cupWater)
  draft.cupWater = Math.min(70, draft.water);
const board = ref<SVGSVGElement>(),
  compact = ref(false),
  message = ref("");
const layout = computed(() => tableLayout(compact.value));
const selected = computed(() => teas[draft.teaId]);
const teaName = computed(() =>
  (game.chapterId === "yenuan" || game.chapterId === "yuhang") && draft.teaId === "hojicha" && draft.garnish === "apple"
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
const ids = Object.keys(teas) as TeaId[];
const showCompletion = ref(false);
let resultDelivered = false;
const phase = computed(
  () =>
    ({
      select: 0,
      leaves: 1,
      scoop: 1,
      water: 2,
      steep: 3,
      serving: 4,
      serve: 4,
    })[draft.step],
);
const phases = ["選一罐茶", "親手舀茶", "提壺注水", "靜候茶香", "倒茶入杯"];
const held = ref(""),
  heldJar = ref<TeaId | null>(null),
  position = reactive<Point>({ x: 0, y: 0 }),
  tilt = ref(0),
  locked = ref(false);
let origin: Point = { x: 0, y: 0 },
  offset: Point = { x: 0, y: 0 },
  last = 0,
  saved = 0,
  raf = 0,
  observer: ResizeObserver | undefined,
  pointerId: number | null = null;
const potRemaining = computed(() =>
  Math.max(0, draft.water + draft.blackTea - draft.cupWater - draft.teaLost),
);
const target = computed(() =>
  held.value === "pot" ? layout.value.cup : layout.value.pot,
);
const tip = computed(() =>
  spout(position, tilt.value, held.value === "pot" ? "pot" : "kettle"),
);
const flowing = computed(
  () =>
    ["kettle", "pot"].includes(held.value) &&
    tilt.value > 15 &&
    (held.value !== "pot" || potRemaining.value > 0),
);
const aligned = computed(() =>
  catchesWater(
    tip.value,
    target.value,
    held.value === "pot" ? "pot" : "kettle",
  ),
);
const readyToServe = computed(
  () =>
    draft.cupWater >= Math.min(25, draft.water * 0.7) &&
    draft.cupWater > 0 &&
    ["serving", "serve"].includes(draft.step),
);
const infusion = computed(() => teaInfusion(draft));
const quality = computed(() => scoreTea(draft, game.chapterId).quality);
const hint = computed(() =>
  held.value
    ? locked.value
      ? "壺口對準了。向右拖慢慢傾倒，向左收水；鬆開放回。"
      : "移到虛線圈上方；可用方向鍵移動、Q／E 傾斜。"
    : [
        "茶架上的八種香氣，都可以拿下來試試。",
        draft.jarOpen
          ? "把茶匙拖進茶罐，放開舀起；再拖進茶壺放下。三匙剛好。"
          : "先把茶罐蓋拖開，聞一聞這罐茶。",
        "提起銅水壺，移到壺口上方的虛線圈。水至七分，再把壺蓋蓋好。",
        draft.steepRunning
          ? "沙漏正在走。香氣到了，直接提起茶壺倒茶。"
          : "點一下沙漏開始浸泡。想再多泡一點，也可以重新開始。",
        "提起藍色茶壺，到杯口上方慢慢傾倒。",
      ][phase.value],
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
function point(event: PointerEvent): Point {
  const rect = board.value!.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * layout.value.width,
    y: ((event.clientY - rect.top) / rect.height) * layout.value.height,
  };
}
function home(kind: string): Point {
  if (kind === "jarLid")
    return { x: layout.value.jar.x, y: layout.value.jar.y - 43 };
  if (kind === "lid")
    return draft.step === "steep"
      ? { x: layout.value.pot.x, y: layout.value.pot.y - 32 }
      : layout.value.lid;
  return (
    layout.value[kind as "kettle" | "pot" | "spoon" | "cup"] || layout.value.jar
  );
}
function place(kind: string): Point {
  return held.value === kind ? position : home(kind);
}
function transform(kind: string) {
  const p = place(kind);
  return `translate(${p.x} ${p.y}) rotate(${held.value === kind ? tilt.value : 0})`;
}
function allowed(kind: string) {
  if (kind.startsWith("jar:") || kind === "jarLid") return phase.value <= 1;
  if (kind === "spoon") return phase.value <= 2 && draft.jarOpen;
  if (kind === "kettle") return phase.value === 2;
  if (kind === "lid")
    return phase.value === 2 && draft.water > 0 && draft.leaves > 0;
  if (kind === "pot") return phase.value >= 3 && potRemaining.value > 0;
  return false;
}
function grab(kind: string, at?: Point) {
  if (!allowed(kind)) {
    message.value =
      kind === "kettle"
        ? "先選茶、舀茶，再拿水壺。"
        : kind === "spoon"
          ? "先打開桌上的茶罐。"
          : "先完成目前這一步。";
    return;
  }
  if (held.value) drop();
  held.value = kind;
  tilt.value = 0;
  locked.value = false;
  heldJar.value = kind.startsWith("jar:") ? (kind.slice(4) as TeaId) : null;
  const p = heldJar.value
    ? layout.value.jarSlot(ids.indexOf(heldJar.value))
    : home(kind);
  Object.assign(position, p);
  offset = at ? { x: at.x - p.x, y: at.y - p.y } : { x: 0, y: 0 };
  if (kind === "pot") {
    draft.steepRunning = false;
    draft.step = "serving";
    flush();
  }
}
function down(event: PointerEvent, kind: string) {
  if (event.button !== 0 || pointerId !== null) return;
  event.preventDefault();
  (event.currentTarget as SVGElement).focus();
  grab(kind, point(event));
  if (held.value !== kind) return;
  pointerId = event.pointerId;
  board.value?.setPointerCapture(event.pointerId);
}
function move(event: PointerEvent) {
  if (pointerId !== event.pointerId || !held.value) return;
  const p = point(event);
  if (locked.value && Math.abs(p.y - origin.y) < 100) {
    tilt.value = clamp((p.x - origin.x) * 0.65, 0, 75);
    return;
  }
  if (locked.value) locked.value = false;
  position.x = clamp(p.x - offset.x, 50, layout.value.width - 70);
  position.y = clamp(p.y - offset.y, 45, layout.value.height - 65);
  if (["pot", "kettle"].includes(held.value)) {
    const anchor = pourAnchor(target.value, held.value as "pot" | "kettle");
    if (distance(position, anchor) < 48) {
      Object.assign(position, anchor);
      locked.value = true;
      origin = p;
      tilt.value = 0;
    }
  }
}
function drop() {
  const kind = held.value;
  if (!kind) return;
  if (heldJar.value && distance(position, layout.value.jar) < 80) {
    draft.teaId = heldJar.value;
    draft.garnish = "none";
    draft.blackTea = 0;
    draft.step = "leaves";
    draft.leaves = 0;
    draft.jarOpen = false;
    draft.spoonLoaded = false;
    draft.water = 0;
    draft.seconds = 0;
    draft.cupWater = 0;
    draft.teaLost = 0;
    message.value = `拿下了${selected.value.name}。把蓋子移開，讓香氣出來。`;
  } else if (kind === "jarLid" && distance(position, home("jarLid")) > 45) {
    draft.jarOpen = true;
    message.value = selected.value.note;
  } else if (kind === "spoon") {
    if (distance(position, layout.value.pot) < 80 && draft.spoonLoaded) {
      if (draft.leaves < 5) {
        draft.leaves++;
        draft.spoonLoaded = false;
        message.value = `壺裡有 ${draft.leaves} 匙茶葉。`;
        draft.step = "water";
      } else message.value = "茶葉已經很多了，先留一點空間。";
    } else if (distance(position, layout.value.pot) < 80 && draft.leaves > 0) {
      draft.leaves--;
      draft.spoonLoaded = true;
      message.value = "取回一匙茶葉。移回茶罐放下，就能調整濃淡。";
    } else if (distance(position, layout.value.jar) < 80 && draft.jarOpen) {
      draft.spoonLoaded = !draft.spoonLoaded;
      message.value = draft.spoonLoaded
        ? "舀起一匙。移到茶壺裡，再放開。"
        : "這一匙放回罐裡了。";
    }
  } else if (kind === "lid" && distance(position, layout.value.pot) < 80) {
    draft.step = "steep";
    draft.steepRunning = true;
    draft.seconds = 0;
    message.value = "蓋好了。沙漏三倍流速，香氣正在展開。";
  } else if (kind === "pot") {
    if (readyToServe.value) {
      draft.step = "serve";
      message.value = `茶已入杯，可以遞給${recipientLabel.value}。`;
    } else message.value = "杯子裡還不夠，再倒一點。";
  }
  held.value = "";
  heldJar.value = null;
  locked.value = false;
  tilt.value = 0;
  flush();
}
function up(event: PointerEvent) {
  if (event.pointerId === pointerId) {
    pointerId = null;
    drop();
  }
}
function cancel() {
  pointerId = null;
  held.value = "";
  heldJar.value = null;
  locked.value = false;
  tilt.value = 0;
  flush();
}
function key(event: KeyboardEvent, kind: string) {
  if (event.key === "Tab") {
    if (held.value === kind) cancel();
    return;
  }
  if (event.key === "Escape") {
    if (held.value) {
      event.preventDefault();
      event.stopPropagation();
      cancel();
    }
    return;
  }
  if (
    ![
      " ",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "q",
      "Q",
      "e",
      "E",
    ].includes(event.key)
  )
    return;
  event.preventDefault();
  event.stopPropagation();
  if (event.key === " " || event.key === "Enter") {
    if (held.value === kind) drop();
    else grab(kind);
    return;
  }
  if (held.value !== kind) return;
  if (event.key === "ArrowLeft") position.x -= 20;
  if (event.key === "ArrowRight") position.x += 20;
  if (event.key === "ArrowUp") position.y -= 20;
  if (event.key === "ArrowDown") position.y += 20;
  position.x = clamp(position.x, 50, layout.value.width - 70);
  position.y = clamp(position.y, 45, layout.value.height - 65);
  if (event.key.toLowerCase() === "q")
    tilt.value = clamp(tilt.value - 10, 0, 75);
  if (event.key.toLowerCase() === "e")
    tilt.value = clamp(tilt.value + 10, 0, 75);
}
function wheel(event: WheelEvent) {
  if (!["kettle", "pot"].includes(held.value)) return;
  event.preventDefault();
  tilt.value = clamp(tilt.value + (event.deltaY < 0 ? 5 : -5), 0, 75);
}
function timer() {
  if (
    draft.step === "serving" &&
    draft.cupWater === 0 &&
    potRemaining.value > 0
  )
    draft.step = "steep";
  if (draft.step !== "steep") return;
  draft.steepRunning = !draft.steepRunning;
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
  game.finishTea();
}
function restart() {
  cancel();
  Object.assign(draft, newTea());
  message.value = "茶席整理好了。重新挑一罐，慢慢來。";
  flush();
}
function pause() {
  cancel();
  draft.steepRunning = false;
  flush();
}
function tick(time: number) {
  const dt = last ? Math.min(0.1, (time - last) / 1000) : 0;
  last = time;
  const paused = document.hidden || !!document.querySelector("dialog[open]");
  if (paused && held.value) cancel();
  if (!paused) {
    if (flowing.value)
      Object.assign(
        draft,
        pourTick(
          draft,
          dt,
          tilt.value,
          aligned.value,
          held.value as "kettle" | "pot",
        ),
      );
    if (draft.steepRunning && draft.step === "steep") {
      draft.seconds = Math.min(120, draft.seconds + dt * 3);
      if (draft.seconds >= 120) draft.steepRunning = false;
    }
    if (time - saved > 1000 && (flowing.value || draft.steepRunning)) {
      flush();
      saved = time;
    }
  }
  raf = requestAnimationFrame(tick);
}
onMounted(() => {
  observer = new ResizeObserver((entries) => {
    const value = entries[0]!.contentRect.width < 600;
    if (compact.value !== value) {
      cancel();
      compact.value = value;
    }
  });
  if (board.value) observer.observe(board.value);
  window.addEventListener("blur", pause);
  document.addEventListener("visibilitychange", pause);
  raf = requestAnimationFrame(tick);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  observer?.disconnect();
  window.removeEventListener("blur", pause);
  document.removeEventListener("visibilitychange", pause);
  flush();
});
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
    <div class="tea-table-layout">
      <div class="tea-board-wrap">
        <svg
          ref="board"
          class="tea-board"
          :class="{ compact }"
          :data-water="draft.water"
          :data-leaves="draft.leaves"
          :data-seconds="draft.seconds"
          :data-liquor-color="infusion.color"
          :data-cup="draft.cupWater"
          :data-spilled="draft.spilled"
          :data-step="draft.step"
          :data-held="held"
          :data-tilt="tilt"
          :viewBox="`0 0 ${layout.width} ${layout.height}`"
          :style="{ aspectRatio: `${layout.width}/${layout.height}` }"
          aria-label="可操作的茶席"
          @pointermove="move"
          @pointerup="up"
          @pointercancel="cancel"
          @lostpointercapture="cancel"
          @wheel="wheel"
        >
          <defs>
            <linearGradient id="water-flow" x1="0" y1="0" x2="1" y2="1">
              <stop stop-color="#7c999e" stop-opacity=".35" />
              <stop offset=".4" stop-color="#edf4ee" stop-opacity=".78" />
              <stop offset=".65" stop-color="#b6cfd0" stop-opacity=".42" />
              <stop offset="1" stop-color="#e3eee1" stop-opacity=".68" />
            </linearGradient>

            <filter
              id="prop-contact-shadow"
              x="-40%"
              y="-100%"
              width="180%"
              height="300%"
            >
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <radialGradient id="jar-glaze" cx="25%" cy="25%" r="90%">
              <stop stop-color="#4c6059" />
              <stop offset=".5" stop-color="#273d39" />
              <stop offset="1" stop-color="#132826" />
            </radialGradient>
            <linearGradient id="brass">
              <stop stop-color="#71563b" />
              <stop offset=".35" stop-color="#e2c18b" />
              <stop offset=".6" stop-color="#ad8452" />
              <stop offset="1" stop-color="#715235" />
            </linearGradient>
            <radialGradient id="copper" cx="28%" cy="23%" r="85%">
              <stop stop-color="#e6b380" />
              <stop offset=".3" stop-color="#b87748" />
              <stop offset=".75" stop-color="#60361f" />
              <stop offset="1" stop-color="#362c28" />
            </radialGradient>
            <radialGradient id="teapot" cx="28%" cy="25%" r="85%">
              <stop stop-color="#52707a" />
              <stop offset=".4" stop-color="#283f4a" />
              <stop offset="1" stop-color="#0d202b" />
            </radialGradient>
            <linearGradient id="porcelain">
              <stop stop-color="#a99775" />
              <stop offset=".32" stop-color="#f3e4bf" />
              <stop offset="1" stop-color="#cfbb91" />
            </linearGradient>
            <linearGradient id="table-wood" x2="0" y2="1">
              <stop stop-color="#3d3029" />
              <stop offset="1" stop-color="#211d1c" />
            </linearGradient>
            <pattern
              id="wood-lines"
              width="180"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 1H180M0 31H180M0 13Q45 6 95 14T180 12"
                fill="none"
                stroke="#c8a777"
                stroke-opacity=".07"
              />
            </pattern>
            <filter
              id="object-shadow"
              x="-70%"
              y="-80%"
              width="240%"
              height="270%"
            >
              <feDropShadow
                dx="6"
                dy="12"
                stdDeviation="8"
                flood-color="#080d13"
                flood-opacity=".5"
              />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="#152229" />
          <path
            :d="`M0 ${layout.shelfBottom}H${layout.width}V${layout.height}H0Z`"
            fill="url(#table-wood)"
          />
          <rect
            :y="layout.shelfBottom"
            width="100%"
            :height="layout.height - layout.shelfBottom"
            fill="url(#wood-lines)"
          />
          <rect
            x="30"
            :y="layout.shelfBottom + 70"
            :width="layout.width - 60"
            :height="layout.height - layout.shelfBottom - 105"
            rx="8"
            fill="#203039"
            stroke="#927a59"
            stroke-opacity=".65"
          />
          <rect
            x="37"
            :y="layout.shelfBottom + 77"
            :width="layout.width - 74"
            :height="layout.height - layout.shelfBottom - 119"
            rx="5"
            fill="none"
            stroke="#927a59"
            stroke-opacity=".25"
          />
          <text x="30" y="30" class="shelf-inscription">
            夜行書店 · 茶香目錄
          </text>
          <g v-for="(id, i) in ids" :key="id">
            <path
              :d="`M${layout.jarSlot(i).x - 53} ${layout.jarSlot(i).y + 65}h108v10h-108Z`"
              fill="#6c4e37"
              stroke="#ab8455"
              stroke-opacity=".4"
            />
            <g
              :transform="`translate(${layout.jarSlot(i).x} ${layout.jarSlot(i).y})`"
              role="button"
              tabindex="0"
              :aria-label="`茶罐：${teas[id].name}`"
              :aria-disabled="phase > 1"
              :data-tea="id"
              class="tea-draggable shelf-jar"
              :opacity="heldJar === id ? 0.3 : phase > 1 ? 0.82 : 1"
              @pointerdown="down($event, 'jar:' + id)"
              @keydown="key($event, 'jar:' + id)"
            >
              <rect
                x="-48"
                y="-55"
                width="96"
                height="118"
                fill="transparent"
              />
              <TeaObject
                kind="jar"
                :color="teas[id].color"
                :label="teas[id].name"
              />
              <text y="88" text-anchor="middle" class="jar-caption">
                {{ teas[id].name }}
              </text>
            </g>
          </g>
          <ellipse
            :cx="layout.jar.x"
            :cy="layout.jar.y + 42"
            rx="66"
            ry="24"
            fill="#152126"
            stroke="#bea171"
            stroke-dasharray="3 5"
          />
          <text
            v-if="draft.step === 'select'"
            :x="layout.jar.x"
            :y="layout.jar.y + 88"
            text-anchor="middle"
            class="table-label"
          >
            把茶罐放在這裡
          </text>
          <g
            v-else
            :transform="`translate(${layout.jar.x} ${layout.jar.y})`"
            filter="url(#object-shadow)"
          >
            <TeaObject
              kind="jar"
              :color="selected.color"
              :label="selected.name"
              open
            />
            <g
              v-if="!draft.jarOpen"
              :opacity="held === 'jarLid' ? 0 : 1"
              transform="translate(0 -43)"
              role="button"
              tabindex="0"
              aria-label="茶罐蓋"
              class="tea-draggable"
              @pointerdown="down($event, 'jarLid')"
              @keydown="key($event, 'jarLid')"
            >
              <rect x="-45" y="-22" width="90" height="44" fill="transparent" />
              <TeaObject kind="jarLid" />
            </g>
          </g>
          <g
            v-if="draft.jarOpen"
            :transform="`translate(${layout.jar.x - 15} ${layout.jar.y + 96})`"
            opacity=".65"
          >
            <TeaObject kind="jarLid" />
          </g>
          <ellipse
            v-if="draft.spilled > 0"
            :cx="layout.pot.x + 90"
            :cy="layout.pot.y + 60"
            :rx="Math.min(70, 15 + draft.spilled)"
            ry="18"
            :fill="selected.color"
            opacity=".3"
          />
          <g
            v-if="['water', 'steep', 'serving'].includes(draft.step)"
            :transform="`translate(${pourAnchor(phase < 3 ? layout.pot : layout.cup, phase < 3 ? 'kettle' : 'pot').x} ${(phase < 3 ? layout.pot : layout.cup).y - 145})`"
            class="pour-target"
            :class="{ matched: locked }"
          >
            <circle r="43" />
            <text y="-55" text-anchor="middle">
              {{ phase < 3 ? "水壺移到這裡" : "茶壺移到這裡" }}
            </text>
          </g>
          <g
            :transform="transform('kettle')"
            role="button"
            tabindex="0"
            aria-label="提起銅水壺"
            data-tool="kettle"
            class="tea-draggable"
            filter="url(#object-shadow)"
            @pointerdown="down($event, 'kettle')"
            @keydown="key($event, 'kettle')"
          >
            <rect
              x="-60"
              y="-102"
              width="150"
              height="168"
              fill="transparent"
            />
            <TeaObject kind="kettle" />
          </g>
          <g
            :transform="transform('pot')"
            role="button"
            tabindex="0"
            aria-label="提起藍色茶壺"
            data-tool="pot"
            class="tea-draggable"
            filter="url(#object-shadow)"
            @pointerdown="down($event, 'pot')"
            @keydown="key($event, 'pot')"
          >
            <rect x="-92" y="-49" width="186" height="110" fill="transparent" />
            <TeaObject
              kind="pot"
              :liquor-color="infusion.color"
              :liquor-strength="infusion.strength"
              :fill="potRemaining"
              :loaded="draft.leaves > 0"
              :color="selected.color"
            />
            <g v-if="(game.chapterId === 'yenuan' || game.chapterId === 'yuhang') && draft.garnish === 'apple'" transform="translate(55 -83)" pointer-events="none" aria-hidden="true">
              <circle r="16" fill="#b7783b" stroke="#e7bb78" stroke-width="2" />
              <circle r="9" fill="#d8a563" stroke="#f3d6a0" stroke-width="1" />
              <circle r="2" fill="#8a4c27" />
              <text y="-24" text-anchor="middle" class="table-label">蘋果乾</text>
            </g>
            <g v-if="game.chapterId === 'yuhang' && draft.garnish === 'lemon'" transform="translate(55 -83)" pointer-events="none" aria-hidden="true">
              <circle r="16" fill="#e7cc67" stroke="#f3dfa1" stroke-width="2" />
              <circle r="11" fill="#fff0a8" stroke="#d8b84e" stroke-width="1" />
              <path d="M0 -11V11M-11 0H11M-8 -8L8 8M8 -8L-8 8" stroke="#e1c45c" stroke-width="1" />
              <text y="-24" text-anchor="middle" class="table-label">檸檬片</text>
            </g>
            <g v-if="game.chapterId === 'yuhang' && draft.blackTea > 0" transform="translate(-46 -86)" pointer-events="none" aria-hidden="true">
              <path d="M-13 -5Q0 -13 13 -5L9 12Q0 17 -9 12Z" fill="#a96137" stroke="#edc693" stroke-width="2" />
              <text y="-22" text-anchor="middle" class="table-label">淡紅茶 {{ draft.blackTea }} 毫升</text>
            </g>
            <g v-if="(game.chapterId === 'boyan' || game.chapterId === 'yuhang') && draft.garnish === 'honey'" transform="translate(55 -83)" pointer-events="none" aria-hidden="true">
              <path d="M-11 -10H11L8 11Q0 15 -8 11Z" fill="#b17b35" stroke="#eac280" stroke-width="2" />
              <path d="M-7 -5H7" stroke="#f8d68d" stroke-width="2" stroke-linecap="round" />
              <text y="-24" text-anchor="middle" class="table-label">蜂蜜</text>
            </g>
            <g v-if="game.chapterId === 'haiming' && draft.garnish === 'caramel'" transform="translate(55 -83)" pointer-events="none" aria-hidden="true">
              <rect x="-13" y="-13" width="26" height="26" rx="4" transform="rotate(-12)" fill="#a46b3a" stroke="#edc47f" stroke-width="2" />
              <path d="M-7 -4L5 -8M-2 6L9 1" stroke="#edc47f" stroke-width="2" stroke-linecap="round" />
              <text y="-24" text-anchor="middle" class="table-label">海鹽焦糖</text>
            </g>
          </g>
          <g
            :transform="`translate(${layout.cup.x} ${layout.cup.y})`"
            filter="url(#object-shadow)"
          >
            <TeaObject
              kind="cup"
              :liquor-color="infusion.color"
              :liquor-strength="infusion.strength"
              :fill="draft.cupWater"
              :color="selected.color"
            />
          </g>
          <g
            v-if="draft.step !== 'select'"
            :transform="transform('spoon')"
            role="button"
            tabindex="0"
            aria-label="茶匙"
            data-tool="spoon"
            class="tea-draggable"
            filter="url(#object-shadow)"
            @pointerdown="down($event, 'spoon')"
            @keydown="key($event, 'spoon')"
          >
            <rect x="-65" y="-30" width="136" height="60" fill="transparent" />
            <TeaObject
              kind="spoon"
              :loaded="draft.spoonLoaded"
              :color="selected.color"
            />
          </g>
          <g
            v-if="draft.step !== 'serving' && draft.step !== 'serve'"
            :transform="transform('lid')"
            role="button"
            tabindex="0"
            aria-label="茶壺蓋"
            :pointer-events="phase > 2 ? 'none' : undefined"
            :aria-disabled="phase > 2"
            data-tool="lid"
            class="tea-draggable"
            filter="url(#object-shadow)"
            @pointerdown="down($event, 'lid')"
            @keydown="key($event, 'lid')"
          >
            <rect x="-50" y="-38" width="100" height="70" fill="transparent" />
            <TeaObject kind="potLid" />
          </g>
          <g
            :transform="`translate(${layout.hourglass.x} ${layout.hourglass.y})`"
            role="button"
            tabindex="0"
            aria-label="沙漏：開始或暫停浸泡"
            class="tea-draggable"
            @click="timer"
            @keydown.enter.stop.prevent="timer"
            @keydown.space.stop.prevent="timer"
          >
            <rect x="-40" y="-45" width="80" height="100" fill="transparent" />
            <TeaObject
              kind="hourglass"
              :fill="Math.min(100, (draft.seconds / selected.seconds) * 100)"
            />
            <text y="69" text-anchor="middle" class="table-label">
              {{ Math.floor(draft.seconds) }} 秒
            </text>
          </g>
          <g
            v-if="heldJar"
            :transform="`translate(${position.x} ${position.y})`"
            pointer-events="none"
            filter="url(#object-shadow)"
          >
            <TeaObject
              kind="jar"
              :color="teas[heldJar].color"
              :label="teas[heldJar].name"
            />
          </g>
          <g
            v-if="held === 'jarLid'"
            :transform="transform('jarLid')"
            pointer-events="none"
          >
            <TeaObject kind="jarLid" />
          </g>
          <g v-if="flowing" pointer-events="none">
            <path
              :d="`M${tip.x} ${tip.y} Q${tip.x + 4} ${tip.y + 45} ${aligned ? target.x : tip.x + 14} ${aligned ? target.y - 27 : Math.min(layout.height - 60, tip.y + 190)}`"
              fill="none"
              :stroke="held === 'pot' ? infusion.color : 'url(#water-flow)'"
              :stroke-width="2 + tilt / 25"
              stroke-linecap="round"
              opacity=".7"
            />
            <path
              :d="`M${tip.x} ${tip.y} Q${tip.x + 4} ${tip.y + 45} ${aligned ? target.x : tip.x + 14} ${aligned ? target.y - 27 : Math.min(layout.height - 60, tip.y + 190)}`"
              fill="none"
              stroke="#f0f6e9"
              stroke-width=".85"
              stroke-linecap="round"
              opacity=".6"
            />
            <ellipse
              v-if="aligned"
              :cx="target.x"
              :cy="target.y - 26"
              rx="17"
              ry="5"
              fill="none"
              stroke="#eee1b9"
              opacity=".7"
            />
          </g>
          <g
            v-if="draft.water > 0 && !settings.values.reducedMotion"
            class="table-steam"
            pointer-events="none"
          >
            <path
              v-for="i in 3"
              :key="i"
              :d="`M${layout.pot.x - 20 + i * 12} ${layout.pot.y - 55}q-16-20 0-40t0-35`"
              fill="none"
              stroke="#dce5d8"
              stroke-opacity=".18"
              stroke-width="3"
            />
          </g>
          <text
            :x="layout.pot.x"
            :y="layout.pot.y + 88"
            text-anchor="middle"
            class="table-label"
          >
            {{ draft.leaves }} 匙 · {{ Math.round(draft.water) }}% 水量
          </text>
          <text
            :x="layout.cup.x"
            :y="layout.cup.y + 70"
            text-anchor="middle"
            class="table-label"
          >
            茶杯 {{ Math.round(draft.cupWater) }}%
          </text>
        </svg>
        <p class="tea-gesture-hint">{{ hint }}</p>
      </div>
      <aside class="tea-recipe-note">
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
        <h3>
          {{ draft.step === "select" ? "今晚，什麼香氣？" : selected.name }}
        </h3>
        <p>
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
        <dl>
          <div>
            <dt>茶葉</dt>
            <dd>{{ draft.leaves }} / 3 匙</dd>
          </div>
          <div>
            <dt>水量</dt>
            <dd>{{ Math.round(draft.water) }}% <small>七分剛好</small></dd>
          </div>
          <div>
            <dt>浸泡</dt>
            <dd>{{ Math.floor(draft.seconds) }} / {{ selected.seconds }} 秒</dd>
          </div>
          <div v-if="draft.water > 0" class="tea-liquor-status">
            <dt>茶湯</dt>
            <dd>
              <span
                class="liquor-swatch"
                :style="{ backgroundColor: infusion.color }"
                aria-hidden="true"
              ></span
              >{{ infusion.label }}
            </dd>
          </div>
          <div v-if="draft.spilled > 1">
            <dt>灑出的水</dt>
            <dd>{{ Math.round(draft.spilled) }}%</dd>
          </div>
        </dl>
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
        <label class="range-label"
          >爐上水溫 <output>{{ draft.temperature }}°C</output
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
        <p class="subtle">
          {{ selected.name }}：{{ selected.temperature }}°C ·
          {{ selected.seconds }} 秒<br />沙漏以三倍流速走動。
        </p>
        <p class="tea-action-feedback" role="status">{{ message || hint }}</p>
        <p v-if="draft.step === 'steep'">
          {{
            draft.seconds < selected.seconds - 8
              ? "茶香還在慢慢展開。"
              : draft.seconds < selected.seconds + 10
                ? "香氣正好。可以提壺了。"
                : "茶湯漸濃，試著收住這一泡。"
          }}
        </p>
        <template v-if="readyToServe"
          ><p>
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
            茶葉太多時，把空茶匙放進壺裡取回一匙，再放回茶罐。水不足可以分次補；壺口未對準或太滿會灑水。離開分頁會停下操作與沙漏，隨時可重新整理茶席。
          </p>
        </details>
      </aside>
    </div>
    <TeaCompletion
      v-if="showCompletion"
      :tea-name="teaName"
      :liquor-color="infusion.color"
      :recipient-label="recipientLabel"
      @done="completeTea"
    />
  </section>
</template>
