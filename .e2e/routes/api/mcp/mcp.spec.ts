/**
 * E2E tests for MCP endpoints
 * Tests: health, tools discover
 */

import { test, expect } from "@playwright/test";
import { E2E_BASE_URL } from "../../../config";

const MCP_BASE_URL = `${E2E_BASE_URL}/api/mcp`;

test.describe("MCP Root Endpoint", () => {
  test("should return welcome message", async ({ request }) => {
    const response = await request.get(`${MCP_BASE_URL}/`);
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("Welcome to MCP Service");
  });

  test("should return text/plain content type", async ({ request }) => {
    const response = await request.get(`${MCP_BASE_URL}/`);
    expect(response.headers()["content-type"]).toMatch(/text\/plain/);
  });
});

test.describe("MCP Health Endpoint", () => {
  test("should return 200 with health status", async ({ request }) => {
    const response = await request.get(`${MCP_BASE_URL}/health`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("healthy");
    expect(body.activeConnections).toBeDefined();
    expect(body.timestamp).toBeDefined();
  });

  test("should return JSON content type", async ({ request }) => {
    const response = await request.get(`${MCP_BASE_URL}/health`);
    expect(response.headers()["content-type"]).toContain("application/json");
  });
});

test.describe("MCP Tools Discovery", () => {
  test("should return list of available tools", async ({ request }) => {
    const response = await request.get(`${MCP_BASE_URL}/tools`);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.tools).toBeDefined();
    expect(Array.isArray(body.tools)).toBe(true);
    expect(body.tools.length).toBeGreaterThan(0);
  });

  test("should include auth tools", async ({ request }) => {
    const response = await request.get(`${MCP_BASE_URL}/tools`);
    const body = await response.json();

    const toolNames = body.tools.map((t: { name: string }) => t.name);
    expect(toolNames).toContain("get-current-user");
    expect(toolNames).toContain("list-sessions");
    expect(toolNames).toContain("revoke-session");
  });

  test("should include user tools", async ({ request }) => {
    const response = await request.get(`${MCP_BASE_URL}/tools`);
    const body = await response.json();

    const toolNames = body.tools.map((t: { name: string }) => t.name);
    expect(toolNames).toContain("get-user");
    expect(toolNames).toContain("list-users");
    expect(toolNames).toContain("update-user");
  });

  test("should include organization tools", async ({ request }) => {
    const response = await request.get(`${MCP_BASE_URL}/tools`);
    const body = await response.json();

    const toolNames = body.tools.map((t: { name: string }) => t.name);
    expect(toolNames).toContain("get-organization");
    expect(toolNames).toContain("list-members");
  });

  test("should include tool metadata", async ({ request }) => {
    const response = await request.get(`${MCP_BASE_URL}/tools`);
    const body = await response.json();

    const tool = body.tools[0];
    expect(tool.name).toBeDefined();
    expect(tool.title).toBeDefined();
    expect(tool.description).toBeDefined();
    expect(tool.category).toBeDefined();
  });
});
