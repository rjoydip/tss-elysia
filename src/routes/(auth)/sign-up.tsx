import { createFileRoute } from "@tanstack/react-router";
import { APP_NAME } from "~/config";
import { SignUp } from "~/features/auth/sign-up";

export const Route = createFileRoute("/(auth)/sign-up")({
  component: SignUp,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: `Create a new ${APP_NAME} account` },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `Sign Up - ${APP_NAME}`,
          description: "Create a new account",
          isPartOf: { "@type": "WebSite", name: APP_NAME },
        }),
      },
    ],
  }),
});