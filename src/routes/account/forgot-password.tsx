/**
 * Forgot Password Page Route
 * Displays the forgot password form for password reset.
 * Uses TanStack Router for file-based routing.
 */

import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordForm } from "~/components/auth/form/forgot-password";
import { Footer } from "~/components/footer";
import { Header } from "~/components/header";

/**
 * Route definition for the forgot password page.
 * Uses TanStack Router's file-based routing system.
 */
export const Route = createFileRoute("/account/forgot-password")({
  component: ForgotPassword,
});

/**
 * ForgotPassword page component.
 * Renders the forgot password form with branding layout.
 */
function ForgotPassword() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 pt-20 pb-12">
        <ForgotPasswordForm />
      </main>

      <Footer />
    </div>
  );
}