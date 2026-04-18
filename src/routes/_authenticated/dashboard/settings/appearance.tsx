import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "~/components/auth/auth-guard";
import { SettingsAppearance } from "~/features/settings/appearance";

function SettingsAppearanceWithGuard() {
  return (
    <AuthGuard>
      <SettingsAppearance />
    </AuthGuard>
  );
}

export const Route = createFileRoute("/_authenticated/dashboard/settings/appearance")({
  component: SettingsAppearanceWithGuard,
});