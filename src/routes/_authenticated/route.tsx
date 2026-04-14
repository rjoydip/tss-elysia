import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthenticatedLayout } from "~/components/layout/authenticated-layout";
import { useAuthStore } from "~/lib/stores/auth-store";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedRouteWrapper,
});

function AuthenticatedRouteWrapper() {
  const navigate = useNavigate();
  const { auth } = useAuthStore();

  useEffect(() => {
    if (!auth.accessToken || !auth.user) {
      navigate({ to: "/sign-in", replace: true });
    }
  }, [auth.accessToken, auth.user, navigate]);

  if (!auth.accessToken || !auth.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return <AuthenticatedLayout />;
}