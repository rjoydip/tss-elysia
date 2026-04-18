import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "~/components/auth/auth-guard";
import { ComingSoon } from "~/components/coming-soon";

function HelpCenterWithGuard() {
  return (
    <AuthGuard>
      <ComingSoon />
    </AuthGuard>
  );
}

export const Route = createFileRoute("/_authenticated/help-center/")({
  component: HelpCenterWithGuard,
});