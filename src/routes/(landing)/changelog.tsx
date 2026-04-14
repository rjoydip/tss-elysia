/**
 * Changelog Page
 */

import { createFileRoute } from "@tanstack/react-router";
import { ChangelogPage } from "~/features/landing/changelog";

export const Route = createFileRoute("/(landing)/changelog")({
  component: ChangelogPage,
});