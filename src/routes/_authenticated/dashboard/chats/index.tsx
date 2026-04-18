import { createFileRoute } from "@tanstack/react-router";
import { AuthGuard } from "~/components/auth/auth-guard";
import { Chats } from "~/features/chats";

function ChatsWithGuard() {
  return (
    <AuthGuard>
      <Chats />
    </AuthGuard>
  );
}

export const Route = createFileRoute("/_authenticated/dashboard/chats/")({
  component: ChatsWithGuard,
});