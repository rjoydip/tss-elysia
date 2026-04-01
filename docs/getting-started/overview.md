# Project Overview

## Goals

A full-stack TypeScript application demonstrating modern web development with TanStack Start, Elysia, and React 19.

## Technology Stack

| Category   | Technology                              |
| ---------- | --------------------------------------- |
| Framework  | TanStack Start                          |
| Server     | Elysia                                  |
| Runtime    | Bun                                     |
| UI         | React 19                                |
| Styling    | Tailwind CSS v4                         |
| Validation | Zod v4                                  |
| Testing    | Bun (unit), Playwright (E2E), k6 (load) |
| Linting    | oxlint                                  |
| Formatting | oxfmt                                   |

## Project Structure

```bash
tss-elysia/
├── src/
│   ├── routes/           # File-based routing
│   │   ├── __root.tsx   # Root layout
│   │   ├── index.tsx    # Home page
│   │   └── api/         # API routes
│   ├── router.tsx       # Router configuration
│   └── styles/          # CSS styles
├── server.ts            # Tanstack server entry
├── vite.config.ts       # Vite configuration
├── test/
│   ├── load-tests/      # k6 load tests
│   └── *.test.ts       # Unit tests
├── .e2e/                # Playwright E2E tests
└── docs/                # Documentation
```

## Features

- Server-Side Rendering (SSR) with TanStack Start
- File-based routing
- API endpoints via Elysia
- Type-safe development
- Hot Module Replacement (HMR)
- Load testing with k6
- E2E testing with Playwright