/**
 * Documentation Configuration
 * Defines the structure of the documentation sidebar.
 * Maps to markdown files in the /docs directory.
 * Sidebar links route through the dynamic catch-all at /docs/$.
 */

export interface DocItem {
  /** Display name in the sidebar */
  name: string;
  /** Route path (maps to docs/<path>.md on the filesystem) */
  href: string;
}

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

/**
 * Sidebar navigation structure.
 * Each href maps to a markdown file under /docs/.
 * The "Overview" item in Getting Started uses href "/docs" so the sidebar
 * auto-expands when the user is on the docs landing page.
 */
export const docsConfig: DocSection[] = [
  {
    title: "Getting Started",
    items: [
      { name: "Overview", href: "/docs" },
      { name: "Development", href: "/docs/development" },
      { name: "Architecture", href: "/docs/architecture" },
    ],
  },
  {
    title: "Authentication",
    items: [
      { name: "Overview", href: "/docs/auth/overview" },
      { name: "Reference", href: "/api/auth/reference" },
    ],
  },
  {
    title: "API",
    items: [
      { name: "Overview", href: "/docs/api/overview" },
      { name: "Reference", href: "/api/reference" },
    ],
  },
  {
    title: "Infrastructure",
    items: [
      { name: "CI/CD", href: "/docs/infra/ci-cd" },
      { name: "Docker", href: "/docs/infra/docker" },
    ],
  },
  {
    title: "Guides",
    items: [
      { name: "Environment Variables", href: "/docs/environment-variables" },
      { name: "Middleware", href: "/docs/middleware" },
      { name: "Testing", href: "/docs/testing" },
      { name: "Troubleshooting", href: "/docs/troubleshooting" },
    ],
  },
];