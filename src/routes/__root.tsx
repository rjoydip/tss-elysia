/// <reference types="vite/client" />
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { A11yer } from "a11yer";
import { StrictMode } from "react";
import { NavigationProgress } from "~/components/navigation-progress";
import { GeneralError } from "~/features/errors/general-error";
import { NotFoundError } from "~/features/errors/not-found-error";
import { Toaster } from "~/components/ui/sonner";
import { DirectionProvider } from "~/context/direction-provider";
import { FontProvider } from "~/context/font-provider";
import { ThemeProvider } from "~/context/theme-provider";
import { queryClient } from "~/router";
import appCss from "~/styles/app.css?url";
import { SearchProvider } from "~/context/search-provider";

export const Route = createRootRoute({
  head: () => ({
    title: "tsse-elysia",
    meta: [
      { charSet: "utf8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
  }),
  errorComponent: GeneralError,
  notFoundComponent: NotFoundError,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <FontProvider>
            <DirectionProvider>
              <SearchProvider>
                <A11yer>
                  <html lang="en">
                    <head>
                      <HeadContent />
                    </head>
                    <body>
                      <NavigationProgress />
                      {children}
                      <Toaster duration={5000} />
                      {import.meta.env.MODE === "development" && (
                        <>
                          <ReactQueryDevtools buttonPosition="bottom-left" />
                          <TanStackRouterDevtools position="bottom-right" />
                        </>
                      )}
                      <Scripts />
                    </body>
                  </html>
                </A11yer>
              </SearchProvider>
            </DirectionProvider>
          </FontProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}