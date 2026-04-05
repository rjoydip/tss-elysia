/**
 * Settings Page Route
 * Displays account settings with tabbed interface.
 * Protected route requiring authentication.
 * Uses TanStack Router for file-based routing.
 */

import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "~/components/settings/settings-page";
import { Header } from "~/components/header";
import { Footer } from "~/components/footer";

/**
 * Route definition for the settings page.
 * Uses TanStack Router's file-based routing system.
 */
export const Route = createFileRoute("/settings")({
  component: Settings,
});

/**
 * Settings page component.
 * Renders the settings content with header and footer.
 * Displays account settings, security, and preferences.
 */
function Settings() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 px-4 pt-20 pb-12">
        <div className="max-w-4xl mx-auto">
          <SettingsPage />
        </div>
      </main>

      <Footer />
    </div>
  );
}