import { describe, it, expect } from "bun:test";
import { mcpRoutes } from "../../../../src/routes/api/mcp/$.ts";
import { MCP_TOOL_CATALOG } from "../../../../src/lib/mcp/tools/catalog";

describe("MCP API Flows", () => {
  it("should return 404 for unknown routes", async () => {
    const response = await mcpRoutes.handle(new Request("http://localhost/unknown-route"));

    expect(response.status).toBe(404);
  });

  it("should include CORS headers", async () => {
    const response = await mcpRoutes.handle(
      new Request("http://localhost/api/mcp", {
        method: "OPTIONS",
        headers: {
          Origin: "http://localhost:3000",
          "Access-Control-Request-Method": "GET",
        },
      }),
    );

    expect(response.headers.get("Access-Control-Allow-Origin")).toBeDefined();
  });

  it("should handle error response format", async () => {
    const response = await mcpRoutes.handle(new Request("http://localhost/api/mcp/nonexistent"));

    expect(response.status).toBe(404);
  });

  it("should include trace headers in response", async () => {
    const response = await mcpRoutes.handle(new Request("http://localhost/api/mcp/"));

    expect(response.headers.get("X-Elapsed")).toBeDefined();
  });
});

describe("MCP API Root", () => {
  it("should return welcome message", async () => {
    const response = await mcpRoutes.handle(new Request("http://localhost/api/mcp/"));
    const text = await response.text();

    expect(text).toContain("Welcome to");
    expect(text).toContain("MCP");
  });

  it("should return text/plain content type", async () => {
    const response = await mcpRoutes.handle(new Request("http://localhost/api/mcp/"));

    expect(response.headers.get("content-type")).toContain("text/plain");
  });
});

describe("MCP API Health", () => {
  it("should return health status", async () => {
    const response = await mcpRoutes.handle(new Request("http://localhost/api/mcp/health"));
    const json = await response.json();

    expect(json).toHaveProperty("status", "healthy");
    expect(json).toHaveProperty("activeConnections");
    expect(json).toHaveProperty("timestamp");
  });

  it("should return json content type", async () => {
    const response = await mcpRoutes.handle(new Request("http://localhost/api/mcp/health"));

    expect(response.headers.get("content-type")).toContain("application/json");
  });
});

describe("MCP API Tools", () => {
  it("should return list of MCP tools", async () => {
    const response = await mcpRoutes.handle(new Request("http://localhost/api/mcp/tools"));
    const json = await response.json();

    expect(json).toHaveProperty("tools");
    expect(Array.isArray(json.tools)).toBe(true);
    expect(json.tools.length).toBeGreaterThan(0);
  });

  it("should include auth-related tools", async () => {
    const response = await mcpRoutes.handle(new Request("http://localhost/api/mcp/tools"));
    const json = await response.json();

    const authTools = json.tools.filter((tool: { category: string }) => tool.category === "auth");
    expect(authTools.length).toBeGreaterThan(0);
  });

  it("should match the shared MCP tool catalog names", async () => {
    // Shared catalog is the source of truth for tool discovery payload.
    const response = await mcpRoutes.handle(new Request("http://localhost/api/mcp/tools"));
    const json = await response.json();

    const responseNames = json.tools.map((tool: { name: string }) => tool.name).sort();
    const catalogNames = MCP_TOOL_CATALOG.map((tool) => tool.name).sort();

    expect(responseNames).toEqual(catalogNames);
  });

  it("should include user-related tools", async () => {
    const response = await mcpRoutes.handle(new Request("http://localhost/api/mcp/tools"));
    const json = await response.json();

    const userTools = json.tools.filter((tool: { category: string }) => tool.category === "users");
    expect(userTools.length).toBeGreaterThan(0);
  });

  it("should include organization-related tools", async () => {
    const response = await mcpRoutes.handle(new Request("http://localhost/api/mcp/tools"));
    const json = await response.json();

    const orgTools = json.tools.filter(
      (tool: { category: string }) => tool.category === "organization",
    );
    expect(orgTools.length).toBeGreaterThan(0);
  });

  it("should have proper tool structure", async () => {
    const response = await mcpRoutes.handle(new Request("http://localhost/api/mcp/tools"));
    const json = await response.json();

    const tool = json.tools[0];
    expect(tool).toHaveProperty("name");
    expect(tool).toHaveProperty("title");
    expect(tool).toHaveProperty("description");
    expect(tool).toHaveProperty("category");
  });

  it("should return json content type for tools", async () => {
    const response = await mcpRoutes.handle(new Request("http://localhost/api/mcp/tools"));

    expect(response.headers.get("content-type")).toContain("application/json");
  });
});