import { defineConfig } from "drizzle-kit";

const dbType = process.env.DATABASE_TYPE || "sqlite";

const sqliteDbUrl =
  process.env.DATABASE_PATH && process.env.DATABASE_NAME
    ? `${process.env.DATABASE_PATH}/${process.env.DATABASE_NAME}`
    : process.env.DATABASE_NAME && !process.env.DATABASE_PATH
      ? `.artifacts/${process.env.DATABASE_NAME}`
      : ".artifacts/tsse-elysia.db";

const postgresUrl =
  process.env.POSTGRES_URL ||
  `postgresql://${process.env.POSTGRES_USER || "tsse"}:${process.env.POSTGRES_PASSWORD || ""}@${
    process.env.POSTGRES_HOST || "localhost"
  }:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DB || "tsse_dev"}`;

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: dbType === "postgres" ? "postgresql" : "sqlite",
  dbCredentials: {
    url: dbType === "postgres" ? postgresUrl : sqliteDbUrl,
  },
});