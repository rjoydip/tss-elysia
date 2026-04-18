/**
 * Breadcrumb Navigation Component
 * Provides path-based navigation for documentation pages
 * Uses shadcn/Radix patterns for consistent styling
 */

import * as React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "~/components/ui/breadcrumb";
import { cn } from "~/lib/utils";

interface BreadcrumbItemData {
  /** Display label for the breadcrumb item */
  label: string;
  /** Link path for navigation (optional for current page) */
  href?: string;
}

interface BreadcrumbProps {
  /** Array of breadcrumb items to display */
  items: BreadcrumbItemData[];
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
export function BreadcrumbNav({ items, className }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  const allItems = [{ label: "Home", href: "/" }, ...items];

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isHome = index === 0;

          return (
            <React.Fragment key={item.label}>
              {index > 0 && (
                <li
                  key={item.label + 1}
                  role="presentation"
                  aria-hidden="true"
                  className="[&>svg]:w-3.5 [&>svg]:h-3.5"
                >
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </li>
              )}
              <BreadcrumbItem key={item.label}>
                {item.href && !isLast ? (
                  <BreadcrumbLink asChild>
                    <Link to={item.href} className="hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage
                    className={cn(isLast ? "font-medium text-foreground" : "text-foreground")}
                  >
                    {isHome ? (
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
                        aria-hidden="true"
                      >
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    ) : (
                      item.label
                    )}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}