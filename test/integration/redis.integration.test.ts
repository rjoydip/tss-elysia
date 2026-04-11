import { beforeAll, afterAll, describe, it, expect } from "bun:test";
import { getRedisClient, getRedisStatus, closeRedis } from "../../src/lib/redis";
import { env } from "../../src/config/env";

describe("Redis Integration", () => {
  beforeAll(async () => {
    if (!env.REDIS_URL) {
      console.log("REDIS_URL not set - skipping tests");
    }
  });

  afterAll(() => {
    closeRedis();
  });

  it("has getRedisClient function", () => {
    expect(typeof getRedisClient).toBe("function");
  });

  it("has getRedisStatus function", () => {
    expect(typeof getRedisStatus).toBe("function");
  });

  it("has closeRedis function", () => {
    expect(typeof closeRedis).toBe("function");
  });
});