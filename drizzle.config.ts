import { defineConfig } from "drizzle-kit";

const db_url =
  process.env.DATABASE_PATH && process.env.DATABASE_NAME
    ? `${process.env.DATABASE_PATH}/${process.env.DATABASE_NAME}`
    : process.env.DATABASE_NAME && !process.env.DATABASE_PATH
      ? `.artifacts/${process.env.DATABASE_NAME}`
      : ".artifacts/tss-elysia.db";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: db_url,
  },
});