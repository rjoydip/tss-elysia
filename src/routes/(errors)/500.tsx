import { createFileRoute } from "@tanstack/react-router";
import { APP_NAME } from "~/config";
import { GeneralError } from "~/features/errors/general-error";

export const Route = createFileRoute("/(errors)/500")({
  component: GeneralError,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content: `500 Internal Server Error - An unexpected error occurred on ${APP_NAME}`,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "500 Internal Server Error",
          description: "An unexpected error occurred",
          isPartOf: { "@type": "WebSite", name: APP_NAME },
        }),
      },
    ],
  }),
});