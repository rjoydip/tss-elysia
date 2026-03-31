import * as React from "react";
import { cn } from "~/lib/utils";

/**
 * Orientation of the separator
 */
type SeparatorOrientation = "horizontal" | "vertical";

/**
 * Props for the Separator component
 */
interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Orientation of the separator - horizontal or vertical
   */
  orientation?: SeparatorOrientation;
  /**
   * Whether the separator is purely decorative (for accessibility)
   */
  decorative?: boolean;
}

/**
 * Separator component for dividing content visually.
 * Supports both horizontal and vertical orientations.
 */
const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
    <div
      ref={ref}
      role={decorative ? "none" : "separator"}
      aria-orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = "Separator";

export { Separator };