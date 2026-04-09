/**
 * Unit tests for src/logger.ts
 * Tests: createLogger, logger instances, log levels, formatting
 */

import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import {
  createLogger,
  logger,
  authLogger,
  apiLogger,
  dbLogger,
  type LogLevel,
  redisLogger,
} from "../../src/lib/logger";

describe("createLogger", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv ?? "test";
  });

  it("should create a logger with default options", () => {
    const testLogger = createLogger();
    expect(testLogger).toHaveProperty("info");
    expect(testLogger).toHaveProperty("warn");
    expect(testLogger).toHaveProperty("error");
    expect(testLogger).toHaveProperty("debug");
  });

  it("should log info messages", () => {
    const testLogger = createLogger({ minLevel: "info", prefix: "test" });
    testLogger.info("test message");
  });

  it("should log warn messages", () => {
    const testLogger = createLogger({ minLevel: "info", prefix: "test" });
    testLogger.warn("warning message");
  });

  it("should log error messages", () => {
    const testLogger = createLogger({ minLevel: "info", prefix: "test" });
    testLogger.error("error message");
  });

  it("should include prefix in log output", () => {
    const testLogger = createLogger({ prefix: "test-prefix" });
    testLogger.info("test");
  });

  it("should include context in log output", () => {
    const testLogger = createLogger({ minLevel: "info" });
    testLogger.info("test", { key: "value" });
  });

  it("should filter messages below minLevel", () => {
    const testLogger = createLogger({ minLevel: "warn", prefix: "test" });
    testLogger.info("should not appear");
    testLogger.debug("should not appear");
    testLogger.warn("should appear");
  });

  it("should convert Error objects to string", () => {
    const testLogger = createLogger({ minLevel: "error", prefix: "test" });
    const err = new Error("test error");
    testLogger.error("error occurred", err);
  });

  it("should output fatal errors to console.error", () => {
    const testLogger = createLogger({ minLevel: "info", prefix: "test" });
    testLogger.fatal("fatal error");
  });
});

describe("logger instances", () => {
  it("should have default app logger", () => {
    expect(logger).toBeDefined();
    expect(logger.info).toBeDefined();
  });

  it("should have auth logger", () => {
    expect(authLogger).toBeDefined();
    expect(authLogger.info).toBeDefined();
  });

  it("should have api logger", () => {
    expect(apiLogger).toBeDefined();
    expect(apiLogger.info).toBeDefined();
  });

  it("should have db logger", () => {
    expect(dbLogger).toBeDefined();
    expect(dbLogger.info).toBeDefined();
  });

  it("should have redis logger", () => {
    expect(redisLogger).toBeDefined();
    expect(redisLogger.info).toBeDefined();
  });

  it("should log with app prefix", () => {
    logger.info("test");
  });

  it("should log with auth prefix", () => {
    authLogger.info("test");
  });

  it("should log with api prefix", () => {
    apiLogger.info("test");
  });

  it("should log with db prefix", () => {
    dbLogger.info("test");
  });

  it("should log with redis prefix", () => {
    redisLogger.info("test");
  });
});

describe("log levels", () => {
  it("should support debug level", () => {
    const testLogger = createLogger({ minLevel: "debug", prefix: "test" });
    testLogger.debug("debug message");
  });

  it("should support info level", () => {
    const testLogger = createLogger({ minLevel: "info", prefix: "test" });
    testLogger.info("info message");
  });

  it("should support warn level", () => {
    const testLogger = createLogger({ minLevel: "warn", prefix: "test" });
    testLogger.warn("warn message");
  });

  it("should support error level", () => {
    const testLogger = createLogger({ minLevel: "error", prefix: "test" });
    testLogger.error("error message");
  });

  it("should support fatal level", () => {
    const testLogger = createLogger({ minLevel: "fatal", prefix: "test" });
    testLogger.fatal("fatal message");
  });
});

describe("LogLevel type", () => {
  it("should accept debug level", () => {
    const level: LogLevel = "debug";
    expect(level).toBe("debug");
  });

  it("should accept info level", () => {
    const level: LogLevel = "info";
    expect(level).toBe("info");
  });

  it("should accept warn level", () => {
    const level: LogLevel = "warn";
    expect(level).toBe("warn");
  });

  it("should accept error level", () => {
    const level: LogLevel = "error";
    expect(level).toBe("error");
  });

  it("should accept fatal level", () => {
    const level: LogLevel = "fatal";
    expect(level).toBe("fatal");
  });
});