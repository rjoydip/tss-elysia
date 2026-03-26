import type { Context } from "elysia";
import Elysia from "elysia";
import { auth } from "~/lib/auth";
import { AUTH_PREFIX } from "~/config";

// user middleware (compute user and session and pass to routes)
export const authMiddleware = new Elysia({ name: "better-auth" }).mount(auth.handler).macro({
  auth: {
    async resolve({ request: { headers }, status }) {
      const session = await auth.api.getSession({
        headers,
      });

      if (!session)
        return status(401, {
          success: false,
          message: "Unauthorized: Please check your credentials and permissions",
        });

      return {
        user: session.user,
        session: session.session,
      };
    },
  },
});

const authService = new Elysia().all(AUTH_PREFIX, (context: Context & { request: Request }) => {
  const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"];
  // validate request method
  if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return auth.handler(context.request);
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    context.set.status = 405;
    context.set.headers["Allow"] = BETTER_AUTH_ACCEPT_METHODS.join(", ");
    return "Method Not Allowed";
  }
});

export { authService, auth };
export type AuthService = typeof authService;
