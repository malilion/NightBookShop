import type { Page } from "@playwright/test";

export async function smallTargets(page: Page) {
  return page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("button, a, input, select, summary, [role='button']")]
      .filter((element) => {
        const style = getComputedStyle(element);
        if (element.classList.contains("skip-link") && !element.matches(":focus")) return false;
        const label = element.closest("label");
        if (label && ["checkbox", "radio"].includes(element.getAttribute("type") ?? "")) {
          const labelRect = label.getBoundingClientRect();
          if (labelRect.width >= 44 && labelRect.height >= 44) return false;
        }
        return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { label: element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 35) || element.getAttribute("type") || element.tagName, width: Math.round(rect.width), height: Math.round(rect.height) };
      })
      .filter((target) => target.width < 44 || target.height < 44),
  );
}
