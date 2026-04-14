import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "~/components/auth/auth-guard";
import { SettingsNotifications } from "~/features/settings/notifications";

function SettingsNotificationsWithGuard() {
  return (
    <AuthGuard>
      <SettingsNotifications />
    </AuthGuard>
  );
}

export const Route = createFileRoute("/_authenticated/dashboard/settings/notifications")({
  component: SettingsNotificationsWithGuard,
});