/// <reference types="vite/client" />
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { A11yer } from "a11yer";
import * as React from "react";
import { ThemeProvider } from "~/components/theme/provider";
import { Toaster } from "~/components/ui/sonner";
import appCss from "~/app.css?url";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  head: () => ({
    title: "tss-elysia",
    meta: [
      { charSet: "utf8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
  }),
  errorComponent: () => <h1>500: Internal Server Error</h1>,
  notFoundComponent: () => <h1>404: Page Not Found</h1>,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <A11yer>
          <html>
            <head>
              <HeadContent />
            </head>
            <body>
              <Toaster richColors />
              {children}
              {import.meta.env.DEV && <TanStackRouterDevtools position="bottom-right" />}
              <Scripts />
            </body>
          </html>
        </A11yer>
      </ThemeProvider>
    </QueryClientProvider>
  );
}