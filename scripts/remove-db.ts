import { existsSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

const dbPath =
  process.env.DATABASE_PATH && process.env.DATABASE_NAME
    ? `${process.env.DATABASE_PATH}/${process.env.DATABASE_NAME}`
    : process.env.DATABASE_NAME && !process.env.DATABASE_PATH
      ? `.artifacts/${process.env.DATABASE_NAME}`
      : ".artifacts/tss-elysia.db";

const fullPath = resolve(dbPath);

if (existsSync(fullPath)) {
  unlinkSync(fullPath);
  console.log(`Removed ${fullPath}`);
} else {
  console.log(`No database file found at ${fullPath}, skipping`);
}
