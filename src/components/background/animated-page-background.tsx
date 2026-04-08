/**
 * Reusable animated page background.
 * Adds subtle non-interactive gradients so pages feel alive without affecting usability.
 */

import { cn } from "~/lib/utils";

interface AnimatedPageBackgroundProps {
  /**
   * Optional class overrides for page-specific tuning.
   */
  className?: string;
}

/**
 * Decorative background layer shared across public pages.
 * Uses pulse animations with staggered delays to avoid visual repetition.
 */
export function AnimatedPageBackground({ className }: AnimatedPageBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}
    >
      <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-primary/12 blur-3xl animate-pulse" />
      <div
        className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl animate-pulse"
        style={{ animationDelay: "700ms" }}
      />
      <div
        className="absolute -bottom-24 left-1/4 h-64 w-64 rounded-full bg-primary/8 blur-3xl animate-pulse"
        style={{ animationDelay: "1200ms" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.10),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.14),transparent_55%)]" />
    </div>
  );
}