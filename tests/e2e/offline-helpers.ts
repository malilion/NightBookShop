import type { BrowserContext } from "@playwright/test";

/**
 * Playwright's WebKit refuses even service-worker responses while the context is
 * offline, so WebKit runs keep the network on here and still check what a reload
 * restores. webkit-offline.spec.ts proves Safari's offline play by stopping a server.
 */
export async function setOffline(context: BrowserContext, offline: boolean) {
  if (context.browser()?.browserType().name() !== "webkit") await context.setOffline(offline);
}
