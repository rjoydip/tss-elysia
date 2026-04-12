import { describe, expect, it, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { faker } from "@faker-js/faker";
import { CREATE_TABLES_SQL } from "../fixtures/db";

function createTestDatabase(): Database {
  const db = new Database(":memory:");
  db.run(CREATE_TABLES_SQL);
  return db;
}

describe("Database Operations", () => {
  let db: Database;

  beforeEach(() => {
    db = createTestDatabase();
  });

  describe("Users CRUD", () => {
    it("should insert and select user", async () => {
      const userId = faker.string.uuid();
      const email = faker.internet.email().toLowerCase();
      const name = faker.person.fullName();
      const now = Date.now();

      db.run(
        `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, subscriptionTier) VALUES ('${userId}', '${name}', '${email}', 0, ${now}, ${now}, 'free')`,
      );

      const result = (await db.prepare("SELECT * FROM user WHERE id = ?").get(userId)) as
        | { id: string }
        | undefined;

      expect(result).toBeDefined();
      expect(result?.id).toBe(userId);
    });

    it("should update user subscription tier", async () => {
      const userId = faker.string.uuid();
      const email = faker.internet.email().toLowerCase();
      const name = faker.person.fullName();
      const now = Date.now();

      await db.exec(
        `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, subscriptionTier) VALUES ('${userId}', '${name}', '${email}', 0, ${now}, ${now}, 'free')`,
      );

      await db.exec(`UPDATE user SET subscriptionTier = 'enterprise' WHERE id = '${userId}'`);

      const result = (await db
        .prepare("SELECT subscriptionTier FROM user WHERE id = ?")
        .get(userId)) as
        | {
            subscriptionTier: string;
          }
        | undefined;

      expect(result?.subscriptionTier).toBe("enterprise");
    });

    it("should delete user", async () => {
      const userId = faker.string.uuid();
      const email = faker.internet.email().toLowerCase();
      const name = faker.person.fullName();
      const now = Date.now();

      await db.exec(
        `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, subscriptionTier) VALUES ('${userId}', '${name}', '${email}', 0, ${now}, ${now}, 'free')`,
      );

      await db.exec(`DELETE FROM user WHERE id = '${userId}'`);

      const result = await db.prepare("SELECT * FROM user WHERE id = ?").get(userId);

      expect(result).toBeUndefined();
    });
  });

  describe("Subscription Plans CRUD", () => {
    it("should insert and select subscription plans", async () => {
      const now = Date.now();

      await db.exec(
        `INSERT INTO subscription_plan (id, name, description, price, currency, interval, intervalCount, rateLimit, rateLimitDuration, createdAt, updatedAt) VALUES ('free', 'Free', 'Free tier', 0, 'USD', 'month', 1, 100, 60000, ${now}, ${now})`,
      );

      await db.exec(
        `INSERT INTO subscription_plan (id, name, description, price, currency, interval, intervalCount, rateLimit, rateLimitDuration, createdAt, updatedAt) VALUES ('contributor', 'Contributor', 'Contributor tier', 990, 'USD', 'month', 1, 1000, 60000, ${now}, ${now})`,
      );

      const result = (await db.prepare("SELECT * FROM subscription_plan").all()) as Array<unknown>;

      expect(result.length).toBe(2);
    });

    it("should query subscription plan by ID", async () => {
      const now = Date.now();

      await db.exec(
        `INSERT INTO subscription_plan (id, name, description, price, currency, interval, intervalCount, rateLimit, rateLimitDuration, createdAt, updatedAt) VALUES ('enterprise', 'Enterprise', 'Enterprise tier', 4990, 'USD', 'month', 1, 10000, 60000, ${now}, ${now})`,
      );

      const result = (await db
        .prepare("SELECT * FROM subscription_plan WHERE id = ?")
        .get("enterprise")) as
        | {
            name: string;
            rateLimit: number;
          }
        | undefined;

      expect(result).toBeDefined();
      expect(result?.name).toBe("Enterprise");
      expect(result?.rateLimit).toBe(10000);
    });
  });

  describe("Subscriptions CRUD", () => {
    it("should create subscription for user", async () => {
      const now = Date.now();
      const userId = faker.string.uuid();
      const subscriptionId = faker.string.uuid();

      await db.exec(
        `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, subscriptionTier) VALUES ('${userId}', 'Test User', 'test@test.com', 0, ${now}, ${now}, 'contributor')`,
      );

      await db.exec(
        `INSERT INTO subscription_plan (id, name, description, price, currency, interval, intervalCount, rateLimit, rateLimitDuration, createdAt, updatedAt) VALUES ('contributor', 'Contributor', 'Contributor tier', 990, 'USD', 'month', 1, 1000, 60000, ${now}, ${now})`,
      );

      await db.exec(
        `INSERT INTO subscription (id, userId, planId, status, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, createdAt, updatedAt) VALUES ('${subscriptionId}', '${userId}', 'contributor', 'active', ${now}, ${now + 30 * 24 * 60 * 60 * 1000}, 0, ${now}, ${now})`,
      );

      const result = (await db
        .prepare("SELECT * FROM subscription WHERE userId = ?")
        .get(userId)) as
        | {
            status: string;
            planId: string;
          }
        | undefined;

      expect(result).toBeDefined();
      expect(result?.status).toBe("active");
      expect(result?.planId).toBe("contributor");
    });
  });
});