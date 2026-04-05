import { describe, expect, it, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { faker } from "@faker-js/faker";
import { CREATE_TABLES_SQL } from "../fixtures/db";

function createTestDatabase(): Database {
  const sqlite = new Database(":memory:");
  sqlite.exec(CREATE_TABLES_SQL);
  return sqlite;
}

describe("Database Operations", () => {
  let db: Database;

  beforeEach(() => {
    db = createTestDatabase();
  });

  describe("Users CRUD", () => {
    it("should insert and select user", () => {
      const userId = faker.string.uuid();
      const email = faker.internet.email().toLowerCase();
      const name = faker.person.fullName();
      const now = Date.now();

      db.prepare(
        "INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, subscriptionTier) VALUES (?, ?, ?, 0, ?, ?, 'free')",
      ).run(userId, name, email, now, now);

      const result = db.query("SELECT * FROM user WHERE id = ?").get(userId);

      expect(result).toBeDefined();
      expect((result as { id: string }).id).toBe(userId);
    });

    it("should update user subscription tier", () => {
      const userId = faker.string.uuid();
      const email = faker.internet.email().toLowerCase();
      const name = faker.person.fullName();
      const now = Date.now();

      db.prepare(
        "INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, subscriptionTier) VALUES (?, ?, ?, 0, ?, ?, 'free')",
      ).run(userId, name, email, now, now);

      db.prepare("UPDATE user SET subscriptionTier = ? WHERE id = ?").run("enterprise", userId);

      const result = db.query("SELECT subscriptionTier FROM user WHERE id = ?").get(userId) as {
        subscriptionTier: string;
      };

      expect(result.subscriptionTier).toBe("enterprise");
    });

    it("should delete user", () => {
      const userId = faker.string.uuid();
      const email = faker.internet.email().toLowerCase();
      const name = faker.person.fullName();
      const now = Date.now();

      db.prepare(
        "INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, subscriptionTier) VALUES (?, ?, ?, 0, ?, ?, 'free')",
      ).run(userId, name, email, now, now);

      db.prepare("DELETE FROM user WHERE id = ?").run(userId);

      const result = db.query("SELECT * FROM user WHERE id = ?").get(userId);

      expect(result).toBeNull();
    });
  });

  describe("Subscription Plans CRUD", () => {
    it("should insert and select subscription plans", () => {
      const now = Date.now();

      db.prepare(
        "INSERT INTO subscription_plan (id, name, description, price, currency, interval, intervalCount, rateLimit, rateLimitDuration, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ).run("free", "Free", "Free tier", 0, "USD", "month", 1, 100, 60000, now, now);

      db.prepare(
        "INSERT INTO subscription_plan (id, name, description, price, currency, interval, intervalCount, rateLimit, rateLimitDuration, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ).run(
        "contributor",
        "Contributor",
        "Contributor tier",
        990,
        "USD",
        "month",
        1,
        1000,
        60000,
        now,
        now,
      );

      const result = db.query("SELECT * FROM subscription_plan").all();

      expect(result.length).toBe(2);
    });

    it("should query subscription plan by ID", () => {
      const now = Date.now();

      db.prepare(
        "INSERT INTO subscription_plan (id, name, description, price, currency, interval, intervalCount, rateLimit, rateLimitDuration, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ).run(
        "enterprise",
        "Enterprise",
        "Enterprise tier",
        4990,
        "USD",
        "month",
        1,
        10000,
        60000,
        now,
        now,
      );

      const result = db.query("SELECT * FROM subscription_plan WHERE id = ?").get("enterprise") as {
        name: string;
        rateLimit: number;
      };

      expect(result).toBeDefined();
      expect(result.name).toBe("Enterprise");
      expect(result.rateLimit).toBe(10000);
    });
  });

  describe("Subscriptions CRUD", () => {
    it("should create subscription for user", () => {
      const now = Date.now();
      const userId = faker.string.uuid();
      const subscriptionId = faker.string.uuid();

      db.prepare(
        "INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, subscriptionTier) VALUES (?, ?, ?, 0, ?, ?, 'contributor')",
      ).run(userId, "Test User", "test@test.com", now, now);

      db.prepare(
        "INSERT INTO subscription_plan (id, name, description, price, currency, interval, intervalCount, rateLimit, rateLimitDuration, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      ).run(
        "contributor",
        "Contributor",
        "Contributor tier",
        990,
        "USD",
        "month",
        1,
        1000,
        60000,
        now,
        now,
      );

      db.prepare(
        "INSERT INTO subscription (id, userId, planId, status, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, createdAt, updatedAt) VALUES (?, ?, ?, 'active', ?, ?, 0, ?, ?)",
      ).run(subscriptionId, userId, "contributor", now, now + 30 * 24 * 60 * 60 * 1000, now, now);

      const result = db.query("SELECT * FROM subscription WHERE userId = ?").get(userId) as {
        status: string;
        planId: string;
      };

      expect(result).toBeDefined();
      expect(result.status).toBe("active");
      expect(result.planId).toBe("contributor");
    });
  });
});