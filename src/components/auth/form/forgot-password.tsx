/**
 * Forgot Password Form Component
 * Modern forgot password form using TanStack Form for state management.
 */

import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { sendPasswordReset } from "~/lib/auth/client";
import { APP_NAME } from "~/config";
import { Branding } from "~/components/branding";
import { toast } from "sonner";
import { setAuthSubmitting, useAuthFormState } from "~/lib/store/auth";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/**
 * ForgotPasswordForm component for password reset.
 * Uses TanStack Form with Zod validation.
 *
 * @example
 * <ForgotPasswordForm />
 */
export function ForgotPasswordForm() {
  const forgotPasswordUi = useAuthFormState("forgotPassword");
  const isSubmitting = forgotPasswordUi.isSubmitting;

  const form = useForm({
    defaultValues: {
      email: "",
    } as ForgotPasswordFormValues,
    validators: {
      onChange: forgotPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      setAuthSubmitting("forgotPassword", true);
      try {
        const { error } = await sendPasswordReset(value.email);
        if (error) {
          toast.error(error.message || "Failed to send reset email");
          return;
        }
        toast.success("Reset link sent. Please check your email.");
      } finally {
        setAuthSubmitting("forgotPassword", false);
      }
    },
  });

  return (
    <div className="flex w-full min-h-screen">
      {/* Left side - Branding (hidden on mobile) */}
      <Branding align="center" justify="center" hidden={{ mobile: true }} />

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/80 to-primary rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                  <path
                    fill="white"
                    d="M12.89 5.64a.184.184 0 0 1-.166-.238a23 23 0 0 1 1.292-3.065a.264.264 0 0 1 .288-.144a19.95 19.95 0 0 1 7.499 2.415a.36.36 0 0 1 .195.363a20.1 20.1 0 0 1-8.721 16.365a.185.185 0 0 1-.283-.086a24 24 0 0 1-.946-3.181a.29.29 0 0 1 .107-.328a16.5 16.5 0 0 0 6.152-10.875a16.5 16.5 0 0 0-5.422-1.226Z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-bold">{APP_NAME}</span>
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight">Forgot password?</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {/* Email Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            {/* Email Field */}
            <form.Field name="email">
              {(field) => (
                <div className="space-y-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    disabled={isSubmitting}
                    required
                    autoComplete="email"
                    className="h-11"
                  />
                  {field.state.meta.isTouched && !field.state.meta.isValid && (
                    <p className="text-xs text-destructive">Please enter a valid email address</p>
                  )}
                </div>
              )}
            </form.Field>

            <Button type="submit" className="w-full h-11" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>

          {/* Back to sign in link */}
          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/account/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}