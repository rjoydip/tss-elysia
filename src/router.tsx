import { createRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { handleServerError } from "~/lib/handle-server-error";
import { useAuthStore } from "~/lib/stores/auth-store.ts";
import { routeTree } from "./routeTree.gen.ts";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function getRouter() {
  return router;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // eslint-disable-next-line no-console
        if (import.meta.env.DEV) console.log({ failureCount, error });

        if (failureCount >= 0 && import.meta.env.DEV) return false;
        if (failureCount > 3 && import.meta.env.PROD) return false;

        return !(error instanceof AxiosError && [401, 403].includes(error.response?.status ?? 0));
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000, // 10s
    },
    mutations: {
      onError: (error) => {
        handleServerError(error);

        if (error instanceof AxiosError) {
          if (error.response?.status === 304) {
            toast.error("Content not modified!");
          }
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error("Session expired!");
          useAuthStore.getState().auth.reset();
          router.navigate({
            to: "/account/login",
            search: { redirect: `${router.history.location.href}` },
          });
        }
        if (error.response?.status === 500) {
          toast.error("Internal Server Error!");
          if (import.meta.env.PROD) {
            router.navigate({ to: "/" });
          }
        }
        if (error.response?.status === 403) {
          // router.navigate("/forbidden", { replace: true });
        }
      }
    },
  }),
});