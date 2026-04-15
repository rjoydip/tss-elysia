/**
 * MCP Server instance and configuration.
 * Initializes the Model Context Protocol server with tools, resources, and capabilities.
 * Uses Streamable HTTP transport for remote client connections.
 */

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/server";
import { randomUUID } from "uncrypto";
import { logger } from "~/lib/logger";
import { registerAuthTools } from "./tools/auth";
import { registerUserTools } from "./tools/users";
import { registerOrganizationTools } from "./tools/organizations";

/**
 * Creates and configures the MCP server instance.
 * Registers all available tools for external AI clients.
 */
export function createMcpServer(): McpServer {
  const server = new McpServer(
    {
      name: "tss-elysia",
      version: "1.0.0",
    },
    {
      instructions:
        "Tools for managing users, organizations, and authentication. " +
        "Use organization-scoped tools to access data within your organization. " +
        "All tools require valid API key authentication.",
      capabilities: {
        tools: {},
        resources: {},
        logging: {},
      },
    },
  );

  // Register tool categories
  registerAuthTools(server);
  registerUserTools(server);
  registerOrganizationTools(server);

  // Register static resources
  server.registerResource(
    "server-info",
    "mcp://server/info",
    {
      title: "Server Information",
      description: "Information about this MCP server",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "mcp://server/info",
          text: JSON.stringify({
            name: "tss-elysia",
            version: "1.0.0",
            description: "MCP server for user, organization, and auth management",
            capabilities: ["tools", "resources", "logging"],
          }),
        },
      ],
    }),
  );

  // Register dynamic resource templates
  server.registerResource(
    "user-profile",
    new ResourceTemplate("mcp://user/{userId}/profile", {
      list: async () => ({
        resources: [],
      }),
    }),
    {
      title: "User Profile",
      description: "User profile data",
      mimeType: "application/json",
    },
    async (uri, { userId }) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify({
            userId,
            message: "Use get-user tool to fetch details",
          }),
        },
      ],
    }),
  );

  server.registerResource(
    "organization",
    new ResourceTemplate("mcp://organization/{organizationId}", {
      list: async () => ({
        resources: [],
      }),
    }),
    {
      title: "Organization Data",
      description: "Organization information",
      mimeType: "application/json",
    },
    async (uri, { organizationId }) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify({
            organizationId,
            message: "Use get-organization tool",
          }),
        },
      ],
    }),
  );

  logger.info("MCP server initialized with tools");
  return server;
}

/**
 * Singleton MCP server instance.
 */
let _mcpServer: McpServer | undefined;

/**
 * Gets or creates the MCP server instance.
 */
export function getMcpServer(): McpServer {
  if (!_mcpServer) {
    _mcpServer = createMcpServer();
  }
  return _mcpServer;
}

/**
 * Session ID generator for HTTP transport.
 * Creates unique session IDs for each MCP client connection.
 */
export function createSessionId(): string {
  return randomUUID();
}