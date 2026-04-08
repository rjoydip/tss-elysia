/**
 * Unit tests for status store actions and state transitions.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "bun:test";
import {
  canTriggerManualRefresh,
  checkStatusHealth,
  getManualRefreshCooldownRemainingMs,
  otherStatusServices,
  refreshStatusHealth,
  statusServices,
  statusStore,
} from "../../../src/lib/store/status";

/**
 * Restores status store to its deterministic baseline for isolated test execution.
 */
function resetStatusStore(): void {
  statusStore.setState(() => ({
    serviceStatuses: statusServices.map((service) => ({
      name: service.name,
      status: "loading",
      responseTime: null,
      lastChecked: null,
    })),
    otherServiceStatuses: otherStatusServices.map((service) => ({
      name: service.name,
      status: service.heartbeatUrl ? "unknown" : "degraded",
      lastUpdated: null,
      tooltip: service.defaultTooltip,
      latencyMs: null,
    })),
    isRefreshing: false,
    lastRefreshSuccessful: null,
    lastManualRefreshAt: null,
  }));
}

describe("status store", () => {
  beforeEach(() => {
    resetStatusStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetStatusStore();
  });

  it("should initialize with loading state for all status services", () => {
    expect(statusStore.state.serviceStatuses).toHaveLength(statusServices.length);
    expect(statusStore.state.serviceStatuses.every((service) => service.status === "loading")).toBe(
      true,
    );
    const databaseStatus = statusStore.state.otherServiceStatuses.find(
      (service) => service.name === "Database",
    );
    expect(databaseStatus?.status).toBe("unknown");
    expect(statusStore.state.isRefreshing).toBe(false);
    expect(statusStore.state.lastRefreshSuccessful).toBeNull();
    expect(statusStore.state.lastManualRefreshAt).toBeNull();
  });

  it("should mark all services up when every health endpoint succeeds", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const requestUrl = String(input);
      if (requestUrl.includes("/api/database/heartbeat")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              status: "healthy",
              detail: "Database heartbeat query succeeded",
              timestamp: new Date().toISOString(),
            }),
            { status: 200 },
          ),
        );
      }
      return Promise.resolve(new Response(JSON.stringify({ status: "healthy" }), { status: 200 }));
    });

    await checkStatusHealth();

    expect(fetchMock).toHaveBeenCalledTimes(statusServices.length + 1);
    expect(statusStore.state.serviceStatuses.every((service) => service.status === "up")).toBe(
      true,
    );
    const databaseStatus = statusStore.state.otherServiceStatuses.find(
      (service) => service.name === "Database",
    );
    expect(databaseStatus?.status).toBe("operational");
    expect(statusStore.state.lastRefreshSuccessful).toBe(true);
    expect(statusStore.state.isRefreshing).toBe(false);
  });

  it("should mark failed services down when fetch rejects", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    fetchMock.mockImplementation((input) => {
      const requestUrl = String(input);
      if (requestUrl.includes("/api/auth/health")) {
        return Promise.reject(new Error("network failure"));
      }
      if (requestUrl.includes("/api/database/heartbeat")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              status: "unhealthy",
              detail: "SQLite instance is not initialized",
              timestamp: new Date().toISOString(),
            }),
            { status: 503 },
          ),
        );
      }
      return Promise.resolve(new Response(JSON.stringify({ status: "healthy" }), { status: 200 }));
    });

    await checkStatusHealth();

    const authService = statusStore.state.serviceStatuses.find(
      (service) => service.name === "Auth API",
    );
    expect(authService?.status).toBe("down");
    expect(authService?.error).toBe("Connection failed");
    const databaseStatus = statusStore.state.otherServiceStatuses.find(
      (service) => service.name === "Database",
    );
    expect(databaseStatus?.status).toBe("outage");
    expect(statusStore.state.lastRefreshSuccessful).toBe(false);
    expect(statusStore.state.isRefreshing).toBe(false);
  });

  it("should trigger health check from refreshStatusHealth helper", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const requestUrl = String(input);
      if (requestUrl.includes("/api/database/heartbeat")) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              status: "healthy",
              detail: "Database heartbeat query succeeded",
              timestamp: new Date().toISOString(),
            }),
            { status: 200 },
          ),
        );
      }
      return Promise.resolve(new Response(JSON.stringify({ status: "healthy" }), { status: 200 }));
    });

    const triggered = refreshStatusHealth();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(triggered).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(statusServices.length + 1);
  });

  it("should block refresh while a check is already in progress", () => {
    statusStore.setState((prev) => ({ ...prev, isRefreshing: true }));

    const triggered = refreshStatusHealth();

    expect(triggered).toBe(false);
    expect(canTriggerManualRefresh()).toBe(false);
  });

  it("should block rapid refresh calls during cooldown window", () => {
    const now = Date.now();
    statusStore.setState((prev) => ({ ...prev, lastManualRefreshAt: now }));

    const triggered = refreshStatusHealth(now + 1000);
    const remainingMs = getManualRefreshCooldownRemainingMs(now + 1000);

    expect(triggered).toBe(false);
    expect(remainingMs).toBeGreaterThan(0);
  });

  it("should handle database heartbeat network or runtime failure gracefully", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    fetchMock.mockImplementation((input) => {
      const requestUrl = String(input);
      if (requestUrl.includes("/api/database/heartbeat")) {
        return Promise.resolve(new Response("Malformed non-json data", { status: 500 }));
      }
      return Promise.resolve(new Response(JSON.stringify({ status: "healthy" }), { status: 200 }));
    });

    await checkStatusHealth();

    const databaseStatus = statusStore.state.otherServiceStatuses.find(
      (service) => service.name === "Database",
    );
    expect(databaseStatus?.status).toBe("outage");
    expect(databaseStatus?.tooltip).toBe(
      "Database heartbeat request failed or returned invalid data.",
    );
  });
});