# 交接說明：給接手的 AI 或開發者

本文件讓新接手的人（包含其他 AI 代理）在不讀完整歷史的情況下，知道專案現況、怎麼安全地改劇情、怎麼驗證，以及還剩哪些工作。細節以各連結文件為準；本文件只整理接手時最容易出錯的地方。

最後更新：2026-10-04（訪客反問與結局收尾選擇之後）。

## 一句話現況

《夜行書店》是 Vue 3 + TypeScript + Ink 的網頁敘事遊戲。六位訪客與林澄終章共七章都能從開場玩到四種結局（共 28 種），並寫入收藏。劇情架構、玩法系統與自動化測試大致完成；尚未完成的是**章節篇幅的真人計時、部分人物表情立繪、實機與輔助科技驗收、發行準備**。粗估整體完成度約 75%～80%（見下方「完成度」）。

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

## 環境與指令

需要 Node.js 22.12+。

```sh
npm ci
npm run dev            # 會先編譯 Ink，再啟動 Vite（127.0.0.1:5173）
npm run build:ink      # 只編譯 Ink 到 public/story/compiled/
npm run lint
npm run typecheck      # vue-tsc；不要用純 tsc，它不認得 .vue
npm test               # Vitest 單元測試（約 790 項，約 50–130 秒；負載高時第一夜 128 條隨機路線可能超過 120 秒上限，單獨重跑即可）
npm run build          # build:ink + typecheck + vite build + 效能預算檢查
npm run test:e2e       # Playwright，使用 dist/，務必先 build
npx playwright install chromium   # Playwright 升版後若找不到瀏覽器
```

- E2E 共約 272 項（桌機＋手機各一輪），單一 worker，整輪 1～3 小時。開發時只跑相關檔案，例如 `npx playwright test tests/e2e/finale.spec.ts`。
- E2E 由 `vite preview` 在 4173 提供 `dist/`。**E2E 執行中不要重新 build**，否則 `dist/` 被換掉會讓測試失敗。
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
- 「顯示全文」按鈕可能在點擊前因逐字完成而消失。點擊時要加短 timeout 並忽略失敗，否則整項卡到逾時。
- `finale.spec.ts` 的手機版拒坐路線在長批次中偶爾停在「翻開終章」找不到（終章未解鎖），單獨或整檔連跑皆通過，原因未查明。遇到時先單獨重跑。
- 第一夜〈替她決定的人〉之前還有一個確認選單（先選「替她把信寄出」，再選「仍替她封口」）。
- `tests/e2e/alternative-endings-from-opening.spec.ts` 讓 20 種替代結局各自從該夜開場玩到結局；〈不會天亮的書店〉由 `finale.spec.ts` 的拒坐路線涵蓋。這份測試在驅動選第一個選項時，會跳過新加的可選追問（因為結局選項在同一選單，偏好清單會先命中結局）。

## 目前版本

| 章節 | Ink 原稿 | 目前版本 |
| --- | --- | --- |
| 第一夜 靜蘭 | `story/main.ink` + `ch01_jinglan.ink` | `jinglan-chapter-10`（`main.json`） |
| 第二夜 柏言 | `ch02_boyan.ink` | `boyan-chapter-16` |
| 第三夜 若音 | `ch03_ruoyin.ink` | `ruoyin-chapter-15` |
| 第四夜 葉暖 | `ch04_yenuan.ink` | `yenuan-chapter-13` |
| 第五夜 雨航 | `ch05_yuhang.ink` | `yuhang-chapter-15` |
| 第六夜 海明 | `ch06_haiming.ink` | `haiming-chapter-20` |
| 終章 林澄 | `finale_lincheng.ink` | `lincheng-chapter-17` |

升版後請更新此表。

## 完成度（2026-10-04 粗估）

| 面向 | 估計 | 說明 |
| --- | --- | --- |
| 劇情架構 | ~100% | 七章 × 四結局皆可達、收藏、跨夜回應 |
| 劇情篇幅 | ~60–70% | PRD 每章 35–60 分鐘；首選路線約 6,000–7,000 字，加小遊戲估 25–35 分鐘，未經真人計時 |
| 玩法系統 | ~90% | 茶席、拼信、六種小遊戲、存檔、PWA、午夜茶席模式 |
| 美術 | ~75% | 背景、結局插畫、立繪齊；多數角色只有一至兩種表情 |
| 聲音與影片 | ~85% | 影片無音軌 |
| 正式版品質 | ~50% | 缺實機 Safari／Android、VoiceOver／TalkBack、完整對比審核 |
| 發行準備 | ~10–20% | 素材授權、內容校閱、跨瀏覽器、部署未開始 |

## 下一步建議（依可由 AI 完成的程度排序）

AI 可直接做：

1. **擴寫章節內容**：PRD_GAP_AUDIT「PRD 章節時長」列。訪客反問（六夜＋終章回應）與結局收尾二選一（24 種訪客結局與終章四種結局）已完成。剩下的方向：記憶場景中更多可查看物件、非首選茶種在後段的回響、結局後記依更多中段選擇變化。每次照「改劇情的標準流程」升版。
2. **跨章回應延伸到非相鄰章節**：程式已支援，PRD 列出的交叉細節都已回應（第三夜回應靜蘭，第六夜回應靜蘭與若音，都經由「四個音」）。若要再加，需要自行從各章已有細節找出合理連結，避免新增與原作矛盾的設定。
3. **E2E 穩定性**：把各檔重複的 `advanceUntil`／`untilChoice` 收斂到共用 helper。
4. **無障礙自動檢查**：擴充 axe 檢查到所有結局畫面與小遊戲操作後狀態。

需要人或外部資源：

5. 真人閱讀計時（各章 35–60 分鐘目標）。
6. 人物表情立繪（靜蘭、若音、葉暖、雨航、柏言的更多表情；成年林澄）。素材流程見 [CHAPTER_ART.md](CHAPTER_ART.md)。
7. 實機 iPhone Safari、Android Chrome、讀屏流程。
8. 素材授權確認、內容校閱、正式部署。

## 交接時的工作狀態

接手前先執行 `git status` 與 `git log --oneline -5`。本文件撰寫時的最新提交與驗證結果記在 [VERIFICATION.md](VERIFICATION.md) 最後幾段。

2026-10-03～04 這一輪完成並已驗證的提交：

| 提交 | 內容 |
| --- | --- |
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
