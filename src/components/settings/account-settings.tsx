/**
 * Account Settings Component
 * Handles password and email change functionality.
 * Provides forms for updating account security settings.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { PasswordChangeForm } from "~/components/settings/password-change-form";
import { EmailChangeForm } from "~/components/settings/email-change-form";

/**
 * AccountSettings component for account security settings.
 * Displays password and email change forms.
 *
 * @example
 * <AccountSettings />
 */
export function AccountSettings() {
  return (
    <div className="space-y-6">
      {/* Password change section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordChangeForm />
        </CardContent>
      </Card>

      {/* Email change section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Email</CardTitle>
          <CardDescription>
            Update your email address. You will need to verify the new email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailChangeForm />
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-destructive border border-destructive rounded-md hover:bg-destructive/10 transition-colors">
              Delete Account
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}