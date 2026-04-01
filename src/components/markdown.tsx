/**
 * Markdown Renderer with Shiki Syntax Highlighting
 * Provides high-quality code syntax highlighting for documentation
 * Uses Shiki for beautiful code blocks with theme support
 */

import React, { useEffect, useState } from "react";
import remarkGfm from "remark-gfm";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import { getShikiHighlighter } from "~/lib/shiki";

/**
 * Parsed frontmatter metadata extracted from YAML frontmatter blocks.
 * Contains optional title and description fields for use in <head> meta tags.
 */
export interface FrontmatterData {
  title?: string;
  description?: string;
  [key: string]: string | undefined;
}

/**
 * Parses YAML frontmatter from raw markdown content.
 * Extracts key-value pairs from the --- delimited block at the start of the file.
 * Returns null if no frontmatter is present.
 */
export function parseFrontmatter(content: string): FrontmatterData | null {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match?.[1]) return null;

  const data: FrontmatterData = {};
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (key) data[key] = value || undefined;
  }
  return Object.keys(data).length > 0 ? data : null;
}

/**
 * Remark plugin that removes frontmatter nodes (yaml/toml) from the AST.
 * remark-frontmatter parses frontmatter into AST nodes but doesn't remove them;
 * this plugin strips them so they don't appear in rendered output.
 */
function remarkStripFrontmatter() {
  return (tree: { children: Array<{ type: string }> }) => {
    tree.children = tree.children.filter((node) => {
      return node.type !== "yaml" && node.type !== "toml";
    });
  };
}

interface MarkdownRendererProps {
  content: string;
  /** Callback invoked with parsed frontmatter metadata for use in <head> meta tags */
  onFrontmatter?: (data: FrontmatterData) => void;
}

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

function CodeBlock({ children, className }: CodeBlockProps) {
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("text");

  const code = React.Children.toArray(children)
    .map((child) => {
      if (typeof child === "string") return child;
      return "";
    })
    .join("");

  useEffect(() => {
    const langMatch = className?.match(/language-(\w+)/);
    if (langMatch) {
      setLanguage(langMatch[1]);
    }
  }, [className]);

  useEffect(() => {
    if (!code) return;

    let cancelled = false;

    const highlight = async () => {
      try {
        const highlighter = await getShikiHighlighter();
        if (cancelled) return;
        const html = highlighter.codeToHtml(code.trim(), {
          lang: language,
          themes: {
            light: "github-light",
            dark: "github-dark",
          },
        });
        if (!cancelled) setHighlightedCode(html);
      } catch {
        if (!cancelled) setHighlightedCode(`<pre><code>${code}</code></pre>`);
      }
    };

    highlight();
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  if (!code) return null;

  if (highlightedCode) {
    return (
      <div
        className="relative group my-4 rounded-lg overflow-hidden border border-border"
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    );
  }

  return (
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
      <code className={className}>{children}</code>
    </pre>
  );
}

export function MarkdownRenderer({ content, onFrontmatter }: MarkdownRendererProps) {
  // Extract frontmatter metadata and notify parent via callback for <head> meta tags
  useEffect(() => {
    if (!onFrontmatter) return;
    const frontmatter = parseFrontmatter(content);
    if (frontmatter) onFrontmatter(frontmatter);
  }, [content, onFrontmatter]);

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <Markdown
        remarkPlugins={[remarkGfm, remarkStripFrontmatter]}
        rehypePlugins={[rehypeRaw, rehypeSlug]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold tracking-tight mb-6 scroll-mt-20">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-semibold tracking-tight mt-8 mb-4 scroll-mt-20">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold tracking-tight mt-6 mb-3 scroll-mt-20">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold tracking-tight mt-4 mb-2">{children}</h4>
          ),
          p: ({ children }) => <p className="leading-7 mb-4">{children}</p>,
          ul: ({ children }) => <ul className="my-4 ml-6 list-disc">{children}</ul>,
          ol: ({ children }) => <ol className="my-4 ml-6 list-decimal">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-[#E11D48] dark:text-[#FB7185]">
                  {children}
                </code>
              );
            }
            return (
              <CodeBlock className={className}>
                <code className={className} {...props}>
                  {children}
                </code>
              </CodeBlock>
            );
          },
          pre: ({ children }) => {
            return <>{children}</>;
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground bg-primary/5 py-2 rounded-r-md">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="min-w-full border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border px-4 py-2 bg-muted text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border border-border px-4 py-2">{children}</td>,
          a: ({ children, href }) => {
            const _href = href?.replace(/\.md$/, "");
            return (
              <a
                href={_href}
                className="text-primary hover:underline"
                target={_href?.startsWith("http") ? "_blank" : undefined}
                rel={_href?.startsWith("http") ? "noopener noreferrer" : undefined}
              >
                {children}
              </a>
            );
          },
          hr: () => <hr className="my-8 border-border" />,
          img: ({ src, alt }) => (
            <img src={src} alt={alt} className="max-w-full h-auto rounded-lg my-4" />
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}

export default MarkdownRenderer;