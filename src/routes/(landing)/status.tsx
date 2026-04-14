/**
 * Status Page
 */

import { createFileRoute } from "@tanstack/react-router";
import { HealthDashboard } from "~/features/landing/status";

export const Route = createFileRoute("/(landing)/status")({
  component: HealthDashboard,
});