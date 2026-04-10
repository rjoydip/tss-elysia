/**
 * Common Header Component
 * Reused across all pages for consistent navigation
 * Includes user-specific navigation when authenticated
 */

import { Link } from "@tanstack/react-router";
import { cn } from "~/lib/utils";
import { ThemeToggle } from "~/components/theme/toggle";
import { GITHUB_REPO_URL } from "~/config";
import { navItems } from "~/config/index";
import { useSession } from "~/lib/auth/client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { BrandLogo } from "./branding";
import { useScrollDirection } from "~/hooks/use-scroll-direction";

interface HeaderProps {
  className?: string;
  children?: React.ReactNode;
  showSignIn?: boolean;
}

export function Header({ className, children, showSignIn = true }: HeaderProps) {
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
        <div className="flex items-center gap-1">
          {!(isPending || session?.user) && (
            <nav className="hidden md:flex items-center gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          )}

          {!(isPending || session?.user) && (
            <>
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
              <ThemeToggle />
            </>
          )}

          {/* User menu when authenticated */}
          {session?.user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-primary">
                        {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">
                    {session.user.name || "User"}
                  </span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="min-w-45 bg-background rounded-md border shadow-md p-1 animate-in fade-in-0 zoom-in-95"
                >
                  <DropdownMenu.Item asChild>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent cursor-pointer outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Profile
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent cursor-pointer outline-none"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      Settings
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="h-px bg-border my-1" />
                  <DropdownMenu.Item asChild>
                    <button
                      onClick={async () => {
                        const { signOut } = await import("~/lib/auth/client");
                        await signOut();
                        window.location.href = "/";
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-sm hover:bg-accent cursor-pointer outline-none w-full text-destructive"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : showSignIn ? (
            <Link
              to="/account/login"
              className="p-2 hover:bg-accent rounded-md transition-colors text-primary"
              aria-label="Login"
              title="Login"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="rotate-180"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </Link>
          ) : null}

          {children}
        </div>
      </div>
    </header>
  );
}