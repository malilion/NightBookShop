import { expect, type Page } from "@playwright/test";

export async function prepareOpening(page: Page) {
  const opening = page.getByRole("region", { name: "每晚開店準備" });
  await expect(opening).toBeVisible();
  for (const task of ["整理櫃台", "查看夜況", "備好茶具"])
    await opening.getByRole("button", { name: new RegExp(task) }).click();
  await expect(opening).toContainText("已準備 3/3 項");
  await opening.getByRole("button", { name: "開門迎接今晚的訪客" }).click();
  await expect(opening).not.toBeVisible();
}
