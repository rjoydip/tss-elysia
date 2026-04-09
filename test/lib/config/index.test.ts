/**
 * Unit tests for configuration settings.
 */

import { describe, it, expect } from "bun:test";
import { sessionConfig, rateLimitConfig, corsConfig } from "../../../src/config";

describe("sessionConfig", () => {
  it("should have expiresIn for session lifetime", () => {
    expect(sessionConfig.expiresIn).toBeDefined();
    expect(sessionConfig.expiresIn).toBeGreaterThan(0);
  });

  it("should have updateAge for session refresh frequency", () => {
    expect(sessionConfig.updateAge).toBeDefined();
    expect(sessionConfig.updateAge).toBeGreaterThan(0);
  });

  it("expiresIn should be 7 days in seconds", () => {
    const sevenDays = 7 * 24 * 60 * 60;
    expect(sessionConfig.expiresIn).toBe(sevenDays);
  });

  it("updateAge should be 24 hours in seconds", () => {
    const twentyFourHours = 24 * 60 * 60;
    expect(sessionConfig.updateAge).toBe(twentyFourHours);
  });
});

describe("rateLimitConfig", () => {
  it("should have duration", () => {
    expect(rateLimitConfig.duration).toBeDefined();
    expect(rateLimitConfig.duration).toBeGreaterThan(0);
  });

  it("should have max requests", () => {
    expect(rateLimitConfig.max).toBeDefined();
    expect(rateLimitConfig.max).toBeGreaterThan(0);
  });
});

describe("corsConfig", () => {
  it("should have origin", () => {
    expect(corsConfig.origin).toBeDefined();
  });

  it("should have allowed methods", () => {
    expect(corsConfig.methods).toBeDefined();
    expect(Array.isArray(corsConfig.methods)).toBe(true);
  });

  it("should have maxAge for preflight caching", () => {
    expect(corsConfig.maxAge).toBeDefined();
    expect(corsConfig.maxAge).toBeGreaterThan(0);
  });
});