/**
 * Token Documentation
 * Understanding session tokens and their management
 */

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/docs/auth/token")({
  component: TokenDocs,
});

function TokenDocs() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Token Management</h1>
      <p className="text-muted-foreground text-lg">
        Understand how session tokens work and how to manage them securely.
      </p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Session Token</h2>
        <p className="text-muted-foreground">
          When a user signs in, Better Auth creates a session and returns a session token. This
          token must be included in subsequent authenticated requests.
        </p>

        <h3 className="text-xl font-medium">Token Structure</h3>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`{
  "id": "session_xxx",
  "expiresAt": "2024-01-08T00:00:00.000Z",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "ipAddress": "::1",
  "userAgent": "Mozilla/5.0...",
  "userId": "user_xxx"
}`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Token Storage</h2>
        <p className="text-muted-foreground">
          The session token is automatically stored as an HTTP-only cookie by Better Auth. You don't
          need to manually store or send the token with requests.
        </p>
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Cookie Settings:</h4>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            <li>
              <code>httpOnly</code>: true (cannot be accessed via JavaScript)
            </li>
            <li>
              <code>secure</code>: true in production
            </li>
            <li>
              <code>sameSite</code>: "lax"
            </li>
            <li>
              <code>path</code>: "/"
            </li>
            <li>
              <code>maxAge</code>: 7 days (session expiry)
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Making Authenticated Requests</h2>
        <p className="text-muted-foreground">
          Since the token is stored as a cookie, authenticated requests automatically include the
          token:
        </p>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`// No need to manually add Authorization header
// The cookie is sent automatically with the request

const response = await fetch("http://localhost:3000/api/protected", {
  method: "GET",
  headers: {
    Origin: "http://localhost:3000",
  },
});`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Get Current Session</h2>
        <p className="text-muted-foreground">
          Retrieve the current user's session to check authentication status:
        </p>

        <h3 className="text-xl font-medium">Endpoint</h3>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code className="text-sm">GET /api/auth/get-session</code>
        </pre>

        <h3 className="text-xl font-medium">Example</h3>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`const response = await fetch("http://localhost:3000/api/auth/get-session", {
  headers: {
    Origin: "http://localhost:3000",
  },
});

const data = await response.json();
// { session: {...}, user: {...} } or { session: null }`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">List Active Sessions</h2>
        <p className="text-muted-foreground">Get all active sessions for the current user:</p>

        <h3 className="text-xl font-medium">Endpoint</h3>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code className="text-sm">GET /api/auth/list-sessions</code>
        </pre>

        <h3 className="text-xl font-medium">Response</h3>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`{
  "sessions": [
    {
      "id": "session_xxx",
      "expiresAt": "2024-01-08T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "ipAddress": "::1",
      "userAgent": "Mozilla/5.0..."
    }
  ]
}`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Revoke Sessions</h2>
        <p className="text-muted-foreground">
          Sign out from the current session or revoke specific sessions:
        </p>

        <h3 className="text-xl font-medium">Sign Out (Current Session)</h3>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`// POST /api/auth/sign-out
const response = await fetch("http://localhost:3000/api/auth/sign-out", {
  method: "POST",
  headers: {
    Origin: "http://localhost:3000",
    "Content-Type": "application/json",
  },
});`}</code>
        </pre>

        <h3 className="text-xl font-medium">Revoke Specific Session</h3>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`// DELETE /api/auth/session/:sessionId
const response = await fetch("http://localhost:3000/api/auth/session/session_xxx", {
  method: "DELETE",
  headers: {
    Origin: "http://localhost:3000",
  },
});`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Token Expiry</h2>
        <p className="text-muted-foreground">
          Sessions expire after 7 days. The{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm">expiresAt</code> field indicates
          when the session will expire. After expiry, the user needs to sign in again.
        </p>
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Session Configuration:</h4>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            <li>
              <strong>Session Age</strong>: 7 days
            </li>
            <li>
              <strong>Update Age</strong>: 24 hours (session activity update)
            </li>
            <li>
              <strong>Cookie Cache</strong>: 5 minutes
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}