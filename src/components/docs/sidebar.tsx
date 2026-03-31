/**
 * Documentation Sidebar
 * Memoized to prevent re-renders when only page content changes
 * Renders the sidebar navigation for docs pages with collapsible sections
 */

import { useMemo, memo } from "react";
import { useLocation } from "@tanstack/react-router";
import { cn } from "~/lib/utils";
import { docsConfig } from "~/config/docs";

interface DocsSidebarProps {
  sidebarOpen: boolean;
  expandedSections: Record<string, boolean>;
  onToggleSection: (title: string) => void;
}

export const DocsSidebar = memo(function DocsSidebar({
  sidebarOpen,
  expandedSections,
  onToggleSection,
}: DocsSidebarProps) {
  // Get current path to highlight active sidebar item
  const currentPath = useLocation({ select: (location) => location.pathname });

  // Pre-compute best match per section so only the most specific item is active
  const sectionMatches = useMemo(() => {
    const map = new Map<string, string>();
    for (const section of docsConfig) {
      const bestMatch = section.items
        .filter(
          (it) =>
            currentPath === it.href || (it.href !== "/docs" && currentPath.startsWith(it.href)),
        )
        .sort((a, b) => b.href.length - a.href.length)[0];
      if (bestMatch) {
        map.set(section.title, bestMatch.href);
      }
    }
    return map;
  }, [currentPath]);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-72 pt-16 bg-background transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
      )}
    >
      <nav className="h-full overflow-y-auto py-6 px-4">
        {docsConfig.map((section) => {
          const activeHref = sectionMatches.get(section.title);

          return (
            <div key={section.title} className="mb-6">
              <button
                onClick={() => onToggleSection(section.title)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent rounded-md transition-colors"
              >
                <span>{section.title}</span>
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
                  className={cn(
                    "transition-transform duration-200",
                    expandedSections[section.title] ? "rotate-90" : "",
                  )}
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
              {expandedSections[section.title] && (
                <ul className="mt-1 ml-2 space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = activeHref === item.href;
                    return (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          className={cn(
                            "block px-3 py-1.5 text-sm rounded-md transition-colors",
                            isActive
                              ? "bg-brand/10 text-brand font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                          )}
                        >
                          {item.name}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
});