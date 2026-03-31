/**
 * Dynamic Documentation Viewer
 * Renders markdown files with sidebar navigation
 * Supports syntax highlighting and anchor links
 * Following Supabase docs UI design: https://supabase.com/docs
 */

import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { cn } from "~/lib/utils";
import { docsConfig, navItems } from "~/config/docs";
import { useTheme } from "~/components/theme-provider";
import { Breadcrumb } from "~/components/ui/breadcrumb";
import { APP_NAME, GITHUB_REPO_URL } from "~/config";

export const Route = createFileRoute("/docs")({
  component: DocsLayout,
});

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  const themes: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];
  const currentIndex = themes.indexOf(theme as "light" | "dark" | "system");
  const nextTheme = themes[(currentIndex + 1) % themes.length];

  const icons = {
    light: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>
    ),
    dark: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    ),
    system: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="14" x="2" y="3" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </svg>
    ),
  };

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      className={cn(
        "inline-flex items-center justify-center w-9 h-9 rounded-md",
        "bg-transparent hover:bg-accent border-0 cursor-pointer",
        "transition-colors duration-200",
      )}
      aria-label={`Switch to ${nextTheme} theme`}
    >
      {icons[theme as keyof typeof icons] || icons.system}
    </button>
  );
}

/**
 * Generates breadcrumb items from the current path
 * Creates a hierarchical navigation structure for docs pages
 */
function useBreadcrumbs(pathname: string) {
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; href?: string }[]>([]);

  useEffect(() => {
    const items: { label: string; href?: string }[] = [];
    const segments = pathname.split("/").filter(Boolean);

    // Only show breadcrumbs for non-root docs pages
    if (segments.length == 0 || segments[0] !== "docs") {
      setBreadcrumbs([]);
      return;
    }

    items.push({ label: "Docs", href: "/docs" });

    // Find matching doc item for current path
    // Prefer exact matches over prefix matches to avoid "/docs" matching "/docs/development"
    for (const section of docsConfig) {
      const matchingItem =
        section.items.find((item) => item.href === pathname) ??
        section.items.find((item) => item.href !== "/docs" && pathname.startsWith(item.href));

      if (matchingItem) {
        items.push({ label: section.title });
        items.push({ label: matchingItem.name });
        break;
      }
    }

    setBreadcrumbs(items);
  }, [pathname]);

  return breadcrumbs;
}

/**
 * Sidebar navigation component
 * Memoized to prevent re-renders when only Outlet content changes
 */
const DocsSidebar = memo(function DocsSidebar({
  currentPath,
  sidebarOpen,
  onToggleSidebar,
  expandedSections,
  onToggleSection,
}: {
  currentPath: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  expandedSections: Record<string, boolean>;
  onToggleSection: (title: string) => void;
}) {
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

  const navItems$ = useMemo(() => navItems, []);

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between h-full px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-brand-hover flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                  stroke="white"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-foreground">{APP_NAME}</span>
            </a>
            <nav className="hidden md:flex items-center gap-6">
              {navItems$.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    currentPath.startsWith(item.href)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-muted/50 hover:bg-muted rounded-md transition-colors">
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
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <span className="hidden sm:inline">Search docs...</span>
              <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-brand text-xs">
                  <span className="gap-1">⌘</span>K
                </span>
              </kbd>
            </button>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-accent rounded-md transition-colors text-brand"
              aria-label="GitHub"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <ThemeToggle />
            <button
              onClick={onToggleSidebar}
              className="p-2 hover:bg-accent rounded-md transition-colors lg:hidden"
              aria-label="Toggle sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" x2="21" y1="6" y2="6" />
                <line x1="3" x2="21" y1="12" y2="12" />
                <line x1="3" x2="21" y1="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
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
    </>
  );
});

function DocsLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const currentPath = useLocation({ select: (location) => location.pathname });
  const breadcrumbs = useBreadcrumbs(currentPath);

  // Sync expanded sections when navigating to a new path
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    docsConfig.forEach((section) => {
      initialExpanded[section.title] = section.items.some(
        (item) => item.href === currentPath || currentPath.startsWith(item.href),
      );
    });
    setExpandedSections(initialExpanded);
  }, [currentPath]);

  const toggleSection = useCallback((title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <DocsSidebar
        currentPath={currentPath}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={toggleSidebar}
        expandedSections={expandedSections}
        onToggleSection={toggleSection}
      />

      {/* Main Content */}
      <main
        className={cn("pt-12 transition-all duration-300", sidebarOpen ? "lg:ml-72" : "lg:ml-0")}
      >
        <div className="max-w-6xl mx-auto py-12">
          {/* Breadcrumb Navigation */}
          {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} className="mb-6" />}
          <Outlet />
        </div>
      </main>
    </div>
  );
}