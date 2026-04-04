/**
 * Dynamic Documentation Page
 * Loads markdown from /docs directory and renders with Shiki highlighting.
 * Catch-all route: matches /docs/* paths (e.g., /docs/architecture, /docs/auth/authentication)
 */

import { createFileRoute } from "@tanstack/react-router";
import { MarkdownRenderer, parseFrontmatter } from "~/components/markdown";
import { Skeleton } from "~/components/ui/skeleton";
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
 * Safely extracts the splat path from route params.
 * In TanStack Router catch-all routes, _splat may be undefined for /docs root.
 */
function getSplatPath(params: Record<string, unknown>): string {
  const raw = params._splat;
  return typeof raw === "string" ? raw : "";
}

/**
 * Route definition for the dynamic docs catch-all.
 * Uses splat parameter to capture nested doc paths.
 */
export const Route = createFileRoute("/docs/$")({
  loader: async ({ params }) => {
    // Use type-safe extraction to handle undefined _splat at runtime
    const rawPath = getSplatPath(params as Record<string, unknown>);
    // Strip .md extension if present so /docs/guides/environment-variables.md
    // resolves the same as /docs/guides/environment-variables
    const docPath = rawPath.replace(/\.md$/, "");
    const content = docMap.get(docPath);

    if (!content) {
      throw new Error(`Documentation page not found: ${docPath}`);
    }

    // Pre-extract frontmatter for use in <head> meta tags
    const frontmatter = parseFrontmatter(content);
    return { content, docPath, frontmatter };
  },
  component: DocsPage,
  head: ({ loaderData }) => {
    const fm = loaderData?.frontmatter;
    const docPath = loaderData?.docPath ?? "";
    // Use frontmatter title/description if available, fall back to doc path
    const title = fm?.title ?? docPath.replace(/\//g, " / ");
    const description = fm?.description;
    return {
      meta: [
        { title: `${title} | Documentation` },
        ...(description ? [{ name: "description", content: description }] : []),
      ],
    };
  },
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
      <div className="max-w-4xl space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return <MarkdownRenderer content={content} />;
}