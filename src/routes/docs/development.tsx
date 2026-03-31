/**
 * Development Documentation
 */

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/docs/development")({
  component: DevelopmentDocs,
});

function DevelopmentDocs() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Development</h1>
      <p className="text-muted-foreground text-lg">
        Guide to setting up and running the development environment.
      </p>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Prerequisites</h2>
        <ul className="list-disc ml-6 space-y-2 text-muted-foreground">
          <li>Bun (latest version) - Runtime and package manager</li>
          <li>Node.js 18+ (optional, for production)</li>
          <li>Git</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Installation</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`# Clone the repository
git clone https://github.com/your-repo/tss-elysia.git
cd tss-elysia

# Install dependencies
bun install

# Setup the project
bun run setup`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Environment Setup</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`# Copy the example environment file
cp .env.example .env

# Generate auth secret
bunx auth secret`}</code>
        </pre>
        <p className="text-muted-foreground">
          Add the generated secret to your{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm">.env</code> file.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Running Development Server</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`# Start development server
bun run dev`}</code>
        </pre>
        <p className="text-muted-foreground">
          The app will be available at{" "}
          <code className="bg-muted px-1.5 py-0.5 rounded text-sm">http://localhost:3000</code>
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Available Scripts</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="border border-border px-4 py-2 text-left font-semibold">Script</th>
                <th className="border border-border px-4 py-2 text-left font-semibold">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="border border-border px-4 py-2">
                  <code className="text-sm">bun run dev</code>
                </td>
                <td className="border border-border px-4 py-2">Start development server</td>
              </tr>
              <tr className="border-b">
                <td className="border border-border px-4 py-2">
                  <code className="text-sm">bun run build</code>
                </td>
                <td className="border border-border px-4 py-2">Build for production</td>
              </tr>
              <tr className="border-b">
                <td className="border border-border px-4 py-2">
                  <code className="text-sm">bun run lint</code>
                </td>
                <td className="border border-border px-4 py-2">Run linting</td>
              </tr>
              <tr className="border-b">
                <td className="border border-border px-4 py-2">
                  <code className="text-sm">bun run typecheck</code>
                </td>
                <td className="border border-border px-4 py-2">Run type checking</td>
              </tr>
              <tr className="border-b">
                <td className="border border-border px-4 py-2">
                  <code className="text-sm">bun run test:unit</code>
                </td>
                <td className="border border-border px-4 py-2">Run unit tests</td>
              </tr>
              <tr className="border-b">
                <td className="border border-border px-4 py-2">
                  <code className="text-sm">bun run test:e2e</code>
                </td>
                <td className="border border-border px-4 py-2">Run E2E tests</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">
                  <code className="text-sm">bun run db:setup</code>
                </td>
                <td className="border border-border px-4 py-2">Setup database (migrate + seed)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Database</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`# Generate migration
bun run db:generate

# Run migrations
bun run db:migrate

# Push schema (development only)
bun run db:push

# Seed database
bun run db:seed

# Full setup (remove, migrate, seed)
bun run db:setup`}</code>
        </pre>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Code Quality</h2>
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          <code>{`# Format code
bun run fmt

# Check formatting
bun run fmt:check

# Fix lint issues
bun run lint:fix

# Run all checks
bun run lint:ci`}</code>
        </pre>
      </section>
    </div>
  );
}