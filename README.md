# 夜行書店 · The Midnight Bookshop

午夜至黎明，一杯茶、一封信，和一個還沒說完的故事。

目前已完成 **靜蘭第一章完整劇情、八種茶的可拖曳茶席與六段製茶動畫**：三段記憶、三片信紙、四種結局及後記。介面沿用原有午夜藍、暖金與書頁風格；茶罐與主要茶具採共用模型的 3D 預渲染素材，茶影片同步使用相同陶瓷與金屬材質。

## 本機啟動

需要 Node.js 22.12+ 與 npm。

```sh
npm ci
npm run dev
```

開啟終端顯示的本機網址。預設為 http://127.0.0.1:5173 。根目錄原始 PNG 已保留，WebP 已產生；只有更換素材時才需要 `npm run assets`。修改 `.ink` 後需重新執行 `npm run build:ink` 或重啟開發伺服器。

```sh
npm run lint
npm run typecheck
npm test
npm run validate:ink
npm run build
npm run test:e2e
```

首次跑瀏覽器測試若缺 Chromium：`npx playwright install chromium`。E2E 使用正式 `dist/`，先執行 build；自動啟動 4173 preview。截圖位於 `output/`，失敗 trace 位於 `test-results/`，兩者不列入 Git。

## 已實作

- Vue 3 + TypeScript + Vite + Pinia + Router 的路由、元件、領域邏輯、儲存層分工。
- 標題、遊戲、六位訪客目錄、收藏、存檔與閱讀設定。
- Ink 原稿與可重複編譯腳本，tag 允許清單與 Story Bridge。
- 序章、靜蘭三段記憶、四種結局與後記；守夜手記保存線索與碎片。
- 校刊室、病房走廊與月台各有獨立背景與可點選的線索物件；查看狀態從 Ink 選項還原，也保留對話選項與數字鍵操作。切換時淡化，減少動態效果會略過轉場。
- 八種不同釉色的 3D 茶罐，搭配陶瓷茶壺、銅水壺、茶杯與茶匙；支援開蓋、乾葉、空杯和茶湯狀態。
- 八種茶自由選罐；拖曳開罐、舀茶、補回茶葉、提壺傾斜注水、蓋壺浸泡及倒茶入杯。水量與灑水即時計算，沙漏可暫停，失手可補水或重泡；滑鼠、觸控及鍵盤皆可操作。
- 茶種、份量、水溫、浸泡與灑水參與計分；泡得不完美仍能繼續故事。按「將茶遞給她」後播放 6 秒 Remotion 完成動畫，再銜接對話；可暫停／略過，減少動態時使用靜態畫面。
- 三枚信件碎片可用滑鼠或觸控拖曳到信紙，支援旋轉、翻面、吸附、移動、留白、墨跡觀察與不同文字版本；點選及鍵盤操作仍可使用。
- Dexie 3 個輪替自動檔、10 個手動檔、首次完成快照、跨新遊戲保留的收藏。
- 存檔格式與故事版本驗證、序列寫入、防覆寫確認、儲存錯誤提示。
- 鍵盤操作、文字放大、對話逐字顯示與四種文字速度、減少動態、手機直向介面。
- 原創書店旋律、窗邊雨聲與室內環境音，以及紙張、茶杯、門鈴音效；首次操作後播放，可分組調整音量或全部靜音。音檔隨 PWA 離線快取。
- PWA manifest、故事與影片預快取、更新提示及舊版短篇存檔相容。

## Remotion 製片

已建立獨立的 `video/` 製片目錄，保留已製作的注水與完成動畫：720p／30 fps／6 秒；其餘四段仍為原版。執行 `npm ci --prefix video` 後，以 `npm run video:studio` 預覽、`npm run video:render` 輸出注水，`npm run video:render:complete -- --publish` 輸出並更新本機完成動畫。詳細流程見 [製片室文件](video/README.md)。目前主要操作採即時 SVG 茶席，影片不控制拖曳、水量或計分。

## 下一階段

獨立立繪、後五章和林澄終章尚未製作。三段記憶有可選的線索標記與文字選項，尚無自由移動；六段茶影片共用固定茶席，尚無手部演出及各茶種獨立影片。35–45 分鐘的目標時長仍需真人閱讀測量。GSAP 與 PixiJS 仍未匯入遊戲 runtime；Howler 用於聲音播放。沒有帳號、後端或雲端存檔。

## 導覽

- [靜蘭第一章與結局條件](docs/story/JINGLAN_CHAPTER.md)
- [3D 茶具：模型、材質與重建](docs/TEA_PROPS.md)
- [可拖曳茶席：操作、規則與架構](docs/HANDS_ON_TEA.md)
- [拼信：拖曳、翻面與存檔](docs/LETTER_PUZZLE.md)
- [書店聲音：素材、播放與控制](docs/AUDIO.md)
- [製茶影片、重建與播放策略](docs/TEA_FILMS.md)
- [開發計畫與階段驗收](docs/DEVELOPMENT_PLAN.md)
- [UI 風格及概念圖對照](docs/UI_STYLE.md)
- [原始技術規格](midnight-bookshop-technical-architecture-v1.md)
- [角色與故事設定](midnight-bookshop-story-chapters-v1.md)
- [製茶動畫規格](midnight-bookshop-tea-animation-system-v1.md)

| 位置              | 責任                                  |
| ----------------- | ------------------------------------- |
| `story/`          | 故事唯一來源；生成 JSON 不手改        |
| `src/story/`      | Ink 指令解析與 runtime bridge         |
| `src/stores/`     | 遊戲編排、畫面狀態、閱讀偏好          |
| `src/services/`   | 製茶與拼信純函式判定                  |
| `src/db/`         | IndexedDB schema、原子寫入、存檔驗證  |
| `src/data/`       | 章節、茶方、結局、信片、素材 manifest |
| `src/components/` | 可組合的對話、製茶、拼信與共用 UI     |
| `src/views/`      | 六個頁面與導覽                        |
| `tests/`          | 故事路徑、資料邏輯、桌機／手機 E2E    |

存檔的 `version` 是資料格式，`storyVersion` 是編譯故事相容性契約。改動 Ink 結構時必須評估相容性並提升 storyVersion，新增明確 migration 後才讀入舊版。不可直接刪除不相容存檔。

API 實作依據：[inkjs 官方文件](https://github.com/y-lohse/inkjs/blob/master/README.md)、[Dexie transaction](<https://dexie.org/docs/Dexie/Dexie.transaction()>)、[Vite PWA 註冊與更新](https://vite-pwa-org.netlify.app/guide/register-service-worker)。
