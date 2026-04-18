import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "~/components/auth/auth-guard";
import { Dashboard } from "~/features/dashboard";

function DashboardWithGuard() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: DashboardWithGuard,
});