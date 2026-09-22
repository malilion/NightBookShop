<script setup lang="ts">
import { useSettingsStore } from "../stores/settingsStore";
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
      <p v-if="settings.error" role="alert">{{ settings.error }}</p>
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
          <dd>選碎片，再選空格</dd>
        </div>
      </dl>
    </section>
    <p class="settings-footnote">
      第一夜包含八種茶的可拖曳茶席。開啟減少動態效果後，關閉蒸氣等裝飾，仍保留茶具操作與水量回饋。目前尚無音樂。進度與閱讀偏好保存在此瀏覽器。
    </p>
  </main>
</template>
