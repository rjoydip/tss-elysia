/**
 * Shared MCP tool catalog used for HTTP tool discovery.
 * Keeping this metadata centralized reduces drift between docs and route responses.
 */
export type McpToolCatalogEntry = {
  name: string;
  title: string;
  description: string;
  category: "auth" | "users" | "organization";
};

/**
 * Public tool metadata for `/api/mcp/tools`.
 */
export const MCP_TOOL_CATALOG: McpToolCatalogEntry[] = [
  {
    name: "get-current-user",
    title: "Get Current User",
    description: "Get the authenticated user's profile information",
    category: "auth",
  },
  {
    name: "list-sessions",
    title: "List Sessions",
    description: "List all active sessions for the current user",
    category: "auth",
  },
  {
    name: "revoke-session",
    title: "Revoke Session",
    description: "Revoke a specific session",
    category: "auth",
  },
  {
    name: "get-user",
    title: "Get User",
    description: "Get user details by user ID",
    category: "users",
  },
  {
    name: "list-users",
    title: "List Users",
    description: "List users in the system",
    category: "users",
  },
  {
    name: "update-user",
    title: "Update User",
    description: "Update the current user's profile",
    category: "users",
  },
  {
    name: "get-organization",
    title: "Get Organization",
    description: "Get details of the current organization",
    category: "organization",
  },
  {
    name: "list-members",
    title: "List Organization Members",
    description: "List all members of the current organization",
    category: "organization",
  },
];