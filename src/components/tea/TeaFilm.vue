<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from "vue";
import LiquorTint from "./LiquorTint.vue";
import { audio } from "../../audio/audioManager";
import completeLiquor from "../../data/teaLiquorFrames.json";
import { brewFilmAsset, brewFilmShots, loadBrewLiquor, type LiquorFrames, type TeaGarnish } from "../../data/teaFilms";
import { useSettingsStore } from "../../stores/settingsStore";
import type { TeaId } from "../../types/game";
const props = withDefaults(
  defineProps<{
    clip: "idle" | "scoop" | "pour" | "steep" | "serve" | "complete" | "brew";
    progress?: number;
    liquorColor?: string;
    loop?: boolean;
    /** The brew film is one per tea: Lin Cheng's hands brewing that tea. */
    tea?: TeaId;
    /** A garnish in the cup picks that tea's garnish film, when there is one. */
    garnish?: TeaGarnish;
  }>(),
  { loop: undefined, progress: undefined, liquorColor: undefined, tea: "osmanthus", garnish: "none" },
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
const liquor = shallowRef<LiquorFrames | null>(null);
const staticMode = computed(
  () => settings.values.reducedMotion || failed.value,
);
const lastFrame = computed(() => (props.clip === "brew" ? brewFilmShots.at(-1)!.to - 1 : 179));
// Reduced motion shows the served cup, the brew film's last frame.
const shownFrame = computed(() =>
  staticMode.value ? (props.clip === "brew" ? lastFrame.value : 0) : filmFrame.value,
);
const liquorFrame = computed(() => liquor.value?.frames[shownFrame.value] ?? null);
const shot = computed(() =>
  props.clip === "brew"
    ? brewFilmShots.find((s) => shownFrame.value < s.to) ?? brewFilmShots.at(-1)!
    : null,
);
let frameHandle = 0,
  rafHandle = 0;
function stopTracking() {
  if (frameHandle) video.value?.cancelVideoFrameCallback?.(frameHandle);
  cancelAnimationFrame(rafHandle);
  frameHandle = rafHandle = 0;
}
function syncFrame(mediaTime = video.value?.currentTime || 0) {
  filmFrame.value = Math.min(lastFrame.value, Math.max(0, Math.floor(mediaTime * 30 + 0.001)));
}
function trackFrames() {
  stopTracking();
  const player = video.value;
  if (!player || !(props.clip === "brew" || (props.liquorColor && props.clip === "complete"))) return;
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
// The brew films' soundtracks follow the video's clock.
const soundtrack = computed(() => props.clip === "brew");
let request: AbortController | undefined;
let objectUrl = "";
const looping = computed(
  () => props.loop ?? ["idle", "steep", "complete"].includes(props.clip),
);
const asset = computed(() =>
  props.clip === "brew"
    ? brewFilmAsset(props.tea, props.garnish)
    : ["pour", "complete"].includes(props.clip)
      ? `${props.clip}-remotion-v1`
      : props.clip,
);
const poster = computed(() => `/video/tea/${asset.value}-poster.webp`);
const still = computed(() =>
  props.clip === "brew" ? `/video/tea/${asset.value}-still.webp` : poster.value,
);
// Tint masks: the completion clip's is bundled, the brew films' is fetched.
watch(
  [() => props.clip, () => props.liquorColor],
  async ([clip, color]) => {
    liquor.value = null;
    liquorFailed.value = false;
    if (!color) return;
    if (clip === "complete") liquor.value = completeLiquor as LiquorFrames;
    else if (clip === "brew") {
      const frames = await loadBrewLiquor();
      if (props.clip === "brew") liquor.value = frames;
      if (!frames) liquorFailed.value = true;
    }
  },
  { immediate: true },
);
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
  if (soundtrack.value) audio.stopFilm();
}
function playSound() {
  if (soundtrack.value && video.value) audio.playFilm(video.value.currentTime);
}
function pauseSound() {
  if (soundtrack.value) audio.pauseFilm();
}
function seekSound() {
  if (soundtrack.value && video.value) audio.seekFilm(video.value.currentTime);
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
    if (soundtrack.value) {
      if (reduced) audio.stopFilm();
      else audio.loadFilm(`/video/tea/${clip}`);
    }
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
  if (soundtrack.value) audio.stopFilm();
  clearTimeout(timeout);
  request?.abort();
  if (objectUrl) URL.revokeObjectURL(objectUrl);
});
</script>
<template>
  <div
    class="tea-film"
    :data-clip="clip"
    :data-tea="clip === 'brew' ? tea : undefined"
    :data-garnish="clip === 'brew' ? garnish : undefined"
    :data-ready="ready"
  >
    <img
      v-if="staticMode"
      :src="still"
      :alt="clip === 'brew' ? '林澄親手奉上的一杯茶' : '暖燈下的茶壺與茶杯'"
    />
    <video
      v-else
      ref="video"
      :key="asset"
      :src="source || undefined"
      :poster="poster"
      :loop="looping"
      muted
      playsinline
      preload="auto"
      :aria-label="clip === 'brew' ? '林澄親手製茶的影片' : '製茶動畫'"
      @loadeddata="start"
      @seeked="syncFrame(), seekSound()"
      @playing="playSound"
      @pause="pauseSound"
      @waiting="pauseSound"
      @timeupdate="syncFrame()"
      @error="fail"
      @ended="pauseSound(), emit('ended')"
    ></video>
    <svg
      v-if="liquor && liquorColor && !liquorFailed"
      class="film-liquor-layer"
      viewBox="0 0 1280 720"
      aria-hidden="true"
      :data-frame="shownFrame"
    >
      <LiquorTint :color="liquorColor" :region="liquorFrame ?? undefined">
        <svg
          v-if="liquorFrame"
          :x="liquorFrame.x"
          :y="liquorFrame.y"
          :width="liquorFrame.width"
          :height="liquorFrame.height"
          :viewBox="`${liquorFrame.sx} ${liquorFrame.sy} ${liquorFrame.width / liquor.scale} ${liquorFrame.height / liquor.scale}`"
          preserveAspectRatio="none"
          overflow="hidden"
        >
          <image
            :href="liquor.atlas.file"
            :width="liquor.atlas.width"
            :height="liquor.atlas.height"
            @error="liquorFailed = true"
          />
        </svg>
      </LiquorTint>
    </svg>
    <div class="film-caption">
      <ol v-if="shot && !staticMode" class="film-shots" aria-label="製茶影片段落">
        <li
          v-for="item in brewFilmShots"
          :key="item.id"
          :aria-current="item.id === shot.id ? 'step' : undefined"
        >
          {{ item.label }}
        </li>
      </ol>
      <span v-else>{{
        failed
          ? clip === "complete" || clip === "brew"
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
