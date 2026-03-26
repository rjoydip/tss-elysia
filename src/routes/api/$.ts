import { treaty } from "@elysiajs/eden";
import { createFileRoute } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { createApp } from "~/app";
import { API_PREFIX, API_NAME, HOST, PORT, isBrowser } from "~/config";

export const app = createApp({
  prefix: API_PREFIX,
})
  .state("name", API_NAME)
  .get("/health", async ({ store: { name } }) => ({ name, status: "ok" }), {
    detail: {
      summary: "Get API health",
      description: "Get API health",
      tags: ["health"],
      responses: {
        200: { description: "Success" },
      },
    },
  })
  .get(
    "/",
    ({ store: { name }, set }) => {
      set.headers["Content-Type"] = "text/plain; charset=utf-8";
      return `Welcome to ${name}`;
    },
    {
      detail: {
        summary: "Get API root",
        description: "Get API root",
        tags: ["root"],
        responses: {
          200: { description: "Success" },
        },
      },
    },
  );

const handle = ({ request }: { request: Request }) => app.fetch(request);

export const Route = createFileRoute(`/api/$`)({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});

export const getAPI = createIsomorphicFn()
  .server(() => treaty(app).api)
  .client(() => {
    const url =
      import.meta.env.VITE_API_URL ||
      (isBrowser ? window.location.origin : `http://${HOST}:${PORT}`);
    return treaty<typeof app>(url).api;
  });
