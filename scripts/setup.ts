#!/usr/bin/env bun

/**
 * Setup Script
 *
 * This script sets up the project from scratch. Run this once after cloning
 * or when starting fresh.
 *
 * What it does:
 * 1. Checks for Bun runtime
 * 2. Installs dependencies
 * 3. Installs OpenCode LSP (if not already installed)
 * 4. Copies .env.example to .env (if .env doesn't exist)
 * 5. Generates database schema
 * 6. Runs database migrations
 * 7. Seeds the database with initial data
 * 8. Sets up git hooks
 * 9. Runs initial typecheck to verify setup
 *
 * Usage:
 *   bun run scripts/setup.ts
 *
 * To skip database setup:
 *   bun run scripts/setup.ts --skip-db
 */

import { existsSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "./lib/logger";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

const SKIP_DB = process.argv.includes("--skip-db");

logger.section("TSS Elysia Setup");

logger.step(1, "Checking Bun installation...");
try {
  const result = Bun.version;
  logger.success(`Bun ${result} detected`);
} catch {
  logger.error("Bun is not installed. Please install Bun first:");
  logger.command("https://bun.sh");
  process.exit(1);
}

logger.step(2, "Installing dependencies...");
const installProcess = Bun.spawn(["bun", "install"], {
  cwd: rootDir,
});
await installProcess.exited;
if (installProcess.exitCode !== 0) {
  logger.error("Failed to install dependencies");
  process.exit(1);
}
logger.success("Dependencies installed");

logger.step(3, "Setting up OpenCode LSP...");

/**
 * Language servers and tools to install for enhanced IDE support.
 * These provide IntelliSense, formatting, and linting capabilities.
 */
const LSP_PACKAGES = [
  "opencode-ai", // AI-powered coding assistant
  "typescript-language-server", // TypeScript/JavaScript language server
  "vscode-langservers-extracted", // JSON, HTML, CSS, YAML language servers
  "@tailwindcss/language-server", // Tailwind CSS IntelliSense
  "yaml-language-server", // YAML validation and completion
] as const;

const opencodeDir = join(rootDir, ".opencode");
const opencodePackageJson = join(opencodeDir, "package.json");

if (existsSync(opencodePackageJson)) {
  const packageJsonContent = await Bun.file(opencodePackageJson).text();
  const packageJson = JSON.parse(packageJsonContent);

  const missingPackages = LSP_PACKAGES.filter(
    (pkg) => !packageJson.dependencies?.[pkg] && !packageJson.devDependencies?.[pkg],
  );

  if (missingPackages.length > 0) {
    logger.info(`Installing LSP packages: ${missingPackages.join(", ")}...`);
    const addProcess = Bun.spawn(["bun", "add", "-D", ...missingPackages], { cwd: opencodeDir });
    await addProcess.exited;
    if (addProcess.exitCode !== 0) {
      logger.warn("Failed to install some LSP packages, continuing...");
    } else {
      logger.success("LSP packages installed");
    }
  } else {
    logger.info("All LSP packages already installed");
  }
} else {
  logger.info("OpenCode config not found, skipping LSP setup");
}

logger.step(4, "Setting up environment variables...");
const envExamplePath = join(rootDir, ".env.example");
const envPath = join(rootDir, ".env");

if (existsSync(envExamplePath)) {
  if (!existsSync(envPath)) {
    copyFileSync(envExamplePath, envPath);
    logger.success("Created .env from .env.example");
    logger.warn("Please edit .env and add your AUTH_SECRET!");
  } else {
    logger.info(".env already exists, skipping");
  }
} else {
  logger.info(".env.example not found, skipping");
}

if (!SKIP_DB) {
  logger.step(5, "Setting up database...");

  logger.info("Generating database schema...");
  const generateProcess = Bun.spawn(["bun", "run", "db:generate"], {
    cwd: rootDir,
  });
  await generateProcess.exited;
  if (generateProcess.exitCode !== 0) {
    logger.error("Failed to generate database schema");
    process.exit(1);
  }
  logger.success("Database schema generated");

  logger.info("Running migrations...");
  const migrateProcess = Bun.spawn(["bun", "run", "db:migrate"], {
    cwd: rootDir,
  });
  await migrateProcess.exited;
  if (migrateProcess.exitCode !== 0) {
    logger.error("Failed to run migrations");
    process.exit(1);
  }
  logger.success("Migrations complete");

  logger.info("Seeding database...");
  const seedProcess = Bun.spawn(["bun", "run", "db:seed"], {
    cwd: rootDir,
  });
  await seedProcess.exited;
  if (seedProcess.exitCode !== 0) {
    logger.error("Failed to seed database");
    process.exit(1);
  }
  logger.success("Database seeded");
} else {
  logger.info("Skipping database setup (--skip-db)");
}

logger.step(6, "Setting up git hooks...");
const prepareProcess = Bun.spawn(["bun", "run", "prepare"], {
  cwd: rootDir,
});
await prepareProcess.exited;
if (prepareProcess.exitCode !== 0) {
  logger.info("Git hooks setup skipped (not a git repo or already set up)");
} else {
  logger.success("Git hooks installed");
}

logger.step(7, "Running typecheck...");
const typecheckProcess = Bun.spawn(["bun", "run", "typecheck"], {
  cwd: rootDir,
});
await typecheckProcess.exited;
if (typecheckProcess.exitCode !== 0) {
  logger.warn("Typecheck found issues, but setup is complete");
  logger.info("Run 'bun run lint:fix' to auto-fix issues");
} else {
  logger.success("Typecheck passed");
}

logger.section("Setup Complete!");

logger.list("Edit .env and configure required variables");
logger.list("Run 'bun run dev' to start development server");
logger.list("Visit http://localhost:3000");