/**
 * Common Footer Component
 * Reused across all pages for consistent footer
 */

import { GITHUB_REPO_URL } from "~/config";

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  return (
    <footer className={`py-12 px-6 bg-muted/10 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3"></div>
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
                <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse self-center" />
                Status
              </span>
            </a>
            <a href={GITHUB_REPO_URL} className="hover:text-foreground transition-colors">
              GitHub
            </a>
          </div>
        </div>
        <div className="mt-8 pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TSS Elysia
        </div>
      </div>
    </footer>
  );
}