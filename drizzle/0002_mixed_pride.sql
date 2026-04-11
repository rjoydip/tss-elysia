CREATE TABLE `active_alert` (
	`id` text PRIMARY KEY NOT NULL,
	`ruleId` text NOT NULL,
	`ruleName` text NOT NULL,
	`metricName` text NOT NULL,
	`currentValue` integer NOT NULL,
	`threshold` integer NOT NULL,
	`severity` text NOT NULL,
	`triggeredAt` integer NOT NULL,
	`acknowledgedAt` integer,
	`acknowledgedBy` text,
	`resolvedAt` integer,
	`message` text
);
--> statement-breakpoint
CREATE TABLE `alert_history` (
	`id` text PRIMARY KEY NOT NULL,
	`ruleId` text NOT NULL,
	`ruleName` text NOT NULL,
	`metricName` text NOT NULL,
	`currentValue` integer NOT NULL,
	`threshold` integer NOT NULL,
	`severity` text NOT NULL,
	`triggeredAt` integer NOT NULL,
	`resolvedAt` integer,
	`durationSeconds` integer,
	`acknowledgedBy` text,
	`message` text
);
--> statement-breakpoint
CREATE TABLE `alert_rule` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`metricName` text NOT NULL,
	`condition` text NOT NULL,
	`threshold` integer NOT NULL,
	`severity` text DEFAULT 'warning' NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`cooldownMinutes` integer DEFAULT 15 NOT NULL,
	`lastTriggeredAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `backup_schedule` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`interval` text NOT NULL,
	`retentionCount` integer DEFAULT 7 NOT NULL,
	`retentionDays` integer,
	`enabled` integer DEFAULT true NOT NULL,
	`lastRunAt` integer,
	`nextRunAt` integer,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `backup` (
	`id` text PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`path` text NOT NULL,
	`size` integer NOT NULL,
	`checksum` text NOT NULL,
	`databaseType` text NOT NULL,
	`schemaVersion` text,
	`createdAt` integer NOT NULL,
	`completedAt` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`type` text DEFAULT 'full' NOT NULL,
	`retentionDays` integer,
	`compressed` integer DEFAULT false NOT NULL,
	`error` text,
	`metadata` text
);
--> statement-breakpoint
CREATE TABLE `connection_pool_stat` (
	`id` text PRIMARY KEY NOT NULL,
	`poolName` text NOT NULL,
	`totalConnections` integer NOT NULL,
	`activeConnections` integer NOT NULL,
	`idleConnections` integer NOT NULL,
	`waitingRequests` integer DEFAULT 0 NOT NULL,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `db_metric` (
	`id` text PRIMARY KEY NOT NULL,
	`metricName` text NOT NULL,
	`value` integer NOT NULL,
	`unit` text,
	`timestamp` integer NOT NULL,
	`tags` text
);
--> statement-breakpoint
CREATE TABLE `health_check_history` (
	`id` text PRIMARY KEY NOT NULL,
	`checkName` text NOT NULL,
	`status` text NOT NULL,
	`responseTimeMs` integer,
	`details` text,
	`timestamp` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `index_recommendation` (
	`id` text PRIMARY KEY NOT NULL,
	`tableName` text NOT NULL,
	`columnName` text NOT NULL,
	`indexType` text DEFAULT 'btree' NOT NULL,
	`estimatedImpact` text NOT NULL,
	`queryPattern` text,
	`frequency` integer DEFAULT 1 NOT NULL,
	`createdAt` integer NOT NULL,
	`applied` integer DEFAULT false NOT NULL,
	`appliedAt` integer
);
--> statement-breakpoint
CREATE TABLE `migration_history` (
	`id` text PRIMARY KEY NOT NULL,
	`version` text NOT NULL,
	`direction` text NOT NULL,
	`startedAt` integer NOT NULL,
	`completedAt` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`error` text,
	`sql` text,
	`executedStatements` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `query_cache` (
	`id` text PRIMARY KEY NOT NULL,
	`queryHash` text NOT NULL,
	`query` text NOT NULL,
	`result` text NOT NULL,
	`ttlSeconds` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	`hitCount` integer DEFAULT 0 NOT NULL,
	`lastHitAt` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `query_cache_queryHash_unique` ON `query_cache` (`queryHash`);--> statement-breakpoint
CREATE TABLE `query_metric` (
	`id` text PRIMARY KEY NOT NULL,
	`queryHash` text NOT NULL,
	`query` text NOT NULL,
	`tableName` text,
	`executionTimeMs` integer NOT NULL,
	`rowsAffected` integer DEFAULT 0 NOT NULL,
	`timestamp` integer NOT NULL,
	`cached` integer DEFAULT false NOT NULL,
	`error` text
);
--> statement-breakpoint
CREATE TABLE `restore_history` (
	`id` text PRIMARY KEY NOT NULL,
	`backupId` text NOT NULL,
	`backupFilename` text NOT NULL,
	`startedAt` integer NOT NULL,
	`completedAt` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`tablesRestored` integer DEFAULT 0 NOT NULL,
	`rowsRestored` integer DEFAULT 0 NOT NULL,
	`error` text,
	`createdBy` text
);
--> statement-breakpoint
CREATE TABLE `rollback_point` (
	`id` text PRIMARY KEY NOT NULL,
	`version` text NOT NULL,
	`createdAt` integer NOT NULL,
	`snapshotData` text NOT NULL,
	`description` text,
	`checksum` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `schema_version` (
	`version` text PRIMARY KEY NOT NULL,
	`description` text NOT NULL,
	`appliedAt` integer NOT NULL,
	`appliedBy` text,
	`checksum` text,
	`status` text DEFAULT 'applied' NOT NULL,
	`rollbackFrom` text
);
--> statement-breakpoint
CREATE TABLE `slow_query_log` (
	`id` text PRIMARY KEY NOT NULL,
	`queryHash` text NOT NULL,
	`query` text NOT NULL,
	`executionTimeMs` integer NOT NULL,
	`timestamp` integer NOT NULL,
	`analyzed` integer DEFAULT false NOT NULL,
	`recommendationId` text
);
