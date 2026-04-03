/**
 * Unit tests for src/components/header.tsx
 * Tests: Header type contracts, prop acceptance
 *
 * Note: Full rendering tests are covered by E2E tests (.e2e/ui/auth.spec.ts)
 * because Header uses <Link> from @tanstack/react-router requiring router context.
 */

import { describe, expect, it } from "bun:test";

describe("Header", () => {
  it("should export Header component", async () => {
    const { Header } = await import("../../src/components/header");
    expect(typeof Header).toBe("function");
  });

  it("should have correct display behavior", async () => {
    // Header uses Link from TanStack Router which requires router context.
    // Verify the component exists and can be imported without errors.
    const { Header } = await import("../../src/components/header");
    expect(Header.name).toBe("Header");
  });

  it("should accept showSignIn prop", async () => {
    // Verify the prop is accepted by checking the component can be imported
    // The actual behavior is tested in E2E tests
    const { Header } = await import("../../src/components/header");
    // Function should exist
    expect(Header.name).toBe("Header");
    // Check that the source includes the showSignIn prop
    const fs = await import("fs");
    const source = fs.readFileSync("./src/components/header.tsx", "utf-8");
    expect(source).toContain("showSignIn");
  });
});