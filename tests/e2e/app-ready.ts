import type { Page } from "@playwright/test";

// 遊戲完成初始化（Dexie 已建好資料表）才離開載入畫面。直接用原生 IndexedDB
// 寫入存檔或收藏前要先等這一步：若搶在前面開啟 "night-bookshop"，會建出沒有
// 資料表的空資料庫，寫入失敗或被之後的升級蓋掉，測試偶爾才失敗。
export async function appReady(page: Page) {
  await page.locator("#main:not(.loading-page)").first().waitFor();
}
