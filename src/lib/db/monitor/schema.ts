/**
 * Database monitoring schema definitions.
 * Stores monitoring metrics, alerts, and health status.
 */

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Database metrics table.
 * Stores aggregated performance and health metrics.
 */
export const dbMetrics = sqliteTable("db_metric", {
  id: text("id").primaryKey(),
  metricName: text("metricName").notNull(),
  value: integer("value").notNull(),
  unit: text("unit"),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  tags: text("tags"),
});

/**
 * Alert rules table.
 * Defines conditions that trigger alerts.
 */
export const alertRules = sqliteTable("alert_rule", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  metricName: text("metricName").notNull(),
  condition: text("condition").notNull(),
  threshold: integer("threshold").notNull(),
  severity: text("severity").notNull().default("warning"),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  cooldownMinutes: integer("cooldownMinutes").notNull().default(15),
  lastTriggeredAt: integer("lastTriggeredAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

/**
 * Active alerts table.
 * Tracks currently active alerts.
 */
export const activeAlerts = sqliteTable("active_alert", {
  id: text("id").primaryKey(),
  ruleId: text("ruleId").notNull(),
  ruleName: text("ruleName").notNull(),
  metricName: text("metricName").notNull(),
  currentValue: integer("currentValue").notNull(),
  threshold: integer("threshold").notNull(),
  severity: text("severity").notNull(),
  triggeredAt: integer("triggeredAt", { mode: "timestamp" }).notNull(),
  acknowledgedAt: integer("acknowledgedAt", { mode: "timestamp" }),
  acknowledgedBy: text("acknowledgedBy"),
  resolvedAt: integer("resolvedAt", { mode: "timestamp" }),
  message: text("message"),
});

/**
 * Alert history table.
 * Records all alerts including resolved ones.
 */
export const alertHistory = sqliteTable("alert_history", {
  id: text("id").primaryKey(),
  ruleId: text("ruleId").notNull(),
  ruleName: text("ruleName").notNull(),
  metricName: text("metricName").notNull(),
  currentValue: integer("currentValue").notNull(),
  threshold: integer("threshold").notNull(),
  severity: text("severity").notNull(),
  triggeredAt: integer("triggeredAt", { mode: "timestamp" }).notNull(),
  resolvedAt: integer("resolvedAt", { mode: "timestamp" }),
  durationSeconds: integer("durationSeconds"),
  acknowledgedBy: text("acknowledgedBy"),
  message: text("message"),
});

/**
 * Health check history table.
 * Records health check results over time.
 */
export const healthCheckHistory = sqliteTable("health_check_history", {
  id: text("id").primaryKey(),
  checkName: text("checkName").notNull(),
  status: text("status").notNull(),
  responseTimeMs: integer("responseTimeMs"),
  details: text("details"),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
});

/**
 * Connection pool stats table.
 * Tracks database connection pool utilization.
 */
export const connectionPoolStats = sqliteTable("connection_pool_stat", {
  id: text("id").primaryKey(),
  poolName: text("poolName").notNull(),
  totalConnections: integer("totalConnections").notNull(),
  activeConnections: integer("activeConnections").notNull(),
  idleConnections: integer("idleConnections").notNull(),
  waitingRequests: integer("waitingRequests").notNull().default(0),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
});

export type DbMetric = typeof dbMetrics.$inferSelect;
export type AlertRule = typeof alertRules.$inferSelect;
export type ActiveAlert = typeof activeAlerts.$inferSelect;
export type AlertHistory = typeof alertHistory.$inferSelect;
export type HealthCheckHistory = typeof healthCheckHistory.$inferSelect;
export type ConnectionPoolStats = typeof connectionPoolStats.$inferSelect;