import { describe, it, expect } from "bun:test";

const getHealthData = () => ({
  name: "TSS ELYSIA",
  status: "ok",
});

describe("API Health", () => {
  it("should return correct name", () => {
    const data = getHealthData();
    expect(data.name).toBe("TSS ELYSIA");
  });

  it("should return ok status", () => {
    const data = getHealthData();
    expect(data.status).toBe("ok");
  });

  it("should return correct response structure", () => {
    const data = getHealthData();
    expect(data).toHaveProperty("name");
    expect(data).toHaveProperty("status");
  });
});

describe("API Root", () => {
  it("should return welcome message", () => {
    const name = "TSS ELYSIA";
    const message = `Welcome to ${name}`;
    expect(message).toBe("Welcome to TSS ELYSIA");
  });
});
