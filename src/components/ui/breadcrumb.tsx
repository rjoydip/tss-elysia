/**
 * Breadcrumb Navigation Component
 * Provides path-based navigation for documentation pages
 * Uses shadcn/Radix patterns for consistent styling
 */

import { Link } from "@tanstack/react-router";
import { cn } from "~/lib/utils";

interface BreadcrumbItem {
  /** Display label for the breadcrumb item */
  label: string;
  /** Link path for navigation (optional for current page) */
  href?: string;
}

interface BreadcrumbProps {
  /** Array of breadcrumb items to display */
  items: BreadcrumbItem[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * Breadcrumb navigation component for docs pages.
 * Shows hierarchical path with clickable links and current page indicator.
 *
 * @example
 * <Breadcrumb items={[
 *   { label: "Docs", href: "/docs" },
 *   { label: "API Reference" }
 * ]} />
 */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center text-sm", className)}>
      <ol className="flex items-center space-x-2">
        {/* Home link */}
        <li className="flex items-center">
          <Link
            to="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Home"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.label} className="flex items-center">
              {/* Separator */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-2 text-muted-foreground"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>

              {/* Breadcrumb item */}
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(isLast ? "text-foreground font-medium" : "text-muted-foreground")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}