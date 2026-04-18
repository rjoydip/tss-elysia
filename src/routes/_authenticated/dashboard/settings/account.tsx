import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "~/components/auth/auth-guard";
import { SettingsAccount } from "~/features/settings/account";

function SettingsAccountWithGuard() {
  return (
    <AuthGuard>
      <SettingsAccount />
    </AuthGuard>
  );
}

export const Route = createFileRoute("/_authenticated/dashboard/settings/account")({
  component: SettingsAccountWithGuard,
});