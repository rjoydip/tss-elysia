/**
 * Privacy Policy Page
 */

import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "~/features/landing/privacy";

export const Route = createFileRoute("/(landing)/privacy")({
  component: PrivacyPage,
});