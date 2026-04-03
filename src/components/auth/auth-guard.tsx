/**
 * Auth Guard Component
 * Protects routes by checking authentication status.
 * Redirects unauthenticated users to the login page.
 * Shows loading state while checking auth.
 */

import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSession } from "~/lib/auth/client";

/**
 * Props for the AuthGuard component.
 * @property children - Content to Render when authenticated
 * @property fallback - Optional redirect path for unauthenticated users (defaults to /auth/login)
 */
interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: string;
}

/**
 * AuthGuard component that wraps protected content.
 * Checks session status and redirects if not authenticated.
 * Displays a loading spinner while authentication state is being determined.
 *
 * @example
 * // Protect a page
 * <AuthGuard>
 *   <ProtectedContent />
 * </AuthGuard>
 *
 * // Custom redirect path
 * <AuthGuard fallback="/custom-login">
 *   <ProtectedContent />
 * </AuthGuard>
 */
export function AuthGuard({ children, fallback = "/auth/login" }: AuthGuardProps) {
  const { data: session, isPending, error } = useSession();
  const navigate = useNavigate();

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    if (!isPending && !session && !error) {
      navigate({ to: fallback });
    }
  }, [session, isPending, error, navigate, fallback]);

  // Show loading state while checking authentication
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          {/* Loading spinner */}
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show error state if session fetch failed
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-destructive"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Authentication Error</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {error.message || "Failed to verify authentication"}
            </p>
          </div>
          <button
            onClick={() => navigate({ to: fallback })}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!session) {
    return null;
  }

  // Render protected content when authenticated
  return <>{children}</>;
}