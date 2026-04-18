import { createFileRoute } from "@tanstack/react-router";
import { APP_NAME } from "~/config";
import { ForbiddenError } from "~/features/errors/forbidden";

export const Route = createFileRoute("/(errors)/403")({
  component: ForbiddenError,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content: `403 Forbidden - Access denied to ${APP_NAME} resource`,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "403 Forbidden",
          description: "Access to this resource is denied",
          isPartOf: { "@type": "WebSite", name: APP_NAME },
        }),
      },
    ],
  }),
});