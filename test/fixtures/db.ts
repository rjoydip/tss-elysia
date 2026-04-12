import { faker } from "@faker-js/faker";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "../../src/lib/db/schema";

const TEST_DB_PATH = ":memory:";

/**
 * SQL to create test tables - user, session, account, verification for auth tests.
 */
export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER DEFAULT 0,
  image TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  subscriptionTier TEXT DEFAULT 'free',
  subscriptionId TEXT,
  subscriptionStatus TEXT,
  subscriptionExpiresAt TEXT
);

CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY NOT NULL,
  expiresAt TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY NOT NULL,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  idToken TEXT,
  accessTokenExpiresAt TEXT,
  refreshTokenExpiresAt TEXT,
  scope TEXT,
  password TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY NOT NULL,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
`;

export function createTestDatabase(): ReturnType<typeof drizzle> {
  const db = new Database(TEST_DB_PATH);
  db.run(CREATE_TABLES_SQL);
  return drizzle(db, { schema });
}

export function cleanupTestDatabase() {
  // No cleanup needed for in-memory database
}

export interface TestUser {
  id: string;
  email: string;
  name: string;
  password: string;
  subscriptionTier: SubscriptionTier;
}

export function generateTestUser(overrides?: Partial<TestUser>): TestUser {
  const tier: SubscriptionTier = overrides?.subscriptionTier ?? "free";
  return {
    id: faker.string.uuid(),
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    password: faker.internet.password({ length: 12 }),
    subscriptionTier: tier,
    ...overrides,
  };
}

export function generateTestUsers(count: number, tier?: SubscriptionTier): TestUser[] {
  return Array.from({ length: count }, () => generateTestUser({ subscriptionTier: tier }));
}

export async function seedTestDatabase(db: ReturnType<typeof drizzle>) {
  const now = new Date();

  await db.insert(schema.subscriptionPlans).values([
    {
      id: "free",
      name: "Free",
      description: "Free tier for personal use",
      price: 0,
      currency: "USD",
      interval: "month",
      intervalCount: 1,
      features: JSON.stringify({ basicAccess: true, communitySupport: true }),
      rateLimit: 100,
      rateLimitDuration: 60_000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "contributor",
      name: "Contributor",
      description: "Contributor tier for active users",
      price: 990,
      currency: "USD",
      interval: "month",
      intervalCount: 1,
      features: JSON.stringify({ basicAccess: true, prioritySupport: true }),
      rateLimit: 1000,
      rateLimitDuration: 60_000,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Enterprise tier for organizations",
      price: 4990,
      currency: "USD",
      interval: "month",
      intervalCount: 1,
      features: JSON.stringify({ basicAccess: true, dedicatedSupport: true }),
      rateLimit: 10000,
      rateLimitDuration: 60_000,
      createdAt: now,
      updatedAt: now,
    },
  ]);
}

export { faker };