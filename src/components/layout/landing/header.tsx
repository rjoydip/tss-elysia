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
          {!isPending && (
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
              {session?.user ? (
                <Link
                  to="/dashboard"
                  className="p-2 hover:bg-accent rounded-md transition-colors text-primary"
                  aria-label="Dashboard"
                  title="Dashboard"
                >
                  <LayoutDashboard className="scale-100" />
                </Link>
              ) : (
                <Link
                  to="/sign-in"
                  className="p-2 hover:bg-accent rounded-md transition-colors text-primary"
                  aria-label="Login"
                  title="Login"
                >
                  <CircleUserRound className="scale-100" />
                </Link>
              )}
            </>
          )}
          {children}
        </div>
      </div>
    </header>
  );
}