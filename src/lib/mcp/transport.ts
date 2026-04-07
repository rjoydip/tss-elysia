/**
 * MCP HTTP transport setup.
 * Configures Streamable HTTP transport for remote MCP clients.
 */

import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import type { McpServer } from "@modelcontextprotocol/server";
import { randomUUID } from "node:crypto";

/**
 * Creates an MCP HTTP transport with proper configuration.
 *
 * @param _server - The MCP server instance (for future use)
 * @returns Configured transport
 */
export async function createMcpTransport(
  _server: McpServer,
): Promise<NodeStreamableHTTPServerTransport> {
  const transport = new NodeStreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
    enableJsonResponse: false,
  });

  return transport;
}

/**
 * Session management for MCP connections.
 * Handles connection lifecycle and cleanup.
 */
export class McpSessionManager {
  private sessions: Map<string, { connectedAt: Date; lastActivity: Date }> = new Map();

  /**
   * Register a new session.
   */
  registerSession(sessionId: string): void {
    const now = new Date();
    this.sessions.set(sessionId, {
      connectedAt: now,
      lastActivity: now,
    });
  }

  /**
   * Update last activity timestamp for a session.
   */
  updateActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }
  }

  /**
   * Remove a session.
   */
  removeSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Get active session count.
   */
  getActiveCount(): number {
    return this.sessions.size;
  }

  /**
   * Clean up stale sessions (older than 5 minutes of inactivity).
   */
  cleanupStaleSessions(): number {
    const staleThreshold = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    let cleaned = 0;

    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastActivity.getTime() > staleThreshold) {
        this.sessions.delete(id);
        cleaned++;
      }
    }

    return cleaned;
  }
}

/**
 * Global session manager instance.
 */
export const sessionManager = new McpSessionManager();