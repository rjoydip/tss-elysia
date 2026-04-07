/**
 * Status page store.
 * Centralizes health dashboard state and actions using TanStack Store.
 */

import { createStore, useStore } from "@tanstack/react-store";
import { statusPageConfig } from "~/config";

/**
 * Health card status model used by the status page.
 */
export interface HealthStatus {
  name: string;
  status: "loading" | "up" | "down";
  responseTime: number | null;
  lastChecked: Date | null;
  detail?: string;
  error?: string;
}

/**
 * External dependency status model used by the "Other Services" section.
 */
export interface OtherServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage" | "unknown";
  lastUpdated: string | null;
  tooltip: string;
}

/**
 * HTTP health endpoints monitored by the status page.
 */
export const statusServices = [
  {
    name: "Core API",
    url: "/api/health",
    description: "Main API health check",
  },
  {
    name: "Auth API",
    url: "/api/auth/health",
    description: "Authentication service health",
  },
  {
    name: "Realtime API",
    url: "/api/realtime/health",
    description: "Realtime service health and websocket counters",
  },
  {
    name: "MCP API",
    url: "/api/mcp/health",
    description: "Model Context Protocol service health",
  },
] as const;

/**
 * External service probes that are not part of the core API cards.
 * Database now uses a functional heartbeat endpoint.
 */
export const otherStatusServices = [
  {
    name: "Database",
    heartbeatUrl: "/api/database/heartbeat",
    defaultTooltip: "Database heartbeat is pending",
  },
  {
    name: "Storage",
    heartbeatUrl: null,
    defaultTooltip: "Storage service is partially available; full monitoring is pending.",
  },
] as const;

/**
 * Full status store shape for dashboard UI and controls.
 */
interface StatusStoreState {
  serviceStatuses: HealthStatus[];
  otherServiceStatuses: OtherServiceStatus[];
  isRefreshing: boolean;
  lastRefreshSuccessful: boolean | null;
  lastManualRefreshAt: number | null;
}

/**
 * Creates initial loading state for each monitored service.
 */
function buildInitialStatuses(): HealthStatus[] {
  return statusServices.map((service) => ({
    name: service.name,
    status: "loading",
    responseTime: null,
    lastChecked: null,
  }));
}

/**
 * Creates initial external service state for the status page.
 */
function buildInitialOtherStatuses(): OtherServiceStatus[] {
  return otherStatusServices.map((service) => ({
    name: service.name,
    status: service.heartbeatUrl ? "unknown" : "degraded",
    lastUpdated: null,
    tooltip: service.defaultTooltip,
  }));
}

/**
 * Shared status store instance consumed by the status page.
 */
export const statusStore = createStore<StatusStoreState>({
  serviceStatuses: buildInitialStatuses(),
  otherServiceStatuses: buildInitialOtherStatuses(),
  isRefreshing: false,
  lastRefreshSuccessful: null,
  lastManualRefreshAt: null,
});

/**
 * Hook to read status page state reactively from TanStack Store.
 */
export function useStatusState(): StatusStoreState {
  return useStore(statusStore, (state) => state);
}

interface DatabaseHeartbeatResponse {
  status?: "healthy" | "unhealthy";
  detail?: string;
  timestamp?: string;
}

/**
 * Executes external service probes (currently database heartbeat) for "Other Services".
 */
async function checkOtherStatusHealth(): Promise<OtherServiceStatus[]> {
  const checks = await Promise.all(
    otherStatusServices.map(async (service) => {
      if (!service.heartbeatUrl) {
        return {
          name: service.name,
          status: "degraded" as const,
          lastUpdated: null,
          tooltip: service.defaultTooltip,
        };
      }

      try {
        const response = await fetch(service.heartbeatUrl, { method: "GET" });
        const payload = (await response.json()) as DatabaseHeartbeatResponse;
        const isHealthy = response.ok && payload.status === "healthy";

        return {
          name: service.name,
          status: isHealthy ? ("operational" as const) : ("outage" as const),
          lastUpdated: payload.timestamp ?? new Date().toISOString(),
          tooltip: payload.detail || service.defaultTooltip,
        };
      } catch {
        return {
          name: service.name,
          status: "outage" as const,
          lastUpdated: new Date().toISOString(),
          tooltip: "Database heartbeat request failed.",
        };
      }
    }),
  );

  return checks;
}

/**
 * Executes HTTP health checks for all configured services and updates store state.
 * This intentionally avoids websocket probing so the dashboard reflects API route health only.
 */
export async function checkStatusHealth(): Promise<void> {
  statusStore.setState((prev) => ({ ...prev, isRefreshing: true }));

  const results = await Promise.all(
    statusServices.map(async (service) => {
      const startTime = Date.now();

      try {
        const response = await fetch(service.url, { method: "GET" });
        return {
          name: service.name,
          status: response.ok ? ("up" as const) : ("down" as const),
          responseTime: Date.now() - startTime,
          lastChecked: new Date(),
          error: response.ok ? undefined : `HTTP ${response.status}`,
        };
      } catch {
        return {
          name: service.name,
          status: "down" as const,
          responseTime: null,
          lastChecked: new Date(),
          error: "Connection failed",
        };
      }
    }),
  );
  const otherResults = await checkOtherStatusHealth();

  const hasDownService = results.some((service) => service.status === "down");
  statusStore.setState((prev) => ({
    ...prev,
    serviceStatuses: results,
    otherServiceStatuses: otherResults,
    lastRefreshSuccessful: !hasDownService,
    isRefreshing: false,
  }));
}

/**
 * Returns whether a new manual refresh can be triggered right now.
 * Prevents burst clicks from generating repeated API traffic.
 */
export function canTriggerManualRefresh(now = Date.now()): boolean {
  const { isRefreshing, lastManualRefreshAt } = statusStore.state;
  if (isRefreshing) return false;
  if (lastManualRefreshAt === null) return true;
  return now - lastManualRefreshAt >= statusPageConfig.manualRefreshCooldownMs;
}

/**
 * Returns remaining cooldown milliseconds until manual refresh is available.
 */
export function getManualRefreshCooldownRemainingMs(now = Date.now()): number {
  const { lastManualRefreshAt } = statusStore.state;
  if (lastManualRefreshAt === null) return 0;
  const elapsed = now - lastManualRefreshAt;
  const remaining = statusPageConfig.manualRefreshCooldownMs - elapsed;
  return remaining > 0 ? remaining : 0;
}

/**
 * Manual trigger for refresh control in the status page.
 * Returns true only when a request is actually dispatched.
 */
export function refreshStatusHealth(now = Date.now()): boolean {
  if (!canTriggerManualRefresh(now)) {
    return false;
  }
  statusStore.setState((prev) => ({ ...prev, lastManualRefreshAt: now }));
  void checkStatusHealth();
  return true;
}