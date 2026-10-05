<script setup lang="ts">
import PageHeader from "../components/common/PageHeader.vue";
const version = __APP_VERSION__;
const commit = __APP_COMMIT__;
const buildDate = __BUILD_DATE__;
</script>
<template>
  <main id="main" tabindex="-1" class="library-page about-page">
    <PageHeader title="關於這間書店" subtitle="版本、製作方式與你的資料。" />
    <section class="settings-section">
      <h2>版本</h2>
      <dl class="about-list">
        <div><dt>遊戲版本</dt><dd>{{ version }}</dd></div>
        <div><dt>建置</dt><dd>{{ commit }} · {{ buildDate }}</dd></div>
      </dl>
    </section>
    <section class="settings-section">
      <h2>製作方式</h2>
      <ul class="about-notes">
        <li>劇本、程式與介面為本作原創。</li>
        <li>背景、記憶場景、人物立繪、書籤插畫與茶點材料圖，以 AI 圖像生成工具（OpenAI 圖像模型）製作。</li>
        <li>背景音樂是薩提〈吉諾佩第一號〉，Robin Alciatore 演奏，錄音來自 Musopen，屬公有領域。</li>
        <li>製茶影片與茶具圖為程式渲染的 3D 動畫；雨聲與所有音效以程式合成，沒有使用外部音效庫或圖庫。</li>
        <li>介面使用裝置內建字型。</li>
      </ul>
    </section>
    <section class="settings-section">
      <h2>你的資料</h2>
      <ul class="about-notes">
        <li>存檔、收藏與設定只存在這個瀏覽器的本機儲存空間（IndexedDB），不會上傳。</li>
        <li>遊戲沒有帳號、廣告、分析或追蹤；連網只用來下載遊戲本身的故事、圖片、聲音與影片。</li>
        <li>清除這個網站的瀏覽資料，會一併刪除存檔與收藏，無法復原。</li>
      </ul>
    </section>
    <section class="settings-section">
      <h2>開放原始碼授權</h2>
      <p class="about-notes-text">
        遊戲使用了 Vue、Pinia、Vue Router、Dexie、Howler.js、inkjs、Zod、Phosphor Icons 與 Workbox 等開放原始碼套件。
      </p>
      <p>
        <a class="text-link" href="/THIRD_PARTY_LICENSES.txt" target="_blank" rel="noopener">查看完整授權條款</a>
      </p>
    </section>
  </main>
</template>
