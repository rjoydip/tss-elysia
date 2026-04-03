/**
 * Profile Page Route
 * Displays user profile information and allows editing.
 * Protected route requiring authentication.
 * Uses TanStack Router for file-based routing.
 */

import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "~/components/profile/profile-page";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";

/**
 * Route definition for the profile page.
 * Uses TanStack Router's file-based routing system.
 */
export const Route = createFileRoute("/profile/")({
  component: Profile,
});

/**
 * Profile page component.
 * Renders the profile content with header and footer.
 * Displays user information and edit functionality.
 */
function Profile() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 px-4 pt-20 pb-12">
        <div className="max-w-4xl mx-auto">
          <ProfilePage />
        </div>
      </main>

      <Footer />
    </div>
  );
}