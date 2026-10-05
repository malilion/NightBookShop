import { expect, test } from "@playwright/test";

// 發行檢查：「關於」頁、版本資訊、第三方授權與正式站的安全標頭。
test("about page shows the build and links the third-party licences", async ({ page, request }) => {
  const response = await page.goto("/");
  expect(response?.headers()["content-security-policy"]).toContain("script-src 'self'");
  await page.getByRole("link", { name: "關於" }).click();
  await expect(page.getByRole("heading", { name: "關於這間書店" })).toBeVisible();
  const version = await (await request.get("/version.json")).json();
  await expect(page.locator(".about-list")).toContainText(version.version);
  await expect(page.getByText("以 AI 圖像生成工具")).toBeVisible();
  await expect(page.getByText("不會上傳")).toBeVisible();
  const licences = await request.get("/THIRD_PARTY_LICENSES.txt");
  expect(licences.ok()).toBe(true);
  expect(await licences.text()).toContain("vue@");
  expect(version.storyVersions).toHaveLength(7);
});
