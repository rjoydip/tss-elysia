/**
 * Password Change Form Component
 * Handles password updates with validation.
 * Requires current password for security verification.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { changePassword } from "~/lib/auth/client";

/**
 * Password validation schema using Zod.
 * Enforces minimum length and complexity requirements.
 */
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Type inferred from the password schema.
 */
type PasswordFormData = z.infer<typeof passwordSchema>;

/**
 * PasswordChangeForm component for updating user password.
 * Validates input and handles password change flow.
 *
 * @example
 * <PasswordChangeForm />
 */
export function PasswordChangeForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  /**
   * Handle form submission.
   * Validates passwords and attempts to change password.
   */
  const onSubmit = async (data: PasswordFormData) => {
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const { error: changeError } = await changePassword(data.currentPassword, data.newPassword);

      if (changeError) {
        setError(changeError.message || "Failed to change password");
        setIsLoading(false);
        return;
      }

      // Clear form and show success
      reset();
      setSuccess(true);
      setIsLoading(false);
    } catch (_err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Success message */}
      {success && (
        <div className="p-3 text-sm text-green-700 bg-green-50 rounded-md border border-green-200">
          Password changed successfully!
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      {/* Current password */}
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current Password</Label>
        <Input
          id="currentPassword"
          type="password"
          placeholder="Enter current password"
          {...register("currentPassword")}
          disabled={isLoading}
          autoComplete="current-password"
        />
        {errors.currentPassword && (
          <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
        )}
      </div>

      {/* New password */}
      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          type="password"
          placeholder="Enter new password"
          {...register("newPassword")}
          disabled={isLoading}
          autoComplete="new-password"
        />
        {errors.newPassword && (
          <p className="text-sm text-destructive">{errors.newPassword.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters with uppercase, lowercase, and number
        </p>
      </div>

      {/* Confirm new password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          {...register("confirmPassword")}
          disabled={isLoading}
          autoComplete="new-password"
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* Submit button */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            Changing password...
          </>
        ) : (
          "Change Password"
        )}
      </Button>
    </form>
  );
}