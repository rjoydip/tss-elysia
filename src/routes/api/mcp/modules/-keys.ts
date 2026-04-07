/**
 * MCP API key management routes plugin.
 *
 * Intent:
 * - Keep key endpoints modular so they can be mounted by both:
 *   - the standalone MCP router (`mcpApiRoutes`, prefix `/api/mcp`) used by tests
 *   - the mountable API module (`mcpApiModuleRoutes`) used by the root `/api` router
 *
 * Prefixing rule:
 * - This plugin does not set a prefix; callers decide the final URL prefix.
 * - Endpoints are defined relative to the caller (e.g. `/keys`, `/keys/:id`).
 */
import { Elysia, t } from "elysia";
import {
  createApiKey,
  listApiKeys,
  revokeApiKeyWithReason,
  updateApiKey,
} from "~/lib/mcp/api-keys";
import { validateMcpAuth } from "~/lib/mcp/auth";
import { logger } from "~/lib/logger";

/**
 * MCP API key routes.
 *
 * @remarks
 * - These endpoints require an MCP API key (`Authorization: Bearer ...`).
 * - The parent router is responsible for adding the `/api/mcp` or `/api/...` prefix.
 */
export const mcpKeysRoutes = new Elysia({ name: "api.routes.mcp.keys", prefix: "/keys" })
  .derive(async (context) => {
    const authHeader: string | null = context.headers.authorization ?? null;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { apiKey: null, rateLimitInfo: null };
    }

    try {
      const authResult = await validateMcpAuth(authHeader);

      if (!authResult) {
        return { apiKey: null, rateLimitInfo: null };
      }

      return {
        apiKey: authResult.apiKey,
        rateLimitInfo: authResult.rateLimit,
      };
    } catch (error) {
      logger.error(
        `[MCP keys] auth derive failure: ${error instanceof Error ? error.message : "unknown error"}`,
      );
      return { apiKey: null, rateLimitInfo: null };
    }
  })
  .get(
    "/",
    async ({ apiKey, rateLimitInfo }) => {
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const keys = await listApiKeys(apiKey.userId);
      const response = new Response(JSON.stringify({ keys }), {
        headers: { "Content-Type": "application/json" },
      });

      if (rateLimitInfo) {
        response.headers.set("X-RateLimit-Limit", String(rateLimitInfo.limit));
        response.headers.set("X-RateLimit-Remaining", String(rateLimitInfo.remaining));
        response.headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimitInfo.resetAt / 1000)));
      }

      return response;
    },
    {
      detail: {
        tags: ["MCP"],
        summary: "List API keys",
        description: "List all MCP API keys for the authenticated user",
      },
    },
  )
  .post(
    "/",
    async ({ apiKey, body, rateLimitInfo }) => {
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { name, organizationId, permissions, rateLimit, rateLimitDuration, expiresAt } =
        body as {
          name?: string;
          organizationId?: string;
          permissions?: Record<string, unknown>;
          rateLimit?: number;
          rateLimitDuration?: number;
          expiresAt?: string;
        };

      if (!name) {
        return new Response(JSON.stringify({ error: "Name is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const result = await createApiKey({
        name,
        userId: apiKey.userId,
        organizationId: organizationId ?? null,
        permissions,
        rateLimit,
        rateLimitDuration,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      });

      const response = new Response(
        JSON.stringify({
          key: result.key,
          id: result.record.id,
          name: result.record.name,
          rateLimit: result.record.rateLimit,
          rateLimitDuration: result.record.rateLimitDuration,
          createdAt: result.record.createdAt.toISOString(),
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      );

      if (rateLimitInfo) {
        response.headers.set("X-RateLimit-Limit", String(rateLimitInfo.limit));
        response.headers.set("X-RateLimit-Remaining", String(rateLimitInfo.remaining));
        response.headers.set("X-RateLimit-Reset", String(Math.ceil(rateLimitInfo.resetAt / 1000)));
      }

      return response;
    },
    {
      body: t.Object({
        name: t.Optional(t.String()),
        organizationId: t.Optional(t.String()),
        permissions: t.Optional(t.Record(t.String(), t.Unknown())),
        rateLimit: t.Optional(t.Number()),
        rateLimitDuration: t.Optional(t.Number()),
        expiresAt: t.Optional(t.String()),
      }),
      detail: {
        tags: ["MCP"],
        summary: "Create API key",
        description: "Create a new MCP API key",
      },
    },
  )
  .delete(
    "/:id",
    async ({ apiKey, params }) => {
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { id } = params;
      const revokeOutcome = await revokeApiKeyWithReason(id, apiKey.userId);

      if (revokeOutcome === "not_found") {
        return new Response(JSON.stringify({ error: "Key not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (revokeOutcome === "forbidden") {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });
    },
    {
      params: t.Object({ id: t.String() }),
      detail: {
        tags: ["MCP"],
        summary: "Revoke API key",
        description: "Revoke (delete) an MCP API key",
      },
    },
  )
  .put(
    "/:id",
    async ({ apiKey, params, body }) => {
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { id } = params;
      const { name, permissions, rateLimit, rateLimitDuration, expiresAt } = body as {
        name?: string;
        permissions?: Record<string, unknown>;
        rateLimit?: number;
        rateLimitDuration?: number;
        expiresAt?: string;
      };

      const updated = await updateApiKey(id, apiKey.userId, {
        name,
        permissions,
        rateLimit,
        rateLimitDuration,
        expiresAt: expiresAt === undefined ? undefined : expiresAt ? new Date(expiresAt) : null,
      });

      if (!updated) {
        return new Response(JSON.stringify({ error: "Key not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(updated), {
        headers: { "Content-Type": "application/json" },
      });
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String()),
        permissions: t.Optional(t.Record(t.String(), t.Unknown())),
        rateLimit: t.Optional(t.Number()),
        rateLimitDuration: t.Optional(t.Number()),
        expiresAt: t.Optional(t.String()),
      }),
      detail: {
        tags: ["MCP"],
        summary: "Update API key",
        description: "Update an MCP API key's settings",
      },
    },
  );