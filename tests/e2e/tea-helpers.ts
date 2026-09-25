import { expect, type Page } from "@playwright/test";
import {
  tableLayout,
  pourAnchor,
  type Point,
} from "../../src/services/teaInteraction";
export async function geometry(page: Page) {
  const board = page.locator(".tea-board");
  await board.scrollIntoViewIfNeeded();
  const box = (await board.boundingBox())!;
  const layout = tableLayout(box.width < 600);
  return {
    layout,
    at: (p: Point) => ({
      x: box.x + (p.x / layout.width) * box.width,
      y: box.y + (p.y / layout.height) * box.height,
    }),
  };
}
export async function drag(page: Page, from: Point, to: Point, touch = false) {
  const { at } = await geometry(page);
  const a = at(from),
    b = at(to);
  if (touch) {
    const session = await page.context().newCDPSession(page);
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [a],
    });
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [b],
    });
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await session.detach();
  } else {
    await page.mouse.move(a.x, a.y);
    await page.mouse.down();
    await page.mouse.move(b.x, b.y, { steps: 10 });
    await page.mouse.up();
  }
}
export async function prepareLeaves(page: Page, touch = false, tea = 0) {
  const { layout: l } = await geometry(page);
  await drag(page, l.jarSlot(tea), l.jar, touch);
  await drag(
    page,
    { x: l.jar.x, y: l.jar.y - 43 },
    { x: l.jar.x + 100, y: l.jar.y + 10 },
    touch,
  );
  for (let i = 0; i < 3; i++) {
    await drag(page, l.spoon, l.jar, touch);
    await drag(page, l.spoon, l.pot, touch);
  }
  await expect(page.locator(".tea-board")).toHaveAttribute("data-leaves", "3");
}
export async function pour(
  page: Page,
  kind: "kettle" | "pot",
  amount: number,
  touch = false,
) {
  const { layout: l, at } = await geometry(page);
  const target = kind === "kettle" ? l.pot : l.cup;
  const resting = pourAnchor(target, kind);
  const start = at(l[kind]),
    anchor = at(resting),
    tilted = at({ x: resting.x + 90, y: resting.y });
  const session = touch ? await page.context().newCDPSession(page) : null;
  if (session) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [start],
    });
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [anchor],
    });
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [tilted],
    });
  } else {
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(anchor.x, anchor.y);
    await page.mouse.move(tilted.x, tilted.y, { steps: 10 });
  }
  await expect
    .poll(
      async () =>
        Number(
          await page
            .locator(".tea-board")
            .getAttribute(kind === "kettle" ? "data-water" : "data-cup"),
        ),
      { intervals: [100] },
    )
    .toBeGreaterThanOrEqual(amount);
  if (session) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await session.detach();
  } else await page.mouse.up();
}
export async function steepAndServe(page: Page, touch = false, recipient = "她") {
  const { layout: l } = await geometry(page);
  await drag(page, l.lid, l.pot, touch);
  await expect
    .poll(
      async () =>
        Number(await page.locator(".tea-board").getAttribute("data-seconds")),
      { timeout: 25000, intervals: [100] },
    )
    .toBeGreaterThanOrEqual(43);
  await pour(page, "pot", 28, touch);
  await page.getByRole("button", { name: `將茶遞給${recipient}`, exact: true }).click();
}
