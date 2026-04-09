/**
 * Centralized logging system for the application.
 * Provides structured logging with multiple levels, context support, and environment-aware filtering.
 *
 * @module logger
 */

import { isProduction, isTest } from "../config";

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
 * Production minimum log level - reduces noise in production.
 */
const DEFAULT_MIN_LEVEL: LogLevel = "info";

/**
 * Creates a centralized logging system with structured output.
 * Supports multiple log levels, context, and error tracking.
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
export function createLogger(options: LoggerOptions = {}) {
  const { minLevel = DEFAULT_MIN_LEVEL, prefix = "" } = options;

  /**
   * Log level priority for filtering.
   */
  const levelPriority: Record<LogLevel, number> = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
  };

  /**
   * Check if a level should be logged based on minLevel setting.
   */
  const shouldLog = (level: LogLevel): boolean => {
    return levelPriority[level] <= levelPriority[minLevel];
  };

  /**
   * Format a log entry with timestamp and metadata.
   */
  const formatEntry = (
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): string => {
    const timestamp = new Date().toISOString();
    const levelStr = level.toUpperCase().padEnd(5);
    const prefixStr = prefix ? `[${prefix}] ` : "";

    let output = `${timestamp} [${levelStr}] ${prefixStr}${message}`;

    if (context && Object.keys(context).length > 0) {
      output += ` ${JSON.stringify(context)}`;
    }

    return output;
  };

  /**
   * Core logging function.
   */
  const log = (level: LogLevel, message: string, data?: Record<string, unknown> | Error) => {
    if (!shouldLog(level) || isTest) return;

    let context: Record<string, unknown> | undefined;
    let error: Error | undefined;

    if (data instanceof Error) {
      error = data;
    } else if (data) {
      context = data;
    }

    const formatted = formatEntry(level, message, context);

    switch (level) {
      case "fatal":
      case "error":
        console.error(formatted);
        if (error?.stack) {
          console.error(error.stack);
        }
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "debug":
        // Only log debug messages in non-production environments
        if (!isProduction) {
          console.debug(formatted);
        }
        break;
      default:
        console.log(formatted);
    }
  };

  return {
    /** Log debug level messages (development only) */
    debug: (message: string, context?: Record<string, unknown>) => log("debug", message, context),
    /** Log info level messages */
    info: (message: string, context?: Record<string, unknown>) => log("info", message, context),
    /** Log warning level messages */
    warn: (message: string, context?: Record<string, unknown>) => log("warn", message, context),
    /** Log error level messages */
    error: (message: string, error?: Error) => log("error", message, error),
    /** Log fatal level messages */
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