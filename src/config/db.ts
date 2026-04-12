/**
 * Database configuration constants.
 * Single place to maintain all database defaults.
 */

export const DB_MIGRATION_OUT = "./drizzle";

/**
 * Default database path (directory where database files are stored).
 */
export const DEFAULT_DATABASE_PATH = ".artifacts";

/**
 * Default database name (filename without extension).
 */
export const DEFAULT_DATABASE_NAME = `tss-elysia.sqlite3`;

/**
 * Get the database full path with fallback to defaults.
 *
 * @param path Optional custom path
 * @param name Optional custom name
 * @returns Full database path
 */
export function getDatabaseFullPath(path?: string, name?: string): string {
  const dbPath = path || DEFAULT_DATABASE_PATH;
  const dbName = name || DEFAULT_DATABASE_NAME;
  return `${dbPath}/${dbName}`;
}