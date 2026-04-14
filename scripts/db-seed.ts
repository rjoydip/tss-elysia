#!/usr/bin/env bun

/**
 * Database seed script.
 *
 * This script creates deterministic demo data so local environments can be reset
 * and reproduced without relying on stale one-off SQL statements.
 */

import { faker } from "@faker-js/faker";
import { Database } from "bun:sqlite";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { logger } from "./_logger";
import * as schema from "../src/lib/db/schema";

/**
 * Shared configuration helpers for database seeding scripts.
 * Centralizing argument parsing keeps the CLI behavior easy to test and reuse.
 */

/**
 * Supported seed targets.
 * Each target maps to a logical seeding step in the database bootstrap flow.
 */
export const SEED_TARGETS = ["plans", "users", "subscriptions"] as const;

/**
 * Valid seed target names.
 */
export type SeedTarget = (typeof SEED_TARGETS)[number];

/**
 * Parsed CLI options for the seed script.
 */
export interface SeedOptions {
  users: number;
  seed: number;
  fresh: boolean;
  only: SeedTarget[] | null;
}

/**
 * Default CLI options.
 * These values keep the seed script useful without requiring any flags.
 */
export const DEFAULT_SEED_OPTIONS: SeedOptions = {
  users: 10,
  seed: 20260409,
  fresh: false,
  only: null,
};

/**
 * Parses a positive integer flag.
 *
 * @param value Raw CLI value.
 * @param flagName Flag name used in the error message.
 * @returns Parsed integer value.
 * @throws Error when the value is not a positive integer.
 */
function parsePositiveInteger(value: string, flagName: string): number {
  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw new Error(`${flagName} must be a non-negative integer. Received "${value}".`);
  }

  return parsedValue;
}

/**
 * Parses the comma-delimited `--only` flag into known seed targets.
 *
 * @param value Raw CLI value.
 * @returns Seed target list or null when no filtering is applied.
 * @throws Error when an unsupported target is requested.
 */
function parseSeedTargets(value: string): SeedTarget[] | null {
  const normalizedTargets = value
    .split(",")
    .map((target) => target.trim().toLowerCase())
    .filter(Boolean);

  if (normalizedTargets.length === 0) {
    return null;
  }

  const invalidTargets = normalizedTargets.filter(
    (target): target is string => !SEED_TARGETS.includes(target as SeedTarget),
  );

  if (invalidTargets.length > 0) {
    throw new Error(
      `Unsupported seed targets: ${invalidTargets.join(", ")}. Valid targets: ${SEED_TARGETS.join(", ")}.`,
    );
  }

  return [...new Set(normalizedTargets)] as SeedTarget[];
}

/**
 * Parses CLI arguments for the database seed script.
 *
 * Supported flags:
 * - `--users=<count>` controls how many demo users to create
 * - `--seed=<number>` controls deterministic Faker output
 * - `--fresh` removes previously generated demo records before reseeding
 * - `--only=<targets>` limits execution to specific seed steps
 *
 * @param argv CLI arguments, typically `process.argv.slice(2)`.
 * @returns Normalized seed options.
 */
export function parseSeedOptions(argv: string[]): SeedOptions {
  const options: SeedOptions = { ...DEFAULT_SEED_OPTIONS };

  for (const argument of argv) {
    if (argument === "--fresh") {
      options.fresh = true;
      continue;
    }

    if (argument.startsWith("--users=")) {
      options.users = parsePositiveInteger(argument.slice("--users=".length), "--users");
      continue;
    }

    if (argument.startsWith("--seed=")) {
      options.seed = parsePositiveInteger(argument.slice("--seed=".length), "--seed");
      continue;
    }

    if (argument.startsWith("--only=")) {
      options.only = parseSeedTargets(argument.slice("--only=".length));
      continue;
    }

    throw new Error(`Unknown seed argument: ${argument}`);
  }

  return options;
}

/**
 * Checks whether a given seed target should run for the current invocation.
 *
 * @param options Parsed CLI options.
 * @param target Current seed target.
 * @returns True when the target should execute.
 */
export function shouldRunSeedTarget(options: SeedOptions, target: SeedTarget): boolean {
  if (options.only === null) {
    return true;
  }

  return options.only.includes(target);
}

/**
 * Shared demo email domain.
 * Using a dedicated domain lets us safely identify generated records later.
 */
const SEED_EMAIL_DOMAIN = "seed.local";

/**
 * Subscription plans available to seeded users.
 * Keeping the plans in one place makes the script easy to evolve alongside pricing changes.
 */
const PLAN_DATA: Array<typeof schema.subscriptionPlans.$inferInsert> = [
  {
    id: "free",
    name: "Free",
    description: "Free tier for personal use",
    price: 0,
    currency: "USD",
    interval: "month",
    intervalCount: 1,
    rateLimit: 100,
    rateLimitDuration: 60_000,
    features: JSON.stringify(["Core API access", "Community support"]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "contributor",
    name: "Contributor",
    description: "Contributor tier for active users",
    price: 990,
    currency: "USD",
    interval: "month",
    intervalCount: 1,
    rateLimit: 1_000,
    rateLimitDuration: 60_000,
    features: JSON.stringify(["Higher rate limits", "Priority fixes"]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Enterprise tier for organizations",
    price: 4_990,
    currency: "USD",
    interval: "month",
    intervalCount: 1,
    rateLimit: 10_000,
    rateLimitDuration: 60_000,
    features: JSON.stringify(["Enterprise limits", "Dedicated support"]),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Resolves the SQLite database path used by Drizzle scripts.
 *
 * @returns Database path for the active environment.
 */
function resolveDatabasePath(): string {
  if (process.env.DATABASE_PATH && process.env.DATABASE_NAME) {
    return `${process.env.DATABASE_PATH}/${process.env.DATABASE_NAME}`;
  }

  if (process.env.DATABASE_NAME && !process.env.DATABASE_PATH) {
    return `.artifacts/${process.env.DATABASE_NAME}`;
  }

  return ".artifacts/tsse-elysia.db";
}

/**
 * Builds deterministic demo users and subscriptions.
 * Deterministic identifiers make reseeding predictable and avoid duplicate junk data.
 *
 * @param userCount Number of demo users to create.
 * @param baseDate Shared timestamp anchor for generated records.
 * @returns Seed rows for both users and subscriptions.
 */
function buildDemoUsers(
  userCount: number,
  baseDate: Date,
  seed: number,
): {
  users: Array<typeof schema.users.$inferInsert>;
  subscriptions: Array<typeof schema.subscriptions.$inferInsert>;
} {
  const users: Array<typeof schema.users.$inferInsert> = [];
  const subscriptions: Array<typeof schema.subscriptions.$inferInsert> = [];
  const planCycle: Array<"free" | "contributor" | "enterprise"> = [
    "free",
    "contributor",
    "enterprise",
  ];

  for (let index = 0; index < userCount; index += 1) {
    const tier = planCycle[index % planCycle.length];
    const seedNumber = `${index + 1}`.padStart(3, "0");
    const createdAt = new Date(baseDate.getTime() - index * 86_400_000);
    const expiresAt = new Date(createdAt.getTime() + 30 * 86_400_000);
    const userId = `seed-user-${seedNumber}`;
    const subscriptionId = tier === "free" ? null : `seed-subscription-${seedNumber}`;

    faker.seed(seed + index);

    users.push({
      id: userId,
      name: faker.person.fullName(),
      email: `seed.user.${seedNumber}@${SEED_EMAIL_DOMAIN}`,
      emailVerified: index % 2 === 0,
      image: `https://api.dicebear.com/9.x/initials/svg?seed=${seedNumber}`,
      createdAt,
      updatedAt: createdAt,
      subscriptionTier: tier,
      subscriptionId,
      subscriptionStatus: subscriptionId ? "active" : null,
      subscriptionExpiresAt: subscriptionId ? expiresAt : null,
    });

    if (subscriptionId) {
      subscriptions.push({
        id: subscriptionId,
        userId,
        planId: tier,
        status: "active",
        currentPeriodStart: createdAt,
        currentPeriodEnd: expiresAt,
        cancelAtPeriodEnd: false,
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  return { users, subscriptions };
}

/**
 * Deletes previously generated demo records.
 * Restricting cleanup to the dedicated seed domain prevents accidental data loss.
 *
 * @param sqlite SQLite connection used for cleanup statements.
 */
function removeExistingSeedData(sqlite: Database): void {
  logger.info("Removing previously generated demo users and subscriptions...");

  sqlite.transaction(() => {
    sqlite.exec(`
      DELETE FROM subscription
      WHERE userId IN (
        SELECT id
        FROM user
        WHERE email LIKE '%@${SEED_EMAIL_DOMAIN}'
      );
    `);

    sqlite.exec(`
      DELETE FROM user
      WHERE email LIKE '%@${SEED_EMAIL_DOMAIN}';
    `);
  })();
}

/**
 * Verifies that the required database tables already exist before seeding.
 * A clear preflight check gives contributors a better error than a raw SQLite exception.
 *
 * @param sqlite SQLite connection used for metadata queries.
 * @throws Error when the database schema has not been migrated yet.
 */
function ensureRequiredTablesExist(sqlite: Database): void {
  const requiredTables = ["user", "subscription_plan", "subscription"];
  const missingTables = requiredTables.filter((tableName) => {
    const row = sqlite
      .query<{ name: string }, [string]>(
        `
          SELECT name
          FROM sqlite_master
          WHERE type = 'table' AND name = ?;
        `,
      )
      .get(tableName);

    return !row;
  });

  if (missingTables.length > 0) {
    throw new Error(
      `Database schema is missing required tables (${missingTables.join(", ")}). Run "bun run db:migrate" before "bun run db:seed".`,
    );
  }
}

/**
 * Writes subscription plan data using an upsert so reruns stay idempotent.
 *
 * @param db Drizzle database instance.
 * @param baseDate Shared timestamp anchor.
 */
function seedPlans(db: ReturnType<typeof createDatabase>, baseDate: Date): void {
  const plans = PLAN_DATA.map((plan) => ({
    ...plan,
    createdAt: baseDate,
    updatedAt: baseDate,
  }));

  logger.info(`Upserting ${plans.length} subscription plans...`);

  db.insert(schema.subscriptionPlans)
    .values(plans)
    .onConflictDoUpdate({
      target: schema.subscriptionPlans.id,
      set: {
        name: sql.raw("excluded.name"),
        description: sql.raw("excluded.description"),
        price: sql.raw("excluded.price"),
        currency: sql.raw("excluded.currency"),
        interval: sql.raw("excluded.interval"),
        intervalCount: sql.raw("excluded.intervalCount"),
        features: sql.raw("excluded.features"),
        rateLimit: sql.raw("excluded.rateLimit"),
        rateLimitDuration: sql.raw("excluded.rateLimitDuration"),
        updatedAt: baseDate,
      },
    })
    .run();
}

/**
 * Writes demo users and subscriptions in a deterministic, idempotent way.
 *
 * @param db Drizzle database instance.
 * @param userCount Number of users to seed.
 * @param baseDate Shared timestamp anchor.
 * @returns Counts of inserted or updated demo rows.
 */
function seedUsers(
  db: ReturnType<typeof createDatabase>,
  userCount: number,
  baseDate: Date,
  seed: number,
): { users: number; subscriptions: number } {
  const { users, subscriptions } = buildDemoUsers(userCount, baseDate, seed);

  logger.info(`Upserting ${users.length} demo users...`);

  db.insert(schema.users)
    .values(users)
    .onConflictDoUpdate({
      target: schema.users.id,
      set: {
        name: sql.raw("excluded.name"),
        email: sql.raw("excluded.email"),
        emailVerified: sql.raw("excluded.emailVerified"),
        image: sql.raw("excluded.image"),
        updatedAt: sql.raw("excluded.updatedAt"),
        subscriptionTier: sql.raw("excluded.subscriptionTier"),
        subscriptionId: sql.raw("excluded.subscriptionId"),
        subscriptionStatus: sql.raw("excluded.subscriptionStatus"),
        subscriptionExpiresAt: sql.raw("excluded.subscriptionExpiresAt"),
      },
    })
    .run();

  if (subscriptions.length > 0) {
    logger.info(`Upserting ${subscriptions.length} demo subscriptions...`);

    db.insert(schema.subscriptions)
      .values(subscriptions)
      .onConflictDoUpdate({
        target: schema.subscriptions.id,
        set: {
          userId: sql.raw("excluded.userId"),
          planId: sql.raw("excluded.planId"),
          status: sql.raw("excluded.status"),
          currentPeriodStart: sql.raw("excluded.currentPeriodStart"),
          currentPeriodEnd: sql.raw("excluded.currentPeriodEnd"),
          cancelAtPeriodEnd: sql.raw("excluded.cancelAtPeriodEnd"),
          updatedAt: sql.raw("excluded.updatedAt"),
        },
      })
      .run();
  }

  return { users: users.length, subscriptions: subscriptions.length };
}

/**
 * Creates the typed Drizzle database instance used by the seed script.
 *
 * @param sqlite SQLite connection used for seeding.
 * @returns Typed Drizzle database client.
 */
function createDatabase(sqlite: Database) {
  return drizzle(sqlite, { schema });
}

/**
 * Executes the full seed workflow.
 */
function main(): void {
  const options = parseSeedOptions(process.argv.slice(2));
  const databasePath = resolveDatabasePath();
  const sqlite = new Database(databasePath);
  try {
    const db = createDatabase(sqlite);
    const baseDate = new Date();

    sqlite.exec("PRAGMA foreign_keys = ON;");

    logger.section("Database Seeding");
    logger.step(1, `Seeding database at ${databasePath}`);
    logger.info(
      `Options: users=${options.users}, seed=${options.seed}, fresh=${options.fresh}, only=${options.only?.join(",") ?? "all"}`,
    );

    ensureRequiredTablesExist(sqlite);
    faker.seed(options.seed);

    if (options.fresh) {
      removeExistingSeedData(sqlite);
    }

    if (shouldRunSeedTarget(options, "plans")) {
      seedPlans(db, baseDate);
    }

    if (shouldRunSeedTarget(options, "users")) {
      const result = seedUsers(db, options.users, baseDate, options.seed);
      logger.success(
        `Seeded ${result.users} demo users and ${result.subscriptions} subscriptions.`,
      );
    } else if (shouldRunSeedTarget(options, "subscriptions")) {
      logger.warn(
        "Subscription-only seeding is not supported independently because subscriptions are generated from users. Run with --only=users instead.",
      );
    }

    logger.step(2, "Database seeding complete!");
  } catch (error) {
    logger.error(error instanceof Error ? error.message : `Unknown seed failure: ${error}`);
    process.exitCode = 1;
  } finally {
    sqlite.close();
  }
}

/**
 * Runs the seed script only when this file is the CLI entrypoint.
 * This prevents tests from executing real seed logic when importing helpers.
 */
if (import.meta.main) {
  main();
}