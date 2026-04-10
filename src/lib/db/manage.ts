/**
 * Database management utilities.
 * Re-exports all database management features for convenient access.
 */

// Versioning exports
export {
  CURRENT_SCHEMA_VERSION,
  getCurrentVersion,
  getVersionHistory,
  compareVersions,
  isNewerVersion,
  isOlderVersion,
  recordVersion,
  recordMigration,
  completeMigration,
  failMigration,
  getMigrationHistory,
  createRollbackPoint,
  getRollbackPoints,
  validateSchemaIntegrity,
  getPendingMigrations,
  initializeSchemaVersioning,
  type VersionCompareResult,
} from "./versioning";

export {
  schemaVersions,
  migrationHistory,
  rollbackPoints,
  type SchemaVersion,
  type MigrationHistory,
  type RollbackPoint,
} from "./versioning/schema";

// Backup exports
export {
  createBackup,
  restoreBackup,
  listBackups,
  getBackup,
  cleanupOldBackups,
  getRestoreHistory,
  verifyBackup,
  createBackupSchedule,
  getBackupSchedules,
  updateScheduleNextRun,
  getBackupDirectory,
  type BackupResult,
  type RestoreResult,
  type BackupOptions,
} from "./backup";

export {
  backups,
  backupSchedules,
  restoreHistory,
  type Backup,
  type BackupSchedule,
  type RestoreHistory,
} from "./backup/schema";

// Optimization exports
export {
  hashQuery,
  extractTableName,
  recordQueryMetric,
  getQueryStats,
  getSlowQueries,
  getIndexRecommendations,
  applyIndexRecommendation,
  cacheQueryResult,
  getCachedResult,
  clearExpiredCache,
  clearAllCache,
  getCacheStats,
  analyzeQuery,
  getTableIndexes,
  hasIndex,
  markSlowQueryAnalyzed,
} from "./optimize";

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

// Monitoring exports
export {
  METRIC_NAMES,
  configureMonitoring,
  recordMetric,
  getMetrics,
  getMetricStats,
  createAlertRule,
  getAlertRules,
  updateAlertRule,
  deleteAlertRule,
  evaluateAlertRules,
  getActiveAlerts,
  acknowledgeAlert,
  resolveAlert,
  getAlertHistory,
  recordHealthCheck,
  getHealthCheckHistory,
  recordConnectionPoolStats,
  collectMetrics,
  performHealthCheck,
  startMonitoring,
  stopMonitoring,
  getMonitoringDashboard,
  initializeDefaultAlertRules,
  clearOldMonitoringData,
  type AlertSeverity,
  type MonitoringConfig,
} from "./monitor";

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