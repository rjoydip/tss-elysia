import { describe, expect, it } from "bun:test";
import {
  hashQuery,
  extractTableName,
  analyzeQuery,
  SLOW_QUERY_THRESHOLD_MS,
} from "~/lib/db/optimize";

describe("Query Optimization", () => {
  describe("hashQuery", () => {
    it("should generate consistent hash for same query", () => {
      const query = "SELECT * FROM users WHERE id = 1";
      const hash1 = hashQuery(query);
      const hash2 = hashQuery(query);

      expect(hash1).toBe(hash2);
      expect(hash1.length).toBe(32);
    });

    it("should generate same hash regardless of case", () => {
      const query1 = "SELECT * FROM users";
      const query2 = "select * from users";

      const hash1 = hashQuery(query1);
      const hash2 = hashQuery(query2);

      expect(hash1).toBe(hash2);
    });

    it("should generate different hash for different queries", () => {
      const query1 = "SELECT * FROM users";
      const query2 = "SELECT * FROM posts";

      const hash1 = hashQuery(query1);
      const hash2 = hashQuery(query2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("extractTableName", () => {
    it("should extract table name from SELECT query", () => {
      const query = "SELECT * FROM users WHERE id = 1";
      const tableName = extractTableName(query);

      expect(tableName).toBe("users");
    });

    it("should extract table name from INSERT query", () => {
      const query = "INSERT INTO posts (title) VALUES ('test')";
      const tableName = extractTableName(query);

      expect(tableName).toBe("posts");
    });

    it("should extract table name from UPDATE query", () => {
      const query = "UPDATE users SET name = 'John' WHERE id = 1";
      const tableName = extractTableName(query);

      expect(tableName).toBe("users");
    });

    it("should return null for invalid query", () => {
      const query = "INVALID QUERY";
      const tableName = extractTableName(query);

      expect(tableName).toBeNull();
    });
  });

  describe("analyzeQuery", () => {
    it("should warn about SELECT *", () => {
      const result = analyzeQuery("SELECT * FROM users");

      expect(result.suggestions.some((s) => s.includes("SELECT *"))).toBe(true);
    });

    it("should warn about LIKE with leading wildcard", () => {
      const result = analyzeQuery("SELECT * FROM users WHERE name LIKE '%john'");

      expect(result.warnings.some((w) => w.includes("LIKE"))).toBe(true);
    });

    it("should warn about query without WHERE", () => {
      const result = analyzeQuery("SELECT * FROM users ORDER BY created_at");

      expect(result.suggestions.some((s) => s.includes("WHERE clause"))).toBe(true);
    });

    it("should warn about implicit JOIN", () => {
      const result = analyzeQuery(
        "SELECT * FROM users JOIN posts users.id = posts.userId WHERE users.id = 1",
      );

      expect(result.warnings.some((w) => w.includes("Implicit JOIN"))).toBe(true);
    });

    it("should suggest optimization for NOT IN", () => {
      const result = analyzeQuery("SELECT * FROM users WHERE id NOT IN (1, 2, 3)");

      expect(result.suggestions.some((s) => s.includes("LEFT JOIN"))).toBe(true);
    });

    it("should not warn about well-formed queries", () => {
      const result = analyzeQuery("SELECT id, name FROM users WHERE id = 1");

      expect(result.warnings.length).toBe(0);
      expect(result.suggestions.length).toBe(0);
    });
  });

  describe("SLOW_QUERY_THRESHOLD_MS", () => {
    it("should be defined and positive", () => {
      expect(SLOW_QUERY_THRESHOLD_MS).toBeGreaterThan(0);
      expect(SLOW_QUERY_THRESHOLD_MS).toBe(100);
    });
  });
});