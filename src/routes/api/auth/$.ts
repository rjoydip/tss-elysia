import { createFileRoute } from "@tanstack/react-router";
import { createApp } from "~/app";
import { AUTH_PREFIX } from "~/config";
import { authService } from "~/middlewares/auth";

export const auth = createApp({
  prefix: AUTH_PREFIX,
}).use(authService);

const handle = ({ request }: { request: Request }) => auth.fetch(request);

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: handle,
      POST: handle,
    },
  },
});
