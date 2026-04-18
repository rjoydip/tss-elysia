import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import MarkdownRenderer from "~/components/docs/markdown";
import { Skeleton } from "~/components/ui/skeleton";
import { parseFrontmatter } from "~/components/docs/markdown";
import { docMap, getSplatPath } from "~/config/docs";

function docsPageLoader(params: Record<string, unknown>) {
  const rawPath = getSplatPath(params);
  const docPath = rawPath.replace(/\.md$/, "");
  const content = docMap.get(docPath);

  if (!content) {
    throw new Error(`Documentation page not found: ${docPath}`);
  }

  const frontmatter = parseFrontmatter(content);
  return { content, docPath, frontmatter };
}

export const Route = createFileRoute("/(landing)/docs/$")({
  loader: async ({ params }) => docsPageLoader(params),
  component: DocsPage,
  head: ({ loaderData }) => {
    const fm = loaderData?.frontmatter;
    const docPath = loaderData?.docPath ?? "";
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