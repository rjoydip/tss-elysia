/**
 * Blog Page
 */

import { createFileRoute } from "@tanstack/react-router";
import { BlogPage } from "~/features/landing/blog";

export const Route = createFileRoute("/(landing)/blog")({
  component: BlogPage,
});