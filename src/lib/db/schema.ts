/**
 * =============================================================================
 * UNIFIED DATABASE SCHEMA
 * =============================================================================
 * This module re-exports all schema definitions for the application.
 *
 * Structure:
 * - core.ts: Core business entity schemas (users, sessions, accounts, etc.)
 * - versioning/schema.ts: Schema version tracking tables
 * - backup/schema.ts: Backup and restore management tables
 * - optimize/schema.ts: Query optimization and caching tables
 * - monitor/schema.ts: Monitoring and alerting tables
 *
 * Usage:
 *   import { users, sessions, schemaVersions, backups } from "~/lib/db/schema";
 * =============================================================================
 */

// Core schema exports
export {
  users,
  sessions,
  accounts,
  verifications,
  subscriptionPlans,
  subscriptions,
  mcpApiKeys,
  usersRelations,
  sessionsRelations,
  accountsRelations,
  subscriptionsRelations,
  mcpApiKeysRelations,
  type User,
  type Session,
  type Account,
  type Verification,
  type SubscriptionPlan,
  type Subscription,
  type McpApiKey,
  type CoreDBType,
} from "./core/schema";

// Versioning schema exports
export {
  schemaVersions,
  migrationHistory,
  rollbackPoints,
  type SchemaVersion,
  type MigrationHistory,
  type RollbackPoint,
} from "./versioning/schema";

// Backup schema exports
export {
  backups,
  backupSchedules,
  restoreHistory,
  type Backup,
  type BackupSchedule,
  type RestoreHistory,
} from "./backup/schema";

// Optimization schema exports
export {
  queryMetrics,
  indexRecommendations,
  queryCache,
  slowQueryLog,
  type QueryMetric,
  type IndexRecommendation,
  type QueryCache,
  type SlowQueryLog,
} from "./optimize/schema";

// Monitoring schema exports
export {
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
} from "./monitor/schema";