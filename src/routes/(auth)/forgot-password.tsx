import { createFileRoute } from "@tanstack/react-router";
import { APP_NAME } from "~/config";
import { ForgotPassword } from "~/features/auth/forgot-password";

export const Route = createFileRoute("/(auth)/forgot-password")({
  component: ForgotPassword,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content: `Reset your ${APP_NAME} password`,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `Forgot Password - ${APP_NAME}`,
          description: "Reset your password",
          isPartOf: { "@type": "WebSite", name: APP_NAME },
        }),
      },
    ],
  }),
});