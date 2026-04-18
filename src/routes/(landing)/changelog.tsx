/**
 * Changelog Page
 * Optimized with JSON-LD structured data for LLMO.
 *
 * @see https://tanstack.com/start/latest/docs/framework/react/guide/llmo
 */

import { createFileRoute } from "@tanstack/react-router";
import { changelogData, getLatestVersion } from "~/features/landing/data/changelog/data";
import { ChangelogPage } from "~/features/landing/changelog";

export const Route = createFileRoute("/(landing)/changelog")({
  component: ChangelogPage,
  head: () => ({
    meta: [
      {
        name: "description",
        content: "Changelog for TSS Elysia - version history, new features, and improvements",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          name: "TSS Elysia Changelog",
          description: `Version ${getLatestVersion().version} - ${getLatestVersion().title}`,
          datePublished: getLatestVersion().releasedAt,
          about: changelogData[0].items.map((item) => ({
            "@type": "ChangeLogEntry",
            name: item.description,
            dateCreated: item.releasedAt,
          })),
          mainEntity: {
            "@type": "ItemList",
            itemListElement: changelogData.map((entry, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: `Version ${entry.version}`,
              description: entry.title,
            })),
          },
        }),
      },
    ],
  }),
});