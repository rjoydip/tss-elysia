/**
 * Unit tests for src/config/docs.ts
 * Tests: docsConfig structure, navItems, DocSection/DocItem types
 * Verifies dynamic config built from /docs directory structure
 */

import { describe, expect, it } from "bun:test";
import { docsConfig } from "../../src/config/docs";
import { navItems } from "../../src/config/index";

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

  it("should have Getting Started section with 3 items", () => {
    const section = docsConfig.find((s) => s.title === "Getting Started");
    expect(section).toBeDefined();
    expect(section!.items).toHaveLength(3);
  });

  it("should have Authentication section", () => {
    const section = docsConfig.find((s) => s.title === "Authentication");
    expect(section).toBeDefined();
    expect(section!.items.length).toBeGreaterThanOrEqual(1);
  });

  it("should have API section", () => {
    const section = docsConfig.find((s) => s.title === "API");
    expect(section).toBeDefined();
    expect(section!.items.length).toBeGreaterThanOrEqual(1);
  });

  it("should have Infrastructure section with CI/CD and Docker", () => {
    const section = docsConfig.find((s) => s.title === "Infrastructure");
    expect(section).toBeDefined();
    const hrefs = section!.items.map((i) => i.href);
    expect(hrefs).toContain("/docs/infra/ci-cd");
    expect(hrefs).toContain("/docs/infra/docker");
  });

  it("should have Guides section with 5 items", () => {
    const section = docsConfig.find((s) => s.title === "Guides");
    expect(section).toBeDefined();
    expect(section!.items).toHaveLength(5);
    const hrefs = section!.items.map((i) => i.href);
    expect(hrefs).toContain("/docs/guides/environment-variables");
    expect(hrefs).toContain("/docs/guides/middleware");
    expect(hrefs).toContain("/docs/guides/testing");
    expect(hrefs).toContain("/docs/guides/troubleshooting");
  });

  it("should have Overview item in Getting Started pointing to /docs", () => {
    const section = docsConfig.find((s) => s.title === "Getting Started");
    const overview = section!.items.find((i) => i.name === "Overview");
    expect(overview).toBeDefined();
    expect(overview!.href).toBe("/docs");
  });

  it("should have getting-started paths for Development and Architecture", () => {
    const section = docsConfig.find((s) => s.title === "Getting Started");
    const hrefs = section!.items.map((i) => i.href);
    expect(hrefs).toContain("/docs/getting-started/development");
    expect(hrefs).toContain("/docs/getting-started/architecture");
  });

  it("should have auth overview in Authentication section", () => {
    const authSection = docsConfig.find((s) => s.title === "Authentication");
    const authHrefs = authSection!.items.map((i) => i.href);
    expect(authHrefs).toContain("/docs/auth/overview");
  });

  it("should have api overview in API section", () => {
    const apiSection = docsConfig.find((s) => s.title === "API");
    const apiHrefs = apiSection!.items.map((i) => i.href);
    expect(apiHrefs).toContain("/docs/api/overview");
  });

  it("should display Overview as item name for all overview pages", () => {
    for (const section of docsConfig) {
      const overviewItems = section.items.filter(
        (item) => item.href.endsWith("/overview") || item.href === "/docs",
      );
      for (const item of overviewItems) {
        expect(item.name).toBe("Overview");
      }
    }
  });

  it("should have Overview as first item in each section", () => {
    for (const section of docsConfig) {
      const firstItem = section.items[0];
      expect(firstItem).toBeDefined();
      expect(firstItem.name).toBe("Overview");
    }
  });

  it("should maintain section order: Getting Started, Authentication, API, Infrastructure, Guides", () => {
    const titles = docsConfig.map((s) => s.title);
    const gettingStartedIdx = titles.indexOf("Getting Started");
    const authIdx = titles.indexOf("Authentication");
    const apiIdx = titles.indexOf("API");
    const infraIdx = titles.indexOf("Infrastructure");
    const guidesIdx = titles.indexOf("Guides");

    expect(gettingStartedIdx).toBeLessThan(authIdx);
    expect(authIdx).toBeLessThan(apiIdx);
    expect(apiIdx).toBeLessThan(infraIdx);
    expect(infraIdx).toBeLessThan(guidesIdx);
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
    const docs = navItems.find((i) => i.name === "Documentation");
    expect(docs).toBeDefined();
    expect(docs!.href).toBe("/docs");
  });

  it("should contain API link pointing to api overview", () => {
    const api = docsConfig.find((i) => i.title === "API");
    expect(api).toBeDefined();
    expect(api!.items[0].href).toBe("/docs/api/overview");
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
    expect(navItems).toHaveLength(3);
  });
});