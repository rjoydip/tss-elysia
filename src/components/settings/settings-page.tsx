/**
 * Settings Page Component
 * Displays account settings with tabbed interface.
 * Protected by AuthGuard to ensure authentication.
 */

import { AuthGuard } from "~/components/auth/auth-guard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { AccountSettings } from "~/components/settings/account-settings";
import { SessionSettings } from "~/components/settings/session-settings";
import { PreferencesSettings } from "~/components/settings/preferences-settings";

/**
 * SettingsPage component wrapped with authentication guard.
 * Displays settings organized in tabs.
 *
 * @example
 * <SettingsPage />
 */
export function SettingsPage() {
  return (
    <AuthGuard>
      <SettingsContent />
    </AuthGuard>
  );
}

/**
 * Settings content component.
 * Renders tabbed interface for different settings sections.
 * Includes account, sessions, and preferences tabs.
 */
function SettingsContent() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Settings tabs */}
      <Tabs defaultValue="account" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-none lg:inline-flex">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Account settings tab */}
        <TabsContent value="account" className="space-y-6">
          <AccountSettings />
        </TabsContent>

        {/* Sessions tab */}
        <TabsContent value="sessions" className="space-y-6">
          <SessionSettings />
        </TabsContent>

        {/* Preferences tab */}
        <TabsContent value="preferences" className="space-y-6">
          <PreferencesSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}