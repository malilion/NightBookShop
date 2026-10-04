<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useSettingsStore } from "../../stores/settingsStore";
import { teas } from "../../data/catalog";
import { garnishes, ingredients } from "../../data/teaFlavor";
import { newTea, type IngredientId, type TeaDraft, type TeaId } from "../../types/game";
import { audio } from "../../audio/audioManager";
import {
  tableLayout,
  distance,
  clamp,
  spout,
  catchesWater,
  pourTick,
  pourAnchor,
  steepWindow,
  heatTick,
  boilStage,
  fireNames,
  minPourTemperature,
  type Point,
} from "../../services/teaInteraction";
import { useTeaBrew } from "./useTeaBrew";
import TeaObject from "./TeaObject.vue";
import "../../styles/teaTable.css";
const props = withDefaults(
  defineProps<{
    draft: TeaDraft;
    /** Who receives the cup; empty when the player tastes it. */
    recipient?: string;
    /** Service nights stop the hourglass only by lifting the pot. */
    allowPause?: boolean;
    /** The tea house boils its own water on a stove instead of a heat dial. */
    boiling?: boolean;
    /** Steep seconds to lift the pot at; defaults to the recipe's window. */
    window?: [number, number] | null;
  }>(),
  { recipient: "", allowPause: true, boiling: false, window: null },
);
const emit = defineEmits<{ flush: [] }>();
const message = defineModel<string>("message", { default: "" });
const settings = useSettingsStore();
// The parent owns this reactive draft; the table edits it in place so the
// sidebar beside it always reads the same cup.
const draft = props.draft;
const {
  selected,
  totalLeaves,
  idealSeconds,
  idealTemperature,
  phase,
  canChooseJar,
  potRemaining,
  readyToServe,
  infusion,
} = useTeaBrew(draft);
const board = ref<SVGSVGElement>(),
  compact = ref(false);
const layout = computed(() => tableLayout(compact.value, props.boiling));
const ids = Object.keys(teas) as TeaId[];
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
const target = computed(() =>
  held.value === "pot" ? layout.value.cup : layout.value.pot,
);
const tip = computed(() =>
  spout(position, tilt.value, held.value === "pot" ? "pot" : "kettle"),
);
const coldKettle = computed(() => props.boiling && draft.kettleTemp < minPourTemperature);
const flowing = computed(
  () =>
    ["kettle", "pot"].includes(held.value) &&
    tilt.value > 15 &&
    (held.value !== "pot" || potRemaining.value > 0) &&
    (held.value !== "kettle" || !coldKettle.value),
);
const aligned = computed(() =>
  catchesWater(
    tip.value,
    target.value,
    held.value === "pot" ? "pot" : "kettle",
  ),
);
// Hourglass ring: one turn is 1.6 recipe lengths (longer if the guest wants a
// long steep); the gold arc is the moment to lift the pot.
const steepZone = computed(() => props.window ?? steepWindow(idealSeconds.value));
const ringTurn = computed(() => Math.max(idealSeconds.value * 1.6, steepZone.value[1] + 10));
const inWindow = computed(
  () =>
    totalLeaves.value > 0 &&
    draft.water > 0 &&
    draft.seconds >= steepZone.value[0] &&
    draft.seconds <= steepZone.value[1],
);
const overSteeped = computed(() => draft.seconds > steepZone.value[1]);
function arc(from: number, to: number, radius: number) {
  const span = clamp(to, 0, 0.9999) - clamp(from, 0, 1);
  if (span <= 0) return "";
  const start = from * Math.PI * 2 - Math.PI / 2,
    end = (from + span) * Math.PI * 2 - Math.PI / 2;
  const point = (angle: number) =>
    `${(radius * Math.cos(angle)).toFixed(2)} ${(radius * Math.sin(angle)).toFixed(2)}`;
  return `M${point(start)}A${radius} ${radius} 0 ${span > 0.5 ? 1 : 0} 1 ${point(end)}`;
}
const aromaTeas = computed(() => {
  const inPot: TeaId[] = [];
  if (draft.leaves > 0) inPot.push(draft.teaId);
  if (draft.blendTeaId && draft.blendLeaves > 0) inPot.push(draft.blendTeaId);
  return inPot;
});
const dominantTeaId = computed(() =>
  draft.blendTeaId && draft.blendLeaves > draft.leaves
    ? draft.blendTeaId
    : draft.teaId,
);
const showAroma = computed(
  () =>
    !settings.values.reducedMotion &&
    aromaTeas.value.length > 0 &&
    draft.water > 0 &&
    phase.value >= 3 &&
    draft.seconds >= idealSeconds.value * 0.2,
);
const aromaAnchor = computed(() =>
  draft.cupWater > 0
    ? { x: layout.value.cup.x, y: layout.value.cup.y - 30 }
    : { x: layout.value.pot.x, y: layout.value.pot.y - 60 },
);
const aromaParticles = [
  { x: -26, delay: 0, drift: 14, scale: 1 },
  { x: 12, delay: 0.9, drift: -18, scale: 0.8 },
  { x: -4, delay: 1.8, drift: 22, scale: 1.15 },
  { x: 30, delay: 2.6, drift: -10, scale: 0.9 },
  { x: -36, delay: 3.4, drift: 8, scale: 0.75 },
  { x: 20, delay: 4.3, drift: 16, scale: 1.05 },
];
const steamOpacity = computed(() =>
  (0.08 + clamp((draft.temperature - 60) / 40, 0, 1) * 0.2).toFixed(3),
);
// Stove and kettle.
const onStove = computed(() => held.value !== "kettle");
const stage = computed(() => boilStage(draft.kettleTemp, draft.kettleOverBoil));
const bubbleCount = computed(() =>
  !props.boiling || !onStove.value || draft.kettleTemp < 70 ? 0 : draft.kettleTemp < 85 ? 3 : draft.kettleTemp < 94 ? 5 : 8,
);
const kettleSteam = computed(() => (props.boiling ? clamp((draft.kettleTemp - 70) / 30, 0, 1) : 0));
function cycleFire() {
  if (!props.boiling) return;
  draft.fire = (draft.fire + 1) % 4;
  message.value = draft.fire ? `爐火轉為${fireNames[draft.fire]}。` : "熄了爐火，水會慢慢變涼。";
  flush();
}
// Ingredients, grouped for the markers on the pot and the cup.
function groups(where: "pot" | "cup") {
  const counts = new Map<IngredientId, number>();
  for (const unit of draft.ingredients) if (unit.where === where) counts.set(unit.id, (counts.get(unit.id) ?? 0) + 1);
  return [...counts].map(([id, count]) => ({ id, count, name: ingredients[id].name }));
}
const potIngredients = computed(() => groups("pot"));
const cupIngredients = computed(() => groups("cup"));
const hint = computed(() =>
  held.value
    ? locked.value
      ? "壺口對準了。向右拖慢慢傾倒，向左收水；鬆開放回。"
      : "移到虛線圈上方；可用方向鍵移動、Q／E 傾斜。"
    : [
        "茶架上的八種香氣，都可以拿下來試試。",
        draft.jarOpen
          ? "把茶匙拖進已開的茶罐舀茶，再放進茶壺；注水前也能選第二罐調配。總共三匙剛好。"
          : "先把茶罐蓋拖開，聞一聞這罐茶。",
        props.boiling && draft.water === 0 && draft.kettleTemp < Math.round(idealTemperature.value / 5) * 5 - 2
          ? `先把水煮熱：點風爐或旁邊的火力鈕，壺中水溫到 ${Math.round(idealTemperature.value / 5) * 5}°C 再提壺注水。`
          : "提起銅水壺，移到壺口上方的虛線圈。水至七分，再把壺蓋蓋好。",
        draft.steepRunning
          ? props.allowPause
            ? "沙漏正在走。香氣到了，直接提起茶壺倒茶。"
            : "沙漏正在走。金色弧線亮起時提起茶壺，就是最好的時機。"
          : "點一下沙漏開始浸泡。想再多泡一點，也可以重新開始。",
        "提起藍色茶壺，到杯口上方慢慢傾倒。",
      ][phase.value],
);
watch(inWindow, (value) => {
  if (value && draft.steepRunning) audio.cue("chime");
});
function flush() {
  emit("flush");
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
  if (kind === "blendJarLid")
    return { x: layout.value.blendJar.x, y: layout.value.blendJar.y - 43 };
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
  if (kind.startsWith("jar:") || kind === "jarLid") return canChooseJar.value;
  if (kind === "blendJarLid") return canChooseJar.value && !!draft.blendTeaId;
  if (kind === "spoon") return phase.value <= 2 && (draft.jarOpen || draft.blendJarOpen || draft.spoonLoaded);
  if (kind === "kettle") return phase.value === 2;
  if (kind === "lid")
    return phase.value === 2 && draft.water > 0 && totalLeaves.value > 0;
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
    if (held.value === "kettle" && coldKettle.value && tilt.value > 15)
      message.value = `水還涼（${Math.round(draft.kettleTemp)}°C）。先放回爐上，煮到 ${minPourTemperature}°C 以上再注水。`;
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
    Object.assign(draft, {
      ...newTea(),
      teaId: heldJar.value,
      temperature: teas[heldJar.value].temperature,
      step: "leaves",
    });
    message.value = `拿下了${selected.value.name}。把蓋子移開，讓香氣出來。`;
  } else if (heldJar.value && draft.step !== "select" && distance(position, layout.value.blendJar) < 80) {
    if (heldJar.value === draft.teaId) message.value = "第二罐請選不同的茶葉；想調整濃淡，可以增減同一罐的茶匙。";
    else {
      draft.blendTeaId = heldJar.value;
      draft.blendLeaves = 0;
      draft.blendJarOpen = false;
      draft.leafOrder = draft.leafOrder.filter((id) => id === draft.teaId);
      draft.spoonLoaded = false;
      draft.spoonTeaId = null;
      message.value = `第二罐是${teas[heldJar.value].name}。打開罐蓋，分別舀取兩種茶葉。`;
    }
  } else if (kind === "jarLid" && distance(position, home("jarLid")) > 45) {
    draft.jarOpen = true;
    message.value = selected.value.note;
  } else if (kind === "blendJarLid" && distance(position, home("blendJarLid")) > 45) {
    draft.blendJarOpen = true;
    message.value = draft.blendTeaId ? teas[draft.blendTeaId].note : "第二罐茶已打開。";
  } else if (kind === "spoon") {
    if (distance(position, layout.value.pot) < 80 && draft.spoonLoaded) {
      if (totalLeaves.value < 5) {
        const scoopTeaId = draft.spoonTeaId ?? draft.teaId;
        if (scoopTeaId === draft.blendTeaId) draft.blendLeaves++;
        else draft.leaves++;
        draft.leafOrder.push(scoopTeaId);
        draft.spoonLoaded = false;
        draft.spoonTeaId = null;
        message.value = `壺裡有 ${totalLeaves.value} 匙茶葉，兩種茶可以調整比例。`;
        draft.step = "water";
      } else message.value = "茶葉已經很多了，先留一點空間。";
    } else if (distance(position, layout.value.pot) < 80 && totalLeaves.value > 0) {
      const removed = draft.leafOrder.pop() ?? (draft.blendLeaves > 0 ? draft.blendTeaId! : draft.teaId);
      if (removed === draft.blendTeaId) draft.blendLeaves--;
      else draft.leaves--;
      draft.spoonLoaded = true;
      draft.spoonTeaId = removed;
      if (totalLeaves.value === 0 && draft.water === 0) draft.step = "leaves";
      message.value = "取回最後加入的一匙茶葉。移回同一罐放下，就能調整比例。";
    } else {
      const scoopTeaId = distance(position, layout.value.jar) < 80 && draft.jarOpen
        ? draft.teaId
        : distance(position, layout.value.blendJar) < 80 && draft.blendJarOpen
          ? draft.blendTeaId
          : null;
      if (scoopTeaId && !draft.spoonLoaded) {
        draft.spoonLoaded = true;
        draft.spoonTeaId = scoopTeaId;
        message.value = `舀起一匙${teas[scoopTeaId].name}。移到茶壺裡，再放開。`;
      } else if (scoopTeaId && draft.spoonTeaId === scoopTeaId) {
        draft.spoonLoaded = false;
        draft.spoonTeaId = null;
        message.value = "這一匙放回原來的茶罐了。";
      } else if (scoopTeaId) message.value = "這匙茶葉請先放回原來的茶罐。";
    }
  } else if (kind === "lid" && distance(position, layout.value.pot) < 80) {
    draft.step = "steep";
    draft.steepRunning = true;
    draft.seconds = 0;
    message.value = "蓋好了。沙漏三倍流速，香氣正在展開。";
  } else if (kind === "pot") {
    if (readyToServe.value) {
      draft.step = "serve";
      message.value = props.recipient
        ? `茶已入杯，可以遞給${props.recipient}。`
        : "茶已入杯，可以品嚐了。";
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
  if (draft.steepRunning && !props.allowPause) {
    message.value = "今晚的沙漏不停；香氣到了，就提起茶壺。";
    return;
  }
  draft.steepRunning = !draft.steepRunning;
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
    if (props.boiling) Object.assign(draft, heatTick(draft, draft.fire, onStove.value, dt));
    if (flowing.value)
      Object.assign(
        draft,
        pourTick(
          draft,
          dt,
          tilt.value,
          aligned.value,
          held.value as "kettle" | "pot",
          props.boiling && held.value === "kettle"
            ? { temp: draft.kettleTemp, overBoil: draft.kettleOverBoil }
            : undefined,
        ),
      );
    if (draft.steepRunning && draft.step === "steep") {
      draft.seconds = Math.min(120, draft.seconds + dt * 3);
      if (draft.seconds >= 120) draft.steepRunning = false;
    }
    if (time - saved > 1000 && (flowing.value || draft.steepRunning || (props.boiling && draft.fire > 0))) {
      flush();
      saved = time;
    }
  }
  audio.setPour(!paused && flowing.value ? clamp((tilt.value - 15) / 45, 0.25, 1) : 0);
  audio.setBoil(!paused && props.boiling && onStove.value && draft.fire > 0 ? clamp((draft.kettleTemp - 65) / 35, 0, 1) : 0);
  raf = requestAnimationFrame(tick);
}
function holdTouch(event: TouchEvent) {
  if (pointerId !== null) event.preventDefault();
}
onMounted(() => {
  observer = new ResizeObserver((entries) => {
    const value = entries[0]!.contentRect.width < 600;
    // Switch layouts on the next frame: resizing the board inside this callback
    // makes Safari report a ResizeObserver loop.
    requestAnimationFrame(() => {
      if (compact.value !== value) {
        cancel();
        compact.value = value;
      }
    });
  });
  if (board.value) observer.observe(board.value);
  // iOS Safari scrolls the page under a finger drag despite touch-action: none;
  // cancelling the touch while something is held keeps the drag on the table.
  board.value?.addEventListener("touchmove", holdTouch, { passive: false });
  window.addEventListener("blur", pause);
  document.addEventListener("visibilitychange", pause);
  raf = requestAnimationFrame(tick);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  observer?.disconnect();
  board.value?.removeEventListener("touchmove", holdTouch);
  window.removeEventListener("blur", pause);
  document.removeEventListener("visibilitychange", pause);
  audio.setPour(0);
  audio.setBoil(0);
  flush();
});
defineExpose({ hint, cancel });
</script>
<template>
  <div class="tea-board-wrap">
    <svg
      ref="board"
      class="tea-board"
      :class="{ compact }"
      :data-water="draft.water"
      :data-leaves="draft.leaves"
      :data-jar-open="draft.jarOpen"
      :data-blend-jar-open="draft.blendJarOpen"
      :data-blend-leaves="draft.blendLeaves"
      :data-blend-tea="draft.blendTeaId || ''"
      :data-garnish="draft.garnish"
      :data-layout="boiling ? 'boiling' : 'classic'"
      :data-kettle-temp="Math.round(draft.kettleTemp)"
      :data-fire="draft.fire"
      :data-window="steepZone.join(',')"
      :data-ingredients="draft.ingredients.map((unit) => `${unit.id}@${unit.where}`).join(' ')"
      :data-seconds="draft.seconds"
      :data-steep-window="inWindow"
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
        <radialGradient id="aroma-glow">
          <stop stop-color="#ffe2a8" stop-opacity=".95" />
          <stop offset=".45" stop-color="#e6a45a" stop-opacity=".55" />
          <stop offset="1" stop-color="#e6a45a" stop-opacity="0" />
        </radialGradient>
        <g id="aroma-osmanthus">
          <circle cy="-3.2" r="2.8" fill="#eab34f" />
          <circle cx="3.2" r="2.8" fill="#eab34f" />
          <circle cy="3.2" r="2.8" fill="#e29d3c" />
          <circle cx="-3.2" r="2.8" fill="#eab34f" />
          <circle r="1.5" fill="#fff0c2" />
        </g>
        <g id="aroma-puer">
          <path d="M-7 4C-7-3 1-6 3-1S-1 6 4 5 9-3 6-7" fill="none" stroke="#c48a66" stroke-width="1.8" stroke-linecap="round" />
        </g>
        <g id="aroma-mint">
          <path d="M0-7Q6-1 0 7Q-6-1 0-7Z" fill="#8fc4a0" />
          <path d="M0-5V6" stroke="#dff2e2" stroke-width=".8" />
        </g>
        <g id="aroma-jasmine">
          <ellipse cy="-3.4" rx="1.7" ry="3.1" fill="#f6f1dc" />
          <ellipse cy="-3.4" rx="1.7" ry="3.1" fill="#f6f1dc" transform="rotate(72)" />
          <ellipse cy="-3.4" rx="1.7" ry="3.1" fill="#f6f1dc" transform="rotate(144)" />
          <ellipse cy="-3.4" rx="1.7" ry="3.1" fill="#f6f1dc" transform="rotate(216)" />
          <ellipse cy="-3.4" rx="1.7" ry="3.1" fill="#f6f1dc" transform="rotate(288)" />
          <circle r="1.2" fill="#e5d77f" />
        </g>
        <g id="aroma-black">
          <circle r="6" fill="url(#aroma-glow)" />
        </g>
        <g id="aroma-chamomile">
          <circle r="5.4" fill="#f8f3e3" />
          <circle r="2.6" fill="#e9bf45" />
        </g>
        <g id="aroma-lavender">
          <ellipse cy="-4" rx="1.6" ry="2.4" fill="#b8a2dc" />
          <ellipse cx="-1.4" cy=".3" rx="1.6" ry="2.4" fill="#a48bcf" />
          <ellipse cx="1.4" cy=".3" rx="1.6" ry="2.4" fill="#a48bcf" />
          <path d="M0 2V8" stroke="#8c9f78" stroke-width=".9" />
        </g>
        <g id="aroma-hojicha">
          <circle r="5" fill="url(#aroma-glow)" />
          <path d="M0-3L2 0 0 3-2 0Z" fill="#ffb25c" />
        </g>
        <linearGradient id="stove-clay" x2="0" y2="1">
          <stop stop-color="#7a4a33" />
          <stop offset="1" stop-color="#34201a" />
        </linearGradient>
        <radialGradient id="stove-ember" cy="70%">
          <stop stop-color="#ffd27a" />
          <stop offset=".45" stop-color="#e2682c" />
          <stop offset="1" stop-color="#3a140c" />
        </radialGradient>
        <linearGradient id="stove-flame" x2="0" y2="1">
          <stop stop-color="#fff0b8" stop-opacity=".2" />
          <stop offset=".45" stop-color="#ffb347" />
          <stop offset="1" stop-color="#e2562a" />
        </linearGradient>
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
          :aria-disabled="!canChooseJar"
          :data-tea="id"
          class="tea-draggable shelf-jar"
          :opacity="heldJar === id ? 0.3 : !canChooseJar ? 0.82 : 1"
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
      <ellipse
        v-if="draft.step !== 'select' && draft.water === 0"
        :cx="layout.blendJar.x"
        :cy="layout.blendJar.y + 42"
        rx="66"
        ry="24"
        fill="#152126"
        stroke="#bea171"
        stroke-dasharray="3 5"
      />
      <text
        v-if="draft.step !== 'select' && !draft.blendTeaId && draft.water === 0"
        :x="layout.blendJar.x"
        :y="layout.blendJar.y + 88"
        text-anchor="middle"
        class="table-label"
      >
        第二種茶可放這裡
      </text>
      <g
        v-if="draft.step !== 'select'"
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
      <g
        v-if="draft.blendTeaId"
        :transform="`translate(${layout.blendJar.x} ${layout.blendJar.y})`"
        filter="url(#object-shadow)"
      >
        <TeaObject kind="jar" :color="teas[draft.blendTeaId].color" :label="teas[draft.blendTeaId].name" open />
        <g
          v-if="!draft.blendJarOpen"
          :opacity="held === 'blendJarLid' ? 0 : 1"
          transform="translate(0 -43)"
          role="button"
          tabindex="0"
          aria-label="第二罐茶罐蓋"
          class="tea-draggable"
          @pointerdown="down($event, 'blendJarLid')"
          @keydown="key($event, 'blendJarLid')"
        >
          <rect x="-45" y="-22" width="90" height="44" fill="transparent" />
          <TeaObject kind="jarLid" />
        </g>
      </g>
      <g
        v-if="draft.blendJarOpen"
        :transform="`translate(${layout.blendJar.x - 15} ${layout.blendJar.y + 96})`"
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
        pointer-events="none"
      >
        <circle r="43" />
        <text y="-55" text-anchor="middle">
          {{ phase < 3 ? "水壺移到這裡" : "茶壺移到這裡" }}
        </text>
      </g>
      <g
        v-if="boiling"
        :transform="`translate(${layout.kettle.x} ${layout.kettle.y})`"
        role="button"
        tabindex="0"
        :aria-label="`風爐：${fireNames[draft.fire]}，壺中水溫 ${Math.round(draft.kettleTemp)} 度（按一下調整火力）`"
        :data-fire-level="draft.fire"
        class="tea-draggable tea-stove"
        :class="`fire-${draft.fire}`"
        @click="cycleFire"
        @keydown.enter.stop.prevent="cycleFire"
        @keydown.space.stop.prevent="cycleFire"
      >
        <rect x="-78" y="40" width="142" height="66" fill="transparent" />
        <g class="stove-flames" aria-hidden="true">
          <path d="M-60 50Q-66 32-56 18Q-54 34-48 38Q-50 26-42 16Q-38 36-40 50Z" fill="url(#stove-flame)" />
          <path d="M34 50Q30 30 42 16Q42 32 48 36Q48 24 56 18Q60 36 52 50Z" fill="url(#stove-flame)" />
        </g>
        <path d="M-72 48H58L48 100H-62Z" fill="url(#stove-clay)" stroke="#a0704c" stroke-width="1.5" />
        <ellipse cx="-7" cy="48" rx="66" ry="11" fill="#2a1b16" stroke="#b88a5a" stroke-width="2" />
        <path d="M-27 96V82Q-7 66 13 82V96Z" fill="#1d120f" stroke="#8a5a3a" />
        <path class="stove-ember" d="M-25 96V83Q-7 69 11 83V96Z" fill="url(#stove-ember)" />
        <path d="M-66 62H52M-64 74H50" stroke="#c3936a" stroke-opacity=".25" />
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
          :loaded="totalLeaves > 0"
          :tea-type="dominantTeaId"
          :color="selected.color"
        />
        <g v-if="potIngredients.length" transform="translate(40 -82)" pointer-events="none" aria-hidden="true" class="ingredient-markers">
          <g v-for="(item, i) in potIngredients" :key="`${item.id}-${item.count}`" :transform="`translate(${i * 30} 0)`">
            <g class="ingredient-drop">
              <image :href="`/images/tea-ingredients/${item.id}.webp`" x="-14" y="-14" width="28" height="28" />
              <text v-if="item.count > 1" x="9" y="16" class="ingredient-count">×{{ item.count }}</text>
            </g>
          </g>
        </g>
        <g v-else-if="draft.garnish !== 'none'" transform="translate(55 -83)" pointer-events="none" aria-hidden="true" class="garnish-marker">
          <template v-if="draft.garnish === 'apple'">
            <circle r="16" fill="#b7783b" stroke="#e7bb78" stroke-width="2" />
            <circle r="9" fill="#d8a563" stroke="#f3d6a0" stroke-width="1" />
            <circle r="2" fill="#8a4c27" />
          </template>
          <template v-else-if="draft.garnish === 'lemon'">
            <circle r="16" fill="#e7cc67" stroke="#f3dfa1" stroke-width="2" />
            <circle r="11" fill="#fff0a8" stroke="#d8b84e" stroke-width="1" />
            <path d="M0 -11V11M-11 0H11M-8 -8L8 8M8 -8L-8 8" stroke="#e1c45c" stroke-width="1" />
          </template>
          <template v-else-if="draft.garnish === 'honey'">
            <path d="M-11 -10H11L8 11Q0 15 -8 11Z" fill="#b17b35" stroke="#eac280" stroke-width="2" />
            <path d="M-7 -5H7" stroke="#f8d68d" stroke-width="2" stroke-linecap="round" />
          </template>
          <template v-else>
            <rect x="-13" y="-13" width="26" height="26" rx="4" transform="rotate(-12)" fill="#a46b3a" stroke="#edc47f" stroke-width="2" />
            <path d="M-7 -4L5 -8M-2 6L9 1" stroke="#edc47f" stroke-width="2" stroke-linecap="round" />
          </template>
          <text y="-24" text-anchor="middle" class="table-label">{{ garnishes[draft.garnish].name }}</text>
        </g>
        <g v-if="draft.blackTea > 0" transform="translate(-46 -86)" pointer-events="none" aria-hidden="true">
          <path d="M-13 -5Q0 -13 13 -5L9 12Q0 17 -9 12Z" fill="#a96137" stroke="#edc693" stroke-width="2" />
          <text y="-22" text-anchor="middle" class="table-label">淡紅茶 {{ draft.blackTea }} 毫升</text>
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
        <g v-if="cupIngredients.length" transform="translate(-30 -52)" pointer-events="none" aria-hidden="true" class="ingredient-markers">
          <g v-for="(item, i) in cupIngredients" :key="`${item.id}-${item.count}`" :transform="`translate(${i * 28} 0)`">
            <g class="ingredient-drop">
              <image :href="`/images/tea-ingredients/${item.id}.webp`" x="-14" y="-14" width="28" height="28" />
              <text v-if="item.count > 1" x="9" y="16" class="ingredient-count">×{{ item.count }}</text>
            </g>
          </g>
        </g>
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
        <rect x="-65" y="-45" width="136" height="90" fill="transparent" />
        <TeaObject
          kind="spoon"
          :loaded="draft.spoonLoaded"
          :tea-type="draft.spoonTeaId || draft.teaId"
          :color="draft.spoonLoaded && draft.spoonTeaId ? teas[draft.spoonTeaId].color : selected.color"
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
        <rect x="-50" y="-45" width="100" height="90" fill="transparent" />
        <TeaObject kind="potLid" />
      </g>
      <g
        v-if="totalLeaves > 0 && draft.water > 0"
        :transform="`translate(${layout.hourglass.x} ${layout.hourglass.y - 4})`"
        class="steep-ring"
        :class="{ 'steep-ring-ready': inWindow, 'steep-ring-over': overSteeped }"
        pointer-events="none"
        aria-hidden="true"
      >
        <circle r="50" class="steep-ring-track" />
        <path :d="arc(steepZone[0] / ringTurn, steepZone[1] / ringTurn, 50)" class="steep-ring-band" />
        <path :d="arc(0, draft.seconds / ringTurn, 50)" class="steep-ring-progress" />
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
        <rect x="-50" y="-45" width="100" height="100" fill="transparent" />
        <TeaObject
          kind="hourglass"
          :fill="Math.min(100, (draft.seconds / idealSeconds) * 100)"
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
      <g
        v-if="held === 'blendJarLid'"
        :transform="transform('blendJarLid')"
        pointer-events="none"
      >
        <TeaObject kind="jarLid" />
      </g>
      <g
        v-if="boiling"
        :transform="`translate(${layout.kettle.x} ${layout.kettle.y})`"
        pointer-events="none"
        aria-hidden="true"
        class="kettle-state"
        :class="`stage-${stage}`"
      >
        <g v-if="bubbleCount && !settings.values.reducedMotion">
          <circle
            v-for="i in bubbleCount"
            :key="i"
            :cx="-18 + ((i * 11) % 36)"
            cy="-48"
            :r="draft.kettleTemp < 85 ? 1.6 : draft.kettleTemp < 94 ? 2.6 : 3.4"
            class="kettle-bubble"
            :style="{ animationDelay: `${(i * 0.37) % 1.4}s` }"
          />
        </g>
        <g v-if="onStove && kettleSteam > 0 && !settings.values.reducedMotion" class="kettle-steam" :style="{ opacity: kettleSteam }">
          <path d="M80-48q-10-16 2-30t0-26" />
          <path d="M92-50q-8-14 4-26t0-24" />
        </g>
        <text x="-7" y="122" text-anchor="middle" class="table-label kettle-label">
          壺中 {{ Math.round(draft.kettleTemp) }}°C · {{ stage }} · {{ fireNames[draft.fire] }}
        </text>
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
          class="pour-ripple"
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
          :stroke-opacity="steamOpacity"
          stroke-width="3"
        />
      </g>
      <g
        v-if="showAroma"
        class="tea-aroma"
        :data-aroma="aromaTeas.join(' ')"
        :transform="`translate(${aromaAnchor.x} ${aromaAnchor.y})`"
        pointer-events="none"
        aria-hidden="true"
      >
        <g
          v-for="(particle, i) in aromaParticles"
          :key="i"
          :transform="`translate(${particle.x} 0) scale(${particle.scale})`"
        >
          <use
            :href="`#aroma-${aromaTeas[i % aromaTeas.length]}`"
            class="aroma-particle"
            :style="{ animationDelay: `${particle.delay}s`, '--drift': `${particle.drift}px` }"
          />
        </g>
      </g>
      <text
        :x="layout.pot.x"
        :y="layout.pot.y + 88"
        text-anchor="middle"
        class="table-label"
      >
        {{ totalLeaves }} 匙 · {{ Math.round(draft.water) }}% 水量
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
</template>
