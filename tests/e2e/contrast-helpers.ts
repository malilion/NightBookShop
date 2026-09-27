import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import sharp from "sharp";

// axe cannot judge text drawn over artwork or gradients and reports it as
// "incomplete". For those elements, hide all text, photograph what lies behind
// each one, and measure the real contrast against the rendered pixels.
const luminance = (rgb: number[]) => {
  const channel = (value: number) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb[0]!) + 0.7152 * channel(rgb[1]!) + 0.0722 * channel(rgb[2]!);
};
const contrast = (a: number[], b: number[]) => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

export type LowContrast = { text: string; selector: string; ratio: number; required: number };

/** Text on the current screen whose worst 10% of background falls below WCAG AA. */
export async function lowContrastText(page: Page): Promise<LowContrast[]> {
  // Measure settled screens, not text halfway through a fade-in.
  await page.waitForFunction(() => document.getAnimations().every((animation) => animation.playState !== "running" || animation.effect?.getTiming().iterations === Infinity));
  const result = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
  const low: LowContrast[] = result.violations.flatMap((rule) =>
    rule.nodes.map((node) => {
      const data = node.any[0]?.data as { contrastRatio?: number; expectedContrastRatio?: string } | undefined;
      return { text: node.html.slice(0, 40), selector: node.target.join(" "), ratio: data?.contrastRatio ?? 0, required: Number.parseFloat(data?.expectedContrastRatio ?? "4.5") };
    }),
  );
  const selectors = result.incomplete.flatMap((rule) => rule.nodes.map((node) => node.target.join(" ")));
  const items = await page.evaluate((list) => list.map((selector) => {
    const element = document.querySelector<HTMLElement>(selector);
    if (!element) return null;
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    let opacity = 1;
    for (let node: HTMLElement | null = element; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity);
    const [r, g, b, a = 1] = style.color.match(/[\d.]+/g)!.map(Number);
    const size = parseFloat(style.fontSize);
    return {
      selector,
      text: (element.innerText ?? element.textContent ?? "").trim().slice(0, 40),
      color: [r!, g!, b!],
      alpha: a * opacity,
      x: box.x + window.scrollX,
      y: box.y + window.scrollY,
      width: box.width,
      height: box.height,
      large: size >= 24 || (Number(style.fontWeight) >= 700 && size >= 18.66),
    };
  }), selectors);
  const hidden = await page.addStyleTag({
    content: "*{color:transparent!important;text-shadow:none!important;caret-color:transparent!important}svg text{fill:transparent!important}",
  });
  const shot = await page.screenshot({ fullPage: true, animations: "disabled" });
  await hidden.evaluate((tag) => (tag as Element).remove());
  const image = sharp(shot);
  const { width = 0, height = 0 } = await image.metadata();
  const pixels = await image.removeAlpha().raw().toBuffer();
  const scale = width / (await page.evaluate(() => document.documentElement.scrollWidth));
  for (const item of items) {
    if (!item?.text || item.width < 1 || item.height < 1 || item.alpha === 0) continue;
    const ratios: number[] = [];
    for (let py = Math.floor(item.y * scale); py < (item.y + item.height) * scale && py < height; py += 2)
      for (let px = Math.floor(item.x * scale); px < (item.x + item.width) * scale && px < width; px += 2) {
        if (px < 0 || py < 0) continue;
        const at = (py * width + px) * 3;
        const background = [pixels[at]!, pixels[at + 1]!, pixels[at + 2]!];
        const text = item.color.map((c, k) => c * item.alpha + background[k]! * (1 - item.alpha));
        ratios.push(contrast(text, background));
      }
    if (!ratios.length) continue;
    ratios.sort((a, b) => a - b);
    const ratio = ratios[Math.floor(ratios.length * 0.1)]!;
    const required = item.large ? 3 : 4.5;
    if (ratio < required) low.push({ text: item.text, selector: item.selector, ratio: Math.round(ratio * 100) / 100, required });
  }
  return low;
}
