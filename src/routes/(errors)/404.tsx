import { createFileRoute } from "@tanstack/react-router";
import { APP_NAME } from "~/config";
import { NotFoundError } from "~/features/errors/not-found-error";

export const Route = createFileRoute("/(errors)/404")({
  component: NotFoundError,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content: `404 Not Found - The requested page does not exist on ${APP_NAME}`,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "404 Not Found",
          description: "The requested resource was not found",
          isPartOf: { "@type": "WebSite", name: APP_NAME },
        }),
      },
    ],
  }),
});