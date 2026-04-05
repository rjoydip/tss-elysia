/**
 * Dynamic Documentation Page
 * Loads markdown from /docs directory and renders with Shiki highlighting.
 * Catch-all route: matches /docs/* paths (e.g., /docs/architecture, /docs/auth/authentication)
 */

import { createFileRoute } from "@tanstack/react-router";
import { MarkdownRenderer, parseFrontmatter } from "~/components/markdown";
import { docMap, getSplatPath } from "~/config/docs";
import { Skeleton } from "~/components/ui/skeleton";
import { useEffect, useState } from "react";

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
      <div className="max-w-7xl space-y-4 w-full">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return <MarkdownRenderer content={content} />;
}