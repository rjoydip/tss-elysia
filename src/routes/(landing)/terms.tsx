/**
 * Terms of Service Page
 * Optimized with JSON-LD structured data for LLMO.
 *
 * @see https://tanstack.com/start/latest/docs/framework/react/guide/llmo
 */

import { createFileRoute } from "@tanstack/react-router";
import { APP_NAME } from "~/config";
import { TermsPage } from "~/features/landing/terms";

export const Route = createFileRoute("/(landing)/terms")({
  component: TermsPage,
  head: () => ({
    meta: [
      {
        name: "description",
        content: `Terms of service for ${APP_NAME} - Usage policies and conditions`,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LegalService",
          name: `${APP_NAME} Terms of Service`,
          description: "Terms of service detailing usage policies and conditions",
          provider: {
            "@type": "Organization",
            name: APP_NAME,
          },
          datePublished: "2026-01-01",
        }),
      },
    ],
  }),
});