import { Elysia } from "elysia";
import { treaty } from "@elysiajs/eden";
import { createFileRoute } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { API_PREFIX, API_NAME, HOST, PORT, isBrowser } from "~/config";
import { composedMiddleware } from "~/middlewares";
import { errorFn, traceFn } from "~/utils";

export const apiApp = new Elysia({
  name: "api-app",
  prefix: API_PREFIX,
})
  .use(
    composedMiddleware({
      openapi_name: "API",
    }),
  )
  .trace(traceFn)
  .onError(errorFn)
  .state("name", API_NAME)
  .get("/health", async ({ store: { name } }) => ({ name, status: "ok" }), {
    detail: {
      summary: "Get API health",
      description: "Get API health",
      tags: ["api-health"],
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
        summary: "Get API root",
        description: "Get API root",
        tags: ["api"],
        responses: {
          200: { description: "Success" },
        },
      },
    },
  );

const handle = ({ request }: { request: Request }) => apiApp.fetch(request);

export const Route = createFileRoute(`/api/$`)({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});

export const getAPI = createIsomorphicFn()
  .server(() => treaty(apiApp).api)
  .client(() => {
    const url =
      import.meta.env.VITE_API_URL ||
      (isBrowser ? window.location.origin : `http://${HOST}:${PORT}`);
    return treaty<typeof apiApp>(url).api;
  });
