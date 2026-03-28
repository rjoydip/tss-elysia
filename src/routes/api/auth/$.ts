import { Elysia } from "elysia";
import type { Context } from "elysia";
import { createFileRoute } from "@tanstack/react-router";
import { errorFn, traceFn } from "~/utils";
import { auth } from "~/lib/auth";
import { AUTH_ALLOWED_METHODS } from "~/config";

const authService = new Elysia().all(
  "*",
  async (context: Context & { request: Request }) => {
    if (AUTH_ALLOWED_METHODS.includes(context.request.method)) {
      return await auth.handler(context.request);
    } else {
      context.set.status = 405;
      context.set.headers["Allow"] = AUTH_ALLOWED_METHODS.join(", ");
      return "Method Not Allowed";
    }
  },
  {
    detail: {
      summary: "Auth Service",
      description: "Handles authentication requests",
      tags: ["auth"],
      responses: {
        200: { description: "Success" },
      },
    },
  },
);

export const authApp = new Elysia({
  name: "auth-app",
  prefix: "/api/auth",
})
  .trace(traceFn)
  .onError(errorFn)
  .use(authService)
  .state("name", "AUTH")
  .get("/health", async ({ store: { name } }) => ({ name, status: "ok" }), {
    detail: {
      summary: "Get AUTH health",
      description: "Get AUTH health",
      tags: ["auth-health"],
      responses: {
        200: { description: "Success" },
      },
    },
  })
  .get(
    "/",
    ({ store: { name }, set }) => {
      set.headers["Content-Type"] = "text/plain; charset=utf-8";
      return `Welcome to ${name} Service`;
    },
    {
      detail: {
        summary: "Get AUTH root",
        description: "Get AUTH root",
        tags: ["auth"],
        responses: {
          200: { description: "Success" },
        },
      },
    },
  );

const handle = ({ request }: { request: Request }) => authApp.fetch(request);

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});
