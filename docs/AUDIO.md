# 書店聲音

音檔放在 `public/audio/`：書店主題曲（薩提〈吉諾佩第一號〉，Robin Alciatore 演奏，Musopen 錄音，公有領域；只取前後重複的第一段做成 88.5 秒循環，接縫落在原曲本來相連的位置，見下方「主題曲」）、窗邊雨聲（20 秒，柔和的粉紅噪音雨幕加上窗上雨滴與偶爾的屋簷滴水）、室內聲（20 秒，低沉的房間底噪與慢速鐘擺），兩者都把尾段疊回開頭，循環沒有接縫，音量刻意低於音樂；以及紙張、茶杯、門鈴三個短音效。茶席另有可無縫循環的注水聲與提壺時機的鈴音。每段都有 Ogg Opus 與 MP3 兩種格式。主題曲以外的音檔執行 `npm run render:audio` 可從 `scripts/render-audio.mjs` 重新產生（原本的程序式 D 小調旋律仍保留在腳本裡，只有 `--only=midnight-theme` 才會輸出）；加上 `-- --only=tea-pour,tea-chime` 只重算指定音檔。重建需要 FFmpeg 的 `libopus` 與 `libmp3lame` 編碼器。

Howler 在玩家首次指標或鍵盤操作後開始播放。遊戲中的書店與靜蘭場景使用雨聲，記憶與月海場景換成室內聲；兩段環境音交叉淡化，旋律持續。午夜茶席使用雨聲。傾斜水壺或茶壺時播放注水聲，音量隨傾斜角度變化，放下即淡出；沙漏進入最佳時機、奉茶結果每亮一顆星時響一聲鈴音。離開遊戲畫面會淡出，瀏覽器頁面切到背景時靜音。音檔載入失敗不影響對話或小遊戲。

設定頁保存全部靜音、背景音樂、環境聲與音效音量。舊偏好沒有聲音欄位時，讀取時補上預設值；故事存檔仍不含音量。音檔已列入 PWA 預快取，離線重新載入可以繼續播放。

奉茶時的十二支製茶影片各有一條 10 秒音軌，放在影片旁的 `public/video/tea/`，以 `npm run render:film-audio` 從 `scripts/render-film-audio.mjs` 重建。影片播放、暫停與定位時音軌跟著影片時間走，音量使用音效設定；它與影片一起按需快取，不在安裝預快取內。細節見[製茶影片](TEA_FILMS.md#音軌)。

## 每夜配樂（進行中）

`audioManager.setMusic` 依場景切換背景音樂：標題與選單是書店主題曲，每夜一首、記憶與結局的月海各一首、午夜茶席另一首（`App.vue`、`TeaApp.vue`）。新曲以 `npm run generate:music`（Google Lyria 3.5，需 `GEMINI_API_KEY`，輸出到 `art-staging/music/lyria/`，帶 SynthID 浮水印）產生候選，選定後以 `npm run import:music` 剪成無縫循環，輸出到 `public/audio/music/<id>.{ogg,mp3}`；Service Worker 在首次播放時快取。

2026-10-07 時 `public/audio/music/` 還沒有任何曲子。`audioManager.ts` 的 `importedMusic` 是空集合，所有場景都併到同一條書店主題曲（`midnight-theme`，已在預快取內），換場景時不會從頭重播。每匯入一首，就把它的 id 加進 `importedMusic`；授權與來源也要同步寫進 [ASSET_LICENSES.md](ASSET_LICENSES.md)。

## 主題曲

2026-10-05 起改用公有領域錄音：薩提〈吉諾佩第一號〉（Gymnopédie No. 1），Robin Alciatore 演奏，錄音來自 Musopen，取自 [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg)，作者已釋出至公有領域；Musopen 希望署名，「關於」頁有列出。原檔保留在 `art-staging/music/satie-gymnopedie-1-alciatore.ogg`。

`npm run import:theme`（`scripts/import-theme.mjs`）從原檔重建：

- 曲子前後兩段幾乎相同，只取第一段。循環從第二段開頭（91.0 秒）開始，帶著第一段最後和弦的餘音；進入 3.4 秒後，在局部波形最吻合處（相關 0.86，第二段慢 310 毫秒）以 0.25 秒等功率交叉淡化接回第一段，一路播到第二段開頭之前。循環的最後一個取樣與第一個取樣在原曲裡本來就相連，所以沒有接縫。
- 加上 `--search` 會重新搜尋接點。
- 音量對齊原本的配樂（−34 LUFS），單聲道 Opus 40 kbps（505 KiB）與 MP3 56 kbps（605 KiB），仍在 PWA 預快取內。
- 連播兩次量測：循環點與交叉淡化點的瞬間振幅跳動為 0.0008 與 0.0018，遠低於曲中正常音頭（第 99 百分位 0.011），前後音量連續。
