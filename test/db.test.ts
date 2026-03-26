import { describe, expect, it, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { faker } from "@faker-js/faker";

const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    subscriptionTier TEXT NOT NULL DEFAULT 'free',
    subscriptionId TEXT,
    subscriptionStatus TEXT,
    subscriptionExpiresAt INTEGER
  );
  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    expiresAt INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    userId TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    userId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt INTEGER,
    refreshTokenExpiresAt INTEGER,
    scope TEXT,
    password TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt INTEGER NOT NULL,
    createdAt INTEGER,
    updatedAt INTEGER
  );
  CREATE TABLE IF NOT EXISTS subscription_plan (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    interval TEXT NOT NULL,
    intervalCount INTEGER NOT NULL DEFAULT 1,
    features TEXT,
    rateLimit INTEGER NOT NULL,
    rateLimitDuration INTEGER NOT NULL DEFAULT 60000,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS subscription (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    planId TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    currentPeriodStart INTEGER NOT NULL,
    currentPeriodEnd INTEGER NOT NULL,
    cancelAtPeriodEnd INTEGER NOT NULL DEFAULT 0,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
  );
`;

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

      db.exec(
        `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, subscriptionTier) VALUES ('${userId}', '${name}', '${email}', 0, ${now}, ${now}, 'free')`,
      );

      const result = db.query(`SELECT * FROM user WHERE id = '${userId}'`).get();

      expect(result).toBeDefined();
      expect((result as { id: string }).id).toBe(userId);
    });

    it("should update user subscription tier", () => {
      const userId = faker.string.uuid();
      const email = faker.internet.email().toLowerCase();
      const name = faker.person.fullName();
      const now = Date.now();

      db.exec(
        `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, subscriptionTier) VALUES ('${userId}', '${name}', '${email}', 0, ${now}, ${now}, 'free')`,
      );

      db.exec(`UPDATE user SET subscriptionTier = 'enterprise' WHERE id = '${userId}'`);

      const result = db.query(`SELECT subscriptionTier FROM user WHERE id = '${userId}'`).get() as {
        subscriptionTier: string;
      };

      expect(result.subscriptionTier).toBe("enterprise");
    });

    it("should delete user", () => {
      const userId = faker.string.uuid();
      const email = faker.internet.email().toLowerCase();
      const name = faker.person.fullName();
      const now = Date.now();

      db.exec(
        `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, subscriptionTier) VALUES ('${userId}', '${name}', '${email}', 0, ${now}, ${now}, 'free')`,
      );

      db.exec(`DELETE FROM user WHERE id = '${userId}'`);

      const result = db.query(`SELECT * FROM user WHERE id = '${userId}'`).get();

      expect(result).toBeNull();
    });
  });

  describe("Subscription Plans CRUD", () => {
    it("should insert and select subscription plans", () => {
      const now = Date.now();

      db.exec(
        `INSERT INTO subscription_plan (id, name, description, price, currency, interval, intervalCount, rateLimit, rateLimitDuration, createdAt, updatedAt) VALUES ('free', 'Free', 'Free tier', 0, 'USD', 'month', 1, 100, 60000, ${now}, ${now})`,
      );

      db.exec(
        `INSERT INTO subscription_plan (id, name, description, price, currency, interval, intervalCount, rateLimit, rateLimitDuration, createdAt, updatedAt) VALUES ('contributor', 'Contributor', 'Contributor tier', 990, 'USD', 'month', 1, 1000, 60000, ${now}, ${now})`,
      );

      const result = db.query(`SELECT * FROM subscription_plan`).all();

      expect(result.length).toBe(2);
    });

    it("should query subscription plan by ID", () => {
      const now = Date.now();

      db.exec(
        `INSERT INTO subscription_plan (id, name, description, price, currency, interval, intervalCount, rateLimit, rateLimitDuration, createdAt, updatedAt) VALUES ('enterprise', 'Enterprise', 'Enterprise tier', 4990, 'USD', 'month', 1, 10000, 60000, ${now}, ${now})`,
      );

      const result = db.query(`SELECT * FROM subscription_plan WHERE id = 'enterprise'`).get() as {
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

      db.exec(
        `INSERT INTO user (id, name, email, emailVerified, createdAt, updatedAt, subscriptionTier) VALUES ('${userId}', 'Test User', 'test@test.com', 0, ${now}, ${now}, 'contributor')`,
      );

      db.exec(
        `INSERT INTO subscription_plan (id, name, description, price, currency, interval, intervalCount, rateLimit, rateLimitDuration, createdAt, updatedAt) VALUES ('contributor', 'Contributor', 'Contributor tier', 990, 'USD', 'month', 1, 1000, 60000, ${now}, ${now})`,
      );

      db.exec(
        `INSERT INTO subscription (id, userId, planId, status, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, createdAt, updatedAt) VALUES ('${subscriptionId}', '${userId}', 'contributor', 'active', ${now}, ${now + 30 * 24 * 60 * 60 * 1000}, 0, ${now}, ${now})`,
      );

      const result = db.query(`SELECT * FROM subscription WHERE userId = '${userId}'`).get() as {
        status: string;
        planId: string;
      };

      expect(result).toBeDefined();
      expect(result.status).toBe("active");
      expect(result.planId).toBe("contributor");
    });
  });
});
