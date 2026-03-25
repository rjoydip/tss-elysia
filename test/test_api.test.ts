import { describe, it, expect } from "bun:test";

const getTestData = () => ({
  message: "Hello from test API",
  timestamp: new Date().toISOString(),
});

describe("Test API", () => {
  it("should return correct message", () => {
    const data = getTestData();
    expect(data.message).toBe("Hello from test API");
  });

  it("should include timestamp", () => {
    const data = getTestData();
    expect(data.timestamp).toBeDefined();
  });

  it("should return JSON response structure", () => {
    const data = getTestData();
    expect(data).toHaveProperty("message");
    expect(data).toHaveProperty("timestamp");
  });
});
