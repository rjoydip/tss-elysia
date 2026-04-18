import { createFileRoute } from "@tanstack/react-router";
import { APP_NAME } from "~/config";
import { UnauthorisedError } from "~/features/errors/unauthorized-error";

export const Route = createFileRoute("/(errors)/401")({
  component: UnauthorisedError,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content: `401 Unauthorized - Authentication required to access ${APP_NAME}`,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "401 Unauthorized",
          description: "This resource requires authentication",
          isPartOf: { "@type": "WebSite", name: APP_NAME },
        }),
      },
    ],
  }),
});