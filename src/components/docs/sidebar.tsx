/**
 * Documentation Sidebar
 * Memoized to prevent re-renders when only page content changes
 * Renders the sidebar navigation for docs pages with collapsible sections
 */

import { useMemo, memo } from "react";
import { useLocation } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { docsConfig } from "~/config/docs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "~/components/ui/sidebar";

export const DocsSidebar = memo(function ({ ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const currentPath = useLocation({ select: (location) => location.pathname });

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
    <Sidebar {...props}>
      <SidebarHeader></SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel></SidebarGroupLabel>
          <SidebarMenu>
            {docsConfig.map((section) => {
              const activeHref = sectionMatches.get(section.title);

              return (
                <SidebarMenuItem key={section.title}>
                  <Collapsible defaultOpen className="group/collapsible">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={section.title}
                        className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                      >
                        {section.title}
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {section.items.map((item) => {
                          const isActive = activeHref === item.href;
                          return (
                            <SidebarMenuSubItem key={item.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive}
                                className="data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                              >
                                <a href={item.href}>
                                  <span>{item.name}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
});