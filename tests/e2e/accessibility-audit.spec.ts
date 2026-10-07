import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { newLetter, newTea, snapshotSchema, STORY_VERSION, type StoryFrame, type TeaId } from "../../src/types/game";
import { playTo } from "../storyWalk";
import { lowContrastText } from "./contrast-helpers";
import { appReady } from "./app-ready";

// Every chapter, every kind of screen: WCAG 2.1 AA by axe, and text contrast
// measured against the rendered artwork. Reports land in output/a11y/.
const chapters = [
  { id: "jinglan", file: "main.json", version: STORY_VERSION, tea: "osmanthus", minigame: null },
  { id: "boyan", file: "boyan-chapter-25.json", version: "boyan-chapter-25", tea: "chamomile", minigame: "notifications" },
  { id: "ruoyin", file: "ruoyin-chapter-25.json", version: "ruoyin-chapter-25", tea: "lavender", minigame: "melody" },
  { id: "yenuan", file: "yenuan-chapter-23.json", version: "yenuan-chapter-23", tea: "hojicha", minigame: "hearth" },
  { id: "yuhang", file: "yuhang-chapter-25.json", version: "yuhang-chapter-25", tea: "mint", minigame: "route" },
  { id: "haiming", file: "haiming-chapter-29.json", version: "haiming-chapter-29", tea: "hojicha", minigame: "lamp" },
  { id: "lincheng", file: "lincheng-chapter-20.json", version: "lincheng-chapter-20", tea: "osmanthus", minigame: "archive" },
] as const;

type Screen = { name: string; reached: (frame: StoryFrame) => boolean };
const screens = (minigame: string | null): Screen[] => [
  { name: "對話", reached: (frame) => frame.mode === "dialogue" && frame.text.length > 0 },
  { name: "選項", reached: (frame) => frame.mode === "dialogue" && frame.choices.length > 1 },
  { name: "記憶", reached: (frame) => frame.mode === "dialogue" && frame.scene === "memory" },
  { name: "茶席", reached: (frame) => frame.mode === "tea" },
  ...(minigame ? [{ name: "小遊戲", reached: (frame: StoryFrame) => frame.mode === minigame }] : []),
  { name: "拼信", reached: (frame) => frame.mode === "letter" },
  { name: "結局", reached: (frame) => frame.mode === "ending" },
];

async function open(page: Page, snapshot: unknown) {
  await page.goto("/");
  await appReady(page);
  await page.evaluate(async (saved) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("night-bookshop");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction("saves", "readwrite");
        transaction.objectStore("saves").put({ id: "auto-1", kind: "auto", updatedAt: new Date().toISOString(), snapshot: saved });
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        transaction.onerror = () => reject(transaction.error);
      };
    });
  }, snapshot);
  await page.goto("/");
  await page.getByRole("button", { name: "繼續故事" }).click();
  await expect(page.locator("main")).toBeVisible();
  await page.waitForLoadState("networkidle");
}

type Finding = { screen: string; rule: string; impact: string | null; targets: string[] } | { screen: string; contrast: unknown };
async function audit(page: Page, screen: string, findings: Finding[]) {
  for (const item of await lowContrastText(page)) findings.push({ screen, contrast: item });
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .disableRules(["color-contrast"])
    .analyze();
  for (const rule of result.violations)
    findings.push({ screen, rule: rule.id, impact: rule.impact ?? null, targets: rule.nodes.map((node) => node.target.join(" ")) });
}

async function setPreferences(page: Page, preferences: { highContrast?: boolean; largeText?: boolean }) {
  await page.goto("/#/settings");
  await page.getByRole("combobox", { name: /對話文字速度/ }).selectOption("instant");
  for (const [name, on] of [["高對比閱讀", preferences.highContrast], ["放大故事文字", preferences.largeText]] as const) {
    const toggle = page.getByRole("switch", { name: new RegExp(name) });
    if (on) await toggle.check();
    else await toggle.uncheck();
  }
}

function report(name: string, project: string, findings: Finding[]) {
  mkdirSync("output/a11y", { recursive: true });
  writeFileSync(`output/a11y/${name}-${project}.json`, JSON.stringify(findings, null, 1));
}

test("menus, settings and the collection meet WCAG AA", async ({ page }, info) => {
  const findings: Finding[] = [];
  for (const preferences of [{}, { highContrast: true }, { largeText: true }]) {
    const mode = Object.keys(preferences)[0] ?? "default";
    await setPreferences(page, preferences);
    await audit(page, `${mode}：設定`, findings);
    for (const [path, name] of [["/", "首頁"], ["/#/chapters", "章節選單"], ["/#/collection", "收藏"]] as const) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await audit(page, `${mode}：${name}`, findings);
    }
  }
  report("menus", info.project.name, findings);
  expect(findings).toEqual([]);
});

for (const chapter of chapters) {
  test(`every ${chapter.id} screen meets WCAG AA`, async ({ page }, info) => {
    test.setTimeout(600_000);
    const json = readFileSync(`public/story/compiled/${chapter.file}`, "utf8");
    const findings: Finding[] = [];
    // The first night is also checked with high contrast and large text on.
    const modes = chapter.id === "jinglan" ? [{}, { highContrast: true }, { largeText: true }] : [{}];
    for (const preferences of modes) {
      const mode = Object.keys(preferences)[0] ?? "default";
      await setPreferences(page, preferences);
      for (const screen of screens(chapter.minigame)) {
        const story = playTo(json, chapter.tea as TeaId, [], screen.reached);
        if (!story) throw new Error(`${chapter.id} never reached ${screen.name}`);
        await open(page, snapshotSchema.parse({
          version: 1,
          storyVersion: chapter.version,
          inkState: story.serialize(),
          frame: story.frame,
          tea: newTea(),
          letter: newLetter(),
        }));
        await audit(page, `${mode}：${screen.name}`, findings);
      }
    }
    report(chapter.id, info.project.name, findings);
    expect(findings).toEqual([]);
  });
}
