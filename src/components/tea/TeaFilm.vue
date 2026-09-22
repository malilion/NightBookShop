<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import LiquorTint from "./LiquorTint.vue";
import liquorFrames from "../../data/teaLiquorFrames.json";
import { useSettingsStore } from "../../stores/settingsStore";
const props = withDefaults(
  defineProps<{
    clip: "idle" | "scoop" | "pour" | "steep" | "serve" | "complete";
    progress?: number;
    liquorColor?: string;
    loop?: boolean;
  }>(),
  { loop: undefined, progress: undefined, liquorColor: undefined },
);
const emit = defineEmits<{ ended: [] }>();
const settings = useSettingsStore();
const video = ref<HTMLVideoElement>();
const failed = ref(false);
const paused = ref(false);
const ready = ref(false);
const source = ref("");
const filmFrame = ref(0);
const liquorFailed = ref(false);
const liquorFrame = computed(
  () => liquorFrames.frames[staticMode.value ? 0 : filmFrame.value]!,
);
const atlasWidth = liquorFrames.cellWidth * liquorFrames.columns;
const atlasHeight =
  liquorFrames.cellHeight *
  Math.ceil(liquorFrames.frames.length / liquorFrames.columns);
let frameHandle = 0,
  rafHandle = 0;
function stopTracking() {
  if (frameHandle) video.value?.cancelVideoFrameCallback?.(frameHandle);
  cancelAnimationFrame(rafHandle);
  frameHandle = rafHandle = 0;
}
function syncFrame(mediaTime = video.value?.currentTime || 0) {
  filmFrame.value = Math.min(
    liquorFrames.frames.length - 1,
    Math.max(0, Math.floor(mediaTime * liquorFrames.fps + 0.001)),
  );
}
function trackFrames() {
  stopTracking();
  const player = video.value;
  if (!player || !props.liquorColor || props.clip !== "complete") return;
  if (player.requestVideoFrameCallback) {
    const next: VideoFrameRequestCallback = (_now, metadata) => {
      syncFrame(metadata.mediaTime);
      frameHandle = player.requestVideoFrameCallback(next);
    };
    frameHandle = player.requestVideoFrameCallback(next);
  } else {
    const next = () => {
      syncFrame();
      rafHandle = requestAnimationFrame(next);
    };
    next();
  }
}
let request: AbortController | undefined;
let objectUrl = "";
const staticMode = computed(
  () => settings.values.reducedMotion || failed.value,
);
const looping = computed(
  () => props.loop ?? ["idle", "steep", "complete"].includes(props.clip),
);
const asset = computed(() =>
  ["pour", "complete"].includes(props.clip)
    ? `${props.clip}-remotion-v1`
    : props.clip,
);
const poster = computed(() => `/video/tea/${asset.value}-poster.webp`);
let timeout: ReturnType<typeof setTimeout> | undefined;
function seek() {
  const player = video.value;
  if (
    player &&
    props.progress !== undefined &&
    Number.isFinite(player.duration)
  ) {
    player.pause();
    const target = Math.min(
      player.duration - 0.05,
      Math.max(0, (props.progress / 100) * player.duration),
    );
    if (Math.abs(player.currentTime - target) > 0.025)
      player.currentTime = target;
  }
}
async function start() {
  clearTimeout(timeout);
  ready.value = true;
  seek();
  trackFrames();
  if (props.progress === undefined && !staticMode.value && !paused.value) {
    try {
      await video.value?.play();
    } catch {
      paused.value = true;
    }
  }
}
function fail() {
  clearTimeout(timeout);
  request?.abort();
  failed.value = true;
}
async function toggle() {
  paused.value = !paused.value;
  if (paused.value) video.value?.pause();
  else await start();
}
watch(() => props.progress, seek);
watch(
  [() => asset.value, () => settings.values.reducedMotion],
  async ([clip, reduced]) => {
    stopTracking();
    filmFrame.value = 0;
    request?.abort();
    const controller = new AbortController();
    request = controller;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    source.value = "";
    objectUrl = "";
    failed.value = false;
    paused.value = false;
    ready.value = false;
    clearTimeout(timeout);
    if (reduced) return;
    await nextTick();
    timeout = setTimeout(() => {
      if (!ready.value) fail();
    }, 8000);
    // Small, pre-cached clips are loaded as whole blobs. Blob URLs support seeking
    // without requiring partial HTTP responses from the offline service worker.
    const formats = document.createElement("video").canPlayType("video/webm")
      ? ["webm", "mp4"]
      : ["mp4"];
    for (const extension of formats) {
      try {
        const response = await fetch(`/video/tea/${clip}.${extension}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Film unavailable");
        const blob = await response.blob();
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(blob);
        source.value = objectUrl;
        return;
      } catch {
        if (controller.signal.aborted) return;
      }
    }
    fail();
  },
  { immediate: true },
);
onBeforeUnmount(() => {
  stopTracking();
  clearTimeout(timeout);
  request?.abort();
  if (objectUrl) URL.revokeObjectURL(objectUrl);
});
</script>
<template>
  <div class="tea-film" :data-clip="clip" :data-ready="ready">
    <img v-if="staticMode" :src="poster" alt="暖燈下的茶壺與茶杯" />
    <video
      v-else
      ref="video"
      :key="clip"
      :src="source || undefined"
      :poster="poster"
      :loop="looping"
      muted
      playsinline
      preload="auto"
      aria-label="製茶動畫"
      @loadeddata="start"
      @seeked="syncFrame()"
      @timeupdate="syncFrame()"
      @error="fail"
      @ended="emit('ended')"
    ></video>
    <svg
      v-if="clip === 'complete' && liquorColor && !liquorFailed"
      class="film-liquor-layer"
      viewBox="0 0 1280 720"
      aria-hidden="true"
      :data-frame="staticMode ? 0 : filmFrame"
    >
      <LiquorTint :color="liquorColor" :region="liquorFrame">
        <svg
          :x="liquorFrame.x"
          :y="liquorFrame.y"
          :width="liquorFrame.width"
          :height="liquorFrame.height"
          :viewBox="`${(staticMode ? 0 : filmFrame % liquorFrames.columns) * liquorFrames.cellWidth} ${(staticMode ? 0 : Math.floor(filmFrame / liquorFrames.columns)) * liquorFrames.cellHeight} ${liquorFrame.width} ${liquorFrame.height}`"
          overflow="hidden"
        >
          <image
            href="/video/tea/complete-liquor.webp"
            :width="atlasWidth"
            :height="atlasHeight"
            @error="liquorFailed = true"
          />
        </svg>
      </LiquorTint>
    </svg>
    <div class="film-caption">
      <span>{{
        failed
          ? clip === "complete"
            ? "影片暫時無法播放，仍可繼續故事。"
            : "影片暫時無法播放，仍可繼續製茶。"
          : settings.values.reducedMotion
            ? "靜態製茶畫面"
            : "櫃台上的一盞茶"
      }}</span>
      <button
        v-if="!staticMode && progress === undefined"
        class="quiet-button"
        @click="toggle"
      >
        {{ paused ? "播放動畫" : "暫停動畫" }}
      </button>
    </div>
  </div>
</template>
