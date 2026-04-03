/**
 * Email Change Form Component
 * Handles email address updates with verification.
 * Sends verification email to the new address.
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useSession, changeEmail } from "~/lib/auth/client";

/**
 * Email validation schema using Zod.
 * Validates email format.
 */
const emailSchema = z.object({
  newEmail: z.string().email("Please enter a valid email address"),
});

/**
 * Type inferred from the email schema.
 */
type EmailFormData = z.infer<typeof emailSchema>;

/**
 * EmailChangeForm component for updating user email.
 * Validates input and handles email change flow.
 * Sends verification email to the new address.
 *
 * @example
 * <EmailChangeForm />
 */
export function EmailChangeForm() {
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  /**
   * Handle form submission.
   * Validates email and sends verification email.
   */
  const onSubmit = async (data: EmailFormData) => {
    setError(null);
    setSuccess(false);

    // Check if new email is same as current
    if (data.newEmail === session?.user?.email) {
      setError("New email must be different from current email");
      return;
    }

    setIsLoading(true);

    try {
      const { error: changeError } = await changeEmail(
        data.newEmail,
        `${window.location.origin}/verify-email`,
      );

      if (changeError) {
        setError(changeError.message || "Failed to change email");
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
          Verification email sent! Please check your new email address.
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      {/* Current email (read-only) */}
      <div className="space-y-2">
        <Label htmlFor="currentEmail">Current Email</Label>
        <Input
          id="currentEmail"
          type="email"
          value={session?.user?.email || ""}
          disabled
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">This is your current email address</p>
      </div>

      {/* New email */}
      <div className="space-y-2">
        <Label htmlFor="newEmail">New Email</Label>
        <Input
          id="newEmail"
          type="email"
          placeholder="Enter new email address"
          {...register("newEmail")}
          disabled={isLoading}
          autoComplete="email"
        />
        {errors.newEmail && <p className="text-sm text-destructive">{errors.newEmail.message}</p>}
        <p className="text-xs text-muted-foreground">
          A verification email will be sent to this address
        </p>
      </div>

      {/* Submit button */}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            Sending verification...
          </>
        ) : (
          "Send Verification Email"
        )}
      </Button>
    </form>
  );
}