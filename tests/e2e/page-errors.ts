import type { Page } from "@playwright/test";

// When a reload cuts off in-flight fetches, WebKit reports each one (and the
// stopped document) as a page error even though the app catches them.
const webkitTeardown = [/ due to access control checks\.$/, /^Context is stopped$/];

/** Collects uncaught page errors into `errors`, minus WebKit's reload teardown noise. */
export function collectPageErrors(page: Page, errors: string[]) {
  const webkit = page.context().browser()?.browserType().name() === "webkit";
  page.on("pageerror", (error) => {
    if (webkit && webkitTeardown.some((pattern) => pattern.test(error.message))) return;
    errors.push(error.message);
  });
}
