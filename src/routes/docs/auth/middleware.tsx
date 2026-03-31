/**
 * Auth Middleware Documentation
 * Protecting routes with authentication
 */

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/docs/auth/middleware")({
  component: MiddlewareDocs,
});

function MiddlewareDocs() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Auth Middleware</h1>
      <p className="text-muted-foreground text-lg">
        Protect your routes and API endpoints using Better Auth's middleware.
      </p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Server-Side Protection</h2>
        <p className="text-muted-foreground">
          Use Better Auth's built-in middleware to protect your Elysia routes:
        </p>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`import { Elysia } from "elysia";
import { auth } from "~/lib/auth";

const app = new Elysia()
  .use(auth)
  .get("/protected", async ({ auth }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session) {
      throw new Error("Unauthorized");
    }
    
    return { user: session.user };
  });`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Using `protect` Middleware</h2>
        <p className="text-muted-foreground">
          Better Auth provides a <code>protect</code> middleware that automatically validates the
          session:
        </p>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`import { Elysia } from "elysia";
import { auth } from "~/lib/auth";

const app = new Elysia()
  .use(auth)
  .get(
    "/protected",
    async ({ auth }) => {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      
      return { 
        user: session.user,
        sessionId: session.session.id 
      };
    },
    {
      async beforeHandle({ auth, set }) {
        const session = await auth.api.getSession({
          headers: request.headers,
        });
        
        if (!session) {
          set.status = 401;
          return { error: "Unauthorized" };
        }
      },
    }
  );`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Route Protection with Elysia</h2>
        <p className="text-muted-foreground">You can create a reusable protection middleware:</p>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`import { Elysia } from "elysia";
import { auth } from "~/lib/auth";

const protect = new Elysia()
  .use(auth)
  .derive(async ({ request }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session) {
      throw new Error("Unauthorized");
    }
    
    return { user: session.user };
  });

const app = new Elysia()
  .use(protect)
  .get("/profile", ({ user }) => {
    return { 
      id: user.id,
      email: user.email,
      name: user.name 
    };
  });`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Client-Side Protection</h2>
        <p className="text-muted-foreground">
          In your React components, check for authentication state:
        </p>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`import { useQuery } from "@tanstack/react-query";

function Profile() {
  const { data: session, isLoading } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch("/api/auth/get-session", {
        headers: { Origin: window.location.origin },
      });
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  
  if (!session?.session) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>{session.user.email}</p>
    </div>
  );
}`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">
          Protected Routes in TanStack Router
        </h2>
        <p className="text-muted-foreground">Create a route guard for protected pages:</p>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`import { createRouter, redirect } from "@tanstack/react-router";

const router = createRouter({
  // ... other config
  beforeLoad: async ({ location }) => {
    const publicPaths = ["/", "/docs", "/docs/auth/login"];
    
    if (publicPaths.includes(location.pathname)) {
      return;
    }

    // Check session
    const res = await fetch("/api/auth/get-session", {
      headers: { Origin: window.location.origin },
    });
    const data = await res.json();

    if (!data.session) {
      throw redirect({
        to: "/docs/auth/login",
        search: { redirect: location.pathname },
      });
    }
  },
});`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Error Handling</h2>
        <p className="text-muted-foreground">Handle authentication errors appropriately:</p>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="border border-border px-4 py-2 text-left font-semibold">Status</th>
                <th className="border border-border px-4 py-2 text-left font-semibold">Code</th>
                <th className="border border-border px-4 py-2 text-left font-semibold">Cause</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="border border-border px-4 py-2">401</td>
                <td className="border border-border px-4 py-2">
                  <code className="text-sm">UNAUTHORIZED</code>
                </td>
                <td className="border border-border px-4 py-2">Invalid or expired session</td>
              </tr>
              <tr className="border-b">
                <td className="border border-border px-4 py-2">403</td>
                <td className="border border-border px-4 py-2">
                  <code className="text-sm">FORBIDDEN</code>
                </td>
                <td className="border border-border px-4 py-2">Missing Origin header</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">415</td>
                <td className="border border-border px-4 py-2">
                  <code className="text-sm">UNSUPPORTED_MEDIA_TYPE</code>
                </td>
                <td className="border border-border px-4 py-2">Missing Content-Type header</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Rate Limiting with Auth</h2>
        <p className="text-muted-foreground">
          Apply different rate limits based on authentication status:
        </p>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`import { rateLimit } from "elysia-rate-limit";

const app = new Elysia()
  .use(
    rateLimit({
      // Unauthenticated: 100 requests per 60s
      max: 100,
      duration: 60_000,
    })
  )
  .get("/public", () => "Public endpoint");

// For authenticated routes, use subscription tier
const authenticatedApp = new Elysia()
  .use(auth)
  .use(
    rateLimit({
      // Use user's subscription tier
      keyGenerator: async ({ auth, request }) => {
        const session = await auth.api.getSession({
          headers: request.headers,
        });
        return session?.user.id || request.headers.get("x-forwarded-for") || "anonymous";
      },
      max: async ({ request, auth }) => {
        const session = await auth.api.getSession({
          headers: request.headers,
        });
        // Get tier from database
        const tier = await getUserTier(session?.user.id);
        return tier.maxRequests;
      },
    })
  );`}</code>
        </pre>
      </section>
    </div>
  );
}