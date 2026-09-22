# 《夜行書店》製茶動畫系統規格 v1.0

## 1. 系統目標

製茶系統需要呈現「拿取茶葉、注入熱水、茶葉舒展、蒸氣升起、茶色變化、倒入茶杯」的電影感，同時保留玩家操作與故事判定。

本系統採用 **預製短影片＋Vue 互動狀態＋PixiJS 即時特效** 的混合架構。自然且複雜的手部與液體動作用影片呈現；茶種差異、蒸氣、花瓣、水波與記憶光點由程式即時疊加。

## 2. 設計原則

1. 每個操作都要有視覺、聲音和數值回饋。
2. 動畫需要能被玩家操作分段控制，不能只播放一支固定長影片。
3. 茶種共用基礎動作，透過色彩、粒子、聲音和蒸氣圖案建立差異。
4. 製茶結果要影響訪客信任值、理解值、對話及信件線索。
5. 動畫銜接點需要保持茶壺、茶杯、手部和攝影機位置一致。
6. 桌面與手機瀏覽器都必須能操作，避免依賴 Hover。

---

## 3. 製茶遊戲流程

**選擇茶葉 → 取茶 → 注入熱水 → 等待浸泡 → 倒入茶杯 → 訪客反應**

| 階段 | 玩家操作 | 動畫內容 | 遊戲判定 |
|---|---|---|---|
| 待機 | 點擊茶具或訪客 | 茶桌、燭火、輕微蒸氣循環 | 顯示訪客當前情緒線索 |
| 選茶 | 選擇一種茶葉 | 茶罐滑入、標籤展開、香氣粒子 | 判斷茶種是否符合訪客需要 |
| 取茶 | 點擊或拖曳茶匙 | 手取茶葉並放入茶壺 | 判斷茶葉份量 |
| 注水 | 按住按鈕或拖曳茶壺 | 熱水注入，蒸氣與水波出現 | 判斷水量與水溫 |
| 浸泡 | 控制沙漏／選擇等待時間 | 茶葉舒展、茶湯漸變、記憶光點出現 | 判斷浸泡時間 |
| 倒茶 | 點擊完成或拖動茶壺 | 茶湯倒入杯中，瓷器與水聲同步 | 綜合判定茶的品質 |
| 回應 | 選擇遞茶方式或一句話 | 訪客接過茶杯，表情與姿勢改變 | 改變信任值、理解值與對話分支 |

---

## 4. 動畫影片拆分

不要製作一支完整的 20～30 秒影片。建議拆成下列獨立片段：

| Asset ID | 名稱 | 建議長度 | 循環 | 畫面內容 |
|---|---|---:|---|---|
| `tea_idle` | 茶桌待機 | 4～6 秒 | 是 | 燭火搖曳、茶具微光、少量蒸氣 |
| `tea_select` | 打開茶罐 | 2～3 秒 | 否 | 手將選定茶罐移到桌面並打開 |
| `tea_scoop` | 取茶入壺 | 2～4 秒 | 否 | 茶匙取茶葉並放入茶壺 |
| `tea_pour_water` | 注入熱水 | 3～5 秒 | 否／可暫停 | 水流、蒸氣、茶壺內水波 |
| `tea_steep` | 茶葉浸泡 | 4～8 秒 | 是 | 茶葉舒展，茶色由淡轉深 |
| `tea_serve` | 倒入茶杯 | 3～4 秒 | 否 | 茶湯倒入杯中，蒸氣向上升起 |
| `tea_complete` | 完成待機 | 4～6 秒 | 是 | 成品茶杯、柔和蒸氣、記憶光點 |
| `tea_failed` | 失誤反應 | 2～3 秒 | 否 | 水溢出、茶色過深或蒸氣消散 |

### 銜接規範

- 所有片段使用相同攝影機、焦距、桌面位置及光源。
- 每段第一幀要接近前一段最後一幀。
- 非循環影片結束後，停留在最後一幀，再切換下一片段。
- 片段切換採用 120～250ms 交叉淡化，降低跳幀感。
- 手部不可在切換瞬間改變角度、袖口或角色造型。
- 茶壺與茶杯需設定固定座標，避免 AI 影片生成造成物件漂移。

---

## 5. 畫面分層

```text
Layer 5：操作 UI、提示、數值與字幕
Layer 4：蒸氣、花瓣、茶香、光點與記憶圖案
Layer 3：手部、茶壺、注水及倒茶短影片
Layer 2：訪客立繪、表情及局部動作
Layer 1：書店茶桌與爐火背景
```

### 各層技術

| 分層 | 技術 | 用途 |
|---|---|---|
| 背景 | AVIF／WebP | 靜態茶桌、爐火與書店場景 |
| 人物 | PNG／WebP／Live2D 可選 | 訪客表情、呼吸和接茶反應 |
| 主動畫 | MP4 + WebM | 手部、液體及茶具的自然動作 |
| 即時特效 | PixiJS | 蒸氣、花瓣、水波、光點與回憶輪廓 |
| UI 動畫 | GSAP | 卡片、沙漏、數值、淡入淡出及鏡頭推進 |
| 小型圖示 | dotLottie 可選 | 水溫、計時、成功提示及按鈕動畫 |

---

## 6. 茶種視覺差異

| 茶 | 茶湯顏色 | 粒子與蒸氣 | 音效特徵 | 故事情緒 |
|---|---|---|---|---|
| 桂花烏龍 | 淡金 → 琥珀 | 桂花瓣、金色微光 | 清脆瓷器聲、柔和風鈴 | 懷念、釋懷 |
| 洋甘菊蜂蜜 | 淡黃 → 蜜金 | 白黃小花、柔軟蒸氣 | 低沉火爐聲、緩慢呼吸 | 安定、休息 |
| 薄荷檸檬紅茶 | 紅褐帶淡綠反光 | 薄荷葉、清涼水氣 | 輕微玻璃聲、清爽氣泡 | 清醒、整理思緒 |
| 伯爵薰衣草 | 琥珀帶紫色倒影 | 薰衣草花瓣、紫色光塵 | 柔和弦樂泛音 | 平衡、重新聆聽自己 |
| 焙茶蘋果 | 深金棕色 | 蘋果香氣、爐火火星 | 木柴聲、麵包出爐聲 | 家、愧疚與延續 |
| 海鹽焦糖焙茶 | 深棕配金色杯緣 | 海霧、微型燈塔光束 | 遠方海浪與燈塔鐘 | 記憶、守候 |

---

## 7. 技術架構

### 建議技術

```text
Vue 3 + TypeScript
Pinia
Ink + inkjs
GSAP
PixiJS
Howler.js
Dexie / IndexedDB
Vite
```

### 模組劃分

```text
src/
├─ components/tea/
│  ├─ TeaBrewingScene.vue
│  ├─ TeaVideoPlayer.vue
│  ├─ TeaSelector.vue
│  ├─ TeaAmountControl.vue
│  ├─ WaterPourControl.vue
│  ├─ SteepTimer.vue
│  ├─ TeaResult.vue
│  └─ VisitorReaction.vue
├─ canvas/
│  ├─ SteamParticles.ts
│  ├─ TeaAuraParticles.ts
│  └─ MemoryShapeEffect.ts
├─ stores/
│  └─ teaBrewingStore.ts
├─ services/
│  ├─ teaScoringService.ts
│  ├─ teaAssetLoader.ts
│  └─ teaAudioService.ts
├─ data/
│  └─ teaRecipes.ts
└─ assets/tea/
   ├─ video/
   ├─ audio/
   ├─ particles/
   └─ ui/
```

---

## 8. 狀態機

```ts
export type BrewingStep =
  | 'idle'
  | 'select-tea'
  | 'add-leaves'
  | 'pour-water'
  | 'steeping'
  | 'serve'
  | 'visitor-reaction'
  | 'completed'

export interface TeaBrewingState {
  step: BrewingStep
  teaId: string | null
  leafAmount: number
  waterTemperature: number
  waterAmount: number
  steepSeconds: number
  qualityScore: number
  emotionalMatch: number
}
```

### 基本狀態轉換

```text
idle
  → select-tea
  → add-leaves
  → pour-water
  → steeping
  → serve
  → visitor-reaction
  → completed
```

每次轉換必須由玩家操作或影片 `ended` 事件觸發。若玩家返回上一階段，只能在注水前更換茶葉；注水後的決定要保留，避免所有錯誤都能無成本復原。

---

## 9. 影片播放元件

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  src: string
  loop?: boolean
}>()

const emit = defineEmits<{
  ended: []
  ready: []
}>()

const video = ref<HTMLVideoElement>()

watch(
  () => props.src,
  async () => {
    video.value?.load()
    await video.value?.play()
  }
)
</script>

<template>
  <video
    ref="video"
    class="tea-video"
    :loop="loop"
    muted
    playsinline
    preload="auto"
    @canplaythrough="emit('ready')"
    @ended="emit('ended')"
  />
</template>
```

實際播放 BGM 與音效時，影片可以維持 `muted`，聲音統一交由 Howler.js 控制，較容易同步音量、淡出與使用者設定。

---

## 10. 注水互動等級

### Level 1：點擊播放

- 玩家點擊「注水」。
- 播放完整注水影片。
- 依選擇的水溫與茶種計分。
- 適合第一版 MVP。

### Level 2：按住注水

- 按住滑鼠或螢幕時影片播放。
- 放開時影片暫停。
- 播放進度換算成水量。
- 水量過少或過多會影響品質。

```ts
function startPouring() {
  video.value?.play()
}

function stopPouring() {
  video.value?.pause()
}

function calculateWaterAmount() {
  const progress = video.value!.currentTime / video.value!.duration
  return Math.round(progress * 100)
}
```

### Level 3：自由拖曳茶壺

- 玩家拖曳茶壺並調整角度。
- 茶壺角度決定水流大小。
- 水流使用 PixiJS 或 Spine 製作。
- 手部需要骨架動畫或序列幀，固定影片不適合。
- 適合正式版後期，不列入第一版範圍。

---

## 11. 計分與故事影響

```ts
qualityScore =
  teaMatchScore * 0.4 +
  leafAmountScore * 0.15 +
  waterTemperatureScore * 0.15 +
  waterAmountScore * 0.1 +
  steepTimeScore * 0.2
```

| 分數 | 製茶結果 | 故事影響 |
|---:|---|---|
| 90～100 | 共鳴之茶 | 解鎖訪客隱藏記憶、特殊信件碎片與金色書籤 |
| 70～89 | 合適 | 提升信任值，正常開啟後續對話 |
| 50～69 | 普通 | 訪客接受，但需要額外傾聽才能取得完整線索 |
| 0～49 | 不合適 | 不會直接失敗；訪客的反應會暴露另一項情緒線索 |

茶泡錯不應造成 Game Over。失誤也是敘事的一部分，玩家可能從「為什麼訪客不喜歡這杯茶」理解對方真正的狀態。

---

## 12. 素材製作流程

### AI 圖生影片路線

1. 建立固定的茶桌、茶具、主角服裝與鏡位設定圖。
2. 產生每段動畫的首幀與尾幀。
3. 分別生成取茶、注水、浸泡、倒茶影片。
4. 檢查手指、壺嘴、水流、茶杯及物件位置。
5. 使用剪輯工具統一亮度、速度、首尾影格與色調。
6. 對不同茶種製作茶湯色彩版本。
7. 輸出 WebM 與 MP4。

### 傳統動畫路線

- Blender：適合茶具、液體、鏡頭及光影一致性。
- After Effects：適合蒸氣、茶色變化、花瓣與光點合成。
- Spine／Rive：適合可互動的手部、茶壺及角色局部動畫。
- PixiJS：適合瀏覽器內即時粒子、濾鏡、水波與記憶效果。

### 影片輸出建議

```text
解析度：1920×1080；手機可另輸出 1280×720
影格率：24 或 30 fps
格式：WebM + MP4
MP4 編碼：H.264
WebM 編碼：VP9
單段目標大小：1～4 MB
聲音：影片不內嵌聲音，統一由遊戲播放
```

---

## 13. 預載與效能

- 進入訪客章節時只載入待機、選茶和取茶片段。
- 玩家選定茶葉後，再預載注水、浸泡和完成片段。
- 使用 `poster` 圖避免影片載入前黑畫面。
- 同時間只保留目前與下一段影片在記憶體中。
- 手機版降低粒子數量、影片解析度和模糊濾鏡。
- 若影片無法播放，回退到關鍵幀圖片＋GSAP 位移版本。
- 本機儲存玩家的「減少動態效果」選項。

---

## 14. 聲音設計

| 動作 | 聲音 |
|---|---|
| 打開茶罐 | 木蓋或金屬蓋的短促聲 |
| 茶匙取茶 | 茶葉摩擦、瓷器輕碰 |
| 注水 | 水流由細變強、壺內回音 |
| 浸泡 | 火爐、雨聲、呼吸與極輕環境音 |
| 倒茶 | 水流、杯緣與茶壺接觸聲 |
| 共鳴成功 | 書店八音盒旋律中的四個音 |
| 選錯茶 | 不使用警告音，改用蒸氣減弱或環境聲變冷 |

聲音需要在玩家第一次點擊或觸控後啟用，以符合瀏覽器自動播放限制。

---

## 15. MVP 範圍

第一版先完成老奶奶「桂花烏龍」章節：

- 1 個固定茶桌鏡位。
- 3 種茶葉可選。
- 取茶、注水、浸泡、倒茶共 4 段主影片。
- 1 段待機循環與 1 段完成循環。
- 點擊式取茶。
- 按住式注水。
- 三段浸泡時間選擇。
- 桂花、洋甘菊、薄荷三組粒子特效。
- 3 種訪客反應。
- 茶種、份量、水量和時間計分。
- 結果寫入 Ink 變數，影響下一段對話。

### Ink 變數範例

```ink
VAR tea_type = ""
VAR tea_quality = 0
VAR emotional_match = 0
VAR visitor_trust = 0

=== tea_result ===
{ tea_quality >= 90 && emotional_match >= 80:
    ~ visitor_trust += 2
    她捧著茶杯，久久沒有開口。桂花香裡，書架深處傳來紙張翻動的聲音。
- tea_quality >= 70:
    ~ visitor_trust += 1
    她喝了一小口，原本緊握信封的手稍微鬆開了。
- else:
    她沒有責怪你，只是把茶杯放回桌上。「這個味道，讓我想起另一個人。」
}
```

---

## 16. 驗收標準

- 玩家能在桌機以滑鼠、手機以觸控完成全流程。
- 所有影片銜接時不出現明顯黑畫面或物件跳位。
- 影片載入失敗時仍可用靜態備援完成遊戲。
- 玩家離開頁面再回來時，製茶階段與選擇能正確恢復。
- 茶種、份量、水量及浸泡時間會產生可驗證的不同結果。
- 製茶結果能正確寫入 Ink，並改變訪客對話。
- 手機版首輪所需動畫資源需經壓縮並分段載入。
- 支援靜音、音量調整、字幕及減少動態效果。
- 泡錯茶不會卡死流程，也不會直接造成 Game Over。

---

## 17. 後續擴充

1. 自由拖曳茶壺與即時水流。
2. 茶葉圖鑑與配方研究。
3. 根據訪客表情推測茶種的觀察玩法。
4. 隱藏茶方與特殊書籤。
5. 不同季節、天氣與夜晚限定茶葉。
6. 玩家自由調配兩種茶材。
7. 製茶回放與故事收藏動畫。
8. 將蒸氣短暫組成訪客記憶中的人物或地點。

## 18. 最終技術決策

第一版採用：

> **Vue 3 + TypeScript + Pinia + Ink/inkjs + GSAP + PixiJS + Howler.js**

動畫採用：

> **六段短影片控制主要動作，PixiJS 疊加茶種差異與魔法效果，Vue 負責互動和故事判定。**

這個方案能保留概念圖的電影感，也能直接部署到 Web 並整合《夜行書店》的對話、拼信、書籤與存檔系統。
