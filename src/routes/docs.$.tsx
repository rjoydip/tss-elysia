/**
 * Dynamic Documentation Page
 * Loads markdown from /docs directory and renders with Shiki highlighting.
 * Catch-all route: matches /docs/* paths (e.g., /docs/architecture, /docs/auth/authentication)
 */

import { createFileRoute } from "@tanstack/react-router";
import { MarkdownRenderer } from "~/lib/markdown";
import { useEffect, useState } from "react";

/**
 * Eagerly import all markdown files from the project /docs directory.
 * Vite bundles these at build time so nested paths resolve correctly.
 * Keys are relative paths like "../../docs/auth/overview.md".
 */
const markdownModules = import.meta.glob("../../docs/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/**
 * Converts a Vite glob key (e.g., "../../docs/auth/overview.md")
 * into a doc path (e.g., "auth/overview") for route matching.
 */
function globKeyToDocPath(key: string): string {
  return key.replace(/^(\.\.\/)*docs\//, "").replace(/\.md$/, "");
}

/**
 * Builds a lookup map from doc path to raw markdown content.
 * Example: { "auth/overview": "# Auth Overview\n...", "architecture": "# Architecture\n..." }
 */
const docMap = new Map<string, string>();
for (const [key, content] of Object.entries(markdownModules)) {
  docMap.set(globKeyToDocPath(key), content);
}

/**
 * Route definition for the dynamic docs catch-all.
 * Uses splat parameter to capture nested doc paths.
 */
export const Route = createFileRoute("/docs/$")({
  loader: async ({ params }) => {
    const docPath = params._splat ?? "";
    const content = docMap.get(docPath);

    if (!content) {
      throw new Error(`Documentation page not found: ${docPath}`);
    }

    return { content, docPath };
  },
  component: DocsPage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${(loaderData?.docPath ?? "").replace(/\//g, " / ")} | Documentation`,
      },
    ],
  }),
});

/**
 * Documentation page component.
 * Renders markdown content with Shiki syntax highlighting.
 * Shows a loading state while content is being fetched.
 */
function DocsPage() {
  const loaderData = Route.useLoaderData();
  const content = loaderData?.content ?? "";
  const [mounted, setMounted] = useState(false);

  // Ensure hydration completes before rendering markdown
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
          <div className="h-32 bg-muted rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <MarkdownRenderer content={content} />
    </div>
  );
}