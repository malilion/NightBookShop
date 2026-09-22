# 3D 茶罐與茶具

2026-09-22。將茶席的平面器物換為同一組 Three.js 模型渲染的透明素材，保留現有拖曳、鍵盤、觸控及水量規則。這是 3D 預渲染美術，不是可自由旋轉的即時 3D 茶桌。

## 模型與材質

- 八種茶罐：深綠、赤褐、薄荷青、灰綠、赭紅、米白、紫灰與深棕釉色。木蓋、金屬口沿、罐口內壁、弧面紙標與乾茶葉分別建模。
- 茶壺、壺蓋與杯碟：釉面清漆、微小凹凸、金邊與內壁；杯／壺的空與有茶狀態分開渲染，液色對應茶方。
- 銅水壺：金屬反射、細刷紋、黑色握柄；茶匙有凹入匙面和圓滑柄，空匙與有茶葉分開渲染。
- 40 個 WebP 狀態涵蓋 16 個茶罐開／關、16 個不同茶色的壺／杯、6 個基本器具，以及壺內乾葉與匙內茶葉。主要操作器物全部透明背景，比例和位置由 manifest 提供。

素材由原生程式模型製作，沒有外部照片、AI 生圖或下載的模型。材質細紋使用固定亂數種子；同一模型同時用於 Remotion 影片。

## 重建

```sh
npm run render:tea-props
npm run video:render -- --publish
npm run video:render:complete -- --publish
npm run build
```

需要既有 Chromium、Three.js、sharp、FFmpeg 與 ffprobe。第一個命令在本機 4176 開啟渲染頁，依茶方產生 `public/images/tea-props/*.webp` 與 `src/data/teaPropAssets.json`；每張檢查透明與不透明像素都存在。後兩個命令會更新本機影片，並驗證雙格式、720p／30 fps／6 秒與完整解碼。工作結束會關閉 Chromium 和渲染伺服器。

- `video/src/tea-set.js`：共用模型、材質、影片與 `renderProp` 正交投影。
- `scripts/tea-props/index.html`：單次工作階段重用各器具的渲染器。
- `scripts/render-tea-props.mjs`：批次輸出、透明度檢查、釉色與顯示範圍。
- `src/components/tea/TeaObject.vue`：預渲染圖、接觸陰影與原 SVG 備援。
- `src/services/teaInteraction.ts`：使用 manifest 的壺嘴投影來判定水流，不另外猜測圖中壺嘴位置。

素材與影片加入 PWA 預快取，Three.js 不進入遊戲 runtime。茶湯目前以空／有茶兩種器物狀態表示，精確水量仍由百分比與水流呈現；沙漏仍為動態 SVG。實體 iOS Safari 尚需驗證。
