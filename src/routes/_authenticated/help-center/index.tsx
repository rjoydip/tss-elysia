import { createFileRoute } from "@tanstack/react-router";
import { APP_NAME } from "~/config";
import { AuthGuard } from "~/components/auth/auth-guard";
import { ComingSoon } from "~/components/coming-soon";

function HelpCenterWithGuard() {
  return (
    <AuthGuard>
      <ComingSoon />
    </AuthGuard>
  );
}

export const Route = createFileRoute("/_authenticated/help-center/")({
  component: HelpCenterWithGuard,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: `${APP_NAME} Help Center` },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `Help Center - ${APP_NAME}`,
          description: "Get help and support",
          isPartOf: { "@type": "WebSite", name: APP_NAME },
        }),
      },
    ],
  }),
});