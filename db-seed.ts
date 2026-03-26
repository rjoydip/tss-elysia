import { faker } from "@faker-js/faker";
import { Database } from "bun:sqlite";

const dbName = process.env.DATABASE_NAME || ".artifacts/tss-elysia.db";
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

function seedPlans() {
  const now = Date.now();
  console.log("Seeding subscription plans...");

  for (const plan of PLAN_DATA) {
    const existing = db.query("SELECT id FROM subscription_plan WHERE id = ?").get(plan.id);

    if (!existing) {
      db.exec(
        `INSERT INTO subscription_plan (id, name, description, price, currency, interval, intervalCount, rateLimit, rateLimitDuration, createdAt, updatedAt, features)
         VALUES ('${plan.id}', '${plan.name}', '${plan.description}', ${plan.price}, '${plan.currency}', '${plan.interval}', ${plan.intervalCount}, ${plan.rateLimit}, ${plan.rateLimitDuration}, ${now}, ${now}, '{}')`,
      );
      console.log(`Inserted plan: ${plan.name}`);
    } else {
      console.log(`Plan already exists: ${plan.name}`);
    }
  }
}

function seedUsers(count: number = 10) {
  const now = Date.now();
  console.log(`Seeding ${count} users...`);

  const tiers = ["free", "contributor", "enterprise"];

  for (let i = 0; i < count; i++) {
    const tier = faker.helpers.arrayElement(tiers);
    const userId = faker.string.uuid();
    const email = faker.internet.email().toLowerCase();
    const name = faker.person.fullName().replace(/'/g, "''");
    const emailVerified = faker.datatype.boolean() ? 1 : 0;
    const subscriptionId = tier !== "free" ? `'${faker.string.uuid()}'` : "NULL";
    const subscriptionStatus = tier !== "free" ? "'active'" : "NULL";
    const subscriptionExpiresAt = tier !== "free" ? now + 30 * 24 * 60 * 60 * 1000 : "NULL";

    db.exec(
      `INSERT OR IGNORE INTO user (id, name, email, emailVerified, image, createdAt, updatedAt, subscriptionTier, subscriptionId, subscriptionStatus, subscriptionExpiresAt)
       VALUES ('${userId}', '${name}', '${email}', ${emailVerified}, '', ${now}, ${now}, '${tier}', ${subscriptionId}, ${subscriptionStatus}, ${subscriptionExpiresAt})`,
    );
  }

  console.log(`Seeded ${count} users`);
}

function main() {
  console.log(`Starting database seeding on ${dbName}...`);

  seedPlans();
  seedUsers(10);

  console.log("Database seeding complete!");
}

main();
