import { beforeAll, describe, it, expect } from "bun:test";
import {
  recordHealthCheck,
  getHealthCheckHistory,
  evaluateAlertRules,
} from "../../src/lib/db/monitor";

describe("Monitoring & Alerts Integration", () => {
  beforeAll(async () => {
    // Just ensure the module loads
    expect(recordHealthCheck).toBeDefined();
    expect(getHealthCheckHistory).toBeDefined();
    expect(evaluateAlertRules).toBeDefined();
  });

  it("has health check function", async () => {
    expect(typeof recordHealthCheck).toBe("function");
  });

  it("has get health check history function", async () => {
    expect(typeof getHealthCheckHistory).toBe("function");
  });

  it("has evaluate alert rules function", async () => {
    expect(typeof evaluateAlertRules).toBe("function");
  });
});