/**
 * Common Header Component
 * Reused across all pages for consistent navigation
 * Includes user-specific navigation when authenticated
 */

import { Link } from "@tanstack/react-router";
import { LayoutDashboard, CircleUserRound } from "lucide-react";
import { cn } from "~/lib/utils";
import { ThemeSwitch } from "~/components/theme-switch";
import { Search } from "~/components/search";
import { GITHUB_REPO_URL } from "~/config";
import { navItems } from "~/config/index";
import { useSession } from "~/lib/auth/client";
import { BrandLogo } from "./branding";
import { useScrollDirection } from "~/hooks/use-scroll-direction";
import { IconGithub } from "~/assets/brand-icons";

interface HeaderProps {
  className?: string;
  children?: React.ReactNode;
}

export function Header({ className, children }: HeaderProps) {
  const { data: session, isPending } = useSession();
  const isVisible = useScrollDirection();

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 transition-transform duration-300 ease-in-out",
        !isVisible && "-translate-y-full",
        className,
      )}
    >
      <div className="flex items-center justify-between h-full px-6 mx-auto">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-1 mt-1 font-bold text-xl">
            <BrandLogo size="sm" />
          </Link>
        </div>

        {/* Middle: Blog and Documentation */}
        {!(isPending || session?.user) && (
          <nav className="hidden md:flex items-center gap-3 absolute left-1/2 transform -translate-x-1/2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-sm font-medium hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side: GitHub, Theme, Dashboard/User */}
        <div className="flex items-center gap-1">
          {/* When user is authenticated: show GitHub, Theme, Dashboard */}
          {session?.user && !isPending && (
            <>
              <Search className="text-primary" />
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-accent rounded-md transition-colors text-primary"
                aria-label="GitHub"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <ThemeSwitch />
              <Link
                to="/dashboard"
                className="p-2 hover:bg-accent rounded-md transition-colors text-primary"
                aria-label="Dashboard"
                title="Dashboard"
              >
                <LayoutDashboard className="scale-100" />
              </Link>
            </>
          )}

          {/* When user is NOT authenticated: show Search, GitHub, Theme, sign-in */}
          {!session?.user && !isPending && (
            <>
              <Search className="text-primary" />
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-accent rounded-md transition-colors text-primary"
                aria-label="GitHub"
              >
                <IconGithub className="text-primary" />
              </a>
              <ThemeSwitch />
              <Link
                to="/sign-in"
                className="p-2 hover:bg-accent rounded-md transition-colors text-primary"
                aria-label="Login"
                title="Login"
              >
                <CircleUserRound className="scale-100" />
              </Link>
            </>
          )}

          {children}
        </div>
      </div>
    </header>
  );
}