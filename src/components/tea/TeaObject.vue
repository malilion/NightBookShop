<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { teas } from "../../data/catalog";
import LiquorTint from "./LiquorTint.vue";
import props3d from "../../data/teaPropAssets.json";
const props = withDefaults(
  defineProps<{
    kind: string;
    color?: string;
    label?: string;
    open?: boolean;
    loaded?: boolean;
    teaType?: string;
    fill?: number;
    liquorColor?: string;
    liquorStrength?: number;
  }>(),
  {
    color: "#c8994e",
    label: "",
    open: false,
    loaded: false,
    teaType: undefined,
    fill: 0,
    liquorStrength: 1,
    liquorColor: undefined,
  },
);
const failed = ref(false);
const contact = computed(
  () =>
    (
      ({
        jar: [0, 54, 37, 9],
        kettle: [-7, 55, 48, 11],
        pot: [-9, 50, 59, 12],
        cup: [0, 41, 54, 10],
        spoon: [0, 10, 48, 4],
        jarLid: [0, 9, 34, 4],
        potLid: [0, 14, 36, 6],
      }) as Record<string, number[]>
    )[props.kind],
);
const teaId = computed(
  () =>
    Object.entries(teas).find(([, tea]) => tea.color === props.color)?.[0] ||
    "osmanthus",
);
const liquid = computed(
  () =>
    props.fill > 0 && props.liquorColor && ["pot", "cup"].includes(props.kind),
);
const assetId = computed(() => {
  if (liquid.value) return `${props.kind}-water`;
  if (props.kind === "jar")
    return `jar-${teaId.value}-${props.open ? "open" : "closed"}`;
  if (props.kind === "cup")
    return props.fill > 0 ? `cup-${teaId.value}` : "cup";
  if (props.kind === "pot")
    return props.fill > 0
      ? `pot-${props.teaType || teaId.value}`
      : props.loaded
        ? `pot-${props.teaType || teaId.value}-leaves`
        : "pot";
  if (props.kind === "spoon")
    return props.loaded
      ? `spoon-${props.teaType || teaId.value}-full`
      : "spoon";
  return props.kind;
});
const liquorAsset = computed(
  () => props3d[`${props.kind}-liquor` as keyof typeof props3d],
);
const asset = computed(() => props3d[assetId.value as keyof typeof props3d]);
watch(assetId, () => {
  failed.value = false;
});
</script>
<template>
  <g
    v-if="asset && !failed"
    class="tea-prop-3d"
    :data-prop-asset="assetId"
    pointer-events="none"
  >
    <ellipse
      v-if="contact"
      :cx="contact[0]"
      :cy="contact[1]"
      :rx="contact[2]"
      :ry="contact[3]"
      fill="#050b0e"
      opacity=".45"
      filter="url(#prop-contact-shadow)"
    />
    <image
      :href="asset.file"
      :x="asset.x"
      :y="asset.y"
      :width="asset.width"
      :height="asset.height"
      @error="failed = true"
    />
    <LiquorTint
      v-if="liquid && liquorAsset"
      :color="liquorColor!"
      :opacity="liquorStrength"
    >
      <image
        :href="liquorAsset.file"
        :x="liquorAsset.x"
        :y="liquorAsset.y"
        :width="liquorAsset.width"
        :height="liquorAsset.height"
        @error="failed = true"
      />
    </LiquorTint>
  </g>
  <g v-else-if="kind === 'jar'">
    <ellipse cx="0" cy="54" rx="39" ry="10" fill="#080d14" opacity=".45" />
    <path
      d="M-34-36 Q0-48 34-36 L37 40 Q37 55 0 55 Q-37 55-37 40Z"
      fill="url(#jar-glaze)"
      stroke="#ab9069"
      stroke-width="1.5"
    />
    <path
      d="M-26-26V36"
      stroke="#e6d5ad"
      stroke-opacity=".12"
      stroke-width="7"
    />
    <ellipse
      cy="-36"
      rx="34"
      ry="9"
      fill="#171d1b"
      stroke="#b99a65"
      stroke-width="3"
    />
    <g v-if="open"
      ><ellipse cy="-35" rx="27" ry="6" fill="#343324" /><path
        d="M-23-36q7-5 12-1l-5 2-3-1Z M-7-33l5-6 3 1-1 3Z M5-37q9-3 15 1l-8 2-2-1Z M-15-32l8-2-2 3Z M10-31l4-4 7 1-6 4Z"
        fill="#706342"
    /></g>
    <path
      v-else
      d="M-36-43 Q0-52 36-43V-34Q0-23-36-34Z"
      fill="url(#brass)"
      stroke="#c8ac79"
    />
    <rect x="-24" y="-16" width="48" height="54" rx="2" fill="#eadbb6" />
    <rect
      x="-21"
      y="-13"
      width="42"
      height="48"
      rx="1"
      fill="none"
      :stroke="color"
    />
    <path
      d="M-8-6Q9-19 10-2Q0 7-8-6M0-8V7"
      :stroke="color"
      fill="none"
      stroke-width="2"
    />
    <text
      y="19"
      text-anchor="middle"
      fill="#3b302a"
      font-size="10"
      font-family="serif"
      >{{ label }}</text
    >
    <path d="M-11 26H11" :stroke="color" />
  </g>
  <g v-else-if="kind === 'jarLid'">
    <ellipse
      rx="36"
      ry="12"
      fill="url(#brass)"
      stroke="#d5b57f"
      stroke-width="2"
    />
    <ellipse rx="26" ry="7" fill="none" stroke="#6c5132" /><path
      d="M-6 0H6"
      stroke="#e8c88e"
    />
  </g>
  <g v-else-if="kind === 'spoon'">
    <path
      d="M-44 4Q-63-12-40-18Q-12-19-12-4Q-16 10-44 4Z"
      fill="url(#brass)"
      stroke="#d9b77d"
    />
    <path d="M-16-6L56-2Q64 2 56 7L-18 1" fill="url(#brass)" stroke="#bc9c68" />
    <g v-if="loaded" fill="#554d31">
      <path
        d="M-49-10q8-6 15-1l-4 3-4-2Z M-36-14l7-1-2 7-4 2Z M-29-8q7-7 12-4l-4 4-5-1Z M-42-4l9-4 6 3-8 3Z"
      />
      <path
        d="M-46-10l8 1m4-4 1 5m8-3 5-1"
        stroke="#9a895b"
        stroke-width=".6"
      />
    </g>
  </g>
  <g v-else-if="kind === 'kettle'">
    <path
      d="M-32-34C-58-117 55-116 37-35"
      fill="none"
      stroke="#121e24"
      stroke-width="13"
    />
    <path
      d="M-30-37C-52-105 48-108 35-38"
      fill="none"
      stroke="#7f705b"
      stroke-width="3"
    />
    <path
      d="M38 0Q57 1 62-22L77-33 85-30Q74-8 69 9L44 26Z"
      fill="url(#copper)"
      stroke="#c19867"
      stroke-width="2"
    />
    <path
      d="M-37-38Q-58-6-48 29Q-40 55 0 56Q44 55 50 28Q56-8 37-38Z"
      fill="url(#copper)"
      stroke="#ac7954"
      stroke-width="2"
    />
    <ellipse
      cy="-39"
      rx="36"
      ry="10"
      fill="url(#brass)"
      stroke="#ead2a0"
      stroke-width="2"
    />
    <ellipse cy="-44" rx="12" ry="7" fill="#1c292f" />
    <path
      d="M-29-18Q-40 15-27 33"
      fill="none"
      stroke="#f5c294"
      stroke-opacity=".25"
      stroke-width="7"
      stroke-linecap="round"
    />
  </g>
  <g v-else-if="kind === 'pot'">
    <path
      d="M-44-13C-96-43-91 40-48 30"
      fill="none"
      stroke="url(#brass)"
      stroke-width="11"
    />
    <path
      d="M47-3Q65 8 81-13L89-9Q79 28 48 31"
      fill="url(#teapot)"
      stroke="#a78c60"
      stroke-width="2"
    />
    <path
      d="M-41-32C-78-7-65 49 0 52C65 49 78-7 41-32Z"
      fill="url(#teapot)"
      stroke="#8b917f"
      stroke-width="1.5"
    />
    <ellipse
      cy="-32"
      rx="43"
      ry="15"
      fill="#111e25"
      stroke="#c6a674"
      stroke-width="4"
    />
    <ellipse
      v-if="fill > 0"
      :cy="-24 - fill * 0.08"
      :rx="35 + fill * 0.035"
      :ry="8 + fill * 0.025"
      :fill="liquorColor || color"
      opacity=".88"
    />
    <g v-if="loaded" fill="#625f38">
      <path
        d="M-23-30q9-7 20 1l-5 2-5-1-4 1Z M2-24q6-7 17-4l-4 3-6 1-2 2Z M-4-34l4-3 9 2-6 2Z"
      />
      <path d="M-21-30l15 1m10 4 12-3" stroke="#a39865" stroke-width=".6" />
    </g>
    <path
      d="M-22-10Q-31 9-19 27"
      fill="none"
      stroke="#fff1ce"
      stroke-opacity=".14"
      stroke-width="7"
      stroke-linecap="round"
    />
    <path d="M6 4C-14 11-10 33 9 30C-17 43-28 5 6 4Z" fill="#d7b477" />
    <path d="M19 10l2 5 5 1-5 2-2 5-1-5-5-2 5-1Z" fill="#d7b477" />
  </g>
  <g v-else-if="kind === 'potLid'">
    <path
      d="M-42 6Q-37-23 0-23Q37-23 42 6Q0 23-42 6Z"
      fill="url(#teapot)"
      stroke="#c6a674"
      stroke-width="3"
    />
    <ellipse cy="-22" rx="11" ry="7" fill="url(#brass)" />
  </g>
  <g v-else-if="kind === 'cup'">
    <ellipse
      cy="32"
      rx="58"
      ry="17"
      fill="url(#teapot)"
      stroke="#b99a65"
      stroke-width="2"
    />
    <path
      d="M32-13C64-23 64 25 33 22"
      stroke="url(#brass)"
      fill="none"
      stroke-width="8"
    />
    <path
      d="M-35-17L-24 26Q0 39 24 26L35-17"
      fill="url(#porcelain)"
      stroke="#dac99f"
      stroke-width="2"
    />
    <ellipse
      cy="-17"
      rx="35"
      ry="11"
      fill="#bba984"
      stroke="#f1dfb5"
      stroke-width="3"
    />
    <ellipse
      v-if="fill > 0"
      cy="-16"
      :rx="24 + fill * 0.09"
      :ry="5 + fill * 0.045"
      :fill="liquorColor || color"
    />
  </g>
  <g v-else-if="kind === 'hourglass'">
    <path
      d="M-23-34C-24-6-8-8-4 0C-8 8-24 6-23 34H23C24 6 8 8 4 0C8-8 24-6 23-34Z"
      fill="#b1c5c2"
      fill-opacity=".15"
      stroke="#bcc7bf"
      stroke-width="2"
    />
    <path
      :d="`M-19 ${-29 + fill * 0.2}H19L0 -3Z`"
      fill="#d9b877"
      :opacity="1 - fill / 110"
    />
    <path :d="`M-19 31L0 ${30 - fill * 0.3}L19 31Z`" fill="#d9b877" />
    <path d="M0-2V24" stroke="#d9b877" stroke-dasharray="2 3" />
    <path
      d="M-30-37H30M-30 37H30M-27-34V34M27-34V34"
      stroke="url(#brass)"
      stroke-width="6"
      stroke-linecap="round"
    />
  </g>
</template>
