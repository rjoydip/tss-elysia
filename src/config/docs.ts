/**
 * Documentation Configuration
 * Dynamically scans the /docs directory to build the sidebar navigation.
 * Maps markdown files in /docs to route paths via import.meta.glob.
 * Sidebar links route through the dynamic catch-all at /docs/$.
 */

/** Display name in the sidebar */
export interface DocItem {
  /** Display name in the sidebar */
  name: string;
  /** Route path (maps to docs/<path>.md on the filesystem) */
  href: string;
}

/** Section heading in the sidebar */
export interface DocSection {
  /** Section heading in the sidebar */
  title: string;
  /** List of documentation pages in this section */
  items: DocItem[];
}

/** Main navigation items for the header */
export const navItems = [
  { name: "Docs", href: "/docs" },
  { name: "API", href: "/docs/api/reference" },
  { name: "Blog", href: "/blog" },
  { name: "Changelog", href: "/changelog" },
];

/** Defines the display order for sidebar sections */
const SECTION_ORDER = ["getting-started", "auth", "api", "infra", "guides"] as const;

/** Maps folder names to sidebar section titles */
const SECTION_TITLE_MAP: Record<string, string> = {
  "getting-started": "Getting Started",
  guides: "Guides",
  auth: "Authentication",
  api: "API",
  infra: "Infrastructure",
};

/**
 * Formats a file or folder name into a readable display name.
 * Converts kebab-case to Title Case (e.g., "environment-variables" → "Environment Variables").
 */
function formatName(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Scan all markdown files in /docs and build the sidebar config.
 * In Vite: import.meta.glob is replaced at build time with eager imports.
 * In Bun tests: falls back to filesystem scanning via createRequire.
 * Using createRequire avoids Vite transforming bare `require()` calls.
 */
function scanDocModules(): Record<string, string> {
  try {
    // Vite transforms this call at build time into static imports.
    // If not transformed (e.g. Bun tests), import.meta.glob is undefined and throws.
    return import.meta.glob("../../docs/**/*.md", {
      query: "?raw",
      import: "default",
      eager: true,
    }) as Record<string, string>;
  } catch {
    // Bun test fallback: use createRequire so Vite doesn't attempt to bundle node:fs
    const { createRequire } = require("node:module") as typeof import("node:module");
    const nodeRequire = createRequire(import.meta.url);
    const { readdirSync, readFileSync } = nodeRequire("node:fs") as typeof import("node:fs");
    const { join } = nodeRequire("node:path") as typeof import("node:path");
    const docsDir = join(__dirname, "../../docs");
    const modules: Record<string, string> = {};

    /**
     * Recursively walks a directory and collects .md files.
     * Builds glob-style relative keys matching the Vite convention.
     */
    function walkDir(dir: string, prefix: string): void {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath, `${prefix}${entry.name}/`);
        } else if (entry.name.endsWith(".md")) {
          // Key format matches Vite glob: "../../docs/<path>.md"
          modules[`../../docs/${prefix}${entry.name}`] = readFileSync(fullPath, "utf-8");
        }
      }
    }

    walkDir(docsDir, "");
    return modules;
  }
}

const docModules = scanDocModules();

/** Group doc paths by their top-level folder (or root) */
const groups = new Map<string, { name: string; href: string }[]>();

for (const key of Object.keys(docModules)) {
  // Convert glob key to doc path: "../../docs/getting-started/overview.md" → "getting-started/overview"
  const relPath = key.replace(/^(\.\.\/)*docs\//, "").replace(/\.md$/, "");
  const segments = relPath.split("/");
  const folder = segments.length > 1 ? (segments[0] as string) : "getting-started";
  const fileName = segments[segments.length - 1] as string;
  // Build the route href: root overview → "/docs", others → "/docs/<path>"
  const href = relPath === "getting-started/overview" ? "/docs" : `/docs/${relPath}`;

  // Overview pages always display as "Overview", other files use formatted file name
  const name = fileName === "overview" ? "Overview" : formatName(fileName);

  if (!groups.has(folder)) {
    groups.set(folder, []);
  }
  groups.get(folder)!.push({ name, href });
}

/**
 * Sidebar navigation structure built dynamically from the /docs directory.
 * Each href maps to a markdown file under /docs/.
 * The "Overview" item in Getting Started uses href "/docs" so the sidebar
 * auto-expands when the user is on the docs landing page.
 */
export const docsConfig: DocSection[] = SECTION_ORDER.reduce((acc: DocSection[], folder) => {
  const items = groups.get(folder);
  if (items && items.length > 0) {
    // Sort: overview first, then alphabetical by name
    const sortedItems = [...items].sort((a, b) => {
      if (a.name === "Overview") return -1;
      if (b.name === "Overview") return 1;
      return a.name.localeCompare(b.name);
    });

    acc.push({
      title: SECTION_TITLE_MAP[folder] ?? formatName(folder),
      items: sortedItems,
    });
  }
  return acc;
}, []);