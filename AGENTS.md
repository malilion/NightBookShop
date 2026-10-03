# 給 AI 代理

接手前先讀 [docs/HANDOFF.md](docs/HANDOFF.md)：專案現況、改劇情時的升版流程、測試陷阱與待辦都在那裡。

- 劇情唯一來源是 `story/`；`public/story/compiled/` 的 JSON 由 `npm run build:ink` 產生，不手改，舊版本不可刪。
- 改了 Ink 結構就要升 storyVersion，並保留舊 JSON 讓舊存檔可讀。
- 每次改動在 `docs/PRD_GAP_AUDIT.md` 最上方與 `docs/VERIFICATION.md` 最後各記一段。
