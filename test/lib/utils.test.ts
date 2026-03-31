/**
 * Unit tests for src/lib/utils.ts
 * Tests: cn (class merging), titleCase, brand utilities
 */

import { describe, expect, it } from "bun:test";
import { cn, titleCase } from "../../src/lib/utils";

describe("cn", () => {
  it("should merge class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", false, "end")).toBe("base end");
    expect(cn("base", "hidden", "end")).toBe("base hidden end");
  });

  it("should handle undefined and null", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("should handle empty strings", () => {
    expect(cn("", "foo", "")).toBe("foo");
  });

  it("should keep duplicate non-Tailwind classes", () => {
    // clsx does not deduplicate; twMerge only handles Tailwind conflicts
    expect(cn("foo", "foo")).toBe("foo foo");
  });

  it("should resolve Tailwind padding conflicts (last wins)", () => {
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });

  it("should resolve conflicting margin classes", () => {
    const result = cn("mt-4", "mt-2");
    expect(result).toBe("mt-2");
  });

  it("should resolve conflicting text colors", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("should handle arrays of classes", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("should handle object-style conditional classes", () => {
    const result = cn("base", { conditional: true, hidden: false });
    expect(result).toContain("base");
    expect(result).toContain("conditional");
    expect(result).not.toContain("hidden");
  });

  it("should return empty string for no arguments", () => {
    expect(cn()).toBe("");
  });

  it("should handle complex Tailwind conflict resolution", () => {
    const result = cn("bg-red-500 p-4 text-white", "bg-blue-500 p-2");
    expect(result).toContain("bg-blue-500");
    expect(result).toContain("p-2");
    expect(result).toContain("text-white");
    expect(result).not.toContain("bg-red-500");
    expect(result).not.toContain("p-4");
  });

  it("should preserve non-conflicting Tailwind classes", () => {
    const result = cn("flex items-center", "justify-center p-4");
    expect(result).toContain("flex");
    expect(result).toContain("items-center");
    expect(result).toContain("justify-center");
    expect(result).toContain("p-4");
  });

  it("should handle mixed string and array inputs", () => {
    const result = cn("base", ["extra", "more"]);
    expect(result).toContain("base");
    expect(result).toContain("extra");
    expect(result).toContain("more");
  });
});

describe("titleCase", () => {
  it("should capitalize first letter of each word", () => {
    expect(titleCase("hello world")).toBe("Hello World");
  });

  it("should handle single word", () => {
    expect(titleCase("hello")).toBe("Hello");
  });

  it("should handle already capitalized strings", () => {
    expect(titleCase("Hello World")).toBe("Hello World");
  });

  it("should handle all caps", () => {
    expect(titleCase("HELLO WORLD")).toBe("HELLO WORLD");
  });

  it("should handle empty string", () => {
    expect(titleCase("")).toBe("");
  });

  it("should handle hyphenated words", () => {
    expect(titleCase("api-reference")).toBe("Api-Reference");
  });

  it("should handle multiple spaces", () => {
    expect(titleCase("hello  world")).toBe("Hello  World");
  });

  it("should handle single character words", () => {
    expect(titleCase("a b c")).toBe("A B C");
  });

  it("should handle strings with numbers", () => {
    expect(titleCase("version 2 release")).toBe("Version 2 Release");
  });
});