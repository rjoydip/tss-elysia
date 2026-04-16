/**
 * Sign In Form Component
 * Uses react-hook-form for state management with Zod validation.
 * Integrates with auth client for actual authentication.
 */

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";
import { IconFacebook, IconGithub } from "~/assets/brand-icons";
import { signInWithEmail } from "~/lib/auth/client";
import { authActions } from "~/lib/stores/auth-store";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { PasswordInput } from "~/components/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === "" ? "Please enter your email" : undefined),
  }),
  password: z.string().min(1, "Password is required"),
});

/**
 * Extracts a readable sign-in error message from unknown client/server error shapes.
 * Better Auth can return different payload structures depending on transport/runtime.
 */
const extractLoginErrorMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (error && typeof error === "object") {
    const maybeError = error as {
      message?: string;
      error?: { message?: string } | string;
      body?: { message?: string };
    };
    if (typeof maybeError.message === "string") {
      return maybeError.message;
    }
    if (typeof maybeError.error === "string") {
      return maybeError.error;
    }
    if (maybeError.error && typeof maybeError.error === "object") {
      const nestedError = maybeError.error as { message?: string };
      if (typeof nestedError.message === "string") {
        return nestedError.message;
      }
    }
    if (maybeError.body && typeof maybeError.body.message === "string") {
      return maybeError.body.message;
    }
  }
  return "Failed to sign in";
};

interface SignInFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string;
}

export function SignInForm({ className, redirectTo, ...props }: SignInFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const result = await signInWithEmail(data.email, data.password);

      if (result.error) {
        toast.error(extractLoginErrorMessage(result.error));
        return;
      }

      if (result.data?.user) {
        const user = result.data.user;
        authActions.setUser({
          accountNo: user.id || "ACC001",
          email: user.email,
          role: ["user"],
          exp: Date.now() + 24 * 60 * 60 * 1000,
        });
        authActions.setAccessToken("auth-access-token");
        toast.success("Signed in successfully");
        const targetPath = redirectTo || "/dashboard";
        navigate({ to: targetPath, replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("grid gap-3", className)}
        {...props}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="relative">
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to="/forgot-password"
                className="absolute inset-e-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75"
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Do not have an account?</span>
          <Link
            to="/sign-up"
            className="text-sm font-medium text-muted-foreground hover:opacity-75"
          >
            Sign up
          </Link>
        </div>
        <Button type="submit" className="mt-2" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
          Sign in
        </Button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" type="button" disabled={isLoading}>
            <IconGithub className="h-4 w-4 mr-2" /> GitHub
          </Button>
          <Button variant="outline" type="button" disabled={isLoading}>
            <IconFacebook className="h-4 w-4 mr-2" /> Facebook
          </Button>
        </div>
      </form>
    </Form>
  );
}