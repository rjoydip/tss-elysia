/**
 * Code Highlight Component
 * Uses Shiki for syntax highlighting with theme support
 * Supports both light and dark themes via data-theme attribute
 */

import { useEffect, useState } from "react";
import { getShikiHighlighter } from "~/lib/shiki";

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

  useEffect(() => {
    if (!code) return;

    const highlight = async () => {
      try {
        const highlighter = await getShikiHighlighter();
        const html = highlighter.codeToHtml(code.trim(), {
          lang: language,
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
        });
        setHighlightedCode(html);
      } catch {
        // Fallback to plain code block on error
        setHighlightedCode(
          `<pre style="background:#0a0a0a;padding:1.5rem;overflow-x:auto"><code>${code}</code></pre>`,
        );
      }
    };

    highlight();
  }, [code, language]);

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
          className="p-4 overflow-x-auto"
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
      <pre className="p-6 text-sm overflow-x-auto bg-[#0a0a0a]">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}