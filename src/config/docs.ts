/**
 * Documentation Configuration
 * Defines the structure of the documentation sidebar
 * Supports nested sections and auto-discovery
 */

export interface DocItem {
  name: string;
  href: string;
}

export interface DocSection {
  title: string;
  items: DocItem[];
}

export const navItems = [
  { name: "Docs", href: "/docs" },
  { name: "API", href: "/docs/api/reference" },
  { name: "Blog", href: "/blog" },
  { name: "Changelog", href: "/changelog" },
];

export const docsConfig: DocSection[] = [
  {
    title: "Getting Started",
    items: [
      { name: "Overview", href: "/docs" },
      { name: "Development", href: "/docs/development" },
    ],
  },
  {
    title: "Authentication",
    items: [
      { name: "Overview", href: "/docs/auth" },
      { name: "Login", href: "/docs/auth/login" },
      { name: "Register", href: "/docs/auth/register" },
      { name: "Token Management", href: "/docs/auth/token" },
      { name: "Middleware", href: "/docs/auth/middleware" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { name: "Overview", href: "/docs/api/reference" },
      { name: "Health", href: "/docs/api/health" },
      { name: "Users", href: "/docs/api/users" },
      { name: "Auth", href: "/docs/api/auth" },
    ],
  },
];

export function getDocsConfig(_pathname: string): DocSection[] {
  return docsConfig;
}