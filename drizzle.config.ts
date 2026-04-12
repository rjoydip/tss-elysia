import { defineConfig } from "drizzle-kit";
import { DB_MIGRATION_OUT, DEFAULT_DATABASE_PATH, getDatabaseFullPath } from "./src/config/db";

const dbType = process.env.DATABASE_TYPE || "sqlite";

const sqliteDbUrl =
  process.env.DATABASE_NAME === ":memory:" && !process.env.DATABASE_PATH
    ? ":memory:"
    : process.env.DATABASE_PATH && process.env.DATABASE_NAME
      ? `${process.env.DATABASE_PATH}/${process.env.DATABASE_NAME}`
      : process.env.DATABASE_NAME && !process.env.DATABASE_PATH
        ? `${DEFAULT_DATABASE_PATH}/${process.env.DATABASE_NAME}`
        : getDatabaseFullPath();

const postgresUrl =
  process.env.POSTGRES_URL ||
  `postgresql://${process.env.POSTGRES_USER || "tsse"}:${
    process.env.POSTGRES_PASSWORD || ""
  }@${process.env.POSTGRES_HOST || "localhost"}:${
    process.env.POSTGRES_PORT || 5432
  }/${process.env.POSTGRES_DB || "tsse_dev"}`;

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: DB_MIGRATION_OUT,
  dialect: dbType === "postgres" ? "postgresql" : "sqlite",
  dbCredentials: {
    url: dbType === "postgres" ? postgresUrl : sqliteDbUrl,
  },
});