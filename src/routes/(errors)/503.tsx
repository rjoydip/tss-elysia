import { createFileRoute } from "@tanstack/react-router";
import { APP_NAME } from "~/config";
import { MaintenanceError } from "~/features/errors/maintenance-error";

export const Route = createFileRoute("/(errors)/503")({
  component: MaintenanceError,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content: `503 Service Unavailable - ${APP_NAME} is under maintenance`,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "503 Service Unavailable",
          description: "The service is currently under maintenance",
          isPartOf: { "@type": "WebSite", name: APP_NAME },
        }),
      },
    ],
  }),
});