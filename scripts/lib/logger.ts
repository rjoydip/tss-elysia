/**
 * Shared logging utilities for scripts.
 * Provides consistent logging across all scripts in the project.
 */

import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Log levels for scripts.
 */
export type ScriptLogLevel = "info" | "success" | "warn" | "error" | "debug";

/**
 * Color codes for terminal output.
 */
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

/**
 * Script logger with styled output.
 */
export const logger = {
  /**
   * Info message (cyan).
   */
  info: (message: string, ...args: unknown[]) => {
    console.log(`${colors.cyan}ℹ${colors.reset}`, message, ...args);
  },

  /**
   * Success message (green).
   */
  success: (message: string, ...args: unknown[]) => {
    console.log(`${colors.green}✓${colors.reset}`, message, ...args);
  },

  /**
   * Warning message (yellow).
   */
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`${colors.yellow}⚠${colors.reset}`, message, ...args);
  },

  /**
   * Error message (red).
   */
  error: (message: string, ...args: unknown[]) => {
    console.error(`${colors.red}✗${colors.reset}`, message, ...args);
  },

  /**
   * Debug message (magenta) - only in development.
   */
  debug: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`${colors.magenta}⚡${colors.reset}`, message, ...args);
    }
  },

  /**
   * Section header with underline.
   */
  section: (title: string) => {
    console.log(`\n${colors.bright}${colors.blue}${title}${colors.reset}`);
    console.log(colors.blue + "=".repeat(title.length) + colors.reset);
  },

  /**
   * Step indicator (e.g., "Step 1:", "Step 2:").
   */
  step: (step: number, title: string) => {
    console.log(`\n${colors.bright}Step ${step}:${colors.reset} ${title}`);
  },

  /**
   * List item with bullet.
   */
  list: (message: string) => {
    console.log(`  ${colors.dim}•${colors.reset}`, message);
  },

  /**
   * Command to run.
   */
  command: (cmd: string) => {
    console.log(`  ${colors.cyan}$${colors.reset}`, cmd);
  },
};

/**
 * Spinner/loading indicator for long-running operations.
 */
export class Spinner {
  private message: string;
  private chars = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  private idx = 0;
  private interval: Timer | null = null;

  constructor(message: string) {
    this.message = message;
  }

  start(): void {
    process.stdout.write(`${this.chars[0]} ${this.message}`);
    this.interval = setInterval(() => {
      this.idx = (this.idx + 1) % this.chars.length;
      process.stdout.write(`\r${this.chars[this.idx]} ${this.message}`);
    }, 80);
  }

  stop(message?: string): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write("\r" + " ".repeat(this.message.length + 3) + "\r");
    if (message) {
      logger.success(message);
    }
  }

  fail(message?: string): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write("\r" + " ".repeat(this.message.length + 3) + "\r");
    if (message) {
      logger.error(message);
    }
  }
}

/**
 * Progress bar for file operations.
 */
export class ProgressBar {
  private total: number;
  private current = 0;
  private width = 30;
  private label: string;

  constructor(label: string, total: number) {
    this.label = label;
    this.total = total;
  }

  increment(n = 1): void {
    this.current = Math.min(this.current + n, this.total);
    this.render();
  }

  private render(): void {
    const filled = Math.floor((this.current / this.total) * this.width);
    const empty = this.width - filled;
    const percent = Math.floor((this.current / this.total) * 100);
    const bar = "█".repeat(filled) + "░".repeat(empty);
    process.stdout.write(`\r${this.label}: [${bar}] ${percent}%`);
    if (this.current >= this.total) {
      process.stdout.write("\n");
    }
  }
}

/**
 * Creates a confirmation prompt.
 */
export async function confirm(message: string, defaultValue = false): Promise<boolean> {
  const suffix = defaultValue ? " [Y/n]" : " [y/N]";
  const answer = await new Promise<string>((resolve) => {
    const rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(`${message}${suffix}: `, (ans: string) => {
      rl.close();
      resolve(ans);
    });
  });

  if (!answer) return defaultValue;
  return answer.toLowerCase() === "y" || answer.toLowerCase() === "yes";
}
