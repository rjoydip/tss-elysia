/**
 * Blog Page
 * Optimized with JSON-LD structured data for LLMO.
 *
 * @see https://tanstack.com/start/latest/docs/framework/react/guide/llmo
 */

import { createFileRoute } from "@tanstack/react-router";
import { blogPosts } from "~/features/landing/data/blog/data";
import { BlogPage } from "~/features/landing/blog";

export const Route = createFileRoute("/(landing)/blog")({
  component: BlogPage,
  head: () => ({
    meta: [
      {
        name: "description",
        content: "Latest updates, tutorials, and insights from the TSS Elysia team",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "TSS Elysia Blog",
          description: "Latest updates, tutorials, and insights from the TSS Elysia team",
          mainEntity: {
            "@type": "ItemList",
            itemListElement: blogPosts.slice(0, 5).map((post, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `/blog/${post.slug}`,
              name: post.title,
            })),
          },
        }),
      },
    ],
  }),
});