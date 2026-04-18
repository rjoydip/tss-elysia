/**
 * Privacy Policy Page
 * Optimized with JSON-LD structured data for LLMO.
 *
 * @see https://tanstack.com/start/latest/docs/framework/react/guide/llmo
 */

import { createFileRoute } from "@tanstack/react-router";
import { APP_NAME } from "~/config";
import { PrivacyPage } from "~/features/landing/privacy";

export const Route = createFileRoute("/(landing)/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      {
        name: "description",
        content: `Privacy policy for ${APP_NAME} - Learn how we collect, use, and protect your data`,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "PrivacyPolicy",
          name: `${APP_NAME} Privacy Policy`,
          description: "Privacy policy detailing data collection, usage, and protection practices",
          publisher: {
            "@type": "Organization",
            name: APP_NAME,
          },
          datePublished: "2026-01-01",
          validFor: "P1Y",
        }),
      },
    ],
  }),
});