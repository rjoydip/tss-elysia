/**
 * Common Footer Component
 * Reused across all pages for consistent footer
 * Includes links, copyright, and optional terms for auth pages
 */

import { APP_NAME, GITHUB_REPO_URL } from "~/config";
import { cn } from "~/lib/utils";
import { BrandLogo } from "./branding";

interface FooterProps {
  className?: string;
  /** Show terms and privacy links (useful for auth pages) */
  showTerms?: boolean;
  /** Show the app logo/name */
  showLogo?: boolean;
}

export function Footer({ className, showTerms = true, showLogo = false }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn(`py-4 px-4 bg-muted/10`, className)}>
      <div className="mx-auto">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Logo and copyright */}
          <div className="flex items-center gap-3">{showLogo && <BrandLogo size="xs" />}</div>

          {/* Navigation links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="/docs" className="hover:text-foreground transition-colors">
              Documentation
            </a>
            <a href="/blog" className="hover:text-foreground transition-colors">
              Blog
            </a>
            <a href="/changelog" className="hover:text-foreground transition-colors">
              Changelog
            </a>
            <a href="/status" className="hover:text-foreground transition-colors">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 mt-1 rounded-full bg-green-500 animate-pulse" />
                Status
              </span>
            </a>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-4 pt-4 border-t border-border/50">
          {/* Terms (optional - for auth pages) */}
          {showTerms && (
            <p className="text-center text-xs text-muted-foreground mb-2">
              By continuing, you agree to our{" "}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          )}

          {/* Copyright */}
          <div className="text-center text-xs text-muted-foreground">
            &copy; {currentYear} {APP_NAME}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}