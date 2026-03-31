/**
 * Register Documentation
 * Endpoint for creating new user accounts
 */

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/docs/auth/register")({
  component: RegisterDocs,
});

function RegisterDocs() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Register</h1>
      <p className="text-muted-foreground text-lg">
        Create a new user account with email and password.
      </p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Endpoint</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code className="text-sm">POST /api/auth/sign-up/email</code>
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
  "password": "secure-password",
  "name": "John Doe",
  "image": "https://example.com/avatar.jpg" // optional
}`}</code>
        </pre>
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Field Requirements:</h4>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            <li>
              <code>email</code>: Valid email address (must be unique)
            </li>
            <li>
              <code>password</code>: Minimum 8 characters
            </li>
            <li>
              <code>name</code>: Display name (required)
            </li>
            <li>
              <code>image</code>: Optional avatar URL
            </li>
          </ul>
        </div>
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

        <h3 className="text-xl font-medium">Error (422 - Duplicate Email)</h3>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`{
  "error": {
    "code": "USER_ALREADY_EXISTS",
    "message": "A user with this email already exists"
  }
}`}</code>
        </pre>

        <h3 className="text-xl font-medium">Error (422 - Validation Failed)</h3>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`{
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Password must be at least 8 characters"
  }
}`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Example</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`const response = await fetch("http://localhost:3000/api/auth/sign-up/email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Origin: "http://localhost:3000",
  },
  body: JSON.stringify({
    email: "user@example.com",
    password: "secure-password",
    name: "John Doe",
  }),
});

const data = await response.json();`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Server-Side Usage</h2>
        <p className="text-muted-foreground">
          You can also use the Better Auth API directly from your server:
        </p>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`import { auth } from "~/lib/auth";

const result = await auth.api.signUpEmail({
  body: {
    email: "user@example.com",
    password: "secure-password",
    name: "John Doe",
  },
});`}</code>
        </pre>
      </section>
    </div>
  );
}