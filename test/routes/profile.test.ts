import { describe, expect, it } from "bun:test";

describe("Profile Route", () => {
  it("should export a Route object", async () => {
    const { Route } = await import("../../src/routes/profile");
    expect(Route).toBeDefined();
    expect(Route).not.toBeNull();
  });
});