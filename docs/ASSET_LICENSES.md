# 素材來源與授權清冊

最後盤點：2026-10-05。範圍是隨遊戲發行的 `public/`（不含 `public/story/` 的自編劇本 JSON），共 309 個檔案、約 64 MB；發行時每個檔案的大小與 SHA-256 另由 `npm run build` 寫進 `dist/asset-manifest.json`。

## 結論

- **唯一的外部素材是公有領域的主題曲錄音。** 沒有圖庫、音效庫、取樣、下載的 3D 模型或內嵌字型（CSS 只用系統字型）。
- **背景音樂是公有領域錄音，其餘聲音與影片由本專案的程式產生。** 主題曲為薩提〈吉諾佩第一號〉，Robin Alciatore 演奏（Musopen，公有領域）；音效、環境音與製茶影片音軌為程序式合成；製茶影片由 `video/` 的 Remotion 專案以程序式 3D 渲染；茶具圖由 three.js 腳本渲染。
- **圖片多為 AI 生成。** 背景、記憶場景、人物立繪、書籤插畫與茶點材料共 123 張，由 Codex 內建 `image_gen`（OpenAI 圖像模型）生成，另有 4 張由 AI 生成的概念圖縮製；2026-10-06 的滿版介面另有 9 張由 ChatGPT 圖像生成。
- **程式相依皆為開放原始碼授權。** 原列於相依、但遊戲未使用的 GSAP（GreenSock 自訂授權）與 PixiJS 已移除。打包進遊戲的套件授權全文在發行檔 `THIRD_PARTY_LICENSES.txt`，遊戲內「關於」頁有連結。

## 分類

| 類別 | 檔案 | 來源 | 紀錄 |
| --- | ---: | --- | --- |
| 公有領域錄音 | 2 | `audio/midnight-theme.{ogg,mp3}`：薩提〈吉諾佩第一號〉，Robin Alciatore 演奏，[Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Erik_Satie_-_gymnopedies_-_la_1_ere._lent_et_douloureux.ogg)（Musopen），作者釋出為公有領域；`scripts/import-theme.mjs` 剪成循環 | [AUDIO.md](AUDIO.md#主題曲) |
| 程序式聲音 | 42 | `scripts/render-audio.mjs`（18 個介面與環境音）、`scripts/render-film-audio.mjs`（24 條製茶影片音軌） | [AUDIO.md](AUDIO.md)、[TEA_FILMS.md](TEA_FILMS.md) |
| Remotion 影片 | 54 | `video/` 的 TeaBrew、TeaPour、TeaComplete 合成，程序式 3D 手部與茶具 | [video/README.md](../video/README.md)、[TEA_FILMS.md](TEA_FILMS.md) |
| 腳本渲染 | 81 | three.js 茶具 60 張（`render-tea-props.mjs`）、茶湯遮罩 3 個（`render-tea-liquor.mjs`）、舊六段影片 18 個（`render-tea-films.mjs`） | [TEA_PROPS.md](TEA_PROPS.md) |
| AI 生成圖片 | 123 | Codex 內建 `image_gen`：書籤 28、立繪 23、記憶背景 50、書店場景 14、茶點材料 8 | [BOOKMARK_ART.md](BOOKMARK_ART.md)、[CHAPTER_ART.md](CHAPTER_ART.md) |
| AI 生成圖片（滿版介面） | 9 | 2026-10-06 依 `art-staging/ui-reference/` 四張介面概念圖，請 ChatGPT 圖像生成畫成去掉文字與介面的背景：標題街景（桌機 `title-street`、手機 `title-street-mobile`）、茶席長桌 `tea-table-scene`、拼信窗邊書桌 `letter-desk-scene`、林澄背影去背立繪 `lincheng-back`、茶席上的左右手 `hand-left-kettle`／`hand-right-pot`、拼信時伏案的林澄 `letter-reader`；原圖留在 `art-staging/ui-generated/`，以 `cwebp` 轉成 webp | [UI_STYLE.md](UI_STYLE.md) |
| 衍生 | 6 | `scripts/optimize-assets.mjs` 由根目錄概念圖縮製 4 張場景（`rain-street`、`counter`、`memory`、`moon-sea`；概念圖帶 OpenAI 的 C2PA 簽章）、由 `favicon.svg` 轉出 2 個 PWA 圖示 | [UI_STYLE.md](UI_STYLE.md) |
| 手繪 | 1 | `favicon.svg`（兩個向量形狀的月亮） | — |

推定來源：第一夜三段記憶背景（`memory-{school,hospital,platform}` 及手機版，6 張）與 `tea-ingredients/` 8 張，專案文件沒有寫明工具；本機 `~/.codex/generated_images` 有尺寸、數量相符且建立時間緊接在提交之前的原圖，原圖帶 OpenAI gpt-image 的 C2PA 標記，因此列為 AI 生成。

2026-10-05 移除三張已無引用、卻仍隨發行的圖：`images/jinglan.webp`（已由 `characters/jinglan.webp` 取代）與舊版 `memory-white-room{,-mobile}.webp`（已由 `-v2` 取代）。

## 發行前需由人確認

這幾項是法律或商業判斷，無法由程式或文件確定：

1. **AI 生成圖片的權利與揭露。** 確認發行主體在 OpenAI 使用條款下可商業使用輸出內容；依上架平台規定，在商店頁或發行說明揭露「部分美術以 AI 生成」（遊戲內「關於」頁已揭露）。
2. **Remotion 授權。** Remotion 只在製作端渲染影片，不隨遊戲發行，但它的自訂授權對公司有條件（見 `video/README.md`「上游參考與授權」）。以公司名義發行時，確認是否需購買公司授權。
3. **作品本身的授權與著作權標示。** 2026-10-05 repo 公開，`LICENSE` 聲明保留所有權利、僅供閱覽，`package.json` 標為 `UNLICENSED`。仍需決定「關於」頁要掛的製作者名稱。
