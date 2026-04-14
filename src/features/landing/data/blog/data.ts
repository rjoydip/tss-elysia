/**
 * Blog Data
 * Mock blog posts for the blog page
 */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: string;
  tags: string[];
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "introducing-tsse-elysia",
    title: "Introducing TSS Elysia: The Future of Type-Safe Full-Stack Development",
    excerpt:
      "We're excited to announce the launch of TSS Elysia, a modern full-stack framework that brings end-to-end type safety to your applications.",
    content: `
# Introducing TSS Elysia

We're excited to announce the launch of TSS Elysia, a modern full-stack framework that brings end-to-end type safety to your applications.

## Why TSS Elysia?

Building full-stack TypeScript applications has never been easier. TSS Elysia combines the best of ElysiaJS, React 19, and Better Auth to provide a seamless development experience.

## Key Features

- **End-to-End Type Safety**: From database to frontend, every layer is type-safe
- **Modern Stack**: Built with React 19, TanStack Start, and Elysia
- **Authentication**: Secure auth with Better Auth supporting OAuth and 2FA
- **Database**: Type-safe queries with Drizzle ORM

## Getting Started

Install dependencies and start building:

\`\`\`bash
bun install
bun run dev
\`\`\`

Stay tuned for more updates!
    `,
    author: {
      name: "Team TSS",
      avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=tss",
    },
    publishedAt: "2026-03-15",
    readTime: "5 min read",
    tags: ["Announcement", "TypeScript", "Full-Stack"],
    featured: true,
  },
  {
    id: "2",
    slug: "type-safe-apis-with-drizzle",
    title: "Building Type-Safe APIs with Drizzle ORM",
    excerpt:
      "Learn how to leverage Drizzle ORM to create fully type-safe database queries that scale with your application.",
    content: `
# Building Type-Safe APIs with Drizzle ORM

Drizzle ORM provides excellent type safety for your database operations. Let's explore how to use it effectively.

## Setting Up Drizzle

First, configure your database connection:

\`\`\`typescript
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const db = drizzle(client, { schema });
\`\`\`

## Type-Safe Queries

With Drizzle, you get full type inference:

\`\`\`typescript
const users = await db.select().from(usersTable);
\`\`\`

The \`users\` variable is fully typed based on your schema definition.
    `,
    author: {
      name: "Alex Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    },
    publishedAt: "2026-03-10",
    readTime: "8 min read",
    tags: ["Tutorial", "Drizzle", "Database"],
  },
  {
    id: "3",
    slug: "authentication-best-practices",
    title: "Authentication Best Practices with Better Auth",
    excerpt:
      "Security is paramount. Learn the best practices for implementing authentication in your TSS Elysia applications.",
    content: `
# Authentication Best Practices with Better Auth

Security is paramount in modern web applications. Here's how to implement secure authentication.

## OAuth Providers

Better Auth supports multiple OAuth providers:

\`\`\`typescript
const auth = betterAuth({
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },
  },
});
\`\`\`

## Two-Factor Authentication

Enable 2FA for enhanced security:

\`\`\`typescript
const auth = betterAuth({
  emailAndPassword: {
    requireEmailVerification: true,
  },
});
\`\`\`
    `,
    author: {
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    },
    publishedAt: "2026-03-05",
    readTime: "6 min read",
    tags: ["Security", "Authentication", "Best Practices"],
  },
  {
    id: "4",
    slug: "server-side-rendering-with-tanstack-start",
    title: "Mastering Server-Side Rendering with TanStack Start",
    excerpt:
      "Discover how TanStack Start enables powerful server-side rendering for optimal performance and SEO.",
    content: `
# Mastering Server-Side Rendering with TanStack Start

TanStack Start provides excellent SSR capabilities out of the box.

## Why SSR?

- Better SEO
- Faster initial page loads
- Improved performance on low-end devices

## Implementation

TanStack Start makes SSR simple:

\`\`\`tsx
export const route = createFileRoute('/')({
  loader: async () => {
    return { message: 'Hello from server!' };
  },
  component: Home,
});
\`\`\`
    `,
    author: {
      name: "Mike Peters",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
    },
    publishedAt: "2026-02-28",
    readTime: "7 min read",
    tags: ["SSR", "Performance", "TanStack"],
  },
  {
    id: "5",
    slug: "optimizing-react-19-performance",
    title: "Optimizing Performance in React 19",
    excerpt:
      "React 19 brings exciting new features. Learn how to optimize your components for maximum performance.",
    content: `
# Optimizing Performance in React 19

React 19 introduces several performance improvements.

## Use Optimistic Updates

Handle pending states gracefully:

\`\`\`tsx
const { mutate, isPending } = useMutation({
  mutationFn: updateUser,
  onMutate: async (newUser) => {
    await queryClient.cancelQueries(['user', newUser.id]);
    const previousUser = queryClient.getQueryData(['user', newUser.id]);
    queryClient.setQueryData(['user', newUser.id], newUser);
    return { previousUser };
  },
});
\`\`\`
    `,
    author: {
      name: "Emily Davis",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
    },
    publishedAt: "2026-02-20",
    readTime: "10 min read",
    tags: ["React", "Performance", "Optimization"],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getFeaturedPost(): BlogPost | undefined {
  return blogPosts.find((post) => post.featured);
}

export function getRecentPosts(count: number = 3): BlogPost[] {
  return blogPosts.slice(0, count);
}