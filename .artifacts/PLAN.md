# Plan

## Overview

Complete the authentication system with additional security features, set up user-facing routes, and ensure robust testing and security hardening for the full-stack TypeScript application.

## Goals

- [ ] Implement OAuth providers (Google, GitHub) for social login
- [ ] Add Two-Factor Authentication (TOTP) support
- [x] Set up user account management routes (profile, settings)
- [ ] Implement organization/team management for multi-tenant support
- [x] Enhance security with rate limiting, CSRF protection, and audit logging
- [ ] Complete E2E test coverage for auth flows
- [x] Integrate shadcn/ui component library
- [ ] Build admin and user dashboards with user management
- [ ] Implement enterprise SASS product features
- [ ] Add email notifications via Resend
- [ ] Set up proper telemetry and analytics
- [ ] Configure enterprise infrastructure (Docker, CI/CD)
- [ ] Implement real-time features (WebSockets/SSE)
- [ ] Build MCP server for external integrations (make product available as MCP tools)
- [x] Configure multi-database strategy (PostgreSQL prod, SQLite dev, vector/graph for AI)

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
- [ ] Add required shadcn components:
  - [x] Input component
  - [x] Label component (already existed)
  - [ ] Form components (Form, Field, etc.)
  - [ ] Dialog component
  - [ ] Dropdown Menu component
  - [ ] Avatar component
  - [ ] Table component
  - [x] Tabs component
  - [ ] Sheet component (sidebar)
- [ ] Create reusable component library
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

- [x] Create Dockerfile for production deployment
- [x] Set up Docker Compose for local development
- [ ] Configure nginx for reverse proxy
- [x] Set up CI/CD pipeline (GitHub Actions)
- [ ] Add environment-specific configs (dev, staging, prod)
- [ ] Configure horizontal scaling support
- [ ] Set up database connection pooling
- [ ] Add Redis for caching/sessions

---

### Phase 8: Real-time Features

- [ ] Install and configure WebSocket library (Elysia WS or SSE)
- [ ] Implement real-time notifications
- [ ] Add live user presence indicators
- [ ] Create real-time dashboard updates
- [ ] Implement chat/messaging infrastructure
- [ ] Add connection status handling

---

### Phase 9: MCP Server (External Integration)

- [ ] Implement MCP protocol server using @modelcontextprotocol/server
- [ ] Design tool schema for available actions (auth, users, organizations)
- [ ] Create authentication layer for MCP clients
- [ ] Implement organization-scoped tool access
- [ ] Add rate limiting per MCP client/token
- [ ] Create API key management UI for MCP access
- [ ] Implement tool execution sandboxing
- [ ] Add MCP connection health monitoring
- [ ] Create MCP client SDK/documentation
- [ ] Implement tool discovery endpoint
- [ ] Add WebSocket support for MCP stdio fallback
- [ ] Set up MCP server load balancing for scalability
- [ ] Add MCP request/response caching
- [ ] Implement MCP telemetry and usage tracking

---

### Phase 10: Database Strategy

- [ ] Migrate from SQLite to PostgreSQL for production
- [ ] Configure environment-based database selection (SQLite dev, PostgreSQL prod)
- [ ] Set up PostgreSQL connection pooling (pgBouncer)
- [ ] Configure database migrations for PostgreSQL
- [ ] Add database schema versioning system
- [ ] Set up database replication (read replicas)
- [ ] Implement database health checks
- [ ] Add database backup/restore automation
- [ ] Configure vector database for LLM embeddings (pgvector or Pinecone)
- [ ] Add graph database for relationship data (Neo4j or Redis Graph)
- [ ] Implement database query optimization
- [ ] Add database monitoring and alerting

---

### Phase 11: Scalability & Optimization

- [ ] Implement Redis caching layer
- [ ] Add database read replicas support
- [ ] Configure horizontal pod autoscaling (HPA)
- [ ] Set up CDN for static assets
- [ ] Implement API request coalescing
- [ ] Add connection pooling for MCP clients
- [ ] Implement circuit breaker pattern
- [ ] Add graceful degradation for non-critical features
- [ ] Add response compression and streaming

---

### Phase 12: Verification

- [ ] Set strong `AUTH_SECRET` (minimum 32 characters)
- [ ] Configure resource limits
- [ ] Enable health checks
- [ ] Set up log rotation
- [ ] Use reverse proxy (`nginx`/`traefik`) for TLS
- [ ] Configure backups for database volume
- [ ] Monitor container health
- [ ] Keep base image updated

### Completed Tasks

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
- [x] Install dependencies: @radix-ui/react-tabs, @radix-ui/react-dialog, @radix-ui/react-avatar, @radix-ui/react-dropdown-menu, @radix-ui/react-toast, react-hook-form, @hookform/resolvers, zod, @tanstack/react-form
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
- [AGENTS.md](./AGENTS.md)
- [Environment Variables Docs](./docs/guides/environment-variables.md)