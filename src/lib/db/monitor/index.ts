/**
 * Database monitoring and alerting system.
 * Provides real-time metrics collection, health monitoring, and alert management.
 */

import { sqlite, getWriteDb } from "../index";
import { getDatabaseHeartbeat } from "../heartbeat";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import {
  dbMetrics,
  alertRules,
  activeAlerts,
  alertHistory,
  healthCheckHistory,
  connectionPoolStats,
  type DbMetric,
  type AlertRule,
  type ActiveAlert,
  type AlertHistory,
  type HealthCheckHistory,
  type ConnectionPoolStats,
} from "./schema";
import { logger } from "~/lib/logger";

/**
 * Metric names enum.
 */
export const METRIC_NAMES = {
  QUERY_LATENCY_AVG: "db.query.latency.avg",
  QUERY_LATENCY_P99: "db.query.latency.p99",
  QUERY_COUNT: "db.query.count",
  CONNECTION_COUNT: "db.connection.count",
  CONNECTION_AVAILABLE: "db.connection.available",
  CONNECTION_ACTIVE: "db.connection.active",
  SLOW_QUERY_COUNT: "db.slow_query.count",
  CACHE_HIT_RATE: "db.cache.hit_rate",
  CACHE_SIZE: "db.cache.size",
  DISK_USAGE: "db.disk.usage",
  TABLE_ROW_COUNT: "db.table.row_count",
} as const;

/**
 * Alert severity levels.
 */
export type AlertSeverity = "info" | "warning" | "critical";

/**
 * Monitoring configuration.
 */
export interface MonitoringConfig {
  collectionIntervalMs: number;
  retentionDays: number;
  healthCheckIntervalMs: number;
}

/**
 * Default monitoring configuration.
 */
const DEFAULT_CONFIG: MonitoringConfig = {
  collectionIntervalMs: 60_000,
  retentionDays: 30,
  healthCheckIntervalMs: 30_000,
};

/**
 * Current monitoring configuration.
 */
let config: MonitoringConfig = { ...DEFAULT_CONFIG };

/**
 * Collection intervals.
 */
let metricsCollectionInterval: ReturnType<typeof setInterval> | null = null;
let healthCheckInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Sets monitoring configuration.
 */
export function configureMonitoring(newConfig: Partial<MonitoringConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Records a database metric.
 */
export async function recordMetric(
  metricName: string,
  value: number,
  unit?: string,
  tags?: Record<string, string>,
): Promise<void> {
  const db = getWriteDb();
  if (!db) return;

  await db.insert(dbMetrics).values({
    id: crypto.randomUUID(),
    metricName,
    value: Math.round(value),
    unit,
    timestamp: new Date(),
    tags: tags ? JSON.stringify(tags) : undefined,
  });
}

/**
 * Gets metrics for a specific name within a time range.
 */
export async function getMetrics(metricName: string, minutes = 60): Promise<DbMetric[]> {
  const db = getWriteDb();
  if (!db) return [];

  const cutoff = new Date(Date.now() - minutes * 60 * 1000);

  return db
    .select()
    .from(dbMetrics)
    .where(and(eq(dbMetrics.metricName, metricName), gte(dbMetrics.timestamp, cutoff)))
    .orderBy(desc(dbMetrics.timestamp));
}

/**
 * Gets aggregated metric statistics.
 */
export async function getMetricStats(
  metricName: string,
  minutes = 60,
): Promise<{
  min: number;
  max: number;
  avg: number;
  count: number;
  latest: number;
}> {
  const metrics = await getMetrics(metricName, minutes);

  if (metrics.length === 0) {
    return { min: 0, max: 0, avg: 0, count: 0, latest: 0 };
  }

  const values = metrics.map((m) => m.value);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    count: values.length,
    latest: values[0],
  };
}

/**
 * Creates an alert rule.
 */
export async function createAlertRule(
  name: string,
  metricName: string,
  condition: "gt" | "lt" | "eq",
  threshold: number,
  severity: AlertSeverity = "warning",
  cooldownMinutes = 15,
): Promise<string> {
  const db = getWriteDb();
  if (!db) return "";

  const id = crypto.randomUUID();

  await db.insert(alertRules).values({
    id,
    name,
    metricName,
    condition,
    threshold,
    severity,
    cooldownMinutes,
    enabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return id;
}

/**
 * Gets all alert rules.
 */
export async function getAlertRules(): Promise<AlertRule[]> {
  const db = getWriteDb();
  if (!db) return [];

  return db.select().from(alertRules);
}

/**
 * Updates an alert rule.
 */
export async function updateAlertRule(ruleId: string, updates: Partial<AlertRule>): Promise<void> {
  const db = getWriteDb();
  if (!db) return;

  await db
    .update(alertRules)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(alertRules.id, ruleId));
}

/**
 * Deletes an alert rule.
 */
export async function deleteAlertRule(ruleId: string): Promise<void> {
  const db = getWriteDb();
  if (!db) return;

  await db.delete(alertRules).where(eq(alertRules.id, ruleId));
}

/**
 * Evaluates alert rules against current metrics.
 */
export async function evaluateAlertRules(): Promise<ActiveAlert[]> {
  const db = getWriteDb();
  if (!db) return [];

  const rules = await db.select().from(alertRules).where(eq(alertRules.enabled, true));

  const newAlerts: ActiveAlert[] = [];

  for (const rule of rules) {
    const stats = await getMetricStats(rule.metricName, 5);
    if (stats.latest === 0) continue;

    let triggered = false;
    switch (rule.condition) {
      case "gt":
        triggered = stats.latest > rule.threshold;
        break;
      case "lt":
        triggered = stats.latest < rule.threshold;
        break;
      case "eq":
        triggered = stats.latest === rule.threshold;
        break;
    }

    if (triggered) {
      const cooldownMs = (rule.cooldownMinutes || 15) * 60 * 1000;
      const canTrigger =
        !rule.lastTriggeredAt || Date.now() - rule.lastTriggeredAt.getTime() > cooldownMs;

      if (canTrigger) {
        const alertId = crypto.randomUUID();

        await db.insert(activeAlerts).values({
          id: alertId,
          ruleId: rule.id,
          ruleName: rule.name,
          metricName: rule.metricName,
          currentValue: stats.latest,
          threshold: rule.threshold,
          severity: rule.severity,
          triggeredAt: new Date(),
          message: `${rule.name}: ${rule.metricName} is ${stats.latest} (threshold: ${rule.threshold})`,
        });

        await db
          .update(alertRules)
          .set({ lastTriggeredAt: new Date() })
          .where(eq(alertRules.id, rule.id));

        const activeAlert = await db
          .select()
          .from(activeAlerts)
          .where(eq(activeAlerts.id, alertId))
          .limit(1);

        if (activeAlert[0]) {
          newAlerts.push(activeAlert[0]);
          logger.warn(`[ALERT] ${rule.name}: ${activeAlert[0].message}`);
        }
      }
    } else {
      const existingAlert = await db
        .select()
        .from(activeAlerts)
        .where(and(eq(activeAlerts.ruleId, rule.id), sql`${activeAlerts.resolvedAt} IS NULL`))
        .limit(1);

      if (existingAlert[0]) {
        await resolveAlert(existingAlert[0].id);
      }
    }
  }

  return newAlerts;
}

/**
 * Gets currently active alerts.
 */
export async function getActiveAlerts(): Promise<ActiveAlert[]> {
  const db = getWriteDb();
  if (!db) return [];

  return db
    .select()
    .from(activeAlerts)
    .where(sql`${activeAlerts.resolvedAt} IS NULL`)
    .orderBy(desc(activeAlerts.triggeredAt));
}

/**
 * Acknowledges an alert.
 */
export async function acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
  const db = getWriteDb();
  if (!db) return;

  await db
    .update(activeAlerts)
    .set({
      acknowledgedAt: new Date(),
      acknowledgedBy,
    })
    .where(eq(activeAlerts.id, alertId));
}

/**
 * Resolves an active alert.
 */
export async function resolveAlert(alertId: string): Promise<void> {
  const db = getWriteDb();
  if (!db) return;

  const alert = await db.select().from(activeAlerts).where(eq(activeAlerts.id, alertId)).limit(1);

  if (!alert[0]) return;

  const resolvedAt = new Date();
  const durationSeconds = Math.round(
    (resolvedAt.getTime() - alert[0].triggeredAt.getTime()) / 1000,
  );

  await db.insert(alertHistory).values({
    id: alert[0].id,
    ruleId: alert[0].ruleId,
    ruleName: alert[0].ruleName,
    metricName: alert[0].metricName,
    currentValue: alert[0].currentValue,
    threshold: alert[0].threshold,
    severity: alert[0].severity,
    triggeredAt: alert[0].triggeredAt,
    resolvedAt,
    durationSeconds,
    acknowledgedBy: alert[0].acknowledgedBy,
    message: alert[0].message,
  });

  await db.delete(activeAlerts).where(eq(activeAlerts.id, alertId));
}

/**
 * Gets alert history.
 */
export async function getAlertHistory(limit = 100): Promise<AlertHistory[]> {
  const db = getWriteDb();
  if (!db) return [];

  return db.select().from(alertHistory).orderBy(desc(alertHistory.triggeredAt)).limit(limit);
}

/**
 * Records a health check result.
 */
export async function recordHealthCheck(
  checkName: string,
  status: "healthy" | "unhealthy" | "degraded",
  responseTimeMs?: number,
  details?: Record<string, unknown>,
): Promise<void> {
  const db = getWriteDb();
  if (!db) return;

  await db.insert(healthCheckHistory).values({
    id: crypto.randomUUID(),
    checkName,
    status,
    responseTimeMs,
    details: details ? JSON.stringify(details) : undefined,
    timestamp: new Date(),
  });
}

/**
 * Gets health check history.
 */
export async function getHealthCheckHistory(
  checkName: string,
  limit = 50,
): Promise<HealthCheckHistory[]> {
  const db = getWriteDb();
  if (!db) return [];

  return db
    .select()
    .from(healthCheckHistory)
    .where(eq(healthCheckHistory.checkName, checkName))
    .orderBy(desc(healthCheckHistory.timestamp))
    .limit(limit);
}

/**
 * Records connection pool statistics.
 */
export async function recordConnectionPoolStats(
  poolName: string,
  totalConnections: number,
  activeConnections: number,
  idleConnections: number,
  waitingRequests = 0,
): Promise<void> {
  const db = getWriteDb();
  if (!db) return;

  await db.insert(connectionPoolStats).values({
    id: crypto.randomUUID(),
    poolName,
    totalConnections,
    activeConnections,
    idleConnections,
    waitingRequests,
    timestamp: new Date(),
  });

  await recordMetric(METRIC_NAMES.CONNECTION_ACTIVE, activeConnections, "connections", {
    pool: poolName,
  });

  await recordMetric(METRIC_NAMES.CONNECTION_AVAILABLE, idleConnections, "connections", {
    pool: poolName,
  });
}

/**
 * Collects current database metrics.
 */
export async function collectMetrics(): Promise<void> {
  if (!sqlite) return;

  const tables = sqlite
    .query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
    .all() as { name: string }[];

  for (const table of tables) {
    try {
      const countResult = sqlite.query(`SELECT COUNT(*) as count FROM ${table.name}`).get() as {
        count: number;
      };
      await recordMetric(METRIC_NAMES.TABLE_ROW_COUNT, countResult.count, "rows", {
        table: table.name,
      });
    } catch {
      // Table may not exist or be accessible
    }
  }

  await recordMetric(METRIC_NAMES.CONNECTION_COUNT, tables.length, "tables");
}

/**
 * Performs database health check.
 */
export async function performHealthCheck(): Promise<{
  healthy: boolean;
  status: "healthy" | "unhealthy" | "degraded";
  checks: Record<string, unknown>;
}> {
  const checks: Record<string, unknown> = {};

  try {
    const heartbeat = await getDatabaseHeartbeat();
    checks.heartbeat = {
      status: heartbeat.status,
      latencyMs: heartbeat.latencyMs,
    };

    if (sqlite) {
      const pragmaResult = sqlite.query("PRAGMA quick_check").get() as { ok?: number } | undefined;
      checks.integrity = pragmaResult?.ok === 1 ? "ok" : "corrupted";
    }

    const activeAlerts = await getActiveAlerts();
    checks.activeAlerts = activeAlerts.length;

    if (activeAlerts.some((a) => a.severity === "critical")) {
      await recordHealthCheck("database", "unhealthy", undefined, checks);
      return { healthy: false, status: "unhealthy", checks };
    }

    if (activeAlerts.length > 0) {
      await recordHealthCheck("database", "degraded", undefined, checks);
      return { healthy: true, status: "degraded", checks };
    }

    await recordHealthCheck("database", "healthy", undefined, checks);
    return { healthy: true, status: "healthy", checks };
  } catch (error) {
    checks.error = error instanceof Error ? error.message : "Unknown error";
    await recordHealthCheck("database", "unhealthy", undefined, checks);
    return {
      healthy: false,
      status: "unhealthy",
      checks,
    };
  }
}

/**
 * Starts monitoring collection.
 */
export function startMonitoring(): void {
  if (metricsCollectionInterval) return;

  metricsCollectionInterval = setInterval(async () => {
    try {
      await collectMetrics();
      await evaluateAlertRules();
    } catch (error) {
      logger.error("[Monitor] Collection error", error instanceof Error ? error : undefined);
    }
  }, config.collectionIntervalMs);

  healthCheckInterval = setInterval(async () => {
    try {
      await performHealthCheck();
    } catch (error) {
      logger.error("[Monitor] Health check error", error instanceof Error ? error : undefined);
    }
  }, config.healthCheckIntervalMs);

  logger.info("[Monitor] Started with interval: " + config.collectionIntervalMs + "ms");
}

/**
 * Stops monitoring collection.
 */
export function stopMonitoring(): void {
  if (metricsCollectionInterval) {
    clearInterval(metricsCollectionInterval);
    metricsCollectionInterval = null;
  }

  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }

  logger.info("[Monitor] Stopped");
}

/**
 * Gets comprehensive monitoring dashboard data.
 */
export async function getMonitoringDashboard(): Promise<{
  health: { healthy: boolean; status: string; checks: Record<string, unknown> };
  metrics: Record<string, { min: number; max: number; avg: number; latest: number }>;
  alerts: { active: ActiveAlert[]; history: AlertHistory[] };
  connections: ConnectionPoolStats[];
}> {
  const health = await performHealthCheck();
  const active = await getActiveAlerts();
  const history = await getAlertHistory(20);

  const metricKeys = [
    METRIC_NAMES.QUERY_LATENCY_AVG,
    METRIC_NAMES.SLOW_QUERY_COUNT,
    METRIC_NAMES.CONNECTION_ACTIVE,
    METRIC_NAMES.CACHE_HIT_RATE,
  ];

  const metrics: Record<string, { min: number; max: number; avg: number; latest: number }> = {};
  for (const key of metricKeys) {
    metrics[key] = await getMetricStats(key, 60);
  }

  const connections =
    (await getWriteDb()
      ?.select()
      .from(connectionPoolStats)
      .orderBy(desc(connectionPoolStats.timestamp))
      .limit(10)) ?? [];

  return {
    health,
    metrics,
    alerts: { active, history },
    connections,
  };
}

/**
 * Initializes default alert rules.
 */
export async function initializeDefaultAlertRules(): Promise<void> {
  const db = getWriteDb();
  if (!db) return;

  const existing = await db.select().from(alertRules);
  if (existing.length > 0) return;

  await createAlertRule(
    "High Slow Query Rate",
    METRIC_NAMES.SLOW_QUERY_COUNT,
    "gt",
    10,
    "warning",
    30,
  );

  await createAlertRule(
    "Connection Pool Saturation",
    METRIC_NAMES.CONNECTION_ACTIVE,
    "gt",
    80,
    "critical",
    5,
  );

  await createAlertRule(
    "High Query Latency",
    METRIC_NAMES.QUERY_LATENCY_AVG,
    "gt",
    500,
    "warning",
    15,
  );

  logger.info("[Monitor] Default alert rules initialized");
}

/**
 * Clears old monitoring data based on retention policy.
 */
export async function clearOldMonitoringData(): Promise<void> {
  const db = getWriteDb();
  if (!db) return;

  const cutoff = new Date(Date.now() - config.retentionDays * 24 * 60 * 60 * 1000);

  await db.delete(dbMetrics).where(sql`${dbMetrics.timestamp} < ${cutoff}`);
  await db.delete(healthCheckHistory).where(sql`${healthCheckHistory.timestamp} < ${cutoff}`);
  await db.delete(connectionPoolStats).where(sql`${connectionPoolStats.timestamp} < ${cutoff}`);

  const oldHistory = await db
    .select()
    .from(alertHistory)
    .where(sql`${alertHistory.triggeredAt} < ${cutoff}`);

  for (const alert of oldHistory) {
    if (alert.resolvedAt && alert.resolvedAt < cutoff) {
      await db.delete(alertHistory).where(eq(alertHistory.id, alert.id));
    }
  }
}