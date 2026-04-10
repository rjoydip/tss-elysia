/**
 * Query optimization engine.
 * Provides query caching, index recommendations, and performance analysis.
 */

import { sqlite, getWriteDb } from "../index";
import { eq, desc, and, gt, sql } from "drizzle-orm";
import { createHash } from "node:crypto";
import {
  queryMetrics,
  indexRecommendations,
  queryCache,
  slowQueryLog,
  type QueryMetric,
  type IndexRecommendation,
  type QueryCache,
  type SlowQueryLog,
} from "./schema";

/**
 * Slow query threshold in milliseconds.
 */
export const SLOW_QUERY_THRESHOLD_MS = 100;

/**
 * Cache TTL in seconds.
 */
const DEFAULT_CACHE_TTL = 300;

/**
 * Generates a hash for query identification and caching.
 */
export function hashQuery(query: string): string {
  return createHash("sha256").update(query.trim().toLowerCase()).digest("hex").substring(0, 32);
}

/**
 * Extracts table name from a SQL query.
 */
export function extractTableName(query: string): string | null {
  const match =
    query.match(/FROM\s+(\w+)/i) || query.match(/INTO\s+(\w+)/i) || query.match(/UPDATE\s+(\w+)/i);
  return match ? match[1] : null;
}

/**
 * Records query execution metrics.
 */
export async function recordQueryMetric(
  query: string,
  executionTimeMs: number,
  rowsAffected = 0,
  cached = false,
  error?: string,
): Promise<void> {
  const db = getWriteDb();
  if (!db || !sqlite) return;

  const id = crypto.randomUUID();
  const queryHash = hashQuery(query);
  const tableName = extractTableName(query);

  await db.insert(queryMetrics).values({
    id,
    queryHash,
    query: query.substring(0, 1000),
    tableName,
    executionTimeMs,
    rowsAffected,
    timestamp: new Date(),
    cached,
    error,
  });

  if (executionTimeMs > SLOW_QUERY_THRESHOLD_MS && !cached) {
    await db.insert(slowQueryLog).values({
      id: crypto.randomUUID(),
      queryHash,
      query: query.substring(0, 1000),
      executionTimeMs,
      timestamp: new Date(),
    });

    await analyzeSlowQuery(query, executionTimeMs);
  }
}

/**
 * Analyzes slow queries and generates index recommendations.
 */
async function analyzeSlowQuery(query: string, executionTimeMs: number): Promise<void> {
  const db = getWriteDb();
  if (!db) return;

  const tableName = extractTableName(query);
  if (!tableName) return;

  const whereMatch = query.match(/WHERE\s+(\w+)\s*=/i);
  if (whereMatch) {
    const columnName = whereMatch[1];

    const existing = await db
      .select()
      .from(indexRecommendations)
      .where(
        and(
          eq(indexRecommendations.tableName, tableName),
          eq(indexRecommendations.columnName, columnName),
        ),
      )
      .limit(1);

    if (existing[0]) {
      await db
        .update(indexRecommendations)
        .set({ frequency: existing[0].frequency + 1 })
        .where(eq(indexRecommendations.id, existing[0].id));
    } else {
      await db.insert(indexRecommendations).values({
        id: crypto.randomUUID(),
        tableName,
        columnName,
        estimatedImpact: executionTimeMs > 500 ? "high" : "medium",
        queryPattern: query.substring(0, 200),
        frequency: 1,
        createdAt: new Date(),
      });
    }
  }
}

/**
 * Gets query performance statistics.
 */
export async function getQueryStats(
  tableName?: string,
  limit = 100,
): Promise<{
  avgExecutionTime: number;
  totalQueries: number;
  cachedQueries: number;
  slowQueries: number;
  topQueries: QueryMetric[];
}> {
  const db = getWriteDb();
  if (!db) {
    return {
      avgExecutionTime: 0,
      totalQueries: 0,
      cachedQueries: 0,
      slowQueries: 0,
      topQueries: [],
    };
  }

  const condition = tableName ? eq(queryMetrics.tableName, tableName) : undefined;
  const metrics = await db
    .select()
    .from(queryMetrics)
    .where(condition)
    .orderBy(desc(queryMetrics.timestamp))
    .limit(limit);

  const totalQueries = metrics.length;
  const cachedQueries = metrics.filter((m: QueryMetric) => m.cached).length;
  const slowQueries = metrics.filter(
    (m: QueryMetric) => m.executionTimeMs > SLOW_QUERY_THRESHOLD_MS,
  ).length;
  const avgExecutionTime =
    totalQueries > 0
      ? metrics.reduce((sum: number, m: QueryMetric) => sum + m.executionTimeMs, 0) / totalQueries
      : 0;

  return {
    avgExecutionTime: Math.round(avgExecutionTime * 100) / 100,
    totalQueries,
    cachedQueries,
    slowQueries,
    topQueries: metrics.slice(0, 10),
  };
}

/**
 * Gets slow query log entries.
 */
export async function getSlowQueries(limit = 50): Promise<SlowQueryLog[]> {
  const db = getWriteDb();
  if (!db) return [];

  return db.select().from(slowQueryLog).orderBy(desc(slowQueryLog.timestamp)).limit(limit);
}

/**
 * Gets index recommendations.
 */
export async function getIndexRecommendations(): Promise<IndexRecommendation[]> {
  const db = getWriteDb();
  if (!db) return [];

  return db
    .select()
    .from(indexRecommendations)
    .where(eq(indexRecommendations.applied, false))
    .orderBy(desc(indexRecommendations.frequency));
}

/**
 * Applies an index recommendation.
 */
export async function applyIndexRecommendation(recommendationId: string): Promise<boolean> {
  const db = getWriteDb();
  if (!db || !sqlite) return false;

  try {
    const recommendation = await db
      .select()
      .from(indexRecommendations)
      .where(eq(indexRecommendations.id, recommendationId))
      .limit(1);

    if (!recommendation[0]) return false;

    const indexName = `idx_${recommendation[0].tableName}_${recommendation[0].columnName}`;
    const createSql = `CREATE INDEX IF NOT EXISTS ${indexName} ON ${recommendation[0].tableName} (${recommendation[0].columnName})`;

    sqlite.exec(createSql);

    await db
      .update(indexRecommendations)
      .set({
        applied: true,
        appliedAt: new Date(),
      })
      .where(eq(indexRecommendations.id, recommendationId));

    return true;
  } catch {
    return false;
  }
}

/**
 * Caches a query result.
 */
export async function cacheQueryResult(
  query: string,
  result: unknown,
  ttlSeconds = DEFAULT_CACHE_TTL,
): Promise<string | null> {
  const db = getWriteDb();
  if (!db) return null;

  const id = crypto.randomUUID();
  const queryHash = hashQuery(query);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

  try {
    await db.insert(queryCache).values({
      id,
      queryHash,
      query: query.substring(0, 500),
      result: JSON.stringify(result),
      ttlSeconds,
      createdAt: now,
      expiresAt,
    });

    return id;
  } catch {
    return null;
  }
}

/**
 * Gets cached query result if available and valid.
 */
export async function getCachedResult(query: string): Promise<{
  hit: boolean;
  result?: unknown;
  fromCache?: boolean;
}> {
  const db = getWriteDb();
  if (!db) return { hit: false };

  const queryHash = hashQuery(query);
  const now = new Date();

  const cached = await db
    .select()
    .from(queryCache)
    .where(and(eq(queryCache.queryHash, queryHash), gt(queryCache.expiresAt, now)))
    .limit(1);

  if (cached[0]) {
    await db
      .update(queryCache)
      .set({
        hitCount: cached[0].hitCount + 1,
        lastHitAt: now,
      })
      .where(eq(queryCache.id, cached[0].id));

    return {
      hit: true,
      result: JSON.parse(cached[0].result),
      fromCache: true,
    };
  }

  return { hit: false };
}

/**
 * Clears expired cache entries.
 */
export async function clearExpiredCache(): Promise<number> {
  const db = getWriteDb();
  if (!db) return 0;

  const now = new Date();
  const expired = await db
    .select()
    .from(queryCache)
    .where(sql`${queryCache.expiresAt} < ${now}`);

  for (const entry of expired) {
    await db.delete(queryCache).where(eq(queryCache.id, entry.id));
  }

  return expired.length;
}

/**
 * Clears all query cache.
 */
export async function clearAllCache(): Promise<void> {
  const db = getWriteDb();
  if (!db) return;

  await db.delete(queryCache);
}

/**
 * Gets cache statistics.
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  hitRate: number;
  avgTtl: number;
  expiredEntries: number;
}> {
  const db = getWriteDb();
  if (!db) {
    return {
      totalEntries: 0,
      hitRate: 0,
      avgTtl: 0,
      expiredEntries: 0,
    };
  }

  const allEntries = await db.select().from(queryCache);
  const now = new Date();
  const expiredEntries = allEntries.filter((e: QueryCache) => e.expiresAt < now);
  const totalHits = allEntries.reduce((sum: number, e: QueryCache) => sum + e.hitCount, 0);

  return {
    totalEntries: allEntries.length,
    hitRate: totalHits > 0 ? Math.round((totalHits / (totalHits + allEntries.length)) * 100) : 0,
    avgTtl:
      allEntries.length > 0
        ? Math.round(
            allEntries.reduce((sum: number, e: QueryCache) => sum + e.ttlSeconds, 0) /
              allEntries.length,
          )
        : 0,
    expiredEntries: expiredEntries.length,
  };
}

/**
 * Analyzes query and suggests optimizations.
 */
export function analyzeQuery(query: string): {
  suggestions: string[];
  warnings: string[];
} {
  const suggestions: string[] = [];
  const warnings: string[] = [];

  const upperQuery = query.toUpperCase();

  if (upperQuery.includes("SELECT *")) {
    suggestions.push("Avoid SELECT * - specify columns explicitly to reduce data transfer");
  }

  if (upperQuery.includes("LIKE '%")) {
    warnings.push("LIKE with leading wildcard prevents index usage");
    suggestions.push("Consider full-text search for pattern matching with leading wildcards");
  }

  if (!upperQuery.includes("WHERE") && upperQuery.startsWith("SELECT")) {
    warnings.push("Query without WHERE clause scans entire table");
  }

  if (upperQuery.includes("ORDER BY") && !upperQuery.includes("WHERE")) {
    suggestions.push("Sorting without WHERE clause processes all rows - add filters if possible");
  }

  if (upperQuery.includes("JOIN") && !upperQuery.includes("ON")) {
    warnings.push("Implicit JOIN detected - use explicit JOIN with ON clause");
  }

  if (upperQuery.includes("NOT IN") || upperQuery.includes("NOT EXISTS")) {
    suggestions.push(
      "Consider using LEFT JOIN with NULL check or IN with negation for better performance",
    );
  }

  if (upperQuery.includes("COUNT(*)") && upperQuery.includes("WHERE")) {
    suggestions.push("Consider maintaining a counter cache for frequent COUNT(*) queries");
  }

  return { suggestions, warnings };
}

/**
 * Gets existing indexes for a table.
 */
export async function getTableIndexes(tableName: string): Promise<string[]> {
  if (!sqlite) return [];

  const indexes = sqlite
    .query(
      `SELECT name FROM sqlite_master WHERE type='index' AND tbl_name=? AND name NOT LIKE 'sqlite_%'`,
    )
    .all(tableName) as { name: string }[];

  return indexes.map((i) => i.name);
}

/**
 * Checks if a column has an index.
 */
export async function hasIndex(tableName: string, columnName: string): Promise<boolean> {
  if (!sqlite) return false;

  const indexes = await getTableIndexes(tableName);
  for (const indexName of indexes) {
    const columns = sqlite
      .query(`SELECT sql FROM sqlite_master WHERE type='index' AND name=?`)
      .get(indexName) as { sql: string } | undefined;

    if (columns?.sql && columns.sql.includes(columnName)) {
      return true;
    }
  }

  return false;
}

/**
 * Marks a slow query as analyzed.
 */
export async function markSlowQueryAnalyzed(
  queryId: string,
  recommendationId?: string,
): Promise<void> {
  const db = getWriteDb();
  if (!db) return;

  await db
    .update(slowQueryLog)
    .set({
      analyzed: true,
      recommendationId,
    })
    .where(eq(slowQueryLog.id, queryId));
}