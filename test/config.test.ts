import { describe, expect, it } from "bun:test";
import {
  API_PREFIX,
  API_NAME,
  HOST,
  PORT,
  isBrowser,
  isBun,
  isNode,
  isProduction,
  appConfig,
  rateLimitConfig,
  corsConfig,
  helmetConfig,
  logger,
} from "../src/config.ts";

describe("_config", () => {
  describe("API Configuration", () => {
    it("should have default API_PREFIX", () => {
      expect(API_PREFIX).toBe("/api");
    });

    it("should have default API_NAME", () => {
      expect(API_NAME).toBe("TSS ELYSIA");
    });

    it("should have HOST as string", () => {
      expect(typeof HOST).toBe("string");
      expect(HOST.length).toBeGreaterThan(0);
    });

    it("should have PORT as number", () => {
      expect(typeof PORT).toBe("number");
      expect(PORT).toBeGreaterThan(0);
    });
  });

  describe("Runtime Detection", () => {
    it("should detect Bun runtime", () => {
      expect(typeof isBun).toBe("boolean");
    });

    it("should detect Node runtime", () => {
      expect(typeof isNode).toBe("boolean");
    });

    it("should detect browser environment", () => {
      expect(typeof isBrowser).toBe("boolean");
    });

    it("should correctly identify production", () => {
      expect(typeof isProduction).toBe("boolean");
    });
  });

  describe("appConfig", () => {
    it("should have normalize enabled", () => {
      expect(appConfig.normalize).toBe(true);
    });

    it("should have empty prefix", () => {
      expect(appConfig.prefix).toBe("");
    });

    it("should have nativeStaticResponse enabled", () => {
      expect(appConfig.nativeStaticResponse).toBe(true);
    });

    it("should have websocket config", () => {
      expect(appConfig.websocket).toBeDefined();
      expect(appConfig.websocket?.idleTimeout).toBe(30);
    });
  });

  describe("rateLimitConfig", () => {
    it("should have duration of 60 seconds", () => {
      expect(rateLimitConfig.duration).toBe(60_000);
    });

    it("should have max of 100 requests", () => {
      expect(rateLimitConfig.max).toBe(100);
    });
  });

  describe("corsConfig", () => {
    it("should allow all origins", () => {
      expect(corsConfig.origin).toBe("*");
    });

    it("should include common HTTP methods", () => {
      expect(corsConfig.methods).toContain("GET");
      expect(corsConfig.methods).toContain("POST");
      expect(corsConfig.methods).toContain("DELETE");
    });

    it("should have credentials enabled", () => {
      expect(corsConfig.credentials).toBe(true);
    });

    it("should have maxAge set", () => {
      expect(corsConfig.maxAge).toBe(86400);
    });
  });

  describe("helmetConfig", () => {
    it("should have contentSecurityPolicy enabled", () => {
      expect(helmetConfig.contentSecurityPolicy).toBe(true);
    });

    it("should have xPoweredBy disabled", () => {
      expect(helmetConfig.xPoweredBy).toBe(false);
    });

    it("should have xContentTypeOptions enabled", () => {
      expect(helmetConfig.xContentTypeOptions).toBe(true);
    });
  });

  describe("logger", () => {
    it("should have info method", () => {
      expect(typeof logger.info).toBe("function");
    });

    it("should have warn method", () => {
      expect(typeof logger.warn).toBe("function");
    });

    it("should have error method", () => {
      expect(typeof logger.error).toBe("function");
    });

    it("should have debug method", () => {
      expect(typeof logger.debug).toBe("function");
    });
  });
});
