import { faker } from "@faker-js/faker";
import { Database } from "bun:sqlite";
import { logger } from "./lib/logger";

const dbName =
  process.env.DATABASE_PATH && process.env.DATABASE_NAME
    ? `${process.env.DATABASE_PATH}/${process.env.DATABASE_NAME}`
    : process.env.DATABASE_NAME && !process.env.DATABASE_PATH
      ? `.artifacts/${process.env.DATABASE_NAME}`
      : ".artifacts/tss-elysia.db";
const db = new Database(dbName);

const PLAN_DATA = [
  {
    id: "free",
    name: "Free",
    description: "Free tier for personal use",
    price: 0,
    currency: "USD",
    interval: "month",
    intervalCount: 1,
    rateLimit: 100,
    rateLimitDuration: 60000,
  },
  {
    id: "contributor",
    name: "Contributor",
    description: "Contributor tier for active users",
    price: 990,
    currency: "USD",
    interval: "month",
    intervalCount: 1,
    rateLimit: 1000,
    rateLimitDuration: 60000,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Enterprise tier for organizations",
    price: 4990,
    currency: "USD",
    interval: "month",
    intervalCount: 1,
    rateLimit: 10000,
    rateLimitDuration: 60000,
  },
];

const insertPlanStmt = db.prepare(
  `INSERT INTO subscription_plan (id, name, description, price, currency, interval, intervalCount, rateLimit, rateLimitDuration, createdAt, updatedAt, features) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
);

function seedPlans() {
  const now = Date.now();
  logger.success("Seeding subscription plans...");

  for (const plan of PLAN_DATA) {
    const existing = db.query("SELECT id FROM subscription_plan WHERE id = ?").get(plan.id);

    if (!existing) {
      insertPlanStmt.run(
        plan.id,
        plan.name,
        plan.description,
        plan.price,
        plan.currency,
        plan.interval,
        plan.intervalCount,
        plan.rateLimit,
        plan.rateLimitDuration,
        now,
        now,
        "{}",
      );
      logger.success(`Inserted plan: ${plan.name}`);
    } else {
      logger.success(`Plan already exists: ${plan.name}`);
    }
  }
}

const insertUserStmt = db.prepare(
  `INSERT OR IGNORE INTO user (id, name, email, emailVerified, image, createdAt, updatedAt, subscriptionTier, subscriptionId, subscriptionStatus, subscriptionExpiresAt) VALUES (?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?)`,
);

function seedUsers(count: number = 10) {
  const now = Date.now();
  logger.success(`Seeding ${count} users...`);

  const tiers = ["free", "contributor", "enterprise"];

  for (let i = 0; i < count; i++) {
    const tier = faker.helpers.arrayElement(tiers);
    const userId = faker.string.uuid();
    const email = faker.internet.email().toLowerCase();
    const name = faker.person.fullName();
    const emailVerified = faker.datatype.boolean() ? 1 : 0;
    const subscriptionId = tier !== "free" ? faker.string.uuid() : null;
    const subscriptionStatus = tier !== "free" ? "active" : null;
    const subscriptionExpiresAt = tier !== "free" ? now + 30 * 24 * 60 * 60 * 1000 : null;

    insertUserStmt.run(
      userId,
      name,
      email,
      emailVerified,
      now,
      now,
      tier,
      subscriptionId,
      subscriptionStatus,
      subscriptionExpiresAt,
    );
  }

  logger.success(`Seeded ${count} users`);
}

function main() {
  logger.step(1, `Starting database seeding on ${dbName}...`);

  seedPlans();
  seedUsers(10);

  logger.step(2, "Database seeding complete!");
}

main();