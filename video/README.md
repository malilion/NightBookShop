# 夜行書店 · Remotion 製片室

獨立於 Vue 遊戲的 React / Remotion 製片目錄。遊戲現在播放 `TeaBrew`：八種茶各一支、1280×720、30 fps、300 格／10 秒的製茶影片，由林澄的雙手演出取茶、注水、倒茶與奉茶。另保留 `TeaPour` 注水與 `TeaComplete` 單杯完成兩個 composition（180 格／6 秒，沒有手部）作回退；其他四段仍是原流程素材。三者都沒有音軌。

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
# 各茶種製茶影片：先看每段中間格，再輸出八支並更新遊戲素材
npm run video:render:brew -- --tea=jasmine --preview
npm run video:render:brew -- --tea=all --publish
npm run video:render:brew -- --garnish=all --publish
```

Studio 預設 http://localhost:3001 。輸出都位於根目錄 `output/remotion/`。`--preview` 只輸出第 0、90、179 格；正式輸出由 Remotion `renderMedia` 製作 H.264，再以 FFmpeg 轉為 VP9 WebM。海報來自第 0 格。

`--publish` 表示複製到**本機** `public/video/tea/pour-remotion-v1.*` 或 `complete-remotion-v1.*`，不會上傳或部署網站。複製前檢查解析度、幀率、時長、2 MiB 單檔快取上限，並全片解碼。最後再 `npm run build`，讓正式預覽和 PWA 使用新檔。

可用 `npm run video:render -- --tea=puer` 或 `--tea=mint` 試製液色版本；目前只有桂花樣片經視覺檢查並接入遊戲，其他茶的產出不能用 `--publish` 覆寫它。

## 各茶種製茶影片（TeaBrew）

| 段落 | 格 | 演出 |
| --- | --- | --- |
| 取茶 | 0–74 | 左手扶住該茶的茶罐，右手以筆式握法持茶匙舀茶；傾倒時繞匙柄轉動，茶葉落進壺中 |
| 注水 | 75–140 | 俯看壺口，銅壺水流注入；乾茶翻轉、舒展成濕葉或浮起的花，湯色由清水轉為該茶的顏色 |
| 倒茶 | 141–215 | 右手手指穿過壺把、拇指壓在把上提壺傾倒，左手食指按住壺蓋鈕；鏡頭後拉以容納壺與雙手 |
| 奉茶 | 216–299 | 雙手指尖扶著杯碟後緣，把茶推到訪客面前，再退到杯碟兩側的桌面上歇著；該茶的茶香粒子升起 |

- `src/tea-varieties.js`：八種茶的釉色、標籤、乾茶葉形與配色、濕葉或花、側碟、茶香與補光；純資料，遊戲測試會核對茶名與湯色。
- `src/tea-forms.js`：捲曲球狀烏龍、茉莉龍珠、普洱茶餅碎片、紅茶條索、乾薄荷、洋甘菊花頭、焙茶葉與茶梗、薰衣草花苞、桂花，以及桂花枝、薄荷枝、蜂蜜棒等側碟材料。固定種子；遊戲的茶具素材也共用這些形態。
- `src/hands.js`：林澄的雙手。手掌、掌骨、十五節指骨、拇指魚際、指節與指腹組成有號距離場，每格在手的座標系內以窄頻 surface nets 重建並投影回表面，手移動時表面不會閃爍。指甲另建曲面；深藍大衣袖、翻邊與米白襯衫袖口沿前臂生成。皮膚以次表面散射近似（光線越過明暗界線，紅色最遠）與手部座標系的細微凹凸著色。左手是右手的鏡像。
- `src/brew-film.js`：四段鏡頭與動作。茶具複製自 `tea-set.js` 並只保留器身；每格只由 `(t, tea, garnish)` 決定，可亂序渲染。有配料時，注水段讓蘋果乾、檸檬片或海鹽焦糖落進壺中（蜂蜜改由蜂蜜棒垂下細流），倒茶與奉茶段在杯碟左前方放另一份，高度低於杯口。
- 配料影片：`src/tea-varieties.js` 的 `brewFilmGarnishes` 列出故事提供的四種組合（焙茶＋蘋果乾、焙茶＋海鹽焦糖、薄荷＋檸檬、洋甘菊＋蜂蜜），`src/tea-forms.js` 的 `garnish()` 建出蘋果乾圈、檸檬片、海鹽焦糖與蜂蜜棒；切片的切面以畫布繪製。遊戲的 `src/data/teaFilms.ts` 保留同一份清單，由單元測試核對。

倒茶與奉茶兩段在八種茶完全相同，所以共用一張湯色遮罩：`scripts/render-tea-liquor.mjs --clip=brew` 逐格輸出半解析度遮罩並裝箱成 `public/video/tea/brew-liquor-v1.webp` 與 `.json`，抽樣比對八種茶與四支配料影片的遮罩像素完全一致，不一致即中止。Remotion 以兩頁並行渲染，輸出保留為 `output/remotion/brew-<茶種>-master.mp4`。繁忙的電腦偶爾會讓瀏覽器以錯誤的緩衝大小擷取一格，畫面變成拼貼卻仍能正常解碼；發布前會逐格比對相鄰影格，鏡頭內變化遠超正常動作（刻意的三個剪接點除外）即自動重新渲染，最多三次。MP4 與 WebM 都由母片編碼，超過單檔 2 MiB 時逐步提高 CRF 重編。每支影片檢查 1280×720、30 fps、10 秒並全片解碼，第 0 格海報與最後一格的奉茶靜態畫面 `-still.webp` 也直接取自母片。只想重新編碼既有母片時加 `--encode-only`；`--tea` 可用逗號列出多種茶。配料影片用 `--garnish=<配料|all>`（可再以 `--tea` 篩選），輸出 `brew-<茶種>-<配料>`；`--frames=0,108,299` 可只預覽指定影格。

## 結構

- `src/index.tsx`：註冊 TeaPour、TeaComplete 與 TeaBrew composition，集中設定尺寸、幀率與時長。
- `src/PourFilm.tsx`：以 `useCurrentFrame` 驅動畫面，在 layout effect 完成同步 Three.js 繪圖。只有初始建立場景使用 `delayRender`，沒有自主播放的動畫迴圈。
- `src/tea-set.js`：從原茶席衍生的獨立場景，保留器具位置；增加環境反射、釉面、曲線水流分段、水珠、漣漪與蒸氣，所有變化由影格計算。
- `scripts/render-pour.mjs`：bundle、Chromium、Remotion still/video 輸出、轉檔與驗證；使用根目錄既有 Playwright 和 sharp。

## 遊戲整合

Vue 的 TeaFilm 將 `brew` 加上茶種對應到 `brew-<茶種>-v1`，`pour` / `complete` 對應到 `pour-remotion-v1` / `complete-remotion-v1`，仍以原有 Blob 影片播放／定位，不載入 React、Remotion 或 Three.js runtime。0–100% 水量對應 0–6 秒，最後留 0.05 秒避免 seek 到片尾。其餘原始影片保留，可回退。完成演出透過 `TeaCompletion.vue` 原生 dialog 播放一次，`ended`、略過按鈕與 Esc 共用去重的結束回傳；動畫中重整會保留已泡好的茶，可重新奉茶。影片失敗與減少動態時均保留繼續入口。

注水版改善了陶器反光、桌面對比、水流與輸出品質；仍是風格化、懸浮茶器的程序式動畫，沒有手部模型、物理流體模擬或音訊。正式美術方向需看樣片後再延伸。

## 上游參考與授權

- [Remotion 基本概念](https://www.remotion.dev/docs/the-fundamentals)
- [renderMedia](https://www.remotion.dev/docs/renderer/render-media)
- [Remotion 授權](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)

Remotion 套件鎖定 4.0.526，實際依賴以本目錄 package-lock.json 為準；它使用自訂授權，個人可免費製作商業影片，公司使用依其適用條件判斷。

## 共用 3D 器物

`tea-set.js` 同時提供遊戲茶具的正交投影素材。新增不同釉色、弧面紙標、陶瓷微凹凸、金屬細紋與乾茶葉；兩個 Remotion composition 已同步更新。修改器物後先跑 `npm run render:tea-props`，再重新渲染兩段影片，避免遊戲和影片材質不同。詳見 [3D 茶具文件](../docs/TEA_PROPS.md)。

## 單杯完成動畫與即時湯色

TeaComplete 現在是獨立單杯特寫，只有杯碟、柔和深色背景和蒸氣，六秒內由中景緩慢靠近。原茶桌／水壺仍用在 TeaPour。兩段以同一套材質製作。

遊戲依茶種與浸泡時間替液面上色。完成演出另以同一個 `setFrame` 產生 180 格液面遮罩，裁切後合成 WebP 圖集，透過 SVG 濾鏡和影片影格 callback 同步；杯身、杯碟與背景不染色。`video:render:complete -- --publish` 會自動執行 `render:tea-liquor` 更新圖集與投影位置。修改鏡頭後必須重新產生影片、圖集與 metadata；減少動態使用同一段的第 0 格。
