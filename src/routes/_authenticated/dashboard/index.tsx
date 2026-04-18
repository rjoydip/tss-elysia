import { createFileRoute } from "@tanstack/react-router";
import { APP_NAME } from "~/config";
import { AuthGuard } from "~/components/auth/auth-guard";
import { Dashboard } from "~/features/dashboard";

function DashboardWithGuard() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardWithGuard,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: `${APP_NAME} Dashboard - Your personal dashboard` },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `Dashboard - ${APP_NAME}`,
          description: "Your personal dashboard",
          isPartOf: { "@type": "WebSite", name: APP_NAME },
        }),
      },
    ],
  }),
});