import { beforeAll, afterAll } from "bun:test";
import { globalSetup, globalTeardown } from "../shared/config/test";
import { DEFAULT_DATABASE_NAME } from "../src/config/db";
import { waitForDb } from "../src/lib/db/index";

process.env.NODE_ENV = "test";
process.env.DATABASE_NAME = ":memory:";
process.env.DATABASE_TYPE = "sqlite";

beforeAll(async () => {
  await waitForDb();
  await globalSetup();
});

afterAll(async () => {
  await globalTeardown();
  process.env.DATABASE_NAME = DEFAULT_DATABASE_NAME;
});