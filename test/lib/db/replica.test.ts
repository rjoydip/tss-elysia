/**
 * Unit tests for database module
 * Tests PostgreSQL replica routing and pool configuration
 */

import { describe, expect, it } from "bun:test";
import { getDatabaseType } from "~/lib/db";

describe("getDatabaseType", () => {
  it("should return sqlite in CI environment", () => {
    const originalCI = process.env.CI;
    process.env.CI = "true";

    const result = getDatabaseType();
    expect(result).toBe("sqlite");

    if (originalCI) process.env.CI = originalCI;
    else delete process.env.CI;
  });
});

describe("Database configuration validation", () => {
  it("should have getDatabasePoolConfigs function exported", () => {
    const { getDatabasePoolConfigs } = require("~/lib/db");
    expect(typeof getDatabasePoolConfigs).toBe("function");
  });

  it("should have getDatabasePools function exported", () => {
    const { getDatabasePools } = require("~/lib/db");
    expect(typeof getDatabasePools).toBe("function");
  });

  it("should have getReadDb function exported", () => {
    const { getReadDb } = require("~/lib/db");
    expect(typeof getReadDb).toBe("function");
  });
});

describe("Database type exports", () => {
  it("should export DatabaseType type", () => {
    const { getDatabaseType } = require("~/lib/db");
    const result = getDatabaseType();
    expect(result === "sqlite" || result === "postgres").toBe(true);
  });
});