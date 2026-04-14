/**
 * Docs Layout Route
 */

import { createFileRoute } from "@tanstack/react-router";
import { DocsLayoutWrapper } from "~/features/landing/docs/layout";

export const Route = createFileRoute("/(landing)/docs")({
  component: DocsLayoutWrapper,
});