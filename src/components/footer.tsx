/**
 * Common Footer Component
 * Reused across all pages for consistent footer
 * Includes links, copyright, and optional terms for auth pages
 */

import { APP_NAME, GITHUB_REPO_URL } from "~/config";

interface FooterProps {
  className?: string;
  /** Show terms and privacy links (useful for auth pages) */
  showTerms?: boolean;
  /** Show the app logo/name */
  showLogo?: boolean;
}

export function Footer({ className, showTerms = true, showLogo = true }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`py-8 px-6 bg-muted/10 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo and copyright */}
          <div className="flex items-center gap-3">
            {showLogo && (
              <>
                <div className="w-6 h-6 bg-gradient-to-br from-primary/80 to-primary rounded-md flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="white"
                      d="M12.89 5.64a.184.184 0 0 1-.166-.238a23 23 0 0 1 1.292-3.065a.264.264 0 0 1 .288-.144a19.95 19.95 0 0 1 7.499 2.415a.36.36 0 0 1 .195.363a20.1 20.1 0 0 1-8.721 16.365a.185.185 0 0 1-.283-.086a24 24 0 0 1-.946-3.181a.29.29 0 0 1 .107-.328a16.5 16.5 0 0 0 6.152-10.875a16.5 16.5 0 0 0-5.422-1.226Z"
                    />
                  </svg>
                </div>
                <span className="text-sm text-muted-foreground">{APP_NAME}</span>
              </>
            )}
          </div>

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
        <div className="mt-8 pt-8 border-t border-border/50">
          {/* Terms (optional - for auth pages) */}
          {showTerms && (
            <p className="text-center text-xs text-muted-foreground mb-4">
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