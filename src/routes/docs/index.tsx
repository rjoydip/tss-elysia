/**
 * Documentation Landing Page
 * Getting Started overview with quick-start steps, features, and next steps
 */

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/docs/")({
  component: DocsLandingPage,
});

const quickStartSteps = [
  {
    title: "Install dependencies",
    description: "Install the required packages using Bun",
    code: "bun install",
  },
  {
    title: "Configure environment",
    description: "Set up your environment variables",
    code: "cp .env.example .env",
  },
  {
    title: "Start development server",
    description: "Run the development server",
    code: "bun run dev",
  },
];

const features = [
  {
    title: "Type-Safe API",
    description: "End-to-end type safety from database to frontend with full TypeScript support",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: "Modern Stack",
    description: "Built with React 19, TanStack Start, and Elysia for optimal performance",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      >
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    title: "Authentication",
    description: "Secure authentication with Better Auth supporting OAuth and 2FA",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "Database",
    description: "Flexible database support with Drizzle ORM for type-safe queries",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      >
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
  },
];

function DocsLandingPage() {
  return (
    <>
      {/* Title */}
      <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">Getting Started</h1>
      <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
        Learn how to set up and build with TSS Elysia - a modern full-stack TypeScript application.
      </p>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold tracking-tight mb-6 text-foreground">Quick Start</h2>
        <div className="space-y-4">
          {quickStartSteps.map((step, index) => (
            <div
              key={index}
              className="border rounded-lg p-5 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="w-7 h-7 rounded-full bg-primary text-primary text-sm font-semibold flex items-center justify-center">
                  {index + 1}
                </span>
                <h3 className="font-semibold text-foreground">{step.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3 ml-10">{step.description}</p>
              <div className="ml-10">
                <pre className="bg-[#0a0a0a] px-4 py-2.5 rounded-md overflow-x-auto border">
                  <code className="text-sm font-mono text-primary">{step.code}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold tracking-tight mb-6 text-foreground">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="border rounded-lg p-5 hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <h2 className="text-2xl font-semibold tracking-tight mb-6 text-foreground">Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/docs/getting-started/development"
            className="block p-5 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <h3 className="font-semibold mb-1 text-foreground group-hover:text-primary transition-colors">
              Development Setup
            </h3>
            <p className="text-sm text-muted-foreground">
              Configure your local development environment
            </p>
          </a>
          <a
            href="/docs/auth/overview"
            className="block p-5 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <h3 className="font-semibold mb-1 text-foreground group-hover:text-primary transition-colors">
              Authentication
            </h3>
            <p className="text-sm text-muted-foreground">Learn about authentication and security</p>
          </a>
        </div>
      </section>
    </>
  );
}