/**
 * Database connection and initialization using Drizzle ORM with Bun SQLite.
 * Provides type-safe database queries and schema definitions.
 *
 * Only initializes on server-side (typeof window === "undefined")
 * to prevent client-side bundle from including database code.
 */

import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";
import { env } from "~/env";

// SQLite database instance - Bun's native SQLite driver
let sqlite: Database | undefined;

// Drizzle ORM instance with typed schema
// eslint_disable-next-line @typescript-eslint/no-explicit-any
let db: any;

// Initialize database only in server-side context
// This prevents database connections in browser bundles
if (typeof window === "undefined") {
  sqlite = new Database(`${env.DATABASE_PATH}/${env.DATABASE_NAME}`);
  db = drizzle(sqlite, {
    schema,
  });
}

// Export for use in other modules (auth, migrations, etc.)
export { sqlite, db, schema };
export type DbType = NonNullable<typeof db>;