/**
 * Query optimization schema definitions.
 * Stores query metrics, index recommendations, and cached queries.
 */

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * Query metrics table.
 * Tracks query execution statistics for analysis.
 */
export const queryMetrics = sqliteTable("query_metric", {
  id: text("id").primaryKey(),
  queryHash: text("queryHash").notNull(),
  query: text("query").notNull(),
  tableName: text("tableName"),
  executionTimeMs: integer("executionTimeMs").notNull(),
  rowsAffected: integer("rowsAffected").notNull().default(0),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  cached: integer("cached", { mode: "boolean" }).notNull().default(false),
  error: text("error"),
});

/**
 * Index recommendations table.
 * Stores suggested indexes based on query analysis.
 */
export const indexRecommendations = sqliteTable("index_recommendation", {
  id: text("id").primaryKey(),
  tableName: text("tableName").notNull(),
  columnName: text("columnName").notNull(),
  indexType: text("indexType").notNull().default("btree"),
  estimatedImpact: text("estimatedImpact").notNull(),
  queryPattern: text("queryPattern"),
  frequency: integer("frequency").notNull().default(1),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  applied: integer("applied", { mode: "boolean" }).notNull().default(false),
  appliedAt: integer("appliedAt", { mode: "timestamp" }),
});

/**
 * Query cache table.
 * Stores frequently executed queries for fast retrieval.
 */
export const queryCache = sqliteTable("query_cache", {
  id: text("id").primaryKey(),
  queryHash: text("queryHash").notNull().unique(),
  query: text("query").notNull(),
  result: text("result").notNull(),
  ttlSeconds: integer("ttlSeconds").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  hitCount: integer("hitCount").notNull().default(0),
  lastHitAt: integer("lastHitAt", { mode: "timestamp" }),
});

/**
 * Slow query log table.
 * Records queries that exceed performance thresholds.
 */
export const slowQueryLog = sqliteTable("slow_query_log", {
  id: text("id").primaryKey(),
  queryHash: text("queryHash").notNull(),
  query: text("query").notNull(),
  executionTimeMs: integer("executionTimeMs").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  analyzed: integer("analyzed", { mode: "boolean" }).notNull().default(false),
  recommendationId: text("recommendationId"),
});

export type QueryMetric = typeof queryMetrics.$inferSelect;
export type IndexRecommendation = typeof indexRecommendations.$inferSelect;
export type QueryCache = typeof queryCache.$inferSelect;
export type SlowQueryLog = typeof slowQueryLog.$inferSelect;