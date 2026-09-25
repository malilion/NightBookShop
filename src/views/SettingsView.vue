<script setup lang="ts">
import { useSettingsStore } from "../stores/settingsStore";
import type { TextSpeed } from "../stores/settingsStore";
import PageHeader from "../components/common/PageHeader.vue";
const settings = useSettingsStore();
</script>
<template>
  <main id="main" tabindex="-1" class="library-page settings-page">
    <PageHeader title="閱讀的步調" subtitle="找一個舒服的姿勢，故事會等你。" />
    <section class="settings-section">
      <h2>文字與動態</h2>
      <label class="setting-row"
        ><span
          ><strong>放大故事文字</strong
          ><small>讓對話與選項更容易閱讀。</small></span
        ><input
          type="checkbox"
          role="switch"
          :checked="settings.values.largeText"
          @change="
            settings.update(
              'largeText',
              ($event.target as HTMLInputElement).checked,
            )
          " /></label
      ><label class="setting-row"
        ><span
          ><strong>減少動態效果</strong
          ><small>減少淡入與介面過場，保留所有操作。</small></span
        ><input
          type="checkbox"
          role="switch"
          :checked="settings.values.reducedMotion"
          @change="
            settings.update(
              'reducedMotion',
              ($event.target as HTMLInputElement).checked,
            )
          "
      /></label>
      <label class="setting-row"
        ><span
          ><strong>對話文字速度</strong
          ><small
            >閱讀時可按 Enter、空白鍵，或點「顯示全文」立即看完這句。</small
          ></span
        ><select
          :value="settings.values.textSpeed"
          @change="
            settings.update(
              'textSpeed',
              ($event.target as HTMLSelectElement).value as TextSpeed,
            )
          "
        >
          <option value="instant">立即顯示</option>
          <option value="fast">快速</option>
          <option value="normal">標準</option>
          <option value="slow">慢速</option>
        </select></label
      >
      <p v-if="settings.error" role="alert">{{ settings.error }}</p>
    </section>
    <section class="settings-section">
      <h2>書店的聲音</h2>
      <label class="setting-row"
        ><span
          ><strong>全部靜音</strong
          ><small>環境音、音樂與音效會在第一次操作後才播放。</small></span
        ><input
          type="checkbox"
          role="switch"
          :checked="settings.values.muted"
          @change="
            settings.update(
              'muted',
              ($event.target as HTMLInputElement).checked,
            )
          "
      /></label>
      <label class="setting-row volume-row"
        ><span
          ><strong>背景音樂</strong><small>書店裡緩慢重複的旋律。</small></span
        ><span class="volume-control"
          ><input
            type="range"
            min="0"
            max="100"
            step="5"
            :value="settings.values.bgmVolume"
            @change="
              settings.update(
                'bgmVolume',
                Number(($event.target as HTMLInputElement).value),
              )
            "
          /><output>{{ settings.values.bgmVolume }}%</output></span
        ></label
      >
      <label class="setting-row volume-row"
        ><span
          ><strong>環境聲</strong
          ><small>窗邊的雨與書店深處的聲音。</small></span
        ><span class="volume-control"
          ><input
            type="range"
            min="0"
            max="100"
            step="5"
            :value="settings.values.ambienceVolume"
            @change="
              settings.update(
                'ambienceVolume',
                Number(($event.target as HTMLInputElement).value),
              )
            "
          /><output>{{ settings.values.ambienceVolume }}%</output></span
        ></label
      >
      <label class="setting-row volume-row"
        ><span><strong>互動音效</strong><small>紙張、茶杯與門鈴。</small></span
        ><span class="volume-control"
          ><input
            type="range"
            min="0"
            max="100"
            step="5"
            :value="settings.values.sfxVolume"
            @change="
              settings.update(
                'sfxVolume',
                Number(($event.target as HTMLInputElement).value),
              )
            "
          /><output>{{ settings.values.sfxVolume }}%</output></span
        ></label
      >
    </section>
    <section class="settings-section">
      <h2>書店裡的操作</h2>
      <dl class="controls-list">
        <div>
          <dt>繼續閱讀</dt>
          <dd><kbd>Enter</kbd> 或 <kbd>Space</kbd></dd>
        </div>
        <div>
          <dt>選擇回應</dt>
          <dd><kbd>1</kbd> 至 <kbd>4</kbd></dd>
        </div>
        <div>
          <dt>開啟選單</dt>
          <dd><kbd>Esc</kbd></dd>
        </div>
        <div>
          <dt>切換焦點</dt>
          <dd><kbd>Tab</kbd></dd>
        </div>
        <div>
          <dt>注水</dt>
          <dd>拖起水壺、移到壺口，向右拖傾倒；鍵盤可用方向鍵及 Q／E</dd>
        </div>
        <div>
          <dt>拼信</dt>
          <dd>拖曳碎片，或選碎片再選空格；可旋轉與翻面</dd>
        </div>
      </dl>
    </section>
    <p class="settings-footnote">
      第一夜包含八種茶的可拖曳茶席。開啟減少動態效果後，關閉蒸氣等裝飾，仍保留茶具操作與水量回饋。聲音於首次操作後播放；進度與偏好保存在此瀏覽器。
    </p>
  </main>
</template>
