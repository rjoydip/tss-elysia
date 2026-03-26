import { describe, it, expect } from "bun:test";
import { treaty } from "@elysiajs/eden";
import { app } from "../src/routes/api.$.ts";

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

const api = treaty(app);

describe("Eden Treaty - API Endpoints", () => {
  describe("GET /api", () => {
    it("should return welcome message", async () => {
      const { data, error, status } = await api.api.get();

      expect(error).toBeNull();
      expect(status).toBe(200);
      expect(data).toContain("Welcome to");
    });

    it("should return text/plain content type", async () => {
      const { response } = await api.api.get();

      expect(response.headers.get("content-type")).toContain("text/plain");
    });
  });

  describe("GET /api/health", () => {
    it("should return health status", async () => {
      const { data, error, status } = await api.api.health.get();

      expect(error).toBeNull();
      expect(status).toBe(200);
      expect(data).toHaveProperty("status", "ok");
    });

    it("should return name in health response", async () => {
      const { data, error } = await api.api.health.get();

      expect(error).toBeNull();
      expect(data).toHaveProperty("name");
      expect(typeof data?.name).toBe("string");
    });

    it("should return json content type", async () => {
      const { response } = await api.api.health.get();

      expect(response.headers.get("content-type")).toContain("application/json");
    });
  });
});
