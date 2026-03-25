import { Elysia } from "elysia";
import type { SocketAddress } from "elysia/universal";
import { type Generator, rateLimit, DefaultContext } from "elysia-rate-limit";
import { rateLimitConfig } from "~/_config";

const ipGenerator: Generator<{ ip: SocketAddress }> = (_r, _s, { ip }) => ip?.address ?? "unknown";

export const rateLimitMiddleware = new Elysia({ name: "rate-limit" }).use(
  rateLimit({
    duration: rateLimitConfig.duration,
    max: rateLimitConfig.max,
    headers: true,
    scoping: "scoped",
    countFailedRequest: true,
    errorResponse: new Response(
      JSON.stringify({
        error: "Too many requests",
      }),
      { status: 429 },
    ),
    generator: ipGenerator,
    context: new DefaultContext(10_000),
  }),
);
