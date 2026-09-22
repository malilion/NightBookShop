<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useSettingsStore } from "../../stores/settingsStore";
const props = withDefaults(
  defineProps<{
    clip: "idle" | "scoop" | "pour" | "steep" | "serve" | "complete";
    progress?: number;
    loop?: boolean;
  }>(),
  { loop: undefined, progress: undefined },
);
const emit = defineEmits<{ ended: [] }>();
const settings = useSettingsStore();
const video = ref<HTMLVideoElement>();
const failed = ref(false);
const paused = ref(false);
const ready = ref(false);
const source = ref("");
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
      @error="fail"
      @ended="emit('ended')"
    ></video>
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
