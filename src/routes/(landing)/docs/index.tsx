/**
 * Docs Index Route
 * Optimized with JSON-LD structured data for LLMO.
 *
 * @see https://tanstack.com/start/latest/docs/framework/react/guide/llmo
 */

import { createFileRoute } from "@tanstack/react-router";
import { DocsLandingPage } from "~/features/landing/docs/index";

const docsList = [
  { slug: "getting-started", title: "Getting Started", category: "Guide" },
  { slug: "api/api-references", title: "API References", category: "Reference" },
  { slug: "getting-started/development", title: "Development Setup", category: "Guide" },
  { slug: "auth/overview", title: "Authentication", category: "Guide" },
  { slug: "deployment/production", title: "Production Deployment", category: "Guide" },
];

export const Route = createFileRoute("/(landing)/docs/")({
  component: DocsLandingPage,
  head: () => ({
    meta: [
      {
        name: "description",
        content:
          "Complete documentation for TSS Elysia - getting started, API references, authentication guides, and deployment",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          name: "TSS Elysia Documentation",
          description:
            "Complete documentation for TSS Elysia - getting started, API references, authentication guides, and deployment",
          about: docsList.map((doc) => ({
            "@type": "Thing",
            name: doc.title,
            description: doc.category,
          })),
          mainEntity: {
            "@type": "ItemList",
            itemListElement: docsList.map((doc, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `/docs/${doc.slug}`,
              name: doc.title,
            })),
          },
        }),
      },
    ],
  }),
});