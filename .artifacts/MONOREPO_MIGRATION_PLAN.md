# Monorepo Migration Plan

## Overview

Migrate from monolithic codebase to Turborepo-managed monorepo with separate packages for better maintainability, testability, and scalability.

**Current**: Single `src/` with all code  
**Target**: `apps/` + `packages/` structure

---

## Goals

- [ ] Set up Turborepo infrastructure with workspace configuration
- [ ] Create shared packages (config, db, auth, server, client)
- [ ] Create web app in apps/web
- [ ] Update all imports to use workspace references
- [ ] Verify build, dev, and test commands work
- [ ] Update CI/CD for monorepo structure

---

## Target Structure

```bash
tss-elysia-nitro/
├── apps/
│   └── web/                    # Full-stack Vite app (TanStack Start)
│       ├── src/
│       │   ├── styles/         # CSS styles
│       │   ├── entry-client.tsx # Client entry point
│       │   └── entry-server.tsx # Server entry point
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── packages/
│   ├── config/                 # Shared configuration
│   │   ├── src/
│   │   │   ├── index.ts        # Exports
│   │   │   ├── env.ts          # Environment variables
│   │   │   ├── config.ts       # App config
│   │   │   ├── logger.ts       # Logging utilities
│   │   │   └── utils.ts        # Utility functions
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── db/                     # Database layer (Drizzle)
│   │   ├── src/
│   │   │   ├── index.ts        # DB connection
│   │   │   └── schema.ts       # DB schema
│   │   ├── drizzle.config.ts   # Drizzle config
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── auth/                   # Authentication (Better Auth)
│   │   ├── src/
│   │   │   └── index.ts        # Auth configuration
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── server/                 # Elysia server
│   │   ├── src/
│   │   │   ├── index.ts        # Server entry
│   │   │   ├── middlewares/    # Express middlewares
│   │   │   └── routes/        # API routes
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── client/                 # React client
│       ├── src/
│       │   ├── __root.tsx      # Root route
│       │   ├── router.tsx     # Router config
│       │   ├── routeTree.gen.ts # Generated routes
│       │   ├── pages/          # Page components
│       │   └── types/          # TypeScript types
│       ├── package.json
│       └── tsconfig.json
├── package.json                 # Root workspace
├── turbo.json                  # Turborepo config
├── tsconfig/
│   └── base.json              # Shared TypeScript config
└── bun.lockb
```

---

## Tasks

### Phase 1: Setup Infrastructure

#### 1.1 Install Turborepo

```bash
bun add turbo -D
```

#### 1.2 Create Root Configuration Files

**Create `package.json` (root)**:

```json
{
  "name": "tss-elysia-nitro",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "lint": "turbo run lint",
    "lint:fix": "turbo run lint:fix",
    "fmt": "turbo run fmt",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "test:e2e": "playwright test",
    "db:generate": "turbo run db:generate",
    "db:migrate": "turbo run db:migrate",
    "db:push": "turbo run db:push",
    "db:studio": "turbo run db:studio",
    "db:seed": "turbo run db:seed",
    "db:setup": "turbo run db:setup",
    "setup": "bun run scripts/setup.ts",
    "cleanup": "bun run scripts/cleanup.ts",
    "release": "changeset publish",
    "prepare": "simple-git-hooks"
  },
  "devDependencies": {
    "turbo": "^2"
  },
  "simple-git-hooks": {
    "pre-commit": "bun run lint:ci && bun run typecheck"
  },
  "packageManager": "bun@1"
}
```

**Create `turbo.json`**:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env*"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "lint:fix": {
      "dependsOn": ["^build"]
    },
    "fmt": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "db:generate": { "cache": false },
    "db:migrate": { "cache": false },
    "db:push": { "cache": false },
    "db:studio": { "cache": false },
    "db:seed": { "cache": false },
    "db:setup": { "cache": false }
  }
}
```

**Create `tsconfig/base.json`**:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "removeComments": true,
    "isolatedModules": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@tss-elysia-nitro/config": ["./packages/config/src"],
      "@tss-elysia-nitro/config/*": ["./packages/config/src/*"],
      "@tss-elysia-nitro/db": ["./packages/db/src"],
      "@tss-elysia-nitro/db/*": ["./packages/db/src/*"],
      "@tss-elysia-nitro/auth": ["./packages/auth/src"],
      "@tss-elysia-nitro/auth/*": ["./packages/auth/src/*"],
      "@tss-elysia-nitro/server": ["./packages/server/src"],
      "@tss-elysia-nitro/server/*": ["./packages/server/src/*"],
      "@tss-elysia-nitro/client": ["./packages/client/src"],
      "@tss-elysia-nitro/client/*": ["./packages/client/src/*"]
    }
  }
}
```

---

### Phase 2: Create Packages

#### 2.1 Package: `packages/config`

| Action | Description                                       |
| ------ | ------------------------------------------------- |
| Create | `packages/config/package.json`                    |
| Create | `packages/config/tsconfig.json`                   |
| Create | `packages/config/src/index.ts`                    |
| Move   | `src/env.ts` → `packages/config/src/env.ts`       |
| Move   | `src/config.ts` → `packages/config/src/config.ts` |
| Move   | `src/logger.ts` → `packages/config/src/logger.ts` |
| Move   | `src/utils.ts` → `packages/config/src/utils.ts`   |

**`packages/config/package.json`**:

```json
{
  "name": "@tss-elysia-nitro/config",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./env": "./src/env.ts",
    "./logger": "./src/logger.ts"
  },
  "scripts": { "typecheck": "tsc --noEmit" },
  "dependencies": { "elysia": "^1.4.28" }
}
```

**`packages/config/tsconfig.json`**:

```json
{
  "extends": "../../tsconfig/base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**`packages/config/src/index.ts`**:

```typescript
export * from "./config";
export * from "./env";
export * from "./logger";
export * from "./utils";
```

---

#### 2.2 Package: `packages/db`

| Action | Description                                          |
| ------ | ---------------------------------------------------- |
| Create | `packages/db/package.json`                           |
| Create | `packages/db/tsconfig.json`                          |
| Create | `packages/db/drizzle.config.ts`                      |
| Move   | `src/lib/db/schema.ts` → `packages/db/src/schema.ts` |
| Move   | `src/lib/db/index.ts` → `packages/db/src/index.ts`   |

**Update import** in `packages/db/src/index.ts`:

```typescript
// Before: import { env } from "~/env";
// After:
import { env } from "@tss-elysia-nitro/config";
```

**`packages/db/package.json`**:

```json
{
  "name": "@tss-elysia-nitro/db",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": { ".": "./src/index.ts" },
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "bun run db-seed.ts",
    "db:setup": "bun run scripts/remove-db.ts && bun run db:migrate && bun run db:seed",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": { "drizzle-orm": "^0.45.1" },
  "devDependencies": { "drizzle-kit": "^0.31.10" }
}
```

**`packages/db/tsconfig.json`**:

```json
{
  "extends": "../../tsconfig/base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**`packages/db/drizzle.config.ts`**:

```typescript
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: `${process.env.DATABASE_PATH || ".artifacts"}/${process.env.DATABASE_NAME || "tss-elysia.db"}`,
  },
} satisfies Config;
```

---

#### 2.3 Package: `packages/auth`

| Action | Description                                      |
| ------ | ------------------------------------------------ |
| Create | `packages/auth/package.json`                     |
| Create | `packages/auth/tsconfig.json`                    |
| Move   | `src/lib/auth.ts` → `packages/auth/src/index.ts` |

**Update imports** in `packages/auth/src/index.ts`:

```typescript
// Before:
import { db, schema } from "~/lib/db";
import { env } from "~/env";
import { isBun } from "~/config";
import { logger } from "~/logger";

// After:
import { db, schema } from "@tss-elysia-nitro/db";
import { env, isBun, logger } from "@tss-elysia-nitro/config";
```

**`packages/auth/package.json`**:

```json
{
  "name": "@tss-elysia-nitro/auth",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": { ".": "./src/index.ts" },
  "scripts": { "typecheck": "tsc --noEmit" },
  "dependencies": {
    "@node-rs/argon2": "^2.0.2",
    "better-auth": "^1.5.6"
  },
  "devDependencies": {
    "@tss-elysia-nitro/config": "workspace:*",
    "@tss-elysia-nitro/db": "workspace:*"
  }
}
```

**`packages/auth/tsconfig.json`**:

```json
{
  "extends": "../../tsconfig/base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

#### 2.4 Package: `packages/server`

| Action | Description                                             |
| ------ | ------------------------------------------------------- |
| Create | `packages/server/package.json`                          |
| Create | `packages/server/tsconfig.json`                         |
| Move   | `src/server.ts` → `packages/server/src/index.ts`        |
| Move   | `src/middlewares/` → `packages/server/src/middlewares/` |
| Move   | `src/routes/api/` → `packages/server/src/routes/api/`   |
| Create | `packages/server/src/routes/index.ts`                   |

**Update import** in `packages/server/src/index.ts`:

```typescript
// Before: import { AUTH_ALLOWED_METHODS } from "./config";
// After:
import { AUTH_ALLOWED_METHODS } from "@tss-elysia-nitro/config";
```

**`packages/server/package.json`**:

```json
{
  "name": "@tss-elysia-nitro/server",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": { ".": "./src/index.ts" },
  "scripts": { "typecheck": "tsc --noEmit" },
  "dependencies": {
    "@elysiajs/eden": "^1.4.8",
    "@elysiajs/openapi": "^1.4.14",
    "@elysiajs/opentelemetry": "^1.4.10",
    "@opentelemetry/exporter-trace-otlp-proto": "^0.214.0",
    "@opentelemetry/sdk-trace-node": "^2.6.1",
    "elysia": "^1.4.28",
    "elysia-rate-limit": "^4.5.1"
  },
  "devDependencies": {
    "@tss-elysia-nitro/auth": "workspace:*",
    "@tss-elysia-nitro/config": "workspace:*",
    "@tss-elysia-nitro/db": "workspace:*"
  }
}
```

**`packages/server/tsconfig.json`**:

```json
{
  "extends": "../../tsconfig/base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**`packages/server/src/routes/index.ts`**:

```typescript
export * from "./api";
```

---

#### 2.5 Package: `packages/client`

| Action | Description                                                     |
| ------ | --------------------------------------------------------------- |
| Create | `packages/client/package.json`                                  |
| Create | `packages/client/tsconfig.json`                                 |
| Move   | `src/routes/index.tsx` → `packages/client/src/pages/index.tsx`  |
| Move   | `src/routes/__root.tsx` → `packages/client/src/__root.tsx`      |
| Move   | `src/router.tsx` → `packages/client/src/router.tsx`             |
| Move   | `src/routeTree.gen.ts` → `packages/client/src/routeTree.gen.ts` |
| Move   | `src/types/` → `packages/client/src/types/`                     |

**Update imports** in client files - change `~/` to `@tss-elysia-nitro/config`

**`packages/client/package.json`**:

```json
{
  "name": "@tss-elysia-nitro/client",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": { ".": "./src/index.ts" },
  "scripts": { "typecheck": "tsc --noEmit" },
  "dependencies": {
    "@tanstack/react-query": "^5.95.2",
    "@tanstack/react-router": "^1.168.4",
    "@tanstack/react-router-devtools": "^1.166.11",
    "react": "^19.2.4",
    "react-dom": "^19.2.4"
  }
}
```

**`packages/client/tsconfig.json`**:

```json
{
  "extends": "../../tsconfig/base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src", "jsx": "react-jsx" },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

#### 2.6 App: `apps/web`

| Action | Description                            |
| ------ | -------------------------------------- |
| Create | `apps/web/package.json`                |
| Create | `apps/web/tsconfig.json`               |
| Create | `apps/web/vite.config.ts`              |
| Move   | `src/styles/` → `apps/web/src/styles/` |
| Delete | `vite.config.ts` (now in `apps/web/`)  |
| Create | `apps/web/src/entry-client.tsx`        |
| Create | `apps/web/src/entry-server.tsx`        |

**`apps/web/package.json`**:

```json
{
  "name": "tss-elysia-nitro-web",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "vite build",
    "dev": "vite dev",
    "preview": "vite preview",
    "fmt": "oxfmt .",
    "fmt:check": "oxfmt --check .",
    "lint": "oxlint . --format=github",
    "lint:fix": "oxlint . --fix && oxfmt .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@tanstack/react-start": "^1.167.8",
    "@tss-elysia-nitro/auth": "workspace:*",
    "@tss-elysia-nitro/client": "workspace:*",
    "@tss-elysia-nitro/config": "workspace:*",
    "@tss-elysia-nitro/db": "workspace:*",
    "@tss-elysia-nitro/server": "workspace:*"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.2.2",
    "@vitejs/plugin-react": "^6.0.1",
    "tailwindcss": "^4.2.2",
    "vite": "^8.0.3"
  }
}
```

**`apps/web/tsconfig.json`**:

```json
{
  "extends": "../../tsconfig/base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src", "jsx": "react-jsx" },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**`apps/web/vite.config.ts`**:

```typescript
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

const host = process.env.HOST || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

export default defineConfig(() => ({
  plugins: [tanstackStart(), viteReact(), tailwindcss()],
  ssr: { noExternal: ["drizzle-orm"] },
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src"),
      "@tss-elysia-nitro/config": resolve(__dirname, "../../packages/config/src"),
      "@tss-elysia-nitro/db": resolve(__dirname, "../../packages/db/src"),
      "@tss-elysia-nitro/auth": resolve(__dirname, "../../packages/auth/src"),
      "@tss-elysia-nitro/server": resolve(__dirname, "../../packages/server/src"),
      "@tss-elysia-nitro/client": resolve(__dirname, "../../packages/client/src"),
    },
  },
  server: { host, port, envPrefix: ["VITE_", "PUBLIC_"] },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-auth": ["better-auth"],
          "vendor-router": ["@tanstack"],
          "vendor-react": ["react"],
          "vendor-db": ["drizzle-orm"],
          "vendor-sqlite": ["bun:sqlite"],
        },
      },
    },
  },
}));
```

**`apps/web/src/entry-client.tsx`**:

```typescript
import { mount, StartClient } from "@tanstack/react-start/client";
import { router } from "@tss-elysia-nitro/client";

mount(() => <StartClient router={router} />);
```

**`apps/web/src/entry-server.tsx`**:

```typescript
import { createStartHandler } from "@tanstack/react-start/server";
import { getRouter } from "@tss-elysia-nitro/client";

export default createStartHandler({
  getRouter: () => getRouter(),
});
```

---

### Phase 3: Update Root Configuration

#### 3.1 Update Root tsconfig.json

```json
{
  "files": [],
  "references": [
    { "path": "./packages/config" },
    { "path": "./packages/db" },
    { "path": "./packages/auth" },
    { "path": "./packages/server" },
    { "path": "./packages/client" },
    { "path": "./apps/web" }
  ]
}
```

#### 3.2 Delete Old Files

- Delete `src/` directory
- Delete old `drizzle.config.ts` (now in `packages/db/`)

---

### Phase 4: Install & Verify

```bash
# Install dependencies
bun install

# Verify build
bun run build

# Verify dev server
bun run dev

# Run typecheck
bun run typecheck
```

---

### Phase 5: Update CI/CD

Update `.github/workflows/ci.yml` to run commands in `apps/web`:

```yaml
- run: bun run lint
  working-directory: apps/web
- run: bun run typecheck
  working-directory: apps/web
```

---

### Phase 6: Cleanup

- [ ] Delete old `src/` directory
- [ ] Update `.gitignore` with:

  ```bash
  node_modules/
  dist/
  .turbo/
  *.tsbuildinfo
  ```

- [ ] Update README with new project structure
- [ ] Run `bun run db:setup` in `packages/db/`

---

## File Movement Summary

| Package           | Files to Move                          |
| ----------------- | -------------------------------------- |
| `packages/config` | env.ts, config.ts, logger.ts, utils.ts |
| `packages/db`     | schema.ts, index.ts                    |
| `packages/auth`   | auth.ts                                |
| `packages/server` | server.ts, middlewares/, routes/api/   |
| `packages/client` | routes/, router.tsx, types/            |
| `apps/web`        | styles/, vite.config.ts                |

---

## Import Path Changes

Update all imports from `~/` to workspace paths:

| Old Import   | New Import                        |
| ------------ | --------------------------------- |
| `~/env`      | `@tss-elysia-nitro/config/env`    |
| `~/config`   | `@tss-elysia-nitro/config`        |
| `~/logger`   | `@tss-elysia-nitro/config/logger` |
| `~/utils`    | `@tss-elysia-nitro/config/utils`  |
| `~/lib/db`   | `@tss-elysia-nitro/db`            |
| `~/lib/auth` | `@tss-elysia-nitro/auth`          |

---

## Notes

- Use workspace references (`workspace:*`) for internal packages
- Each package has its own `tsconfig.json` extending `tsconfig/base.json`
- Turborepo handles build orchestration with `dependsOn: ["^build"]`
- Separate dependencies per package for isolation
- Use `@tss-elysia-nitro/*` import paths throughout

---

## References

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Bun Workspaces](https://bun.sh/docs/install/workspaces)
- [TanStack Start](https://tanstack.com/start)
- [Drizzle ORM](https://orm.drizzle.team)
- [Better Auth](https://better-auth.com)
