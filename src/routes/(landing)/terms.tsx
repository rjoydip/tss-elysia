/**
 * Terms of Service Page
 */

import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "~/features/landing/terms";

export const Route = createFileRoute("/(landing)/terms")({
  component: TermsPage,
});