/**
 * Changelog Data
 * Mock changelog entries for the changelog page
 */

export type ChangelogType = "feature" | "fix" | "breaking" | "improvement" | "docs";

export interface ChangelogItem {
  id: string;
  version: string;
  releasedAt: string;
  type: ChangelogType;
  description: string;
}

export interface ChangelogEntry {
  version: string;
  releasedAt: string;
  title: string;
  items: ChangelogItem[];
}

export const changelogData: ChangelogEntry[] = [
  {
    version: "1.2.0",
    releasedAt: "2026-03-28",
    title: "New Dashboard Components & Performance Improvements",
    items: [
      {
        id: "1-1",
        version: "1.2.0",
        releasedAt: "2026-03-28",
        type: "feature",
        description: "Added new dashboard components with analytics widgets",
      },
      {
        id: "1-2",
        version: "1.2.0",
        releasedAt: "2026-03-28",
        type: "feature",
        description: "Support for custom themes with CSS variables",
      },
      {
        id: "1-3",
        version: "1.2.0",
        releasedAt: "2026-03-28",
        type: "improvement",
        description: "Reduced bundle size by 15% through code splitting",
      },
      {
        id: "1-4",
        version: "1.2.0",
        releasedAt: "2026-03-28",
        type: "fix",
        description: "Fixed authentication token refresh race condition",
      },
      {
        id: "1-5",
        version: "1.2.0",
        releasedAt: "2026-03-28",
        type: "docs",
        description: "Updated API reference documentation with new endpoints",
      },
    ],
  },
  {
    version: "1.1.0",
    releasedAt: "2026-03-15",
    title: "Enhanced Authentication & Database Features",
    items: [
      {
        id: "2-1",
        version: "1.1.0",
        releasedAt: "2026-03-15",
        type: "feature",
        description: "Added two-factor authentication (2FA) support",
      },
      {
        id: "2-2",
        version: "1.1.0",
        releasedAt: "2026-03-15",
        type: "feature",
        description: "New OAuth providers: Google, Twitter, and Discord",
      },
      {
        id: "2-3",
        version: "1.1.0",
        releasedAt: "2026-03-15",
        type: "feature",
        description: "Database migrations with Drizzle Kit",
      },
      {
        id: "2-4",
        version: "1.1.0",
        releasedAt: "2026-03-15",
        type: "improvement",
        description: "Improved TypeScript type inference for queries",
      },
      {
        id: "2-5",
        version: "1.1.0",
        releasedAt: "2026-03-15",
        type: "fix",
        description: "Fixed CORS configuration for local development",
      },
    ],
  },
  {
    version: "1.0.0",
    releasedAt: "2026-03-01",
    title: "Initial Release",
    items: [
      {
        id: "3-1",
        version: "1.0.0",
        releasedAt: "2026-03-01",
        type: "feature",
        description: "Initial release of TSS Elysia framework",
      },
      {
        id: "3-2",
        version: "1.0.0",
        releasedAt: "2026-03-01",
        type: "feature",
        description: "Type-safe API with ElysiaJS",
      },
      {
        id: "3-3",
        version: "1.0.0",
        releasedAt: "2026-03-01",
        type: "feature",
        description: "Authentication with Better Auth",
      },
      {
        id: "3-4",
        version: "1.0.0",
        releasedAt: "2026-03-01",
        type: "feature",
        description: "Database ORM with Drizzle",
      },
      {
        id: "3-5",
        version: "1.0.0",
        releasedAt: "2026-03-01",
        type: "feature",
        description: "Server-side rendering with TanStack Start",
      },
      {
        id: "3-6",
        version: "1.0.0",
        releasedAt: "2026-03-01",
        type: "docs",
        description: "Complete documentation and guides",
      },
    ],
  },
  {
    version: "0.9.0",
    releasedAt: "2026-02-15",
    title: "Beta Release - Public Preview",
    items: [
      {
        id: "4-1",
        version: "0.9.0",
        releasedAt: "2026-02-15",
        type: "feature",
        description: "Public beta release for community feedback",
      },
      {
        id: "4-2",
        version: "0.9.0",
        releasedAt: "2026-02-15",
        type: "breaking",
        description: "Changed API response format (v1 migration guide available)",
      },
      {
        id: "4-3",
        version: "0.9.0",
        releasedAt: "2026-02-15",
        type: "improvement",
        description: "Improved hot module replacement speed",
      },
    ],
  },
];

export function getChangelogEntry(version: string): ChangelogEntry | undefined {
  return changelogData.find((entry) => entry.version === version);
}

export function getLatestVersion(): ChangelogEntry {
  return changelogData[0];
}