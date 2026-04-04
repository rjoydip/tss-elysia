/**
 * Docs Layout Route
 * Shared layout for all documentation pages
 * Provides Header, Footer, Sidebar, and breadcrumbs
 * Sidebar is memoized so it doesn't re-render when only page content changes
 */

import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import { docsConfig } from "~/config/docs";
import { Header } from "~/components/header";
import { SidebarInset, SidebarProvider, SidebarTrigger, useSidebar } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { DocsSidebar } from "~/components/docs/sidebar";
import { Footer } from "~/components/footer";

export const Route = createFileRoute("/docs")({
  component: DocsLayoutWrapper,
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

    if (segments.length === 0 || segments[0] !== "docs") {
      setBreadcrumbs([]);
      return;
    }

    items.push({ label: "Docs", href: "/docs" });

    for (const section of docsConfig) {
      const matchingItem =
        section.items.find((item) => item.href === pathname) ??
        section.items.find((item) => item.href !== "/docs" && pathname.startsWith(item.href));

      if (matchingItem) {
        items.push({ label: section.title, href: undefined });
        items.push({ label: matchingItem.name, href: matchingItem.href });
        break;
      }
    }

    setBreadcrumbs(items);
  }, [pathname]);

  return breadcrumbs;
}

function DocsLayout() {
  const currentPath = useLocation({ select: (location) => location.pathname });
  const breadcrumbs = useBreadcrumbs(currentPath);
  const { state } = useSidebar();
  const isExpanded = state === "expanded";

  const headerMargin = isExpanded
    ? "mx-[var(--sidebar-width)]"
    : "mx-[calc(var(--sidebar-width-icon)+2rem)]";
  const contentMargin = isExpanded
    ? "mx-[var(--sidebar-width)]"
    : "mx-[calc(var(--sidebar-width-icon)+2rem)]";

  return (
    <div className="flex flex-col">
      <Header />
      <>
        <DocsSidebar className={isExpanded ? "" : "pt-12"} />
        <SidebarInset className="flex pt-12">
          <header className={`flex h-16 shrink-0 items-center gap-2 ${headerMargin}`}>
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {breadcrumbs.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((item, index) => (
                    <React.Fragment key={item.label}>
                      <BreadcrumbItem
                        className={
                          index === breadcrumbs.length - 1 ? "hidden md:block" : "hidden md:block"
                        }
                      >
                        {item.href && index < breadcrumbs.length - 1 ? (
                          <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                        ) : (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        )}
                      </BreadcrumbItem>
                      {index < breadcrumbs.length - 1 && (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </header>
          <div className={`flex flex-col gap-4 p-4 transition-all duration-200 ${contentMargin}`}>
            <Outlet />
            <Footer showLogo={true} />
          </div>
        </SidebarInset>
      </>
    </div>
  );
}

function DocsLayoutWrapper() {
  return (
    <SidebarProvider defaultOpen>
      <DocsLayout />
    </SidebarProvider>
  );
}