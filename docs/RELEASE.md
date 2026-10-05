# 發行與部署

《夜行書店》是純靜態網站（`dist/`），沒有後端。正式站預設使用 **Vercel**（技術架構 §1、§3 列的 Vercel／Cloudflare Pages 之一；`.gitignore` 已有 `.vercel`）。Cloudflare Pages 或 Netlify 也能直接用同一份 `dist/`，建置時會一併產生它們讀的 `_headers`。

## 每次建置產生什麼

`npm run build` 依序執行：編譯 Ink → 型別檢查 → Vite 建置 → 效能預算 → `scripts/release-manifest.mjs`。最後一步寫入：

| 檔案 | 內容 |
| --- | --- |
| `dist/version.json` | 版本、提交（有未提交改動時加 `-dirty`）、建置時間、七章目前的故事版本、檔案數與總大小 |
| `dist/asset-manifest.json` | 每個發行檔案的大小與 SHA-256，用來比較兩次發行的差異 |
| `dist/THIRD_PARTY_LICENSES.txt` | 打包進遊戲的開放原始碼套件授權全文（遊戲內「關於」頁連結） |
| `dist/_headers` | Cloudflare Pages／Netlify 的安全與快取標頭 |

遊戲內「關於」頁（`/#/about`，首頁與設定頁都有入口）顯示版本與提交、製作方式（含 AI 生成美術的揭露）、隱私說明與授權連結。

## HTTP 標頭

單一來源是 `deploy/headers.mjs`：

- **CSP**：只允許自己的網域載入程式；`style-src 'unsafe-inline'` 是 Vue 的 `:style` 綁定需要，`data:`、`blob:` 給 Howler 的手機音訊解鎖與製茶影片。本機 `vite preview` 套用同一組，所以全部 E2E 都在正式 CSP 下執行。
- **快取**：`/assets/*` 帶雜湊，快取一年；`index.html`、`tea.html`、`sw.js`、`/story/*` 每次確認新版；圖片、聲音、影片快取一天並允許背景更新（換內容時請照慣例改檔名版本號，如 `-v2`）。

改標頭時改 `deploy/headers.mjs`，再重新產生 `vercel.json`：

```bash
node -e 'import("./deploy/headers.mjs").then(m=>{const f=require("fs");const v=JSON.parse(f.readFileSync("vercel.json","utf8"));v.headers=m.vercelHeaders();f.writeFileSync("vercel.json",JSON.stringify(v,null,2)+"\n")})'
```

`tests/unit/deploy-headers.test.ts` 會檢查兩者一致。

## CI（`.github/workflows/ci.yml`）

| 觸發 | 執行 |
| --- | --- |
| Pull request | lint、Ink 驗證、單元測試、正式建置；再以建置產物跑關鍵流程 E2E（第一夜、玩法系統、收藏、聲音、無障礙稽核，桌機＋手機 Chromium） |
| 推到 `main`、每週日 | 同上的檢查，加上完整 Chromium E2E（桌機＋手機） |
| 手動（Run workflow） | 可另選 WebKit（Safari 引擎）、Firefox 或全部 |

建置產物以 `dist` artifact 保留 14 天。

## 第一次上線（需要你的帳號）

1. 把 `main` 推到 GitHub（`origin` 為 `malilion/NightBookShop`）。
2. 到 Vercel 匯入這個 repo。`vercel.json` 已指定 `npm ci`、`npm run build` 與輸出目錄 `dist`；Node 版本由 `package.json` 的 `engines`（>=22.12）決定。
3. 之後每個 PR 自動有預覽網址，合併到 `main` 即部署正式站。
4. 在 GitHub 的 branch protection 把 CI 的 `check` 設為必過，避免未通過的提交進入 `main`。
5. （可選）綁定自訂網域；PWA 的快取以網域為單位，換網域後玩家的本機存檔不會跟著移動，正式網域最好一開始就定好。

## 每次發行

1. 確認 CI 在 `main` 全綠；大改動另手動跑 WebKit 與 Firefox。
2. 視改動調整 `package.json` 的 `version`（「關於」頁與 `version.json` 會顯示）。
3. 合併後 Vercel 自動部署。開啟正式站的 `/version.json`，確認提交與故事版本正確。
4. 已安裝的 PWA 會在下次開啟時看到「新的一頁已準備好」，玩家按下前遊戲會先存檔，並另存一份「更新前備份」。

## 回退

Vercel 保留每次部署：在 Deployments 頁選前一個正式版本按 **Promote to Production**（Instant Rollback），不需重新建置。用 `asset-manifest.json` 比對兩個版本差了哪些檔案。

故事 JSON 的舊版本永遠保留在 `public/story/compiled/`，所以回退後新版建立的存檔仍可讀；但若新版升了存檔格式（`SAVE_VERSION`），舊版會拒讀那些存檔（不刪除），重新部署新版即可恢復。

## 發行前的人工關卡

這些無法由程式完成，發行前逐項確認：

- [ ] 素材權利與 AI 揭露、Remotion 授權、作品授權與製作者署名（[ASSET_LICENSES.md](ASSET_LICENSES.md)「發行前需由人確認」）。
- [ ] 「關於」頁的製作說明與署名用語。
- [ ] 作者確認 [CONTENT_REVIEW.md](CONTENT_REVIEW.md) 第二輪的劇情與用字修正符合原意。
- [ ] 真人閱讀計時（各章 35–60 分鐘）。
- [ ] 實機 iPhone Safari、Android Chrome 與 VoiceOver／TalkBack（[DEVICE_QA.md](DEVICE_QA.md)）。
- [ ] 選定正式網域。
