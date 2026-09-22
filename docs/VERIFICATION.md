# 第一章、可拖曳茶席與製茶影片驗證紀錄

2026-09-22，本機 Node 26.7.0，正式 Vite build 與 Playwright Chromium。

## 茶完成動畫增量驗證（目前版本）

- Remotion `TeaComplete` 實際輸出 180 格、1280×720／30 fps／6 秒；H.264 約 1.33 MiB、VP9 約 0.57 MiB，兩者經 ffprobe 格式檢查及 ffmpeg 全片解碼通過。`output/remotion/complete-osmanthus-validation.json` 保留原始報告。
- 已目視檢查第 0、179 格與遊戲內桌機／手機演出截圖。杯碟滑近、漣漪漸弱、蒸氣與鏡頭緩慢推進；畫面不含手部或音效，八種茶共用暖色茶湯鏡頭。
- `video:typecheck`、根目錄 lint、typecheck／build 及 19 項單元測試通過。
- 完整 E2E 單次 10 項全部通過（約 2.8 分鐘）。桌機與 Chromium 手機模擬皆實際播放 720p 完成影片，確認不循環、暫停時間不再增加、離線播放、動畫中重整後可重新奉茶，以及自然播完回到對話和完整章末結局。
- 缺片仍可略過回到故事；減少動態顯示海報與繼續按鈕，Esc 關閉完成演出時不另外打開遊戲選單。結束／略過共用一次性結果回傳。
- `output/tea-completion-desktop.png`、`output/tea-completion-mobile.png` 為演出截圖。PWA 預快取新增兩種影片格式與海報，約 5.94 MiB；遊戲畫面 JS 約 15.60 KB gzip。尚未 iOS Safari 實機驗證。

## 可拖曳茶席增量驗證（先前版本）

- `npm run lint`、`npm run build` 通過；TypeScript、Ink 編譯與 PWA 產物正常。
- `npm test`：4 個檔案、19 項通過。新增兩種壺在 16–75 度的接水範圍、灑水／滿水、壺內存量守恆、八種茶的計分與舊 draft 預設值。原型及 `jinglan-chapter-1` 原編譯故事皆驗證讀檔與完整結局。
- E2E 共 10 個桌機／手機案例：首輪 7 項通過；修正手機壺蓋遮住壺身命中區，及測試切換設定後立即硬導航導致尚未完成偏好寫入的測試競態，再重跑其餘 3 項，全部通過。未將這兩輪記成單次完整綠燈執行。
- 桌機以滑鼠，手機完整流程以 CDP `touchStart/touchMove/touchEnd` 操作：八罐茶的畫面、選罐開蓋、三匙茶葉、傾斜注水、蓋壺等待、提壺倒茶、回到劇情、最佳理解結局、拼信及存讀檔。
- 另驗證鍵盤選另一種茶、移開罐蓋、空匙取回茶葉、失手灑水後 Escape 停止、補水後仍可奉茶、沙漏與選單暫停、重泡清零、減少動態關閉蒸氣、阻擋影片仍可完成茶席、離線重整恢復實際水量。
- 已目視檢查 `output/tea-desktop.png` 與 `output/tea-mobile.png`。手機第二層茶罐名稱留足空間，重新整理按鈕不折字；桌機保留側欄、手機側欄移至下方。
- 目前遊戲畫面 JS 約 15.27 KB gzip，主包約 131.77 KB gzip；PWA 預快取約 3.99 MiB。即時操作為 SVG，沒有將 React、Remotion、Three.js 載入遊戲 runtime。
- 手機測試是 Chromium 裝置模擬，尚未驗證 iOS Safari 實機。玩法與鍵盤說明見 [可拖曳茶席](HANDS_ON_TEA.md)。

## 先前版本結果（分段影片操作）

- `npm run lint`：通過。
- `npm run build`：Ink 編譯、TypeScript 與正式建置通過。
- `npm test`：3 個檔案、13 個測試通過。四種結局定向走完，另跑 128 條確定性抽樣路線；檢查三段記憶、三片必要信紙、後記與章末線索。這不是全部組合的窮舉。
- 舊版故事使用保留的原編譯檔測試，存讀檔核對畫面與變數，不將舊故事位置套到新章。
- `npm run test:e2e`：10 項通過。桌機 1440×900 與手機 390×664（iPhone 13 Chromium 模擬）驗證完整流程、設定、離線與減少動態；缺片測試在兩個專案各以獨立、停用 service worker 的預設尺寸 context 執行。
- 12 個 MP4 / WebM 檔案逐一以 ffprobe 驗證 960×540、24 fps、3–5 秒，再用 ffmpeg 全片解碼，無錯誤。報告 `output/tea-film/validation.json`。

## 瀏覽器覆蓋

1. 新遊戲走完三段記憶與最佳理解結局，真實影片播放；在注水 70% 時斷網、重整、恢復水量與影片時間；拼信途中重整、手動存讀檔、收藏及無水平溢出。
2. 閱讀偏好保存、未開放章節、鍵盤與空收藏。
3. Service worker 快取完成後斷網，重載並繼續對話。
4. 減少動態使用靜態畫面；按住注水／鬆開停止、重整恢復、略過動作後完成製茶。
5. 阻擋影片下載，顯示海報與說明，仍能完成製茶回到故事。

本輪修正了預快取影片無法正常 Range seek 的問題：使用完整小型 Blob 播放，讀檔後水量與影片位置一致。測試助手也修正了在 Vue 尚未顯示對話前誤等候選項的競態。

## 視覺與大小

桌機與手機的標題、對話、茶席、拼信、收藏截圖已產出於 `output/`；茶席兩種版型已目視檢查。影片也檢查過取茶、注水、倒茶的代表影格，合併預覽為 `output/tea-film/tea-sequence.mp4`，24 秒。

初始主要 JS 約 130.6 KB gzip；遊戲畫面約 8 KB gzip；完整預快取約 3.37 MiB。Three.js 僅供離線製片，未進入遊戲 bundle。

## 實際邊界

手機為 Chromium 裝置模擬，尚未實機驗證 iOS Safari／Android。35–45 分鐘目標未經真人閱讀計時。茶影片是共用程序式 3D 場景，沒有手部或聲音，還不是原規格的最終手繪美術。三段記憶以文字選項探索，拼信仍採點選放置。其他五位訪客與林澄終章未實作；未發布到公開網站。

## Remotion 注水樣片增量驗證

- 獨立製片目錄 `video/`，Remotion 4.0.526；`video:typecheck`、根目錄 lint / typecheck / build 通過。
- TeaPour 實際經 Remotion 渲染 180 格，H.264 與 VP9 均為 1280×720／30 fps／6 秒，分別約 339 KiB 與 167 KiB，全片解碼通過。
- 目視檢查第 0、90、179 格及遊戲茶席；第 90 格為製作中段的注水狀態。
- 接入新版素材後重新跑完 10 項 E2E，全部通過。注水離線重載明確驗證 1280×720，與 `duration × 0.7` 的時間誤差小於 0.08 秒。
- 遊戲的 React / Remotion / Three.js 製片依賴未納入 runtime；PWA 預快取約 3.91 MiB。
- 更新的是注水一段，其他五段保持原版。新版遊戲素材：`public/video/tea/pour-remotion-v1.*`；驗證明細：`output/remotion/pour-osmanthus-validation.json`。
