import Elysia from "elysia";
import { corsConfig } from "~/config";

export const cors = new Elysia({ name: "cors" }).onRequest(({ set }) => {
  set.headers["Access-Control-Allow-Origin"] = corsConfig.origin;
  set.headers["Access-Control-Allow-Methods"] = corsConfig.methods.join(", ");
  set.headers["Access-Control-Allow-Headers"] = corsConfig.allowedHeaders.join(", ");
  set.headers["Access-Control-Expose-Headers"] = corsConfig.exposedHeaders.join(", ");
  set.headers["Access-Control-Max-Age"] = String(corsConfig.maxAge);
  if (corsConfig.credentials) {
    set.headers["Access-Control-Allow-Credentials"] = "true";
  }
});

export const corsWithCredentials = new Elysia({ name: "cors-credentials" }).onRequest(
  ({ request, set }) => {
    const origin = request.headers.get("Origin");
    if (origin) {
      set.headers["Access-Control-Allow-Origin"] = origin;
    }
    set.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, PATCH, OPTIONS";
    set.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
    set.headers["Access-Control-Allow-Credentials"] = "true";
  },
);
