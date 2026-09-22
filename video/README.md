# 夜行書店 · Remotion 製片室

獨立於 Vue 遊戲的 React / Remotion 製片目錄。已提供 `TeaPour` 注水與 `TeaComplete` 完成兩個 composition，都是 1280×720、30 fps、180 格／6 秒。完成動畫以茶杯移近、漣漪漸收、蒸氣和緩慢推鏡呈現，沒有手部模型或音效。其他四段仍保留原流程素材。

## 啟動與輸出

在專案根目錄執行：

```sh
npm ci
npm ci --prefix video
# 首次使用需有 Chromium 與系統 ffmpeg / ffprobe
npx playwright install chromium
npm run video:studio
npm run video:typecheck
npm run video:render -- --preview
npm run video:render
# 在中間影格與整段影片確認後，輸出遊戲使用的版本檔名
npm run video:render -- --publish
# 茶完成演出
npm run video:render:complete -- --preview
npm run video:render:complete -- --publish
```

Studio 預設 http://localhost:3001 。輸出都位於根目錄 `output/remotion/`。`--preview` 只輸出第 0、90、179 格；正式輸出由 Remotion `renderMedia` 製作 H.264，再以 FFmpeg 轉為 VP9 WebM。海報來自第 0 格。

`--publish` 表示複製到**本機** `public/video/tea/pour-remotion-v1.*` 或 `complete-remotion-v1.*`，不會上傳或部署網站。複製前檢查解析度、幀率、時長、2 MiB 單檔快取上限，並全片解碼。最後再 `npm run build`，讓正式預覽和 PWA 使用新檔。

可用 `npm run video:render -- --tea=puer` 或 `--tea=mint` 試製液色版本；目前只有桂花樣片經視覺檢查並接入遊戲，其他茶的產出不能用 `--publish` 覆寫它。

## 結構

- `src/index.tsx`：註冊 TeaPour 與 TeaComplete composition，集中設定尺寸、幀率與時長。
- `src/PourFilm.tsx`：以 `useCurrentFrame` 驅動畫面，在 layout effect 完成同步 Three.js 繪圖。只有初始建立場景使用 `delayRender`，沒有自主播放的動畫迴圈。
- `src/tea-set.js`：從原茶席衍生的獨立場景，保留器具位置；增加環境反射、釉面、曲線水流分段、水珠、漣漪與蒸氣，所有變化由影格計算。
- `scripts/render-pour.mjs`：bundle、Chromium、Remotion still/video 輸出、轉檔與驗證；使用根目錄既有 Playwright 和 sharp。

## 遊戲整合

Vue 的 TeaFilm 將 `pour` / `complete` 對應到 `pour-remotion-v1` / `complete-remotion-v1`，仍以原有 Blob 影片播放／定位，不載入 React、Remotion 或 Three.js runtime。0–100% 水量對應 0–6 秒，最後留 0.05 秒避免 seek 到片尾。其餘原始影片保留，可回退。完成演出透過 `TeaCompletion.vue` 原生 dialog 播放一次，`ended`、略過按鈕與 Esc 共用去重的結束回傳；動畫中重整會保留已泡好的茶，可重新奉茶。影片失敗與減少動態時均保留繼續入口。

注水版改善了陶器反光、桌面對比、水流與輸出品質；仍是風格化、懸浮茶器的程序式動畫，沒有手部模型、物理流體模擬或音訊。正式美術方向需看樣片後再延伸。

## 上游參考與授權

- [Remotion 基本概念](https://www.remotion.dev/docs/the-fundamentals)
- [renderMedia](https://www.remotion.dev/docs/renderer/render-media)
- [Remotion 授權](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)

Remotion 套件鎖定 4.0.526，實際依賴以本目錄 package-lock.json 為準；它使用自訂授權，個人可免費製作商業影片，公司使用依其適用條件判斷。

## 共用 3D 器物

`tea-set.js` 同時提供遊戲茶具的正交投影素材。新增不同釉色、弧面紙標、陶瓷微凹凸、金屬細紋與乾茶葉；兩個 Remotion composition 已同步更新。修改器物後先跑 `npm run render:tea-props`，再重新渲染兩段影片，避免遊戲和影片材質不同。詳見 [3D 茶具文件](../docs/TEA_PROPS.md)。
