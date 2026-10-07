# 宣傳片

《夜行書店》80 秒宣傳片的原始檔。畫面與配樂都由程式產生，重新執行即可得到相同結果。

| 檔案 | 用途 |
| --- | --- |
| `score.py` | 配樂：從零合成鋼琴、弦樂墊音、八音盒與低頻打擊（72 BPM），並混入 `public/audio` 的雨聲、門鈴、倒茶與紙張音效 |
| `prep.py` | 把 `public/images` 的場景放大銳化到 2560×1440、取出立繪，並從 `output/` 裁出三張遊戲畫面 |
| `stage.html` | 逐幀可重現的 Canvas 合成；`window.renderAt(t)` 畫出第 t 秒。`?v=1` 為 9:16 直式版 |
| `render.mjs` | 用 Playwright 逐幀擷取並以管線交給 ffmpeg 編碼 |

```sh
cd trailer
for f in rain-window bookshop-room door-bell paper tea-pour tea-chime porcelain; do ffmpeg -y -i ../public/audio/$f.mp3 -ar 48000 -ac 2 build/sfx_$f.wav; done
python3 score.py          # build/score.wav
python3 prep.py           # build/img/
node render.mjs           # build/trailer-16x9.mp4（1920×1080，寬銀幕遮幅）
node render.mjs --vertical  # build/trailer-9x16.mp4（1080×1920，字卡避開短影音底部按鈕區）
node render.mjs --stills 12,43,69   # 只輸出指定秒數的靜態畫面
```

`prep.py` 需要 `output/` 裡的 `tea-infusion`、`dialogue`、`letter` 桌機截圖（由 E2E 產生）。剪接點全部對齊小節（一小節 10/3 秒）；改節奏時 `score.py` 的 `PROG` 與 `stage.html` 的 `B(n)` 要一起改。

結構：雨夜（0–6.7 秒）→ 書店與林澄（6.7–20）→ 六位訪客各一小節（20–40）→ 泡茶、傾聽、拼信（40–46.7）→ 員工手冊第一頁與店主（46.7–53.3）→ 高潮快剪「七個夜晚／二十八種結局」（53.3–66.7）→ 片名（66.7）→ 「即將開門」（80）。
