/**
 * Docs Index Route
 */

import { createFileRoute } from "@tanstack/react-router";
import { DocsLandingPage } from "~/features/landing/docs/index";

export const Route = createFileRoute("/(landing)/docs/")({
  component: DocsLandingPage,
});