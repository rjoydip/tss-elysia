import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "~/components/auth/auth-guard";
import { Settings } from "~/features/settings";

function SettingsWithGuard() {
  return (
    <AuthGuard>
      <Settings />
    </AuthGuard>
  );
}

export const Route = createFileRoute("/_authenticated/dashboard/settings")({
  component: SettingsWithGuard,
});