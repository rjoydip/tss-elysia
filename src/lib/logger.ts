/**
 * Centralized logging system for the application.
 * Provides structured logging with multiple levels, context support, and environment-aware filtering.
 * Built on top of Consola for elegant console output.
 *
 * @module logger
 */

import { createConsola } from "consola";
import { isProduction } from "../config";

/**
 * Log levels in priority order (lowest to highest).
 */
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

/**
 * Log entry structure for structured logging.
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

/**
 * Logger configuration options.
 */
export interface LoggerOptions {
  /** Minimum log level to output */
  minLevel?: LogLevel;
  /** Enable colored output (for development) */
  enableColors?: boolean;
  /** Include context in output */
  enableContext?: boolean;
  /** Prefix for all log messages */
  prefix?: string;
}

/**
 * Map custom LogLevel to Consola level numbers.
 * Consola uses: fatal=0, error=1, warn=2, log=3, info=3, success=3, ready=3, start=3, debug=4, trace=5
 */
const LOG_LEVEL_MAP: Record<LogLevel, number> = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

/**
 * Production minimum log level - reduces noise in production.
 */
const DEFAULT_MIN_LEVEL: LogLevel = "info";

/**
 * Creates a centralized logging system with structured output.
 * Supports multiple log levels, context, and error tracking.
 * Built on top of Consola for elegant output with fallback support.
 *
 * @param options - Logger configuration
 * @returns Logger object with methods for each level
 *
 * @example
 * const logger = createLogger({ prefix: "app" });
 * logger.info("Server started");
 * logger.warn("Memory usage high", { usage: "80%" });
 * logger.error("Database failed", new Error("connection refused"));
 */
export function createLogger(options: LoggerOptions = {}): Readonly<{
  debug: (message: string, context?: Record<string, unknown>) => void;
  log: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, error?: Error) => void;
  fatal: (message: string, error?: Error) => void;
}> {
  const { minLevel = DEFAULT_MIN_LEVEL, prefix = "" } = options;

  /**
   * Create consola instance with configured options.
   */
  const consolaInstance = createConsola({
    level: LOG_LEVEL_MAP[minLevel],
    formatOptions: {
      date: true,
      colors: !isProduction,
      compact: isProduction,
    },
  });

  /**
   * Add prefix tag if provided.
   */
  const logger = prefix ? consolaInstance.withTag(prefix) : consolaInstance;

  /**
   * Determines if the given log level should be logged based on minLevel setting.
   */
  const shouldLog = (level: LogLevel): boolean => {
    return LOG_LEVEL_MAP[level] <= LOG_LEVEL_MAP[minLevel];
  };

  /**
   * Core logging function that handles both context and error objects.
   */
  const log = (level: LogLevel, message: string, data?: Record<string, unknown> | Error) => {
    if (!shouldLog(level)) {
      return;
    }

    let error: Error | undefined;
    let context: Record<string, unknown> | undefined;

    if (data instanceof Error) {
      error = data;
    } else if (data) {
      context = data;
    }

    if (error) {
      switch (level) {
        case "fatal":
          logger.fatal(message, { error });
          break;
        case "error":
          logger.error(message, { error });
          break;
        default:
          logger.error(message, { cause: error });
          break;
      }
    } else if (context && Object.keys(context).length > 0) {
      switch (level) {
        case "fatal":
          logger.fatal(message, context);
          break;
        case "error":
          logger.error(message, context);
          break;
        case "warn":
          logger.warn(message, context);
          break;
        case "debug":
          logger.debug(message, context);
          break;
        default:
          logger.info(message, context);
      }
    } else {
      switch (level) {
        case "fatal":
          logger.fatal(message);
          break;
        case "error":
          logger.error(message);
          break;
        case "warn":
          logger.warn(message);
          break;
        case "debug":
          logger.debug(message);
          break;
        default:
          logger.info(message);
      }
    }
  };

  return {
    log: (message: string, context?: Record<string, unknown>) => log("info", message, context),
    debug: (message: string, context?: Record<string, unknown>) => log("debug", message, context),
    info: (message: string, context?: Record<string, unknown>) => log("info", message, context),
    warn: (message: string, context?: Record<string, unknown>) => log("warn", message, context),
    error: (message: string, error?: Error) => log("error", message, error),
    fatal: (message: string, error?: Error) => log("fatal", message, error),
  };
}

/**
 * Default application logger instance.
 * Uses INFO level in production, DEBUG in development.
 */
export const logger = createLogger({
  minLevel: isProduction ? "info" : "debug",
  prefix: "app",
});

/**
 * Logger for authentication-related logs.
 * Useful for security monitoring and debugging auth issues.
 */
export const authLogger = createLogger({
  minLevel: isProduction ? "info" : "debug",
  prefix: "auth",
});

/**
 * Logger for API-related logs.
 * Useful for monitoring API performance and debugging request issues.
 */
export const apiLogger = createLogger({
  minLevel: isProduction ? "info" : "debug",
  prefix: "api",
});

/**
 * Logger for database-related logs.
 * Useful for debugging database connection and query issues.
 */
export const dbLogger = createLogger({
  minLevel: isProduction ? "warn" : "debug",
  prefix: "db",
});

/**
 * Logger for Redis-related logs.
 * Useful for monitoring Redis connection, Pub/Sub, and caching events.
 */
export const redisLogger = createLogger({
  minLevel: isProduction ? "warn" : "debug",
  prefix: "redis",
});

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
};

export const scriptLogger = {
  section: (title: string) => {
    console.log(`\n${colors.bright}${colors.blue}${title}${colors.reset}`);
    console.log(colors.blue + "=".repeat(title.length) + colors.reset);
  },
  step: (step: number, title: string) => {
    console.log(`\n${colors.bright}Step ${step}:${colors.reset} ${title}`);
  },
  list: (message: string) => {
    console.log(`  ${colors.dim}•${colors.reset}`, message);
  },
  command: (cmd: string) => {
    console.log(`  ${colors.cyan}$${colors.reset}`, cmd);
  },
  success: (message: string) => {
    console.log(`${colors.green}✓${colors.reset}`, message);
  },
  info: (message: string) => {
    console.log(`${colors.cyan}ℹ${colors.reset}`, message);
  },
  warn: (message: string) => {
    console.warn(`${colors.yellow}⚠${colors.reset}`, message);
  },
  error: (message: string) => {
    console.error(`${colors.red}✗${colors.reset}`, message);
  },
  debug: (message: string) => {
    if (!isProduction) {
      console.log(`${colors.magenta}⚡${colors.reset}`, message);
    }
  },
};