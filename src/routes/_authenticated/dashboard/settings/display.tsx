import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "~/components/auth/auth-guard";
import { SettingsDisplay } from "~/features/settings/display";

function SettingsDisplayWithGuard() {
  return (
    <AuthGuard>
      <SettingsDisplay />
    </AuthGuard>
  );
}

export const Route = createFileRoute("/_authenticated/dashboard/settings/display")({
  component: SettingsDisplayWithGuard,
});