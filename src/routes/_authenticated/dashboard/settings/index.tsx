import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "~/components/auth/auth-guard";
import { SettingsProfile } from "~/features/settings/profile";

function SettingsProfileWithGuard() {
  return (
    <AuthGuard>
      <SettingsProfile />
    </AuthGuard>
  );
}

export const Route = createFileRoute("/_authenticated/dashboard/settings/")({
  component: SettingsProfileWithGuard,
});