# Authentication

This project uses [Better Auth](https://better-auth.com) for authentication and authorization, integrated with Drizzle ORM for database storage.

## Setup

### Environment Variables

Add the following to your `.env` file:

```bash
# Required - Generate with: bunx auth secret
AUTH_SECRET=your-32-char-secret-key

# Optional - Database path (defaults to .artifacts/tss-elysia.db)
DATABASE_NAME=.artifacts/tss-elysia.db
```

### Database Setup

```bash
# Generate and run migrations
bun run db:generate
bun run db:migrate

# Seed initial data
bun run db:seed
```

## Configuration

The auth system is configured in `src/lib/auth/index.ts`:

- **Email/Password**: Enabled with optional email verification
- **Session**: 7-day expiry, 24-hour update age
- **Database**: Drizzle adapter with SQLite

## Subscription Tiers

Users are assigned subscription tiers that control API rate limits:

| Tier        | Rate Limit | Duration |
| ----------- | ---------- | -------- |
| Free        | 100        | 60s      |
| Contributor | 1,000      | 60s      |
| Enterprise  | 10,000     | 60s      |

## API Endpoints

Better Auth provides these endpoints under `/api/auth`:

- `POST /api/auth/sign-up/email` - Register new user
- `POST /api/auth/sign-in/login` - Login user
- `GET /api/auth/get-session` - Get current session
- `POST /api/auth/sign-out` - Logout user

## Usage

```typescript
import { auth } from "~/lib/auth";

// Sign up
const result = await auth.api.signUpEmail({
  body: {
    email: "user@example.com",
    password: "secure-password",
    name: "John Doe",
  },
});

// Sign in
const login = await auth.api.signInEmail({
  body: {
    email: "user@example.com",
    password: "secure-password",
  },
});
```
