import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { netlifyHeaders, securityHeaders, vercelHeaders } from "../../deploy/headers.mjs";

describe("deploy headers", () => {
  it("keeps vercel.json in step with deploy/headers.mjs", () => {
    const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
    expect(vercel.headers).toEqual(vercelHeaders());
    expect(vercel.outputDirectory).toBe("dist");
  });
  it("never caches the service worker or the story, and caches hashed bundles for good", () => {
    const headers = netlifyHeaders();
    expect(headers).toMatch(/\/sw\.js\n {2}Cache-Control: no-cache/);
    expect(headers).toMatch(/\/story\/\*\n {2}Cache-Control: no-cache/);
    expect(headers).toMatch(/\/assets\/\*\n {2}Cache-Control: public, max-age=31536000, immutable/);
  });
  it("allows only the game's own origin for scripts", () => {
    expect(securityHeaders["Content-Security-Policy"]).toContain("script-src 'self';");
    expect(securityHeaders["Content-Security-Policy"]).not.toContain("unsafe-eval");
  });
});
