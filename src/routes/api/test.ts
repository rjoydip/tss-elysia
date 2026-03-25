import { createFileRoute } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";

const getTestData = () => ({
  message: "Hello from test API",
  timestamp: new Date().toISOString(),
});

export const Route = createFileRoute("/api/test")({
  server: {
    handlers: {
      GET: () => {
        return Response.json(getTestData());
      },
      POST: () => {
        return Response.json(getTestData());
      },
    },
  },
});

export const getTreaty = createIsomorphicFn()
  .server(() => getTestData())
  .client(() => getTestData());
