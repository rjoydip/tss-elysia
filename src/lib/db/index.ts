import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";
import { env } from "~/env";

let sqlite: Database | undefined;
// eslint_disable-next-line @typescript-eslint/no-explicit-any
let db: any;

if (typeof window === "undefined") {
  sqlite = new Database(`${env.DATABASE_PATH}/${env.DATABASE_NAME}`);
  db = drizzle(sqlite, {
    schema,
  });
}

export { sqlite, db, schema };
export type DbType = NonNullable<typeof db>;
