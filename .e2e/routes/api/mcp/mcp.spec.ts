/**
 * E2E tests for MCP endpoints
 * Tests: health, tools discover
 */

import { test, expect } from "@playwright/test";
import { apiGet } from "../../../helpers/api-route";
import { E2E_BASE_URL } from "../../../_config";

const MCP_BASE_URL = `${E2E_BASE_URL}/api/mcp`;

test.describe("MCP Root Endpoint", () => {
  test("should return welcome message", async ({ page }) => {
    const response = await apiGet(page, `${MCP_BASE_URL}/`);
    expect(response.status).toBe(200);
    expect(response.text).toContain("Welcome to MCP Service");
  });

  test("should return text/plain content type", async ({ page }) => {
    const response = await apiGet(page, `${MCP_BASE_URL}/`);
    expect(response.headers["content-type"]).toMatch(/text\/plain/);
  });
});

test.describe("MCP Health Endpoint", () => {
  test("should return 200 with health status", async ({ page }) => {
    const response = await apiGet(page, `${MCP_BASE_URL}/health`);
    expect(response.status).toBe(200);

    const body = response.body as {
      status: string;
      activeConnections: number;
      timestamp: number;
    };
    expect(body.status).toBe("healthy");
    expect(body.activeConnections).toBeDefined();
    expect(body.timestamp).toBeDefined();
  });

  test("should return JSON content type", async ({ page }) => {
    const response = await apiGet(page, `${MCP_BASE_URL}/health`);
    expect(response.headers["content-type"]).toContain("application/json");
  });
});

test.describe("MCP Tools Discovery", () => {
  test("should return list of available tools", async ({ page }) => {
    const response = await apiGet(page, `${MCP_BASE_URL}/tools`);
    expect(response.status).toBe(200);

    const body = response.body as { tools: Array<unknown> };
    expect(body.tools).toBeDefined();
    expect(Array.isArray(body.tools)).toBe(true);
    expect(body.tools.length).toBeGreaterThan(0);
  });

  test("should include auth tools", async ({ page }) => {
    const response = await apiGet(page, `${MCP_BASE_URL}/tools`);
    const body = response.body as { tools: Array<{ name: string }> };

    const toolNames = body.tools.map((t) => t.name);
    expect(toolNames).toContain("get-current-user");
    expect(toolNames).toContain("list-sessions");
    expect(toolNames).toContain("revoke-session");
  });

  test("should include user tools", async ({ page }) => {
    const response = await apiGet(page, `${MCP_BASE_URL}/tools`);
    const body = response.body as { tools: Array<{ name: string }> };

    const toolNames = body.tools.map((t) => t.name);
    expect(toolNames).toContain("get-user");
    expect(toolNames).toContain("list-users");
    expect(toolNames).toContain("update-user");
  });

  test("should include organization tools", async ({ page }) => {
    const response = await apiGet(page, `${MCP_BASE_URL}/tools`);
    const body = response.body as { tools: Array<{ name: string }> };

    const toolNames = body.tools.map((t) => t.name);
    expect(toolNames).toContain("get-organization");
    expect(toolNames).toContain("list-members");
  });

  test("should include tool metadata", async ({ page }) => {
    const response = await apiGet(page, `${MCP_BASE_URL}/tools`);
    const body = response.body as {
      tools: Array<{ name: string; title: string; description: string; category: string }>;
    };

    const tool = body.tools[0];
    expect(tool.name).toBeDefined();
    expect(tool.title).toBeDefined();
    expect(tool.description).toBeDefined();
    expect(tool.category).toBeDefined();
  });
});