/**
 * Register Page Route
 * Displays the registration form for new user accounts.
 * Uses TanStack Router for file-based routing.
 */

import { createFileRoute } from "@tanstack/react-router";
import { RegisterForm } from "~/components/auth/form/register";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";

/**
 * Route definition for the register page.
 * Uses TanStack Router's file-based routing system.
 */
export const Route = createFileRoute("/auth/register")({
  component: Register,
});

/**
 * Register page component.
 * Renders the registration form with header and footer.
 * Centered layout with responsive design.
 */
function Register() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 pt-20 pb-12">
        <RegisterForm />
      </main>

      <Footer />
    </div>
  );
}