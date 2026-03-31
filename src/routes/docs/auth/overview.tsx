/**
 * Authentication Overview Documentation
 * Overview of the auth system and its features
 */

import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/docs/auth/overview")({
  component: AuthDocsOverview,
});

function AuthDocsOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Authentication</h1>
        <p className="text-muted-foreground text-lg">
          This project uses{" "}
          <a
            href="https://better-auth.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Better Auth
          </a>{" "}
          for authentication and authorization, integrated with Drizzle ORM for database storage.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/docs/auth/login"
            className="p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold">Login</h3>
            <p className="text-sm text-muted-foreground">Sign in to existing account</p>
          </Link>
          <Link
            to="/docs/auth/register"
            className="p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold">Register</h3>
            <p className="text-sm text-muted-foreground">Create a new account</p>
          </Link>
          <Link
            to="/docs/auth/token"
            className="p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold">Token Management</h3>
            <p className="text-sm text-muted-foreground">Understand session tokens</p>
          </Link>
          <Link
            to="/docs/auth/middleware"
            className="p-4 border rounded-lg hover:bg-accent transition-colors"
          >
            <h3 className="font-semibold">Auth Middleware</h3>
            <p className="text-sm text-muted-foreground">Protect routes with auth</p>
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Setup</h2>
        <h3 className="text-xl font-medium">Environment Variables</h3>
        <p className="text-muted-foreground">
          Add the following to your{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm">.env</code> file:
        </p>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`# Required - Generate with: bunx auth secret
BETTER_AUTH_SECRET=your-32-char-secret-key

# Optional - Auth base URL
BETTER_AUTH_URL=http://localhost:3000/api/auth

DATABASE_PATH=tss-elysia.db
DATABASE_NAME=tss-elysia.db`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Database Setup</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`# Generate and run migrations
bun run db:generate
bun run db:migrate

# Seed initial data
bun run db:seed`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Configuration</h2>
        <p className="text-muted-foreground">
          The auth system is configured in{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm">src/lib/auth.ts</code>:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
          <li>
            <strong>Email/Password</strong>: Enabled with optional email verification
          </li>
          <li>
            <strong>Session</strong>: 7-day expiry, 24-hour update age, 5-minute cookie cache
          </li>
          <li>
            <strong>Database</strong>: Drizzle adapter with SQLite
          </li>
          <li>
            <strong>Password Hashing</strong>: Argon2id (memory: 64MiB, iterations: 3, parallelism:
            4)
          </li>
          <li>
            <strong>Trusted Origins</strong>: <code>BETTER_AUTH_URL</code> and its base origin
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Subscription Tiers</h2>
        <p className="text-muted-foreground">
          Users are assigned subscription tiers that control API rate limits:
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="border border-border px-4 py-2 text-left font-semibold">Tier</th>
                <th className="border border-border px-4 py-2 text-left font-semibold">
                  Rate Limit
                </th>
                <th className="border border-border px-4 py-2 text-left font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="border border-border px-4 py-2">Free</td>
                <td className="border border-border px-4 py-2">100</td>
                <td className="border border-border px-4 py-2">60s</td>
              </tr>
              <tr className="border-b">
                <td className="border border-border px-4 py-2">Contributor</td>
                <td className="border border-border px-4 py-2">1,000</td>
                <td className="border border-border px-4 py-2">60s</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">Enterprise</td>
                <td className="border border-border px-4 py-2">10,000</td>
                <td className="border border-border px-4 py-2">60s</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}