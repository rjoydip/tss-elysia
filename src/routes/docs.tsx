/**
 * Docs Layout Route
 * Shared layout for all documentation pages
 * Provides Header, Footer, Sidebar, and breadcrumbs
 * Sidebar is memoized so it doesn't re-render when only page content changes
 */

import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { cn } from "~/lib/utils";
import { docsConfig } from "~/config/docs";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";
import { DocsSidebar } from "~/components/docs/sidebar";
import { Breadcrumb } from "~/components/ui/breadcrumb";

export const Route = createFileRoute("/docs")({
  component: DocsLayout,
});

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
    if (segments.length === 0 || segments[0] !== "docs") {
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
      <Header>
        {/* Mobile sidebar toggle */}
        <button
          onClick={toggleSidebar}
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
      </Header>

      <DocsSidebar
        sidebarOpen={sidebarOpen}
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
        <Footer />
      </main>
    </div>
  );
}