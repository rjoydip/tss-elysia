import { createFileRoute } from "@tanstack/react-router";
import { APP_NAME } from "~/config";
import { Otp } from "~/features/auth/otp";

export const Route = createFileRoute("/(auth)/otp")({
  component: Otp,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content: `Verify your OTP code for ${APP_NAME}`,
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `OTP Verification - ${APP_NAME}`,
          description: "Verify your one-time password",
          isPartOf: { "@type": "WebSite", name: APP_NAME },
        }),
      },
    ],
  }),
});