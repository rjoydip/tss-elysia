/**
 * Login Documentation
 * Endpoint for signing in to existing accounts
 */

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/docs/auth/login")({
  component: LoginDocs,
});

function LoginDocs() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Login</h1>
      <p className="text-muted-foreground text-lg">
        Sign in to an existing user account using email and password.
      </p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Endpoint</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code className="text-sm">POST /api/auth/sign-in/email</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Request Headers</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="border border-border px-4 py-2 text-left font-semibold">Header</th>
                <th className="border border-border px-4 py-2 text-left font-semibold">Required</th>
                <th className="border border-border px-4 py-2 text-left font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="border border-border px-4 py-2">
                  <code className="text-sm">Origin</code>
                </td>
                <td className="border border-border px-4 py-2 text-center">Yes</td>
                <td className="border border-border px-4 py-2">
                  Must match a trusted origin (e.g., <code>http://localhost:3000</code>)
                </td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">
                  <code className="text-sm">Content-Type</code>
                </td>
                <td className="border border-border px-4 py-2 text-center">Yes</td>
                <td className="border border-border px-4 py-2">
                  Must be <code>application/json</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Request Body</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`{
  "email": "user@example.com",
  "password": "your-password"
}`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Response</h2>

        <h3 className="text-xl font-medium">Success (200)</h3>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`{
  "user": {
    "id": "user_xxx",
    "email": "user@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "session": {
    "id": "session_xxx",
    "expiresAt": "2024-01-08T00:00:00.000Z",
    "token": "xxx",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "ipAddress": "::1",
    "userAgent": "Mozilla/5.0..."
  }
}`}</code>
        </pre>

        <h3 className="text-xl font-medium">Error (401 - Invalid Credentials)</h3>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Example</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`const response = await fetch("http://localhost:3000/api/auth/sign-in/email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: "http://localhost:3000",
  },
  body: JSON.stringify({
    email: "user@example.com",
    password: "your-password",
  }),
});

const data = await response.json();`}</code>
        </pre>
      </section>
    </div>
  );
}