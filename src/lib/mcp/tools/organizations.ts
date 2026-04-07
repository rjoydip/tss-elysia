/**
 * Organization management MCP tools.
 * Provides tools for managing organizations and members.
 * Note: Currently a placeholder - better-auth organization plugin would add real functionality.
 */

import type { McpServer } from "@modelcontextprotocol/server";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types";
import { z } from "zod";
import { getCurrentApiKey } from "../auth";

/**
 * Registers organization-related MCP tools.
 * These tools are placeholders - real implementation requires better-auth organization plugin.
 */
export function registerOrganizationTools(server: McpServer): void {
  /**
   * Get organization details.
   * Returns the organization associated with the API key.
   */
  server.registerTool(
    "get-organization",
    {
      title: "Get Organization",
      description:
        "Get details of the current organization. " +
        "Returns organization ID, name, and metadata.",
      inputSchema: z.object({}),
      outputSchema: z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string().optional(),
        logo: z.string().optional(),
      }),
    },
    async (): Promise<CallToolResult> => {
      try {
        const apiKey = getCurrentApiKey();
        if (!apiKey) {
          return {
            content: [{ type: "text", text: "Authentication required" }],
            isError: true,
          };
        }

        if (!apiKey.organizationId) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  message: "No organization associated with this API key",
                }),
              },
            ],
          };
        }

        // Placeholder - would query organization table
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                id: apiKey.organizationId,
                name: "Organization",
                slug: "org",
              }),
            },
          ],
          structuredContent: {
            id: apiKey.organizationId,
            name: "Organization",
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  /**
   * List organization members.
   * Returns members of the organization.
   */
  server.registerTool(
    "list-members",
    {
      title: "List Organization Members",
      description:
        "List all members of the current organization. " +
        "Returns member details including name, email, and role.",
      inputSchema: z.object({
        limit: z.number().optional().default(50).describe("Maximum members to return"),
        offset: z.number().optional().default(0).describe("Number of members to skip"),
      }),
      outputSchema: z.array(
        z.object({
          userId: z.string(),
          name: z.string().optional(),
          email: z.string(),
          role: z.string(),
        }),
      ),
    },
    async (): Promise<CallToolResult> => {
      try {
        const apiKey = getCurrentApiKey();
        if (!apiKey) {
          return {
            content: [{ type: "text", text: "Authentication required" }],
            isError: true,
          };
        }

        if (!apiKey.organizationId) {
          return {
            content: [{ type: "text", text: "No organization associated with this API key" }],
            isError: true,
          };
        }

        // Placeholder - would query organization members table
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify([
                {
                  userId: apiKey.userId,
                  role: "owner",
                  message: "Organization features require better-auth organization plugin",
                },
              ]),
            },
          ],
          structuredContent: { members: [] },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}