/**
 * Code Highlight Component
 * Uses Shiki for syntax highlighting with theme support
 * Supports both light and dark themes via data-theme attribute
 */

import { useEffect, useState } from "react";
import { getShikiHighlighter } from "~/lib/shiki";
import { useTheme } from "~/context/theme-provider";

interface CodeHighlightProps {
  /** Code string to highlight */
  code: string;
  /** Programming language for syntax highlighting */
  language?: string;
  /** Optional filename to display in header */
  filename?: string;
  /** Additional CSS classes */
  className?: string;
}

export function CodeHighlight({
  code,
  language = "typescript",
  filename,
  className = "",
}: CodeHighlightProps) {
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const { theme } = useTheme();

  /**
   * Resolves runtime theme for highlighting.
   * When using system mode, we read the active media query to keep output aligned with UI mode.
   */
  const resolvedTheme =
    theme === "system"
      ? typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  useEffect(() => {
    if (!code) return;

    const highlight = async () => {
      try {
        const highlighter = await getShikiHighlighter();
        const html = highlighter.codeToHtml(code.trim(), {
          lang: language,
          theme: resolvedTheme === "dark" ? "github-dark" : "github-light",
        });
        /**
         * Shiki adds inline background styles to `<pre>`. We remove those so
         * the app theme tokens define the surface consistently across themes.
         */
        const normalizedHtml = html
          .replace(/background-color:[^;"]*;?/g, "")
          .replace(/background:[^;"]*;?/g, "");
        setHighlightedCode(normalizedHtml);
      } catch {
        // Fallback to plain code block on error
        setHighlightedCode(
          `<pre style="padding:1.5rem;overflow-x:auto"><code>${code}</code></pre>`,
        );
      }
    };

    highlight();
  }, [code, language, resolvedTheme]);

  if (highlightedCode) {
    return (
      <div className={`rounded-xl border bg-card overflow-hidden shadow-2xl ${className}`}>
        {filename && (
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs text-muted-foreground ml-2 font-mono">{filename}</span>
          </div>
        )}
        <div
          className="p-4 overflow-x-auto bg-muted/40 [&_pre]:bg-transparent!"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </div>
    );
  }

  // Loading state
  return (
    <div className={`rounded-xl border bg-card overflow-hidden shadow-2xl ${className}`}>
      {filename && (
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-xs text-muted-foreground ml-2 font-mono">{filename}</span>
        </div>
      )}
      <pre className="p-6 text-sm overflow-x-auto bg-muted/40 text-foreground">
        {/* Uses theme tokens so loading state tracks light/dark mode immediately. */}
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}