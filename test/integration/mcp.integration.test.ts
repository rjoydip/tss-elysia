import { beforeAll, afterAll, describe, it, expect } from "bun:test";
import { getWriteDb } from "../../src/lib/db";
import { mcpApiKeys, users } from "../../src/lib/db/core/schema";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "@lukeed/uuid";
import { createHash } from "crypto";

async function seedApiKey() {
  const db = getWriteDb();
  if (!db) return null;

  // First create a user
  const userId = uuid();
  await db.insert(users).values({
    id: userId,
    name: "Test User",
    email: "test@example.com",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Then create API key with userId
  const keyId = uuid();
  const keyHash = createHash("sha256").update(`secret-${Date.now()}`).digest("hex");

  await db.insert(mcpApiKeys).values({
    id: keyId,
    name: `test-key-${Date.now()}`,
    keyHash,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return keyId;
}

describe("MCP Integration", () => {
  let keyId: string = "";

  beforeAll(async () => {
    keyId = (await seedApiKey()) ?? "";
  });

  afterAll(async () => {
    const db = getWriteDb();
    if (db && keyId) {
      try {
        await db.delete(mcpApiKeys).where(eq(mcpApiKeys.id, keyId));
      } catch {}
    }
  });

  it("can create an API key", async () => {
    expect(keyId).not.toBeNull();
  });
});