import { describe, expect, it } from "bun:test";
import {
  compareVersions,
  isNewerVersion,
  isOlderVersion,
  calculateSchemaChecksum,
  CURRENT_SCHEMA_VERSION,
} from "~/lib/db/versioning";

describe("Schema Versioning", () => {
  describe("CURRENT_SCHEMA_VERSION", () => {
    it("should be defined", () => {
      expect(CURRENT_SCHEMA_VERSION).toBeDefined();
      expect(CURRENT_SCHEMA_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  describe("compareVersions", () => {
    it("should return 0 for equal versions", () => {
      expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
      expect(compareVersions("2.1.3", "2.1.3")).toBe(0);
    });

    it("should return -1 when first version is smaller", () => {
      expect(compareVersions("1.0.0", "2.0.0")).toBe(-1);
      expect(compareVersions("1.0.0", "1.1.0")).toBe(-1);
      expect(compareVersions("1.0.0", "1.0.1")).toBe(-1);
    });

    it("should return 1 when first version is larger", () => {
      expect(compareVersions("2.0.0", "1.0.0")).toBe(1);
      expect(compareVersions("1.1.0", "1.0.0")).toBe(1);
      expect(compareVersions("1.0.1", "1.0.0")).toBe(1);
    });

    it("should handle different version lengths", () => {
      expect(compareVersions("1.0", "1.0.0")).toBe(0);
      expect(compareVersions("1", "1.0.0")).toBe(0);
      expect(compareVersions("1.0.0.0", "1.0.0")).toBe(0);
    });
  });

  describe("isNewerVersion", () => {
    it("should return true when target is newer", () => {
      expect(isNewerVersion("1.0.0", "2.0.0")).toBe(true);
      expect(isNewerVersion("1.0.0", "1.1.0")).toBe(true);
    });

    it("should return false when target is same or older", () => {
      expect(isNewerVersion("1.0.0", "1.0.0")).toBe(false);
      expect(isNewerVersion("2.0.0", "1.0.0")).toBe(false);
    });
  });

  describe("isOlderVersion", () => {
    it("should return true when target is older", () => {
      expect(isOlderVersion("2.0.0", "1.0.0")).toBe(true);
      expect(isOlderVersion("1.1.0", "1.0.0")).toBe(true);
    });

    it("should return false when target is same or newer", () => {
      expect(isOlderVersion("1.0.0", "1.0.0")).toBe(false);
      expect(isOlderVersion("1.0.0", "2.0.0")).toBe(false);
    });
  });

  describe("calculateSchemaChecksum", () => {
    it("should generate consistent checksum", () => {
      const tables1 = ["users", "posts", "comments"];
      const tables2 = ["comments", "users", "posts"];

      const checksum1 = calculateSchemaChecksum(tables1);
      const checksum2 = calculateSchemaChecksum(tables2);

      expect(checksum1).toBe(checksum2);
    });

    it("should generate different checksum for different tables", () => {
      const tables1 = ["users", "posts"];
      const tables2 = ["users", "comments"];

      const checksum1 = calculateSchemaChecksum(tables1);
      const checksum2 = calculateSchemaChecksum(tables2);

      expect(checksum1).not.toBe(checksum2);
    });

    it("should return 16-character hex string", () => {
      const checksum = calculateSchemaChecksum(["users"]);

      expect(checksum.length).toBe(16);
      expect(checksum).toMatch(/^[a-f0-9]+$/);
    });

    it("should handle empty tables array", () => {
      const checksum = calculateSchemaChecksum([]);

      expect(checksum.length).toBe(16);
      expect(checksum).toMatch(/^[a-f0-9]+$/);
    });
  });
});