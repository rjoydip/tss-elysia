# Plan

## Overview

Complete the authentication system with additional security features, set up user-facing routes, and ensure robust testing and security hardening for the full-stack TypeScript application.

## Goals

- [ ] Implement OAuth providers (Google, GitHub) for social login
- [ ] Add Two-Factor Authentication (TOTP) support
- [x] Set up user account management routes (profile, settings)
- [ ] Implement organization/team management for multi-tenant support
- [x] Enhance security with rate limiting, CSRF protection, and audit logging
- [x] Complete E2E test coverage for auth flows
- [x] Integrate shadcn/ui component library
- [ ] Build admin and user dashboards with user management
- [ ] Implement enterprise SASS product features
- [ ] Add email notifications via Resend
- [ ] Set up proper telemetry and analytics
- [ ] Configure enterprise infrastructure (Docker, CI/CD)
- [x] Implement real-time features (WebSockets)
- [x] Build MCP server for external integrations (make product available as MCP tools)
- [x] Configure multi-database strategy (PostgreSQL prod, SQLite dev, vector/graph for AI)
- [ ] Implement contract testing with Pact (Consumer & Provider)

## Tasks

### Phase 0: Setup & Development Standards (Completed)

- [x] Create setup script (`scripts/setup.ts`) for automated project initialization
- [x] Create cleanup script (`scripts/cleanup.ts`) for removing artifacts
- [x] Add AI/LLM coding guidelines to AGENTS.md
- [x] Add npm scripts for setup and cleanup (`bun run setup`, `bun run cleanup`)
- [x] Add code comments to all existing source files explaining intent and purpose
- [x] Optimize Docker build process (multi-stage, smaller image, security)
- [x] Improve release process with automated tagging and validations
- [x] Create manual release script (`scripts/release.ts`)
- [x] Update documentation (CONTRIBUTING.md, docker.md)
- [x] Enable dead code detection (TypeScript + oxlint rules)

### Phase 1: Preparation

- [x] Review existing Better Auth configuration in `src/lib/auth.ts`
- [x] Check environment variables for OAuth credentials
- [x] Review existing tests in `test/auth.test.ts` and `.e2e/auth.test.ts`
- [x] Document current API endpoints in `src/routes/api/auth/$.ts`

### Phase 2: Verification

- [x] Run linting: `bun run lint:fix`
- [x] Run typecheck: `bun run typecheck`
- [x] Run formatter: `bun run fmt`
- [x] Run unit tests: `bun test`
- [x] Run E2E tests: `bun run test:e2e`
- [x] Run security audit: Use security-auditor skill

### Phase 3: Authentication & Security

#### OAuth Integration

- [ ] Configure Google OAuth provider
- [ ] Configure GitHub OAuth provider
- [ ] Add OAuth buttons to login/signup UI
- [ ] Test OAuth flow end-to-end

#### Two-Factor Authentication

- [ ] Enable TOTP plugin in Better Auth
- [ ] Create 2FA setup UI (QR code, manual key)
- [ ] Add 2FA verification during sign-in
- [ ] Implement backup codes for account recovery

#### User Account Management

- [x] Create profile route `/profile`
- [x] Create settings route `/settings`
- [x] Add password change functionality
- [x] Add email change with verification
- [x] Implement session management (view/revoke sessions)

#### Organization Support

- [ ] Enable organization plugin
- [ ] Create organization creation UI
- [ ] Add member invitation system
- [ ] Implement role-based access control (RBAC)

#### Security Hardening

- [x] Configure trusted origins
- [ ] Set up CSRF protection
- [ ] Add audit logging for auth events
- [x] Configure email verification for sign-ups (configured in `src/lib/auth/index.ts`, currently disabled)
- [ ] Implement password strength requirements

### Phase 4: Documentation & Testing Updates

- [x] Add `stripFrontmatter` function to remove frontmatter from markdown before rendering
- [x] Add `getDisplayName` function for proper FILE_NAME_MAP lookup
- [x] Move docs utilities from `src/routes/docs.$.tsx` to `src/config/docs.ts`:
  - [x] `globKeyToDocPath` - converts Vite glob key to doc path
  - [x] `getSplatPath` - extracts splat path from route params
  - [x] `buildDocMap` - builds lookup map from modules
  - [x] `docMap` - exported map instance
- [x] Add unit tests for new config functions:
  - [x] `test/config/docs.test.ts` - globKeyToDocPath, getSplatPath, buildDocMap, getDisplayName
- [x] Add unit tests for middlewares:
  - [x] `test/middlewares/helmet.test.ts` - security headers
  - [x] `test/middlewares/cors.test.ts` - CORS headers
  - [x] `test/middlewares/index.test.ts` - traceFn, errorFn, composedMiddleware
- [x] Add E2E tests for middlewares:
  - [x] `.e2e/api/middlewares.spec.ts` - CORS, Helmet, Trace, Error, Rate Limit
- [x] Split UI component E2E tests into separate files:
  - [x] `button.spec.ts`, `input.spec.ts`, `card.spec.ts`, `badge.spec.ts`
  - [x] `tabs.spec.ts`, `form.spec.ts`, `sidebar.spec.ts`, `avatar.spec.ts`
  - [x] `tooltip.spec.ts`, `sheet.spec.ts`, `dropdown-menu.spec.ts`, `switch.spec.ts`
  - [x] `select.spec.ts`, `accordion.spec.ts`, `label.spec.ts`, `table.spec.ts`, `skeleton.spec.ts`
- [x] Add OpenAPI metadata unit tests across API routes (`test/routes/api/openapi-metadata/*.test.ts`)
- [x] Add E2E tests for OpenAPI spec generation and Scalar UI (`.e2e/api/openapi.spec.ts`)
- [x] Update README.md with new test structure
- [x] Update AGENTS.md with testing requirements
- [x] Update folder structure documentation in README.md

---

### Phase 4: UI/Component Library

#### UI Library (shadcn/ui)

- [x] Set up Tailwind CSS v4 with shadcn themes (already configured in `src/styles/app.css`)
- [x] Create cn utility function (`src/lib/utils.ts`)
- [x] Create essential shadcn/ui components:
  - [x] Button component (`src/components/ui/button.tsx`)
  - [x] Card components (`src/components/ui/card.tsx`)
  - [x] Badge component (`src/components/ui/badge.tsx`)
  - [x] Separator component (`src/components/ui/separator.tsx`)
- [x] Add required shadcn components:
  - [x] Input component
  - [x] Label component (already existed)
  - [x] Form components (Form, Field, etc.) - using TanStack Form
  - [x] Dropdown Menu component
  - [x] Avatar component
  - [x] Table component
  - [x] Tabs component
  - [x] Sheet component (sidebar)
  - [x] Switch component
  - [x] Select component
  - [x] Accordion component
  - [x] Tooltip component
  - [x] Skeleton component
  - [x] Breadcrumb component
  - [x] Collapsible component
  - [x] Sonner toast component
- [x] Add Markdown renderer with Shiki (`src/components/ui/markdown.tsx`)
- [x] Create unit tests for UI components (`test/components/ui/*.test.tsx`)
- [x] Create E2E tests for UI components split by component (`.e2e/ui/*.spec.ts`)
- [x ] Create reusable component library using Shadcn UI
- [ ] Implement design tokens (colors, spacing, typography)
- [ ] Add Preact configuration (future optimization)
- [ ] Document component usage patterns

#### Dashboards & User Management

- [ ] Create user dashboard route `/dashboard`
- [ ] Create admin dashboard route `/admin`
- [ ] Implement user profile management UI
- [ ] Add admin user list with pagination
- [ ] Implement user CRUD operations (create, read, update, delete)
- [ ] Add role-based access control UI
- [ ] Create organization settings page
- [ ] Add audit log viewer for admins

#### Enterprise SASS Features

- [ ] Multi-tenancy support with organization isolation
- [ ] Role-based access control (RBAC) system
- [ ] Team invitations and member management
- [ ] Subscription/billing UI integration
- [ ] Custom branding (logo, colors) per organization
- [ ] API rate limiting tiers
- [ ] Audit logging for all admin actions

---

### Phase 5: Email & Notifications

- [ ] Install and configure Resend SDK
- [ ] Set up email templates (welcome, verification, password reset)
- [ ] Integrate with Better Auth for transactional emails
- [ ] Add email preference settings UI
- [ ] Implement email delivery tracking
- [ ] Add unsubscribe management

---

### Phase 6: Analytics & Telemetry

- [ ] Set up error tracking (Sentry or similar)
- [ ] Add application performance monitoring
- [ ] Implement custom event tracking
- [ ] Create analytics dashboard
- [ ] Add user session tracking
- [ ] Set up health check endpoints
- [ ] Configure log aggregation

---

### Phase 7: Infrastructure & DevOps

> **Detailed Plan (Cache)**: See [phase-7.1-redis-implementation-plan.md](./plans/phase-7.1-redis-implementation-plan.md) for comprehensive implementation details.

- [x] Create Dockerfile for production deployment
- [x] Set up Docker Compose for local development
- [ ] Configure nginx for reverse proxy
- [x] Set up CI/CD pipeline (GitHub Actions)
- [x] Add Trivy container security scanning in CI
  - [x] Add docker-scan job to CI workflow
  - [x] Build Docker image locally in CI
  - [x] Scan for vulnerabilities (CRITICAL, HIGH severity)
  - [x] Scan for malware
  - [x] Fail pipeline on critical findings
- [ ] Add environment-specific configs (dev, staging, prod)
- [ ] Configure horizontal scaling support
- [ ] Set up database connection pooling
- [x] Add Redis for caching/sessions
  - [x] Configure Redis 7 Alpine in docker-compose with persistence and health check
  - [x] Create custom `redis.conf` with Pub/Sub, AOF, and memory limits
  - [x] Create Redis client module (`src/lib/redis/index.ts`) with Bun native `RedisClient`
  - [x] Create Pub/Sub helper module (`src/lib/redis/pubsub.ts`) with typed channels
  - [x] Add `REDIS_URL` environment variable (Docker + Upstash compatible)
  - [x] Create Redis heartbeat route (`src/routes/api/modules/-redis.ts`)
  - [x] Integrate Redis health check into status dashboard
  - [x] Add Redis logger (`src/lib/logger.ts`)
  - [x] Add unit tests (`test/lib/redis/redis.test.ts`, `test/lib/redis/pubsub.test.ts`)
  - [x] Add E2E test (`.e2e/api/redis-health.spec.ts`)

---

### Phase 8: Real-time Features

> Detailed Phase 8 realtime checklist was completed in prior milestone work.

#### Security & Authentication

- [x] Use authenticated WebSocket/SSE connections (require valid session token)
- [x] Implement connection authentication middleware
- [x] Add connection upgrade request validation (CSRF tokens)
- [x] Set up rate limiting per WebSocket connection
- [x] Implement connection expiration and re-authentication flow
- [x] Add secure WebSocket handshake with origin validation
- [ ] Encrypt real-time message payloads
- [x] Add audit logging for connection events

#### Implementation

- [x] Install and configure WebSocket library (Elysia WS or SSE)
- [x] Implement real-time notifications
- [x] Add live user presence indicators
- [x] Create real-time dashboard updates
- [x] Implement chat/messaging infrastructure
- [x] Add connection status handling

#### Connection Security Checklist

- [x] Validate session on connection handshake
- [x] Use secure WebSocket (wss://) in production
- [x] Implement heartbeat/ping-pong for connection health
- [x] Add connection timeout limits
- [x] Rate limit message frequency per user
- [x] Sanitize real-time message data
- [x] Implement graceful disconnect handling
- [x] Add reconnection logic with exponential backoff

#### Phase 9 Tests

- [x] Add unit tests for connection store (`test/lib/realtime/connection-store.test.ts`)
- [x] Add E2E tests for WebSocket (`.e2e/realtime/websocket.spec.ts`)

---

### Phase 9: MCP Server (External Integration)

> **Detailed Plan**: See [phase-9-mcp-server-plan.md](./plans/phase-9-mcp-server-plan.md) for comprehensive implementation details

- [x] Implement MCP protocol server using @modelcontextprotocol/server
- [x] Design tool schema for available actions (auth, users, organizations)
- [x] Create authentication layer for MCP clients
- [x] Implement organization-scoped tool access
- [x] Add rate limiting per MCP client/token (token bucket algorithm)
- [x] Create API key management routes (UI pending)
- [ ] Implement tool execution sandboxing (timeout wrapper needed)
- [x] Add MCP connection health monitoring
- [ ] Create MCP client SDK (using @modelcontextprotocol/sdk)
- [x] Implement tool discovery endpoint
- [ ] Add WebSocket support for MCP stdio fallback (future)
- [ ] Set up MCP server load balancing (future - needs Redis)
- [ ] Add MCP request/response caching (future - needs Redis)
- [x] Implement MCP telemetry (partial - lastUsedAt tracking)

#### Tests

- [x] Unit tests for rate limiting (`test/lib/mcp/rate-limit.test.ts`) - 12 tests passing
- [x] Unit tests for API key utilities (`test/lib/mcp/api-keys.test.ts`) - 6 tests passing
- [x] E2E tests for MCP endpoints (`.e2e/mcp/mcp.spec.ts`, `.e2e/mcp/mcp-keys.spec.ts`)

---

### Phase 10: Database Strategy

- [x] Migrate from SQLite to PostgreSQL for production
- [x] Configure environment-based database selection (SQLite dev, PostgreSQL prod)
- [ ] Set up PostgreSQL connection pooling (pgBouncer)
- [x] Configure database migrations for PostgreSQL
- [ ] Add database schema versioning system
- [x] Set up database replication (read replicas)
- [x] Implement database health checks
- [ ] Add database backup/restore automation
- [ ] Configure vector database for LLM embeddings (pgvector or Pinecone)
- [ ] Add graph database for relationship data (Neo4j or Redis Graph)
- [ ] Implement database query optimization
- [ ] Add database monitoring and alerting

---

### Phase 11: Scalability & Optimization

- [x] Implement Redis caching layer (use `src/lib/redis/index.ts`)
- [x] Add Redis-backed rate limiting (replace in-memory)
- [x] Add Redis session storage for Better Auth
- [x] Implement Pub/Sub event broadcasting for MCP
- [x] Add database read replicas support
- [ ] Configure horizontal pod autoscaling (HPA)
- [ ] Set up CDN for static assets
- [ ] Implement API request coalescing
- [ ] Add connection pooling for MCP clients
- [ ] Implement circuit breaker pattern
- [ ] Add graceful degradation for non-critical features
- [ ] Add response compression and streaming

---

### Phase 12: Verification

- [ ] Set strong `BETTER_AUTH_SECRET` (minimum 32 characters)
- [ ] Configure resource limits
- [ ] Enable health checks
- [ ] Set up log rotation
- [ ] Use reverse proxy (`nginx`/`traefik`) for TLS
- [ ] Configure backups for database volume
- [ ] Monitor container health
- [ ] Keep base image updated

---

### Phase 13: Contract Testing (Pact)

> **Detailed Plan of Contract Testing**: See [phase-13-contract-testing-implementation-plan.md](./plans/phase-13-contract-testing-implementation-plan.md) for comprehensive implementation details

- [ ] Install `@pact-foundation/pact`
- [ ] Configure Pact consumer for Auth endpoints
  - [ ] `GET /api/auth/get-session`
  - [ ] `POST /api/auth/login`
- [ ] Generate pact files in `pacts/` directory
- [ ] Configure Pact provider verification for Elysia
  - [ ] Implement state handlers for Auth flows
- [ ] Integrate Pact verification into CI pipeline
- [ ] Add contract testing documentation to `docs/guides/testing.md`

### Completed Tasks

- [x] Modernize database seeding with deterministic demo data, CLI flags, and unit test coverage
- [x] Refactor logging to dedicated `src/logger.ts` file
- [x] Rename `scriptLogger` to `logger` in scripts
- [x] Update logger imports across codebase (src/env.ts, src/lib/auth/index.ts, src/utils.ts)
- [x] Create auth client utilities (`src/lib/auth/client.ts`)
- [x] Create auth server instance (`src/lib/auth/index.ts`)
- [x] Create auth guard component (`src/components/auth/auth-guard.tsx`)
- [x] Create login page (`src/routes/auth/login.tsx`) and form (`src/components/auth/form/login.tsx`)
- [x] Create register page (`src/routes/auth/register.tsx`) and form (`src/components/auth/form/register.tsx`)
- [x] Create forgot password page (`src/routes/account/forgot-password.tsx`) and form (`src/components/auth/form/forgot-password.tsx`)
- [x] Create profile page (`src/routes/profile.tsx`) with profile components
- [x] Create settings page (`src/routes/settings/index.tsx`) with settings components
- [x] Add password change functionality (`src/components/settings/password-change-form.tsx`)
- [x] Add email change with verification (`src/components/settings/email-change-form.tsx`, `src/routes/auth/verify-email.tsx`)
- [x] Implement session management (`src/components/settings/session-settings.tsx`)
- [x] Add Input component (`src/components/ui/input.tsx`)
- [x] Add Tabs component (`src/components/ui/tabs.tsx`)
- [x] Install dependencies: @radix-ui/react-tabs, @radix-ui/react-dialog, @radix-ui/react-avatar, @radix-ui/react-dropdown-menu, react-hook-form, @hookform/resolvers, zod, @tanstack/react-form
- [x] Reorganize file structure:
  - [x] Moved `src/components/auth-guard.tsx` to `src/components/auth/auth-guard.tsx`
  - [x] Moved `src/lib/auth.ts` to `src/lib/auth/index.ts`
  - [x] Moved `src/lib/auth-client.ts` to `src/lib/auth/client.ts`
  - [x] Moved `src/routes/login.tsx` to `src/routes/auth/login.tsx`
  - [x] Moved `src/routes/register.tsx` to `src/routes/auth/register.tsx`
  - [x] Moved `src/routes/verify-email.tsx` to `src/routes/auth/verify-email.tsx`
  - [x] Moved `src/routes/profile.tsx` to `src/routes/profile/index.tsx`
  - [x] Moved `src/routes/settings.tsx` to `src/routes/settings/index.tsx`
  - [x] Moved `src/components/auth/login-form.tsx` to `src/components/auth/form/login.tsx`
  - [x] Moved `src/components/auth/register-form.tsx` to `src/components/auth/form/register.tsx`
  - [x] Created `src/components/branding.tsx` for reusable branding
  - [x] Created `src/components/footer.tsx` for common footer
  - [x] Updated all imports to reflect new structure
- [x] Redesign login form with Supabase-style UI (`src/components/auth/form/login.tsx`)
- [x] Redesign register form with Supabase-style UI (`src/components/auth/form/register.tsx`)
- [x] Convert login/register forms to use TanStack Form (`src/components/auth/form/login.tsx`, `src/components/auth/form/register.tsx`)
- [x] Install @tanstack/react-form package
- [x] Make branding component customizable (`src/components/branding.tsx`)
- [x] Improve footer component with configurable options (`src/components/footer.tsx`)
- [x] Update README.md with new folder structure
- [x] Create unit tests for UI components split by component (`test/components/ui/*.test.tsx`)
  - Badge, Button, Card, Separator, Label, Switch, Skeleton, Input, Tabs, Accordion, Sonner
- [x] Create E2E tests for UI components (`.e2e/ui/components.spec.ts`)
- [x] Update testing documentation (`docs/guides/testing.md`) with new test structure
- [x] Add password requirements hidden until typing in register form
- [x] Add Branding layout to forgot password page
- [x] Remove OAuth buttons from forgot password page
- [x] Add showSignIn prop to Header component
- [x] Fix Branding component to hide on mobile properly
- [x] Add PostgreSQL replica configuration with `POSTGRES_REPLICAS` env var
- [x] Configure primary database for read+write when no replicas configured
- [x] Implement round-robin replica selection for read queries
- [x] Add database pool configuration for health checks (`src/lib/db/index.ts`)
- [x] Add database heartbeat API endpoint (`src/routes/api/modules/-database.ts`)
- [x] Add database replica status to status dashboard UI
- [x] Fix unused import warning in status.test.ts
- [x] Add unit tests for database replica configuration (`test/lib/db/replica.test.ts`)
- [x] Improve navigation E2E tests with proper wait states for parallel execution
- [x] Update docs E2E tests to use networkidle for reliable navigation

#### Notification & State Management

- [x] Add sonner toast component for notifications (`src/components/ui/sonner.tsx`)
- [x] Add Toaster to root layout for global toast notifications (`src/routes/__root.tsx`)
- [x] Replace setError state with sonner toasts in components:
  - [x] Session settings (`src/components/settings/session-settings.tsx`)
  - [x] Password change form (`src/components/settings/password-change-form.tsx`)
  - [x] Email change form (`src/components/settings/email-change-form.tsx`)
  - [x] Profile page (`src/components/profile/profile-page.tsx`)
- [x] Set up TanStack Store for centralized state management (`src/lib/store/preferences.ts`)
- [x] Add localStorage persistence to preferences store
- [x] Update PreferencesSettings component to use centralized store
- [x] Add unit tests for sonner component (`test/components/ui/sonner.test.tsx`)
- [x] Add unit tests for preferences store (`test/store/preferences.test.ts`)
- [x] Split UI component tests into separate files (`test/components/ui/*.test.tsx`)
- [x] Add `stripFrontmatter` function to remove frontmatter from markdown content
- [x] Add `getDisplayName` function for proper FILE_NAME_MAP lookup in docs config
- [x] Move docs utilities from `src/routes/docs.$.tsx` to `src/config/docs.ts`
- [x] Add unit tests for config/docs functions (`test/config/docs.test.ts`)
- [x] Add unit tests for middlewares (`test/middlewares/*.test.ts`)
- [x] Add E2E tests for middlewares (`.e2e/api/middlewares.spec.ts`)
- [x] Split UI component E2E tests into separate files (`.e2e/ui/*.spec.ts`)
- [x] Update README.md with new test structure and folder structure
- [x] Update AGENTS.md with testing requirements
- [x] Add Trivy container security scanning in CI (`.github/workflows/ci.yml`)
  - [x] Add docker-scan job that builds image locally
  - [x] Scan for vulnerabilities (CRITICAL, HIGH) with Trivy
  - [x] Scan for malware with Trivy
  - [x] Configure fail-on-critical for security gates

---

## Notes

- OAuth requires credentials from Google Cloud Console and GitHub Developer Settings
- Consider environment variable structure for OAuth client secrets
- Use skill tool for 2FA: `Load skill "two-factor-authentication-best-practices"`
- Use skill tool for organizations: `Load skill "organization-best-practices"`
- Use skill tool for security: `Load skill "better-auth-security-best-practices"`
- Preact migration requires careful testing of React ecosystem libraries
- shadcn/ui needs Preact-compatible configuration
- Resend requires API key configuration
- Telemetry should comply with privacy regulations (GDPR, etc.)
- MCP server should support both stdio and HTTP transport
- Scalability design should support 10k+ concurrent MCP connections
- Consider MCP server as a separate microservice in future
- Use PostgreSQL for production relational data, SQLite for development
- Use vector database (pgvector) for LLM embeddings and semantic search
- Use graph database for complex relationship queries

---

## References

- [Better Auth Documentation](https://better-auth.com/docs)
- [Better Auth OAuth Guide](https://better-auth.com/docs/plugins/oauth)
- [Better Auth 2FA Guide](https://better-auth.com/docs/plugins/two-factor)
- [Better Auth Organization Guide](https://better-auth.com/docs/plugins/organizations)
- [TanStack Store Documentation](https://tanstack.com/store/latest/docs/overview)
- [TanStack Form Documentation](https://tanstack.com/form/latest/docs/overview)
- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/overview)
- [TanStack Router Documentation](https://tanstack.com/router/latest/docs/overview)
- [Preact Documentation](https://preactjs.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [sonner Toast Documentation](https://sonner.emilkowal.dev/)
- [Resend Documentation](https://resend.com/docs)
- [ElysiaJS WebSocket](https://elysiajs.com/plugins/websocket.html)
- [Model Context Protocol SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Redis Documentation](https://redis.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Neo4j Graph Database](https://neo4j.com/docs/)
- [AGENTS.md](../AGENTS.md)
- [Environment Variables Docs](../docs/guides/environment-variables.md)