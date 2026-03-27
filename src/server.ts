import handler, { createServerEntry } from "@tanstack/react-start/server-entry";
import { AUTH_ALLOWED_METHODS } from "./config";

export default createServerEntry({
  fetch(request: Request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/auth/")) {
      if (!AUTH_ALLOWED_METHODS.includes(request.method)) {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: { Allow: AUTH_ALLOWED_METHODS.join(", ") },
        });
      }
    }
    return handler.fetch(request);
  },
});
