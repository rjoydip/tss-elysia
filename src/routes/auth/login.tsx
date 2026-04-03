/**
 * Login Page Route
 * Displays the login form for user authentication.
 * Uses TanStack Router for file-based routing.
 */

import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "~/components/auth/form/login";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";

/**
 * Route definition for the login page.
 * Uses TanStack Router's file-based routing system.
 */
export const Route = createFileRoute("/auth/login")({
  component: Login,
});

/**
 * Login page component.
 * Renders the login form with header and footer.
 * Centered layout with responsive design.
 */
function Login() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 pt-20 pb-12">
        <LoginForm />
      </main>

      <Footer />
    </div>
  );
}