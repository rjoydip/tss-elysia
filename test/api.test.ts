import { describe, expect, it } from "bun:test";
import { createApp } from "../src/app";

const testApp = createApp();

describe("API Flows", () => {
  it("should return 404 for unknown routes", async () => {
    const response = await testApp.handle(new Request("http://localhost/unknown-route"));

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe("Endpoint not found");
  });

  it("should include CORS headers", async () => {
    const response = await testApp.handle(
      new Request("http://localhost/api/health", {
        method: "OPTIONS",
        headers: {
          Origin: "http://localhost:3000",
          "Access-Control-Request-Method": "GET",
        },
      }),
    );

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("should handle error response format", async () => {
    const response = await testApp.handle(new Request("http://localhost/api/nonexistent"));

    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toHaveProperty("error");
  });

  it("should include trace headers in response", async () => {
    const response = await testApp.handle(new Request("http://localhost/api/health"));

    expect(response.headers.get("X-Elapsed")).toBeDefined();
  });
});
