import { beforeAll, afterAll } from "bun:test";
import { globalSetup, globalTeardown } from "../config/test";

beforeAll(async () => {
  await globalSetup();
});

afterAll(async () => {
  await globalTeardown();
});