import { describe, it, expect } from "bun:test";
import { mcpRoutes } from "../../../../src/routes/api/mcp/$.ts";

describe("MCP Keys API Flows", () => {
  it("should return 404 for unknown routes", async () => {
    const response = await mcpRoutes.handle(new Request("http://localhost/api/mcp/unknown-route"));

    expect(response.status).toBe(404);
  });

  it("should return 401 without authorization", async () => {
    const response = await mcpRoutes.handle(new Request("http://localhost/api/mcp/keys"));

    expect(response.status).toBe(401);
  });
});

describe("MCP Keys API - Unauthorized Access", () => {
  it("should reject GET without auth", async () => {
    const response = await mcpRoutes.handle(
      new Request("http://localhost/api/mcp/keys", { method: "GET" }),
    );

    const text = await response.text();
    expect(response.status).toBe(401);
    expect(text).toContain("Unauthorized");
  });

  it("should reject POST without auth", async () => {
    const response = await mcpRoutes.handle(
      new Request("http://localhost/api/mcp/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Test Key" }),
      }),
    );

    const text = await response.text();
    expect(response.status).toBe(401);
    expect(text).toContain("Unauthorized");
  });

  it("should reject PUT without auth", async () => {
    const response = await mcpRoutes.handle(
      new Request("http://localhost/api/mcp/keys/test-key-id", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Updated Key" }),
      }),
    );

    const text = await response.text();
    expect(response.status).toBe(401);
    expect(text).toContain("Unauthorized");
  });

  it("should reject DELETE without auth", async () => {
    const response = await mcpRoutes.handle(
      new Request("http://localhost/api/mcp/keys/test-key-id", { method: "DELETE" }),
    );

    const text = await response.text();
    expect(response.status).toBe(401);
    expect(text).toContain("Unauthorized");
  });
});

describe("MCP Keys API - Create Key Validation", () => {
  it("should reject POST without name when no auth", async () => {
    const response = await mcpRoutes.handle(
      new Request("http://localhost/api/mcp/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }),
    );

    const text = await response.text();
    expect(response.status).toBe(401);
    expect(text).toContain("Unauthorized");
  });
});