/**
 * Unit tests for src/config/docs.ts
 * Tests: docsConfig structure, navItems, DocSection/DocItem types
 */

import { describe, expect, it } from "bun:test";
import { docsConfig, navItems } from "../../src/config/docs";

describe("docsConfig", () => {
  it("should be a non-empty array", () => {
    expect(Array.isArray(docsConfig)).toBe(true);
    expect(docsConfig.length).toBeGreaterThan(0);
  });

  it("should have sections with title and items", () => {
    for (const section of docsConfig) {
      expect(typeof section.title).toBe("string");
      expect(section.title.length).toBeGreaterThan(0);
      expect(Array.isArray(section.items)).toBe(true);
    }
  });

  it("should have items with name and href", () => {
    for (const section of docsConfig) {
      for (const item of section.items) {
        expect(typeof item.name).toBe("string");
        expect(item.name.length).toBeGreaterThan(0);
        expect(typeof item.href).toBe("string");
        expect(item.href.length).toBeGreaterThan(0);
      }
    }
  });

  it("should have all hrefs start with /docs", () => {
    for (const section of docsConfig) {
      for (const item of section.items) {
        expect(item.href).toMatch(/^\/docs/);
      }
    }
  });

  it("should have unique hrefs across all sections", () => {
    const allHrefs = docsConfig.flatMap((s) => s.items.map((i) => i.href));
    const uniqueHrefs = new Set(allHrefs);
    expect(uniqueHrefs.size).toBe(allHrefs.length);
  });

  it("should have Getting Started section", () => {
    const section = docsConfig.find((s) => s.title === "Getting Started");
    expect(section).toBeDefined();
    expect(section!.items.length).toBeGreaterThanOrEqual(2);
  });

  it("should have Authentication section", () => {
    const section = docsConfig.find((s) => s.title === "Authentication");
    expect(section).toBeDefined();
    expect(section!.items.length).toBeGreaterThanOrEqual(4);
  });

  it("should have API Reference section", () => {
    const section = docsConfig.find((s) => s.title === "API Reference");
    expect(section).toBeDefined();
    expect(section!.items.length).toBeGreaterThanOrEqual(1);
  });

  it("should have Overview item in Getting Started pointing to /docs", () => {
    const section = docsConfig.find((s) => s.title === "Getting Started");
    const overview = section!.items.find((i) => i.name === "Overview");
    expect(overview).toBeDefined();
    expect(overview!.href).toBe("/docs");
  });

  it("should contain all expected flat auth routes", () => {
    const authSection = docsConfig.find((s) => s.title === "Authentication");
    const authHrefs = authSection!.items.map((i) => i.href);
    expect(authHrefs).toContain("/docs/auth/overview");
    expect(authHrefs).toContain("/docs/auth/login");
    expect(authHrefs).toContain("/docs/auth/register");
    expect(authHrefs).toContain("/docs/auth/token");
    expect(authHrefs).toContain("/docs/auth/middleware");
  });
});

describe("navItems", () => {
  it("should be a non-empty array", () => {
    expect(Array.isArray(navItems)).toBe(true);
    expect(navItems.length).toBeGreaterThan(0);
  });

  it("should have items with name and href", () => {
    for (const item of navItems) {
      expect(typeof item.name).toBe("string");
      expect(item.name.length).toBeGreaterThan(0);
      expect(typeof item.href).toBe("string");
      expect(item.href.length).toBeGreaterThan(0);
    }
  });

  it("should contain Docs link", () => {
    const docs = navItems.find((i) => i.name === "Docs");
    expect(docs).toBeDefined();
    expect(docs!.href).toBe("/docs");
  });

  it("should contain API link pointing to flat route", () => {
    const api = navItems.find((i) => i.name === "API");
    expect(api).toBeDefined();
    expect(api!.href).toBe("/docs/api/reference");
  });

  it("should contain Blog link", () => {
    const blog = navItems.find((i) => i.name === "Blog");
    expect(blog).toBeDefined();
    expect(blog!.href).toBe("/blog");
  });

  it("should contain Changelog link", () => {
    const changelog = navItems.find((i) => i.name === "Changelog");
    expect(changelog).toBeDefined();
    expect(changelog!.href).toBe("/changelog");
  });

  it("should have exactly 4 nav items", () => {
    expect(navItems).toHaveLength(4);
  });
});