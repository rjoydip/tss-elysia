import { beforeAll, describe, it, expect } from "bun:test";
import {
  getCurrentVersion,
  recordVersion,
  compareVersions,
  isNewerVersion,
  isOlderVersion,
} from "../../src/lib/db/versioning";

describe("Versioning & Schema Management", () => {
  beforeAll(async () => {
    // Just ensure functions exist
    expect(getCurrentVersion).toBeDefined();
    expect(recordVersion).toBeDefined();
    expect(compareVersions).toBeDefined();
    expect(isNewerVersion).toBeDefined();
    expect(isOlderVersion).toBeDefined();
  });

  it("has getCurrentVersion function", () => {
    expect(typeof getCurrentVersion).toBe("function");
  });

  it("has recordVersion function", () => {
    expect(typeof recordVersion).toBe("function");
  });

  it("compares semantic versions correctly", () => {
    expect(compareVersions("1.0.0", "1.0.1")).toBe(-1);
    expect(compareVersions("2.0.0", "1.9.9")).toBe(1);
    expect(compareVersions("1.2.3", "1.2.3")).toBe(0);
    expect(isNewerVersion("1.0.0", "1.1.0")).toBeTrue();
    expect(isOlderVersion("1.2.0", "1.1.0")).toBeTrue();
  });
});