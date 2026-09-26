# 章節、可拖曳茶席與製茶影片驗證紀錄

## 童年林澄與店主立繪（2026-09-26）

- 以內建 `image_gen` 生成兩張透明角色圖，轉為 1024×1536 WebP：`public/images/characters/lincheng-child.webp`（約 119 KiB）、`owner.webp`（約 121 KiB）。第六夜章末與終章以明確的 Ink `portrait` 標記顯示角色，段落切換時清除標記；兩章的離線素材包包含兩張圖。第六夜店主揭露的稱謂修正為與原稿一致的男性。
- 新劇本編譯為 `haiming-chapter-5` 與 `lincheng-chapter-5`；`-4` 等舊 JSON 保留，單元測試逐條載入舊路線並驗證存檔還原。`npm run build`（Ink、型別、正式建置、效能預算）、`npm run lint` 與 `npm test` 通過；單元測試共 217 項。正式建置的完整遊戲 JS gzip 約 213.5 KiB，PWA 預快取約 6.41 MiB，低於既定預算。
- 第六夜與終章完整路線、其餘結局的瀏覽器續玩，以及按章離線素材包均於桌機 1440×900、iPhone 13 Chromium 模擬核對。首輪 40 項中 38 項通過，第六夜一項遇到設定頁導航競態、一項在圖片載入前快速略過角色提示；等待設定頁就緒及新立繪載入後，第六夜與離線素材包重跑 14 項全通過。桌機／手機截圖 `output/{sixth-night-child,sixth-night-owner,finale-owner,finale-child-home}-{desktop,mobile}.png` 已目視檢查，角色可見且對話可讀。這仍是 Chromium 模擬，尚未做實機 Safari／Android 驗收。

## 終章童年住處與第五夜場景複核（2026-09-26）

- 終章 `child-home` 原先落回共用記憶圖；新增專屬橫向與直向 WebP，接入場景切換與終章離線素材包。兩張遊戲圖分別為 1672×941 與 941×1672，合計約 231 KiB。完整終章桌機／手機 Chromium 流程及終章離線素材包共 4 項通過；場景轉場後再跑完整流程 2 項通過。已目視檢查 `output/finale-child-home-{desktop,mobile}.png`，信、空椅、行李與雨衣符合童年住處敘述，對話可讀。首次桌機截圖在淡入前抓到上一場景，已改為等待舊圖層移除且新圖層不透明後再截圖。
- 複核已存在的第五夜四組記憶背景：`tests/e2e/fifth-night.spec.ts` 桌機／手機完整路線 2 項通過；已目視檢查 `output/fifth-night-{last-bus,empty-shop,bookshop-door}-{desktop,mobile}.png`，與原有舊郵局背景合計四段皆有專屬圖，場景標題、物件與對話可讀。先前文件仍稱公車與店面沿用共用圖，現依實際檔案、場景接線和瀏覽器畫面修正。
- `npm run build`（含 Ink、型別與效能預算）通過；全部遊戲 JS gzip 213.3 KiB、首頁必要圖片 284.3 KiB、PWA 安裝預快取 6358.8 KiB，均低於預算。上述瀏覽器證據為 Chromium 模擬，仍待實機 Safari／Android 與真人閱讀時長驗收。

## 第四夜四段專屬背景與預快取修正（2026-09-25）

- 以清晨廚房為參照，新增週年活動、醫院走廊和熄火老烤箱各一組桌機／手機背景；四段記憶現各有專屬圖。六張 WebP 合計約 972 KiB，接入場景切換及葉暖章節素材包。
- 新醫院背景的檔名曾意外匹配第一夜的 `memory-hospital*.webp` 預快取規則，使安裝包增加約 252 KiB；把第一夜三段規則改為明確的橫／直檔名後，第四夜素材維持章節啟動後按需下載。`npm run build`（含 Ink、型別與效能檢查）、`npm run lint`、`git diff --check` 通過；此版全部遊戲 JS gzip 213.1 KiB、首頁必要圖片 284.3 KiB、安裝預快取 6357.7 KiB，均低於預算。
- `tests/e2e/fourth-night.spec.ts` 與 `tests/e2e/chapter-asset-pack.spec.ts` 在桌機／手機 Chromium 共 10 項通過：第四夜最佳理解完整路線、三段新背景及手機來源、四章素材包離線可讀及重載。已目視檢查 `output/fourth-night-{anniversary,hospital-return,old-oven}-{desktop,mobile}.png`；六張畫面的背景、場景標題與對話可讀。尚未做實機 Safari／Android 和真人閱讀時長驗收。

## 第三夜四段專屬背景（2026-09-25）

- 以既有童年練習室為風格參照，新增比賽後台、散場宴會廳與沒有盡頭的舞台各一組橫／直 WebP，接入場景切換及若音章節素材包；第三夜四段記憶現各有專屬背景。六張新圖共約 760 KiB，來源 PNG 保留在本機生成目錄，遊戲載入 `public/images/memory-{backstage,banquet,grandstage}*.webp`。
- `npm run build`（含 Ink 編譯、型別與效能檢查）、`npm run lint`、`git diff --check` 通過。此版全部遊戲 JS gzip 213.0 KiB、首頁必要圖片 284.3 KiB、安裝預快取 6356.9 KiB，均低於 PRD 預算。`tests/e2e/chapter-asset-pack.spec.ts` 在桌機／手機 Chromium 的第三夜離線素材包兩項通過；`tests/e2e/third-night.spec.ts` 兩版完整流程重跑通過，核對三段新背景載入、直版來源、記憶物件、雙面拼信與結局。首次桌機執行在三件物件後立即重載，讀到前一筆尚未寫完的存檔；改為等待自動保存完成後兩版重跑通過。
- 已目視檢查 `output/third-night-{backstage,banquet,grandstage}-{desktop,mobile}.png`；六張遊戲截圖的背景、場景標題、對話與手機直向構圖均可讀。這是 Chromium 模擬；實機 Safari／Android 與真人閱讀時長仍待驗收。

## 第二夜候診區與列車背景（2026-09-25）

- 以第二夜辦公室背景作風格參照，新增候診區與末班列車各一組桌機／手機 WebP，分別接入記憶場景切換及柏言章節素材包；三段記憶現各有專屬背景。遊戲檔案為 `public/images/memory-{clinic,train}*.webp`，橫版 1672×941、直版 941×1672，四張合計約 500 KiB。
- `npm run build`（含 Ink 編譯、型別檢查與效能預算）、`npm run lint`、`git diff --check` 通過。此版全部遊戲 JS gzip 合計 212.9 KiB、首頁必要圖片 284.3 KiB、安裝預快取 6356.2 KiB，均低於各自預算。`tests/e2e/second-night.spec.ts` 與 `tests/e2e/chapter-asset-pack.spec.ts` 在桌機／手機 Chromium 共 6 項通過，涵蓋第二夜完整路線、三段場景切換後圖片載入、候診區與列車直版來源，以及柏言素材包離線快取與重載。
- 已目視檢查 `output/second-night-{clinic,train}-{desktop,mobile}.png`：兩處背景、前景文字與直版構圖均可見。這是 Chromium 模擬與定向驗證；Safari／Android 實機及其餘章節場景尚待驗收。

## 七夜收藏回顧與柏言蜂蜜茶（2026-09-25）

- 收藏頁依既有結局收藏資料回溯顯示二十八格書籤：已取得者顯示名稱，未取得者只顯示缺頁，不透露條件。七夜各有故事句、主線線索與茶方；對應的最佳理解結局可展開一則後日談。四枚徽章由既有收藏推算，舊玩家無須遷移存檔。桌機／手機 Chromium 的空白、單一替代結局、最佳結局及二十八結局收藏狀態共 2 項定向 E2E 通過；已目視檢查 `output/collection-{shelf,recap,achievements}-{desktop,mobile}.png`，版面、缺頁與解鎖內容可讀。
- 第二夜新增可加入或取回蜂蜜的洋甘菊茶席操作；材料狀態可重載，茶壺有蜂蜜標記，蜂蜜版的情緒契合分數為 100，原味洋甘菊為 75。新版 `boyan-chapter-6` 讓蜂蜜茶觸發身體警訊與求助對話；`boyan-chapter-5` 與更舊編譯檔保留給既有 Ink 存檔。`npm run build`（含 Ink 編譯、型別及效能預算）、`npm run lint`、`npm test`（12 檔 207 項）通過；第二夜完整流程及三種替代結局在桌機／手機 Chromium 共 8 項通過，桌機從空白收藏連玩七夜到終章亦通過。第一次完整流程的收藏頁斷言仍尋找舊茶方標題，更新為新茶方文字後兩版重跑通過。已目視檢查 `output/second-night-honey-tea-{desktop,mobile}.png`，蜂蜜入口、按鈕狀態與壺邊標記可見。

## PWA 章節素材與效能預算（2026-09-25）

- 正式建置改為預快取 App Shell、所有版本的 Ink 存檔相容 JSON、音效、茶席靜態素材及第一夜背景／立繪；後續章節的圖片在開始或讀取該章時下載到瀏覽器快取，製茶影片按需快取。影片未下載時仍可使用靜態畫面完成茶席。Workbox 建置報告由原本 172 項、約 13.25 MiB 降為 130 項、約 6.17 MiB；同一 URL 重複列於清單時只計一次，為 127 個不同檔案。
- `npm run build` 現在會執行 `npm run audit:performance`。本輪全部遊戲 JS 的 gzip 合計 210.4 KiB（比初次載入更保守）、首頁必要圖片 284.3 KiB、安裝預快取 6320.4 KiB，分別低於 PRD 的 300 KiB、1.5 MiB、8 MiB 預算。這是建置檔大小，尚未量測實際逐章首批網路傳輸、影片動畫容量或桌機／手機 FPS。
- 桌機與手機 Chromium 的第一夜離線重載、續讀與茶席浸泡還原，以及第六夜啟動後九張專屬圖片進入快取、未到達的白色房間直式圖可在斷線後由 Service Worker 讀取、斷線重整後回到第六夜開店準備，定向 E2E 共 6 項通過。尚未做 Safari／Android 實機離線驗證。

## 第六夜四段記憶背景（2026-09-25）

- 以既有暴風燈塔背景為風格參照，新增夏日探視、最後一次值班及沒有海的白色房間的獨立橫／直 WebP；保留風箏與午餐袋、婚禮信封與空椅子、未點亮的壞煤油燈與城市窗景。來源 PNG 留在 `.codex/generated_images/01a0d693-22ca-7641-b1e2-f711c9102084/`，遊戲只載入 `public/images/memory-{summer-visit,last-watch,white-room}*.webp`。
- `npm run build`、`npm run lint` 通過；`tests/e2e/sixth-night.spec.ts` 桌機／手機 Chromium 2 條完整路線通過，包含三段新背景、十二件物件、紙船、原句與共讀結局。場景轉換須待前張淡出且新圖完成載入再擷取；已目視檢查 `output/sixth-night-{summer-visit,last-watch,white-room}-{desktop,mobile}.png`，確認新圖與文字均可見。逐件物件與放大字級的視覺審核仍待完成。

## 第二夜列車通知互動（2026-09-25）

- 新流程編譯為 `boyan-chapter-5`，`boyan-chapter-4` 等舊檔仍保留供既有 Ink 存檔讀取。列車第三段離開前，柏言須逐則暫停主管、同事與工作系統三則通知，才會在車窗找到交接與下一步信紙；母親的私人訊息可選擇此刻回覆或留到明天。暫停狀態與回覆選擇寫入存檔，舊存檔缺少欄位時使用空白預設值。
- `npm run build`（含 Ink 編譯與型別檢查）、`npm run lint`、`npm test`（12 檔 194 項）、`git diff --check` 通過。桌機第二夜完整流程通過；首次手機流程在辦公室物件後立即重載，讀到前一筆尚未寫完的存檔，測試改為等待自動保存完成後，手機完整流程重跑通過。兩版都涵蓋通知暫停兩則後重載、母親回覆、最後一則暫停、拼信及結局收藏。
- `tests/e2e/seven-nights.spec.ts` 與 `tests/e2e/visitor-alternative-endings.spec.ts` 在同一次桌機／手機 Chromium 執行中共 32 項通過，確認新版柏言章沒有擋住從空白收藏連玩七夜及其餘訪客替代結局。七夜連玩採自動化瞬間對話，不能代替真人閱讀時長。目視檢查 `output/second-night-notifications-{desktop,mobile}.png`，手機長頁可捲動，狀態、私人訊息和完成按鈕可讀；尚未做 Safari／Android 實機測試。

## 靜蘭立繪、第一夜書店與章節縮圖（2026-09-25）

- 內建 `image_gen` 以既有靜蘭場景為參考，製作透明全身立繪及去除原有非中文文字、人物與介面框的書店橫／直背景；轉成 `public/images/characters/jinglan.webp`、`public/images/jinglan-room.webp`、`public/images/jinglan-room-mobile.webp`。六位訪客在章節選單有各自立繪縮圖，在書店對話以立繪疊在背景與對話框之間。
- `npm run build`（含 Ink 編譯與型別檢查）、`npm run lint` 通過。桌機與手機 Chromium 的 `first-night.spec.ts` 與 `character-portraits.spec.ts` 共 22 項通過：第一夜完整流程、茶席離線還原、六位訪客畫面載入與其餘五位章節縮圖來源。第一夜目視檢查 `output/jinglan-portrait-{desktop,mobile}.png`；章節選單目視檢查 `output/chapter-portraits-{desktop,mobile}.png`。這是 Chromium 模擬，尚未涵蓋實機 Safari／Android。

## 第二至六夜訪客立繪（2026-09-25）

- 內建 `image_gen` 製作柏言、若音、葉暖、雨航與海明五張透明背景立繪，轉成保留 alpha 的 WebP 後接入各自書店對話。海明提燈的首版與劇本不符，重新生成未點亮版本才匯入。
- `npm run lint`、`npm test`（12 檔 189 項）、`npm run build`、`git diff --check` 通過。`tests/e2e/character-portraits.spec.ts` 在桌機與手機 Chromium 共 10 項通過，核對圖片路徑、載入尺寸、對話可見與頁面錯誤；第二夜另有 2 項既有流程回歸通過。
- `output/{boyan,ruoyin,yenuan,yuhang,haiming}-portrait-{desktop,mobile}.png` 為遊戲畫面截圖。已目視檢查所有手機截圖及代表性桌機截圖；立繪可見，對話文字在前景可讀。裝置仍為 Chromium 模擬，尚未做實機驗收。

## 前四夜與第六夜替代結局（2026-09-25）

- `tests/e2e/visitor-alternative-endings.spec.ts` 為靜蘭、柏言、若音、葉暖及海明各補三種替代結局。依 Ink 劇本從開場運算至最終選擇，保存有效快照，再由瀏覽器繼續；桌機與手機 Chromium 共 30 項通過，逐一核對結局標題、自動存檔及收藏寫入。每個結局都有兩種版面的截圖；抽查 `output/{intervention,boyan-boundary,ruoyin-score,yenuan-copy,haiming-voice}-ending-mobile.png`，文字、書籤及操作鈕可見。
- 連同各夜原有的完整主線及第五夜、終章的替代結局測試，七章四結局共 28 種皆有桌機／手機瀏覽器證據。替代結局的測試由最終選擇前的有效存檔接續，不能等同於逐條從開場自然重玩。

## 終章其餘兩種結局（2026-09-25）

- `tests/e2e/finale-endings.spec.ts` 以有效的最終選擇前 Ink 存檔，分別檢查完整拼信後的〈下一任守夜人〉、保留部分空白後的〈留在書架上的信〉；桌機與手機 Chromium 共 4 項通過，包含結局畫面、自動存檔與收藏。已目視檢查 `output/lincheng-{keeper,shelf}-ending-mobile.png`，標題、書籤及按鈕在直向版面可見。
- 另有先前完整路線的〈天亮以後〉與開場拒絕訪客席的〈不會天亮的書店〉瀏覽器檢查；四種終章結局現皆有瀏覽器證據。新測試從有效存檔接續，不代表這兩條路線都從開場重玩。

## 第五夜定量混茶與四結局（2026-09-25）

- 雨航新流程為 `yuhang-chapter-6`；舊 `-1` 至 `-5` 編譯檔保留供既有 Ink 存檔讀取。四段記憶補足可探索細節，拼信前可從明信片、租約或雨航的意願切入談話，並依實際探索回應。薄荷茶可加入檸檬片，並從備好的小壺量取 0–30 毫升淡紅茶；洋甘菊可加蜂蜜，焙茶可加蘋果乾。用量與配料選擇保存在茶席草稿，改變分數與雨航的回應；只有蜂蜜洋甘菊會出現妹妹的夢話。舊存檔缺少用量欄位時以 0 還原。
- `npm test` 12 檔 189 項、`npm run typecheck`、`npm run lint`、`npm run build` 通過。桌機與手機 Chromium 的第五夜完整流程各一項通過，含混茶用量及檸檬重載、投遞路線、拼信與〈今日簽收〉收藏；另以最終選擇前的有效存檔，逐一驗證四種結局於兩種版面完成並寫入收藏，共 8 項通過。這批結局測試不代表四條完整路線都從開場重玩。
- 已目視檢查 `output/fifth-night-lemon-tea-{desktop,mobile}.png` 的混茶控制與茶壺標記，以及 `output/yuhang-{today,future,past,unknown}-ending-mobile.png` 的結局標題、書籤、按鈕與排版。桌機四種結局也擷取畫面供比對。

## 終章童年書店背景（2026-09-25）

- 以內建 `image_gen` 分別生成橫向與直向的童年書店櫃台場景，轉成 `public/images/memory-child-bookshop.webp` 與 `public/images/memory-child-bookshop-mobile.webp`，在 `hidden-envelope` 記憶段落按桌機／手機載入。兩張皆為高櫃台、未交出的信、墨水、黑貓、月亮刻痕與雨夜街燈，留出對話框位置。
- `npm run build` 通過。桌機與手機 Chromium 的終章〈天亮以後〉完整流程各通過一項。第一次截圖在新圖片已掛入 DOM 但舊圖片尚未淡出的轉場期間，畫面仍是前一張共用背景；改為等待 `.scene-art` 僅一張後重新擷取，目視確認 `output/finale-child-bookshop-{desktop,mobile}.png` 實際呈現新背景，文字、黑貓與信件可見。

## 從空白收藏連續遊玩七夜（2026-09-25）

- 新增 `tests/e2e/seven-nights.spec.ts`，不寫入任何章節解鎖資料，從標題頁〈開始故事〉、每晚開店、茶席、各章互動與留白的信件，一路使用結局畫面的「翻開下一夜」走到終章。此路線刻意不要求每封信拼滿，驗證較低理解度的選擇也能自然推進。
- 桌機與手機 Chromium 各一條完整七夜連玩通過，耗時約 3.1 與 3.0 分鐘；桌機補強後重跑並核對收藏頁有七個結局書籤，約 3.5 分鐘通過。這些是瞬間對話、減少動態下的自動化耗時，不能代替 PRD 的真人閱讀時長。

## 林澄終章的三段記憶探索（2026-09-25）

- 收藏室、童年住處與童年書店各有三件可獨立查看的物件，也可提前離開；四片童年信仍隨主線取得。新流程為 `lincheng-chapter-4`，舊 `-1` 至 `-3` 編譯檔保留供既有存檔讀取。海明〈完美的守塔人〉結局會影響林澄查看六格信櫃時的回應。
- `npm test` 12 檔 184 項、`npm run validate:ink` 8 檔 153 項、`npm run lint`、`npm run build`、`git diff --check` 通過。桌機與手機 Chromium 各有〈天亮以後〉及開場拒絕訪客席兩條路線通過；前者涵蓋九件物件、收藏室已讀狀態重載、六夜地圖、四片信與結局收藏。
- 已目視檢查 `output/finale-hidden-room-objects-{desktop,mobile}.png`，三件物件與回櫃台選項可見。〈下一任守夜人〉及〈留在書架上的信〉仍由 Ink 路徑測試覆蓋，尚未逐一做瀏覽器視覺審核。

## 海明四段記憶與海鹽焦糖焙茶（2026-09-25）

- 對照 `midnight-bookshop-story-chapters-v1.md` 第六章：暴風燈塔、夏日探視、最後值班與白色房間各有三件可獨立查看的物件，也可提前離開；紙船四角仍隨主線取得。新流程為 `haiming-chapter-4`，舊 `-1` 至 `-3` 編譯檔保留供既有存檔讀取。雨航〈退回過去〉結局會改變海明查看潮汐圖的回應。物件文字保留不確定與矛盾的記憶，書店不會治癒遺忘。
- 海明章選焙茶後可在注水前加入或取回海鹽焦糖；材料標記跟著茶壺移動，選擇存於茶席草稿。專屬茶與原味焙茶有不同契合分數與海明對話；共用完成動畫尚未按材料變化。
- `npm test` 12 檔 178 項、`npm run validate:ink` 8 檔 147 項、`npm run lint`、`npm run build`、`git diff --check` 通過。桌機與手機 Chromium 各一條完整第六夜流程通過，涵蓋海鹽焦糖加入及重載、十二件物件、燈塔已讀狀態重載、守燈、紙船與父子共讀結局。
- 已目視檢查 `output/sixth-night-caramel-tea-{desktop,mobile}.png` 與 `output/sixth-night-lighthouse-objects-{desktop,mobile}.png`；材料入口、茶壺標記、三件物件及離開按鈕可見。其餘三個結局尚未逐一做瀏覽器視覺審核。

## 雨航四段記憶與薄荷檸檬茶（2026-09-25）

- 對照 `midnight-bookshop-story-chapters-v1.md` 第五章：老郵局、末班公車、空店面與夜行書店門外各有三件可獨立查看的物件，也可提前離開；四片藍色信仍隨主線取得。新流程為 `yuhang-chapter-4`，舊 `-1` 至 `-3` 編譯檔保留供既有存檔讀取。葉暖〈讓晨麥休息一週〉結局會改變雨航查看老郵局派送簿的回應。
- 雨航章選薄荷茶後可在注水前加入或取回檸檬片；茶壺旁的材料標記會一起移動，選擇保存於茶席草稿。檸檬薄荷茶與原味薄荷茶有不同契合分數及雨航對話。淡紅茶仍在敘述中，尚無獨立混茶操作。
- `npm test` 12 檔 170 項、`npm run validate:ink` 8 檔 140 項、`npm run lint`、`npm run build`、`git diff --check` 通過。桌機與手機 Chromium 各一條完整第五夜流程通過，涵蓋檸檬片加入及重載、十二件物件、老郵局已讀狀態重載、投遞路線、郵票與「今日簽收」。桌機初跑在物件最後一筆存檔完成前重載，測試加入等待自動保存完成後，兩裝置重跑通過。
- 已目視檢查 `output/fifth-night-lemon-tea-{desktop,mobile}.png` 與 `output/fifth-night-post-office-objects-{desktop,mobile}.png`；材料入口、茶壺標記、三件物件與離開按鈕可見。其餘三個結局尚未逐一做瀏覽器視覺審核。

## 葉暖四段記憶與焙茶蘋果茶（2026-09-25）

- 對照 `midnight-bookshop-story-chapters-v1.md` 第四章：清晨廚房、週年活動、醫院走廊、老烤箱各有三件可獨立查看的物件，亦可先離開；三片食譜仍按主線取得。語音必須先問葉暖，由她決定播放或保留。新流程為 `yenuan-chapter-4`，舊 `-1` 至 `-3` 編譯檔保留供既有存檔讀取；若音〈掌聲的回音〉結局會影響週年招牌的探索回應。
- 葉暖章選焙茶後可在注水前加入或取回一片蘋果乾；材料標記跟著茶壺移動，選擇與茶席一起存檔。焙茶蘋果茶及原味焙茶有不同契合分數與葉暖對話；舊茶席存檔缺少材料欄位時預設為無。共用製茶完成動畫仍未按材料變化。
- `npm test` 12 檔 162 項、`npm run validate:ink` 8 檔 133 項、`npm run lint`、`npm run build`、`git diff --check` 通過。桌機與手機 Chromium 各一條完整第四夜流程通過，涵蓋蘋果乾加入及重載、十二件場景物件、廚房已讀狀態重載、爐火、雙面食譜及最佳結局。第一次桌機測試在新增材料後立即重載，讀到前一筆存檔；測試改為等「自動保存完成」狀態後重載，兩裝置均通過。
- 已目視檢查 `output/fourth-night-apple-tea-desktop.png`、`output/fourth-night-apple-tea-mobile.png` 及 `output/fourth-night-bakery-objects-*.png`，材料入口、茶壺標記、三件記憶物件、文字與離開按鈕可見。其他三種結局仍未逐一做瀏覽器視覺審核。

## 若音四段記憶、專屬茶與最後一小節（2026-09-25）

- 對照 `midnight-bookshop-story-chapters-v1.md` 第三章：空教室、比賽後台、散場宴會廳與想像舞台各有三件可獨立查看的物件，亦可提前離開；信紙三片仍依主線順序取得。新流程為 `ruoyin-chapter-4`，舊 `ruoyin-chapter-1` 至 `-3` 編譯檔保留供既有存檔讀取。柏言繼續加班的結局會在若音查看尾牙節目單時引出不同回應。
- 薰衣草茶在空教室解鎖首次真心盼著再演奏的童年線索，其他茶可繼續主線。最後一小節的三種選法分別對應雨聲、宴會廳聽眾、手傷與休息；若沒有聽見相應回憶，最佳理解選項不出現。三種選法在最佳結局的演奏敘述中各有不同文字。
- `npm test` 12 檔 154 項、`npm run validate:ink` 8 檔 126 項、`npm run lint`、`npm run build`、`git diff --check` 通過。第一夜逐節還原的 5 秒測試時限曾兩次偶發逾時；該條路線保留 600 步上限，時限調為 15 秒後兩次完整測試集通過。
- 桌機與手機 Chromium 各一條完整第三夜路線通過：十二件物件、空教室已讀狀態重載、四音回應、雙面信重載、最佳結局與薰衣草專屬手記。已目視檢查 `output/third-night-childhood-objects-desktop.png`、`output/third-night-childhood-objects-mobile.png`，物件入口、文字及離開按鈕可見。其餘三種結局仍未逐一做瀏覽器視覺審核。

## 柏言三段記憶探索（2026-09-25）

- 第二夜辦公室、候診區、列車各有三件可獨立查看的物件與離開選項；原 `boyan-chapter-3` 等舊編譯檔保留，新流程為 `boyan-chapter-4`。靜蘭「被代為決定」結局會在辦公室信紙段落引出柏言親自拿筆的回應。
- `npm test` 12 檔 144 項、`npm run validate:ink` 8 檔 116 項、`npm run lint`、`npm run build` 與 `git diff --check` 通過。Ink 驗證初跑有一項第一夜測試超過 5 秒時限，單檔 13 項與完整 Ink 驗證重跑皆通過。桌機與手機 Chromium 的第二夜完整路線各通過一項，含九件物件、辦公室已讀狀態重載、四格信與結局收藏。正式 PWA 預快取 148 項，約 9982 KiB。
- 辦公室的場景物件入口與「前往下一處」選項分開顯示；已目視檢查 `output/second-night-office-objects-desktop.png`、`output/second-night-office-objects-mobile.png`，三件物件、文字與離開按鈕可見。
- 候診區及列車沿用共用背景；其餘三種結局仍由 Ink 路徑測試覆蓋，未逐一做瀏覽器視覺審核。

## 前夜結局進入下一章對話（2026-09-25）

- 第二至六夜與林澄終章的新版 Ink 在第一段對話讀取前一章首次結局，各四種結果都有不同的來客反應或書店事件。`StoryBridge` 在首次讀取前寫入變數，之後由 Ink 狀態存檔；舊編譯檔不含該變數時維持原路線。
- 新版為第二至六夜及終章 `*-chapter-3`；原 `*-chapter-1`、`*-chapter-2` JSON 保留。`npm test` 共 12 檔 138 項通過，含 24 種前夜分流、逐節還原及舊版四結局；`npm run validate:ink` 現會驗七夜，8 檔 110 項通過。
- 桌機／手機 Chromium 七夜最佳路線及終章拒絕訪客席路線，單次定向測試 16 項全通過（7.9 分鐘）。第一夜自然完成後進入第二夜，瀏覽器確認新開場台詞對應靜蘭的結局。`npm run build`、`npm run lint`、`git diff --check` 通過；正式 PWA 預快取 147 項、約 9956 KiB。其他 23 種前夜分流由 Ink 狀態測試覆蓋，尚未各自做瀏覽器視覺驗收。

## 每晚開店準備與前夜痕跡（2026-09-25）

- 七夜開始時可整理櫃台、查看夜況及可探索區域、核對八種茶，再開門迎接訪客；三項操作寫進 IndexedDB。第一夜桌機／手機完整路線在準備 2/3 時重載，恢復勾選狀態後才繼續劇情。舊存檔沒有準備欄位時視為已開店，避免原有進度突然被前置流程阻斷。
- 前夜首次完成的章節快照會決定下一夜櫃台痕跡，涵蓋六位訪客每種結局；第一夜〈月光抵達之處〉後，第二夜實際顯示靜蘭留下的痕跡。桌機、手機的開店畫面已目視檢查；手機卡片改為頁面自然捲動，標題與開門按鈕可見。
- `npm run build`、`npm run lint`、`npm test` 通過（11 檔、107 項）；全套 Playwright 首輪 34 項中 33 項通過，手機第三夜在進入設定頁前遇到導覽競態逾時。手機捲動修正後，第一、三夜 2 項重跑通過；標題頁圖示連結加上明確名稱、章節測試改以連結導覽後，手機第三夜與終章 3 項再通過。這些分段結果不等於單次 34 項全綠。

## 七夜交叉線索（2026-09-25）

- 靜蘭離開前聽見校刊室外的四音；柏言母親保存靜蘭的校刊；若音尾牙演出與柏言相遇；葉暖的食譜卡由雨航父親代送；雨航妹妹寄回海明燈塔照片；海明哼出若音與靜蘭聽過的旋律。六項線索均寫入手記，原稿及編譯檔同步更新。
- 新故事版本為 `jinglan-chapter-3`、第二至六夜的 `*-chapter-2`、`lincheng-chapter-2`。原版 Ink JSON 保留，舊第一夜四結局與第二至六夜各四結局逐節還原測試通過。
- 第一夜及第四至六夜的完整最佳路線在桌機與手機 Chromium 共 8 項通過；手記可見新增線索。`npm run build`、`npm run lint`、`npm test` 與 `git diff --check` 通過，單元測試 11 檔、106 項。曾在完整瀏覽器測試並行時遇到一個 5 秒單元測試逾時；瀏覽器測試結束後單獨重跑完整單元測試全數通過。正式 PWA 預快取 140 項、約 9817 KiB。

## 章節場景、拼信鍵盤與隱藏收藏室（2026-09-25）

- 拼信碎片可 Tab 聚焦，方向鍵放入信紙或在格間移動，遇到已佔用格會交換；第一夜桌機／手機完整流程已驗證鍵盤移動及存檔還原。
- 柏言深夜辦公室與終章書架後收藏室各有桌機、手機 WebP 背景。等待場景淡化結束後，桌機／手機 Chromium 四項完整路線通過；已目視檢查 `output/second-night-office-*.png` 及 `output/finale-hidden-room-*.png`，確認實際顯示新背景且文字可讀。
- 收藏室可查看六格信櫃、身高線、停鐘後回到林澄主線；新終章用 `lincheng-chapter-2`，原版編譯檔保留四結局及逐節還原驗證，供既有存檔讀取。
- 海明暴風燈塔桌機／手機場景在守燈後實際呈現；兩條第六夜完整瀏覽器流程通過，已目視檢查 `output/sixth-night-lighthouse-*.png`。終章拒絕訪客席的非最佳結局另外在桌機／手機兩條瀏覽器流程通過，已檢查手機結局畫面與收藏頁。
- 若音童年練習室、葉暖清晨廚房、雨航舊郵局各有桌機／手機獨立背景；第三、四、五夜的六條完整瀏覽器流程通過。等待淡化完成再截圖，已目視檢查 `output/third-night-practice-room-*.png`、`output/fourth-night-bakery-*.png`、`output/fifth-night-post-office-*.png`，沒有以 DOM 路徑存在代替可見畫面。
- 新增背景後第一夜 PWA 離線重載與續讀在桌機、手機 Chromium 2 項通過；正式建置預快取 134 項，約 9660 KiB。此數字是完整快取量，不是單章首次傳輸量。
- `npm run build`、`npm run lint`、`git diff --check` 通過；完整單元測試 11 檔 82 項通過，含舊版終章四結局逐節還原。

## 林澄終章（2026-09-25）

- `npm run build`、`npm run lint`、`npm test` 通過，單元測試 11 檔、77 項，含四種最終結局、逐節還原、六夜地圖、童年四片信與舊存檔預設欄位。
- 桌機／手機 Chromium 的〈天亮以後〉路線 2 項通過：第六夜收藏解鎖、為自己泡茶、六紙地圖中途重載、四片信中途重載、最終結局、手記與收藏。已目視檢查 `output/finale-map-desktop.png`、`output/finale-letter-mobile.png`、`output/finale-ending-mobile.png`，畫面與操作完整可見。
- 其他三種最終結局目前只由 Ink 路徑測試覆蓋，尚未做瀏覽器視覺審核；終章專屬美術與真人閱讀時長仍待補齊。

## 第六夜海明（2026-09-25）

- `npm run build`、`npm run lint`、`npm test` 通過，單元測試 10 檔、69 項，含四結局、各 Ink 節點還原、守燈計分、紙船信原句與修飾判定，以及舊存檔預設值。
- 桌機／手機 Chromium 的第六夜完整路線 2 項通過：解鎖、焙茶、守燈中途重載、原句四片拼頁中途重載、顧川共讀結局、燈塔照片與收藏茶方。已目視檢查 `output/sixth-night-lamp-desktop.png`、`output/sixth-night-letter-mobile.png`、`output/sixth-night-ending-mobile.png`，內容與操作完整可見。
- 其他三結局仍只有 Ink 路徑測試；專屬場景美術與 50–60 分鐘真人閱讀時長未達標。

## 第五夜雨航（2026-09-25）

- `npm run build`、`npm run lint` 與 `npm test` 通過；單元測試 9 檔、61 項涵蓋四結局、每個 Ink 節點還原、三站路線與錯路、四片信、郵票及舊存檔預設值。
- 桌機／手機 Chromium 的第五夜完整路線 2 項通過：從第四夜收藏解鎖、薄荷茶、路線中途重載、四片信與「現在」郵票重載、今日簽收、郵戳線索與收藏茶方。已目視檢查 `output/fifth-night-route-desktop.png`、`output/fifth-night-letter-mobile.png`、`output/fifth-night-ending-mobile.png`，內容與操作可見。
- 首次瀏覽器測試發現茶席沿用「遞給她」文案；改成雨航的「遞給他」後重建並重跑兩裝置通過。其餘三結局仍只有 Ink 路徑測試；專屬場景美術與 45–55 分鐘時長未達標。

## 第四夜葉暖（2026-09-25）

- `npm run build` 通過，Ink 從 `story/chapters/ch04_yenuan.ink` 編譯；`npm test` 8 檔、53 項通過，含四結局、各存檔節點還原、雙面食譜、爐火計分與舊存檔預設值。
- 桌機及手機 Chromium 的第四夜完整路線 2 項通過：解鎖、焙茶、爐火中途重載、食譜正反面拼完再重載、柚子麵包最佳結局、主線線索與收藏茶方。已目視檢查 `output/fourth-night-hearth-desktop.png`、`output/fourth-night-recipe-mobile.png`、`output/fourth-night-ending-mobile.png`，操作與內容均完整可見。
- 全套 Playwright 桌機／手機 Chromium 26 項一次通過（6.7 分鐘）；`npm run lint` 與 `git diff --check` 通過。
- 其他三結局只有 Ink 路徑測試。獨立麵包店／記憶美術、蘋果乾茶席物件、40–50 分鐘真人閱讀時長仍待完成。

## 第三夜若音（2026-09-25）

- `npm run build`、`npm run lint`、`npm test` 通過；單元測試走完四種結局、四段記憶、旋律與雙面信的判定，並檢查每個 Ink 檢查點可還原。
- 桌機與手機 Chromium：薰衣草伯爵茶席、四音輸入與重載、正反兩面拼信與重載、最佳理解結局、手冊第一頁線索和收藏頁通過。執行命令：`npx playwright test tests/e2e/third-night.spec.ts`。
- 已目視檢查桌機正面信與手機背面信截圖，三片信紙、翻面狀態、底部操作均完整顯示。其餘三結局仍只有單元路徑測試，獨立場景美術與小提琴音檔尚未完成。

## 第二夜柏言（2026-09-25）

- `npm run build`、`npm run lint`、`npm test` 通過；單元測試走完第二夜四種結局、三段記憶、四片信紙與中途 Ink 存檔還原。
- 桌機 Chromium：第一夜完整流程後，章節選單解鎖第二夜；第二夜開場可重新載入，第一夜手動存檔仍可讀回。
- 桌機與手機 Chromium：第二夜洋甘菊茶席、四格信、請假就醫結局、收藏頁及信件階段重新載入通過。執行命令：`npx playwright test tests/e2e/second-night.spec.ts`。
- 第二夜其餘三種結局已由 Ink 單元路徑測試覆蓋；尚未做各結局的瀏覽器視覺審核。辦公室、候診區、列車共用既有記憶背景，通知互動目前是文字選項。

2026-09-22，本機 Node 26.7.0，正式 Vite build 與 Playwright Chromium。

## 動態茶湯與單杯完成動畫（目前版本）

- 八種茶分別設定初染、適飲與深色階段，依現有浸泡秒數連續插值；壺中、倒茶水線、杯中與完成演出使用同一個湯色。沒有水或茶葉時維持清水，暫停停止變色，重整由既有存檔欄位還原。
- 新增 4 張清水／灰階液面素材，茶席共 44 個 WebP 狀態；只替液面染色，保留器身、葉片和反光。已目視檢查 `output/tea-infusion-gallery.png` 的八茶 × 三階段對照。
- TeaComplete 改為單杯特寫，只顯示杯碟、蒸氣及柔和背景，六秒內緩慢靠近。MP4／WebM 均為 1280×720、30 fps、6 秒，格式核對與全片解碼通過，大小為 479,968／161,883 bytes；開頭、中段、末格已目視檢查。
- 同鏡頭產生 180 格液面遮罩，裁切圖集 3228×855、348,626 bytes。以影片影格 callback 對齊，支援暫停／seek；海報使用第 0 格，圖集失敗不阻止故事繼續。完成影片的發布命令會一併重建圖集。
- lint、`video:typecheck`、TypeScript／正式 build、29 項單元測試通過。單元測試包含八茶漸深、階段邊界連續、無茶葉／水、存檔還原。遊戲畫面 JS 約 19.32 kB gzip，97 項 PWA 預快取共 5661.47 KiB。
- 最新完整 E2E 單次 12 項通過（3.3 分鐘）：桌機與手機 Chromium 實際操作、湯色隨時間改變、暫停後離線讀檔還原、重泡清水、壺／杯／完成演出顏色一致、影片暫停與 seek 至第 90 格的圖層同步，以及章末流程。已檢查兩種裝置的 `output/tea-completion-mid-*.png`，畫面為單杯特寫。尚未實機驗證 iOS Safari。

## 新水壺與材質增量驗證（先前版本）

- 水壺重建為低矮圓腹、漸細鵝頸壺嘴、獨立蓋、胡桃木握柄與金屬提梁；陶瓷輪廓平滑、細金邊與釉色斑點同步更新。以程序式柔光環境取代原多光斑反射，茶葉增加細葉脈與皺摺。
- 40 張器物素材重建，合計 564,900 bytes，透明度檢查通過；更新壺嘴投影 manifest，19 項單元測試通過，包含 16–75 度接水範圍與水量守恆。
- 茶湯以深淺貼圖、半透明非金屬材質、彎月面與少量細泡呈現，實際茶湯色與標籤色分開；互動水線使用透明漸層與細高光，影片水流加入透光參數。
- 注水及完成影片已重建：四檔皆為 1280×720、30 fps、6 秒，格式驗證及全片解碼通過。注水 MP4／WebM 為 341,145／159,742 bytes；完成段為 1,400,748／586,488 bytes。已目視檢查代表器物、注水中格及完成末格。
- lint、`video:typecheck`、TypeScript／正式 build 通過；遊戲畫面 JS 為 17.04 kB gzip，92 項 PWA 預快取共 6619.47 KiB。Three.js 仍僅用於離線製片，沒有加入遊戲 runtime。
- 單次完整 E2E 10 項通過（2.8 分鐘），涵蓋桌機滑鼠、手機 Chromium 觸控、離線水量恢復、動畫、補救操作、暫停與完整章末流程。已目視檢查本輪桌機／手機茶席截圖。未做 iOS Safari 實機驗證。

## 薄片茶葉增量驗證（先前版本）

- 移除茶罐、茶匙、落葉和壺內茶葉的橢圓球體，改用具葉脈、破口與摺痕的雙面薄片網格；乾葉與泡開葉有不同長寬、曲度及粗糙度。壺內改為不規則散布，SVG 備援同步更換為尖葉輪廓。
- 重新渲染 40 個器物狀態，合計約 648 KiB，透明度檢查通過；已目視檢查開罐、滿匙、壺內泡開茶葉，以及注水中段和完成末格。壺嘴投影 manifest 沒有變動。
- 注水及完成兩段 Remotion 影片重新發布到本機遊戲資產。四檔均為 1280×720、30 fps、6 秒，格式核對及全片解碼通過；注水 MP4／WebM 為 330,464／181,876 bytes，完成段為 1,518,937／692,874 bytes。
- lint、`video:typecheck`、正式 build 與 19 項單元測試通過。遊戲畫面 JS 約 16.88 kB gzip，92 個 PWA 預快取項目合計 6958.95 KiB。
- 單次完整 E2E 10 項通過（2.8 分鐘）：桌機滑鼠／手機 Chromium 觸控、離線重載、完成影片、存讀檔、補救操作與減少動態均通過。已目視檢查本輪 `output/tea-desktop.png`、`output/tea-mobile.png`；未做 iOS Safari 實機驗證。

## 3D 茶具增量驗證（先前版本）

- 40 個 3D WebP 狀態已實際渲染，合計約 639 KiB；每個來源都檢查同時存在透明背景及不透明器物像素。八種釉色、開／關罐、空／有茶杯壺與茶匙狀態均已輸出，manifest 保存顯示範圍及實際壺嘴投影。
- 共用模型重建注水及完成兩段 Remotion 影片。MP4 / WebM 均為 1280×720、30 fps、6 秒，逐檔格式核對及全片解碼通過；完成段約 1.48 / 0.70 MiB，注水段約 320 / 177 KiB。
- 根目錄 lint、typecheck／build、`video:typecheck`、19 項單元測試通過。16–75 度接水測試改用新模型實際投影，維持原有倒水規則。
- 本輪單次完整 E2E 10 項通過（約 2.8 分鐘），包含八個 3D 茶罐載入、桌機滑鼠及手機觸控完整流程、離線水量還原、完成動畫與章末結局、鍵盤、失手補救、減少動態和影片略過。
- 已目視檢查桌機／手機的 `output/tea-desktop.png`、`output/tea-mobile.png`，以及完成動畫末格。遊戲 JS 約 16.73 KiB gzip，PWA 共 92 個預快取項目、約 6.86 MiB；Three.js 仍只在製片與資產工具使用。
- 茶席是使用 3D 預渲染素材的可拖曳場景，沒有自由 3D 攝影機；精確水量由百分比與水流顯示，器物圖以空／有茶狀態切換。手機為 Chromium 模擬，未做 iOS Safari 實機驗證。

## 茶完成動畫增量驗證（先前版本）

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
