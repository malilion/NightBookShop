# 交接說明：給接手的 AI 或開發者

本文件讓新接手的人（包含其他 AI 代理）在不讀完整歷史的情況下，知道專案現況、怎麼安全地改劇情、怎麼驗證，以及還剩哪些工作。細節以各連結文件為準；本文件只整理接手時最容易出錯的地方。

最後更新：2026-10-05（發行準備之後）。

## 一句話現況

《夜行書店》是 Vue 3 + TypeScript + Ink 的網頁敘事遊戲。六位訪客與林澄終章共七章都能從開場玩到四種結局（共 28 種），並寫入收藏。劇情架構、玩法系統、自動化測試與發行設定已完成；剩下的都需要人：**真人閱讀計時、實機與輔助科技驗收、素材權利與署名確認、作者確認校閱修正、部署帳號與網域**（見 [RELEASE.md](RELEASE.md)）。可由程式完成的部分約 100%（見下方「完成度」）。

## 先讀哪些文件

| 文件 | 用途 |
| --- | --- |
| [README.md](../README.md) | 啟動、指令、已實作功能總覽 |
| [PRD_GAP_AUDIT.md](PRD_GAP_AUDIT.md) | **最重要**：每項 PRD 要求的證據與尚需工作；每次改動都在最上方加一段 |
| [VERIFICATION.md](VERIFICATION.md) | 每次改動的驗證紀錄（測試數、通過與失敗）；最新的在最後 |
| [docs/story/*.md](story/) | 七章各自的劇情、分支、結局條件 |
| [midnight-bookshop-story-chapters-v1.md](../midnight-bookshop-story-chapters-v1.md) | 原始劇情 PRD（角色、茶、記憶、結局） |
| [midnight-bookshop-technical-architecture-v1.md](../midnight-bookshop-technical-architecture-v1.md) | 原始技術規格 |
| [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) | 階段里程碑與原稿差異裁決 |
| [RELEASE.md](RELEASE.md) | 建置產物、標頭、CI、部署與回退、發行前人工關卡 |

## 環境與指令

需要 Node.js 22.12+。

```sh
npm ci
npm run dev            # 會先編譯 Ink，再啟動 Vite（127.0.0.1:5173）
npm run build:ink      # 只編譯 Ink 到 public/story/compiled/
npm run lint
npm run typecheck      # vue-tsc；不要用純 tsc，它不認得 .vue
npm test               # Vitest 單元測試（約 790 項，約 50–130 秒；第一夜 128 條隨機路線單獨約 100 秒，時限已放寬為 300 秒）
npm run build          # build:ink + typecheck + vite build + 效能預算檢查
npm run test:e2e       # Playwright Chromium 桌機＋手機，使用 dist/，務必先 build
npm run test:e2e:webkit  # 同一套測試跑在 Safari 引擎（桌機＋iPhone），約 1 小時；需 npx playwright install webkit
npm run test:e2e:firefox # 同一套測試跑在 Firefox（桌機＋窄螢幕觸控）；需 npx playwright install firefox
npx playwright install chromium   # Playwright 升版後若找不到瀏覽器
```

- 測試輔助的注意事項：觸控拖曳只在 Chromium 用 CDP（`tea-helpers.ts` 的 `canTouch`），WebKit 用滑鼠驅動同一組 pointer 事件；Playwright 的 WebKit 在 `setOffline` 時連 Service Worker 回應都會拒絕，所以離線一律用 `offline-helpers.ts` 的 `setOffline`（WebKit 保持連線），Safari 離線由 `webkit-offline.spec.ts` 關閉自建伺服器驗證；`page-errors.ts` 的 `collectPageErrors` 會略過 WebKit 在重新整理時回報、但程式已處理的中斷請求。
- E2E 共約 272 項（桌機＋手機各一輪），單一 worker，整輪 1～3 小時。開發時只跑相關檔案，例如 `npx playwright test tests/e2e/finale.spec.ts`。
- E2E 由 `vite preview` 在 4173 提供 `dist/`。**E2E 執行中不要重新 build**，否則 `dist/` 被換掉會讓測試失敗。
- Firefox（`npm run test:e2e:firefox`）沒有手機模擬，`firefox-mobile` 是 390×844 加觸控的窄螢幕；它把 `manifest.webmanifest` 當下載處理，需要「不執行 App 的同網域頁面」時用 `/favicon.svg`。Firefox 把元素捲進畫面時會捲到最上方，手機版固定在上方的信紙曾因此蓋住碎片，現在由 `--sticky-paper` 與 `scroll-margin-top` 預留高度。
- 測試直接用原生 IndexedDB 寫入存檔或收藏前，先 `await appReady(page)`（`tests/e2e/app-ready.ts`）：搶在遊戲建好 Dexie 資料表前開啟資料庫，會建出空資料庫，寫入失敗而偶發逾時（2026-10-06 CI 踩過）。
- 不要在一輪 E2E 進行中另開 Playwright：兩邊共用 `test-results/`，會互刪對方的 trace，造成假失敗。
- 存檔快照格式目前是 `SAVE_VERSION = 2`（`src/types/saveMigrations.ts`）。改快照欄位時加一版並補遷移函式；`snapshotSchema` 會先遷移再驗證，所以既有測試以 `version: 1` 建的快照仍可讀。IndexedDB 結構改動另在 `database.ts` 加 Dexie 版本與 `upgrade`。
- 機器負載高時（其他專案同時跑 Playwright、ffmpeg 等），對時間敏感的測試會逾時或卡住。先用 `uptime` 看負載，負載正常後再單獨重跑失敗項目，不要急著改測試。

## 程式結構

| 位置 | 責任 |
| --- | --- |
| `story/main.ink` | 序章與第一夜入口，`INCLUDE chapters/ch01_jinglan.ink` |
| `story/chapters/*.ink` | 各章 Ink 原稿，是劇情唯一來源 |
| `public/story/compiled/*.json` | 編譯產物；**不手改**，舊版本也**不可刪** |
| `scripts/compile-ink.mjs` | 原稿對應的輸出檔名（決定目前版本） |
| `src/story/storyBridge.ts` | Ink runtime 包裝：frame、小遊戲結果寫回變數、序列化與還原 |
| `src/story/commandParser.ts` | Ink tag 允許清單（scene、speaker、portrait、section、clue、fragment、minigame、ending 等） |
| `src/stores/gameStore.ts` | 遊戲編排；開新章時決定使用哪個 storyVersion |
| `src/types/game.ts` | `STORY_VERSION`（第一夜）、`storyVersionSchema` 列舉、存檔 schema |
| `src/data/catalog.ts` | 章節、結局、`chapterForVersion` |
| `src/services/` | 茶、拼信、各小遊戲的純函式評分 |
| `src/components/` | 對話、茶席、拼信、小遊戲 UI |
| `tests/unit/*-story.test.ts` | 各章 Ink 路線測試（四結局、分支、還原） |
| `tests/e2e/` | 桌機／手機瀏覽器測試 |

## 改劇情的標準流程（最常做的工作）

存檔的 `storyVersion` 綁定一份編譯 JSON。只要改了 Ink 結構，就必須升版，舊 JSON 保留，讓舊存檔仍能讀。

### 第二夜至終章（以海明 15 → 16 為例）

1. 改 `story/chapters/ch06_haiming.ink`。新變數用 `VAR` 宣告在檔頭。
2. `scripts/compile-ink.mjs`：輸出檔名改為 `haiming-chapter-16.json`。
3. `src/types/game.ts`：`storyVersionSchema` 加入 `"haiming-chapter-16"`。
4. `src/data/catalog.ts`：`chapterForVersion` 的 haiming 條件加上 `|| version === "haiming-chapter-16"`。
5. `src/stores/gameStore.ts`：開新章時的版本改為 `-16`。
6. `npm run build:ink`，確認新 JSON 產生、舊 JSON 仍在。
7. 測試：
   - `tests/unit/haiming-story.test.ts`：`compiled` 指向 `-16`，並新增一個常數讀 `-15`，加一個 `it.each` 確認 `-15` 四結局仍可讀。
   - 用 `grep -rln "haiming-chapter-15" src tests scripts` 找出所有引用，把**目前版本**的引用改成 `-16`（素材包、觸控尺寸、替代結局、終章測試等）。
   - 若某測試用某份 JSON 產生存檔，**存檔的 `storyVersion` 必須與產生它的 JSON 相同**。版本寫新、JSON 用舊會讓 ink 狀態與選單錯位，點下選項後畫面不動（2026-10-03 已踩過一次）。
8. 文件：`docs/story/HAIMING_CHAPTER.md` 開頭的版本號與內容說明、`PRD_GAP_AUDIT.md` 最上方一段、`VERIFICATION.md` 最後一段。

### 第一夜（靜蘭）不同

第一夜由 `story/main.ink` 編譯成 `main.json`。升版時先把現有 `main.json` 複製成 `jinglan-chapter-N.json`（舊版），再改 `STORY_VERSION` 常數為 `jinglan-chapter-(N+1)` 並加入 schema 列舉。可參考提交 `5b2bd21`。

## 劇情寫作慣例

- 繁體中文。旁白以第二人稱「妳」指林澄；店員說話時 `# speaker:林澄`。
- 每行對話尾端用 tag 標說話者與畫面：`# speaker:顧海明 # portrait:haiming-warm`。只能用 `commandParser.ts` 允許的 tag，各章單元測試會檢查。
- **篇幅上限**：`tests/unit/chapter-length.test.ts` 量每章首選路線（每個選單都選第一項、配推薦茶），要求快速閱讀至少 40 分鐘、慢速（每分鐘 250 字）不超過 60 分鐘。2026-10-07 各章慢速約 55–57 分鐘，只剩 3–5 分鐘（約 750–1,200 字）。新內容請放在首選路線不經過的地方：非首選的茶、不是第一項的選項、替代結局；若要加在第一項或推薦茶路線上，先跑這個測試確認沒有超過上限。
- **記憶裡的茶**：各訪客章第二段記憶的進場段落（靜蘭醫院、柏言候診區、若音婚宴、葉暖週年、雨航末班車、海明夏日探訪）與其後一段（靜蘭月台、柏言列車、若音大舞台、葉暖醫院、雨航空店面、海明最後一次值班），以及第一段（靜蘭校刊室、柏言辦公室、若音童年、葉暖清晨廚房、雨航老郵局、海明暴風燈塔）在進入物件選單前，依 `tea_type` 只為兩種非首選的茶各給一句。
- **拼信前的茶**：各訪客章的 `=== letter_start ===` 第一行呼叫 `-> tea_before_letter ->`，依 `tea_type` 給一句，再進入拼信小遊戲。
- **篇幅守門**：`tests/unit/chapter-length.test.ts` 以首選路線（每次選第一項）估算各章時間，必須在快讀 40 分鐘以上、慢讀 60 分鐘以內。新增內容若讓某章超過上限，或刪減讓某章低於 40 分鐘，這個測試會失敗。編譯單章可用 `node scripts/compile-ink.mjs --only=ch04`。
- **表情立繪**：台詞尾端加 `# portrait:<cue>`（可用值見 `portraitCueSchema`，圖片對照在 `src/data/portraits.ts`）。cue 只影響該行；沒有 cue 時顯示場景訪客的預設立繪。`tests/unit/portraits.test.ts` 會走到每個 cue 的台詞確認顯示正確。
- **終章書籤的茶**：`gameStore` 開終章時除了 `lincheng_*` 回答，也把各夜章節存檔的 `tea_type` 傳成 `tea_<訪客>`（含海明）；終章翻書籤時依此各給一句。章節存檔沒有茶時不出現，所以不影響篇幅測試。
- **後記的中段選擇**：各訪客章檔尾有 `=== choice_afterword ===`，四種後記在 `-> tea_afterword ->` 前呼叫；每章兩個非第一項選項各設一個變數，各一句、四種結局都成立。新增時沿用，句子不要假設特定結局。
- **後記的茶**：各訪客章檔尾有 `=== tea_afterword ===` 隧道，四種後記在設定 `ending_kind`／`afterword_kind`（柏言是 `-> coda_*`）前呼叫 `-> tea_afterword ->`。新增茶種或結局時記得補上，句子要對四種結局都成立。
- **結局收尾的二選一**：24 種訪客結局與終章四種結局的收尾場景都以林澄的一個二選一收束，格式為 `* [選項] ~ 變數 = "值" 內容` 兩項，再以 `- -> xxx_afterword` 匯合，後記用 `{變數 == "值":一句話}` 回應。替訪客決定的結局裡，其中一項會再 `intervention += 1`。新加結局時沿用此格式。
- **可略過的追問**模式：在結局選單或段落選單中放 `* {條件 && not 已問} [選項]`，內容結束後 `-> xxx_return`（一行過場）再回到選單。結局選項放在同一選單裡，玩家隨時能直接選結局。
- **後記回響**：追問設一個變數，在相關結局的 `*_afterword` 用 `{變數:一句話}` 或 `{變數 == "值":一句話}` 留下痕跡。條件只依實際發生過的事，不要讓後記與結局矛盾。
- **前夜回應**：`previous_ending` 是前一夜的首次結局。第二至六夜各有抵達、中段、後段三處回應。更早各夜的首次結局由 `gameStore` 傳入；章節 Ink 宣告 `VAR ending_jinglan = ""`（或 boyan、ruoyin、yenuan、yuhang）才會收到。目前第三夜讀 `ending_jinglan`、第六夜讀 `ending_jinglan` 與 `ending_ruoyin`，終章讀五夜全部。
- **訪客反問**：六夜各有一段訪客反問林澄（答案存在 `lincheng_destination`、`lincheng_shift`、`lincheng_paused`、`lincheng_mother`、`lincheng_card`、`lincheng_fear`）。終章由 `gameStore` 從章節存檔的 Ink 狀態讀出（`storyBridge.ts` 的 `visitorQuestionVariables`、`readInkString`），宣告同名變數即可收到。林澄的回答只能用序章與終章已有的設定，不可提前揭露童年那封信。終章另有林澄反問店主的一題（`owner_letter`）；店主那封信刻意不交代寫信人與內容，續寫時不要替它補設定。
- 主題底線：泡茶不取代醫療；柏言的胸悶與昏厥一律引導就醫。不讓林澄替訪客決定成為「正確答案」。
- 每次只改一個主題，一次一個提交。提交訊息用英文、祈使句，說明玩家可見的變化，最後一行是 `New story version xxx-chapter-N; -M stays for existing saves.`，再加 `Co-Authored-By` 行。

## 測試慣例與已知陷阱

- 單元測試的 `play()`／`complete()` helper 預設選第一個選項；要走特定追問時，用該檔已有的參數（`refusal`、`extra`、`chooseTexts`、`prefer`）依序指定選項文字。
- E2E 寫入 IndexedDB（例如預先解鎖章節）後，**要 `page.reload()`**，否則 App 已讀過空收藏，章節仍是未解鎖。
- 從結局選擇前的存檔接續的 E2E，推進迴圈必須也會點 `.dialogue-choices button`（參考 `visitor-alternative-endings.spec.ts`）。結局收尾現在都有選項，只按「繼續」會卡到逾時（2026-10-04 `fifth-night-endings.spec.ts` 踩過）。
- 要模擬影片或素材載入失敗時，`page.route` 攔不到 Service Worker 從預快取送出的請求，須在該測試 `test.use({ serviceWorkers: "block" })`（見 `tea-brew-films.spec.ts`）。
- 整輪 E2E 的背景指令上限是 2 小時；負載高時會跑不完。被停掉時，用 `grep "\[mobile\] › tests/e2e/<檔名>"` 比對日誌找出未執行的檔案，補跑即可，不必整輪重來。
- 可能有另一個工作階段同時在這個儲存庫工作（2026-10-07 宣傳片原始檔就是由另一個工作階段提交，與本工作階段的提交只差 40 秒）。提交時明確列出路徑，不要用 `git add -A`；提交後看 `git log` 確認順序，推送前先 `git fetch`。
- 重新渲染製茶影片：`npm run video:render:brew -- --tea=<茶> --publish`、`-- --garnish=<配料|all> --publish`。系統負載高時渲染用的瀏覽器會當掉或啟動逾時；設 `FILM_CONCURRENCY=1` 並一支一支跑，失敗時腳本不會發佈任何檔案，重試即可。一支約 20 分鐘。
- `playwright.config.ts` 另有 `webkit-*`、`firefox-*` 專案，本機沒有安裝這兩個瀏覽器；直接 `npx playwright test <檔案>` 會連它們一起跑，每項幾毫秒就失敗。本機請加 `--project=desktop --project=mobile`（`npm run test:e2e` 已預設只跑 Chromium）。
- 單元測試約 1,100 項；機器負載高（其他工作階段同時跑）時，預設平行數下會有十來項在 15–115 秒逾時。先看 `uptime`，用 `npx vitest run --maxWorkers=3` 重跑確認，不要急著改測試。
- 「顯示全文」按鈕可能在點擊前因逐字完成而消失。點擊時要加短 timeout 並忽略失敗，否則整項卡到逾時。
- `finale.spec.ts` 的手機版拒坐路線在長批次中偶爾停在「翻開終章」找不到（終章未解鎖），單獨或整檔連跑皆通過，原因未查明。遇到時先單獨重跑。
- 拼信面板底部現在有「提示」「重置」與完成鈕三顆按鈕；要按完成請用 `.letter-panel .letter-finish`，不要用 `.panel-footer button`（會同時選到三顆）。茶席的茶名是「配方」卡裡的 `h4`，五張 HUD 卡標題（水溫、浸泡、風味、配方、完成度）是 `h3`。
- 遊戲頁的頂端是右上角的浮動工具列：「守夜手記」按鈕（名稱含「守夜手記 · 信紙 n/m」）在工具列的「記憶」，頁尾只剩信紙數與存檔狀態；齒輪鈕仍叫「開啟遊戲選單」。對話、茶席、拼信三種畫面固定為一個視窗高、不捲動（茶席在視窗矮於 780 px、拼信矮於 700 px 或寬度 ≤1180 px 時改回可捲動的上下排列）。PWA 首批預快取離 8 MiB 上限約剩 110 KiB，再加首夜圖片前要先壓縮或移出預快取。茶板上的手是 `TeaTable.vue` 裡 `.tea-hand` 群組（在水壺與茶壺的 `<g>` 內），只在滿版時顯示；改器具位置或尺寸時要一起調手的座標。寬版茶板的器具位置都在 `tableLayout`（茶罐兩排在左後、水壺在右且放大 `kettleScale` 倍）；E2E 的 `tea-helpers.ts` 也從它算座標，`pourAnchor`／`spout` 要傳 `kettleScale`。
- 第一夜〈替她決定的人〉之前還有一個確認選單（先選「替她把信寄出」，再選「仍替她封口」）。
- `tests/e2e/alternative-endings-from-opening.spec.ts` 讓 20 種替代結局各自從該夜開場玩到結局；〈不會天亮的書店〉由 `finale.spec.ts` 的拒坐路線涵蓋。這份測試在驅動選第一個選項時，會跳過新加的可選追問（因為結局選項在同一選單，偏好清單會先命中結局）。

## 目前版本

| 章節 | Ink 原稿 | 目前版本 |
| --- | --- | --- |
| 第一夜 靜蘭 | `story/main.ink` + `ch01_jinglan.ink` | `jinglan-chapter-18`（`main.json`） |
| 第二夜 柏言 | `ch02_boyan.ink` | `boyan-chapter-24` |
| 第三夜 若音 | `ch03_ruoyin.ink` | `ruoyin-chapter-23` |
| 第四夜 葉暖 | `ch04_yenuan.ink` | `yenuan-chapter-21` |
| 第五夜 雨航 | `ch05_yuhang.ink` | `yuhang-chapter-23` |
| 第六夜 海明 | `ch06_haiming.ink` | `haiming-chapter-27` |
| 終章 林澄 | `finale_lincheng.ink` | `lincheng-chapter-20` |

升版後請更新此表。

## 完成度（2026-10-04 粗估）

| 面向 | 估計 | 說明 |
| --- | --- | --- |
| 劇情架構 | ~100% | 七章 × 四結局皆可達、收藏、跨夜回應 |
| 劇情篇幅 | ~100%（估算） | 七章首選路線各約 9,700–10,900 字；以 `tests/chapterLength.ts` 的快讀模型（每分鐘 400 字、每行 0.8 秒、每個選擇 3 秒、小遊戲固定分鐘）皆為 40.5–41.2 分鐘，慢讀（每分鐘 250 字）約 55–57 分鐘，`chapter-length.test.ts` 守住 40–60 分鐘；仍需真人計時確認 |
| 玩法系統 | ~100% | 茶席、拼信（含墨光提示）、六種小遊戲、存檔（遷移、刪除、遊玩時間、章節快照、更新前備份）、收藏（三種書籤、剪影、個人回顧、八枚徽章）、音效字幕、PWA、午夜茶席模式。刻意不做：雲端存檔（PRD 可選）、語音分組（PRD 列為未來）、夜色值（原稿劇情未定義） |
| 美術 | ~100% | 背景、結局插畫齊；七位訪客與店主各有兩種以上表情立繪，成年林澄有平靜與含淚兩張（2026-10-04 第二批，見 CHAPTER_ART）；實機視覺驗收併入正式版品質 |
| 聲音與影片 | ~100% | 十二支製茶影片各有同步音軌（`npm run render:film-audio`）；全部音效為原創程序式合成，真人聽感併入實機驗收 |
| 正式版品質 | ~100%（自動化可達範圍） | 全套 E2E 在 Chromium 與 Safari 引擎（WebKit 桌機／iPhone）皆通過；七章所有畫面類型與選單的 WCAG 2.1 AA（axe）與實際畫素對比稽核零違規；iOS 模擬器真 Safari 已確認首頁、設定、章節、收藏。剩實機與讀屏人工驗收，清單見 [DEVICE_QA.md](DEVICE_QA.md) |
| 發行準備 | ~100%（可由程式完成的部分） | 素材來源清冊與 AI 揭露（ASSET_LICENSES）、全文校閱與修正（CONTENT_REVIEW）、Firefox 引擎測試、CI、Vercel／Cloudflare 部署設定與安全／快取標頭、版本資訊與素材清單、第三方授權、「關於」頁（RELEASE）。剩人工關卡：權利確認、作者確認校閱修正、帳號與網域、實機驗收 |

## 下一步建議（依可由 AI 完成的程度排序）

AI 可直接做：

1. **擴寫章節內容**：PRD_GAP_AUDIT「PRD 章節時長」列。訪客反問（六夜＋終章回應）與結局收尾二選一（24 種訪客結局與終章四種結局）已完成。後記依當晚的茶各多一句也已完成（`tea_afterword`）。剩下的方向：記憶場景中更多可查看物件、非首選茶種在其餘記憶場景中的回響（靜蘭、柏言三段記憶皆已完成；若音、葉暖、雨航、海明尚缺第四段記憶）、結局後記依更多中段選擇變化（每章已有兩個非第一項的選擇回響在四種後記，`choice_afterword`）。每次照「改劇情的標準流程」升版。
2. **跨章回應延伸到非相鄰章節**：程式已支援，PRD 列出的交叉細節都已回應（第三夜回應靜蘭，第六夜回應靜蘭與若音，都經由「四個音」）。若要再加，需要自行從各章已有細節找出合理連結，避免新增與原作矛盾的設定。
3. **E2E 穩定性**：把各檔重複的 `advanceUntil`／`untilChoice` 收斂到共用 helper。
4. **無障礙自動檢查**：擴充 axe 檢查到所有結局畫面與小遊戲操作後狀態。

需要人或外部資源：

5. 真人閱讀計時（各章 35–60 分鐘目標）。
6. 新增立繪時沿用 [CHAPTER_ART.md](CHAPTER_ART.md) 的流程：Codex 內建 `image_gen` 生圖到 `art-staging/portraits/`，`npm run import:portraits` 轉檔，再於 `portraitCueSchema` 與 `src/data/portraits.ts` 加 cue。
7. 實機 iPhone Safari、Android Chrome、讀屏流程。
8. 發行前人工關卡：見 [RELEASE.md](RELEASE.md)「發行前的人工關卡」（素材權利、作者確認校閱修正、Vercel 帳號與網域）。

## 交接時的工作狀態

**CI（2026-10-07）**：`77ef571` 那一輪完整 Chromium 304 通過、1 失敗（第一夜重新整理後 GameView 延遲載入中斷），由 PR #5（`c446543`）修正，`c446543` 的 CI 全數通過。之後推送的 `b4f0dea` 只改拼信翻面鈕的樣式，CI 結果請看 GitHub Actions。WebKit／Firefox 依設定只在手動觸發時跑。

**配樂（進行中，已提交）**：每夜一首的切換程式、音樂快取與 `generate:music`／`import:music` 兩支腳本已提交，但 `public/audio/music/` 還沒有曲子，`importedMusic` 為空，所有場景暫時播原本的書店主題曲；匯入一首就把 id 加進 `audioManager.ts` 的 `importedMusic`，詳見 [AUDIO.md](AUDIO.md#每夜配樂進行中)。`trailer/`（80 秒宣傳片的原始檔，`build/` 被它自己的 `.gitignore` 排除）與 `art-staging/ui-screenshots/`（滿版改版前後截圖）也已提交。

接手前先執行 `git status` 與 `git log --oneline -5`。本文件撰寫時的最新提交與驗證結果記在 [VERIFICATION.md](VERIFICATION.md) 最後幾段。

2026-10-03～04 這一輪完成並已驗證的提交：

| 提交 | 內容 |
| --- | --- |
| `08a2c62` | 六夜第一段記憶進場時，兩種非首選的茶各多一句（共 12 句）；首選路線篇幅不變 |
| `d141dc2` | 六夜下一段記憶進場時，兩種非首選的茶再各多一句（共 12 句）；首選路線篇幅不變 |
| `8253b9f` | 終章 `lincheng-chapter-20`：翻開六位訪客的書籤時想起那一夜泡的茶（18 句，從章節存檔帶入） |
| `93d57d3` | 每章兩個非第一項的中段選擇在四種後記各留一句（`choice_afterword`，共 12 句）；首選路線篇幅不變 |
| `b4f0dea` | 兩面信的翻面鈕墊深色底板（桌機若音、葉暖拼信畫面文字對比 4.41 → 合格） |
| `c446543` | （PR #5，他人合併）標題與遊戲頁改為靜態載入，修正 CI 上第一夜重新整理後 GameView 載入中斷 |
| `ebe6a96` | 六夜第二段記憶進場時，兩種非首選的茶各多一句（共 12 句）；首選路線篇幅不變 |
| `aa1b7c4` | 滿版介面：標題、對話、茶席、拼信改為鋪滿視窗的場景（新圖 9 張）；提交前修正拼信木盒切掉碎片、手機拖曳變捲動、翻面鈕被縮放列蓋住 |
| `541cda4` | 茶壺、杯碟改為青花瓷，茶席器物與十二支製茶影片全部用新模型重新渲染 |
| `9290e84` | `tea-brew-films.spec.ts` 的影片載入失敗情境改為封鎖 Service Worker（原本依 SW 接管時序時好時壞） |
| `80b689e` | 六夜拼信開始前依當晚的茶多一句（`tea_before_letter`，共 18 句） |
| `a7d6cb0` | 六夜後記依當晚的茶各多一句（`tea_afterword`，共 18 句） |
| `744b8e1` | 終章 `lincheng-chapter-17`：林澄反問店主有沒有一封沒讀的信（不交代寫信人與內容） |
| `a605895` | 終章 `lincheng-chapter-16`：四種最終結局收尾的二選一，28 種結局收尾都有林澄的選擇 |
| `f34742e` | 第一、二、三、五、六夜的結局收尾二選一（比照第四夜），24 種訪客結局收尾都有林澄的選擇 |
| `edf9c1d` | 終章 `lincheng-chapter-15`：讀完信後回答六夜的反問；`gameStore` 從章節存檔傳入回答 |
| `228c10c` | 第一、二、三、四、六夜的訪客反問（`jinglan-chapter-9`、`boyan-chapter-15`、`ruoyin-chapter-14`、`yenuan-chapter-13`、`haiming-chapter-19`） |
| `6b1e3d7` | 第五夜 `yuhang-chapter-14`：雨航問林澄有沒有沒回的信（第一段訪客反問） |
| `3dd18ca` | 終章 `lincheng-chapter-13`：拼信後可問店主那晚有沒有人抱過林澄、補完或保留貓腳印壓住的第三行 |
| `2283365` | 第二、五、六夜拼信後的可選追問（七章拼信後至此都有可選談話）；20 種替代結局從開場玩到結局的瀏覽器測試；「顯示全文」點擊的時序修正 |
| `6e37dd8` | 經由「四個音」的非相鄰前夜回應（第三夜回應靜蘭、第六夜回應若音）；`gameStore` 把更早各夜的結局傳給每一章 |

工作區在交接時是乾淨的，沒有未完成的半成品。
