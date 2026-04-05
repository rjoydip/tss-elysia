import { describe, expect, it } from "bun:test";

describe("Settings Route", () => {
  it("should export a Route object", async () => {
    const { Route } = await import("../../src/routes/settings");
    expect(Route).toBeDefined();
    expect(Route).not.toBeNull();
  });
});