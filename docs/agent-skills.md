# Agent Skills

This project uses a skill-based architecture for AI agents. Skills provide specialized instructions and workflows for specific tasks.

## Available Skills

Skills are located in `.agents/skills/` and provide domain-specific guidance for AI coding agents.

### Authentication & Security

| Skill                                                                                                        | Description                                                                                              |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| [better-auth-best-practices](.agents/skills/better-auth-best-practices/SKILL.md)                             | Configure Better Auth server and client, database adapters, sessions, plugins, and environment variables |
| [better-auth-security-best-practices](.agents/skills/better-auth-security-best-practices/SKILL.MD)           | Rate limiting, CSRF protection, trusted origins, secure sessions, OAuth token encryption, audit logging  |
| [email-and-password-best-practices](.agents/skills/email-and-password-best-practices/SKILL.md)               | Email verification, password reset flows, password policies, custom hashing algorithms                   |
| [organization-best-practices](.agents/skills/organization-best-practices/SKILL.md)                           | Multi-tenant organizations, members, invitations, custom roles, RBAC, teams                              |
| [two-factor-authentication-best-practices](.agents/skills/two-factor-authentication-best-practices/SKILL.md) | TOTP authenticator, OTP via email/SMS, backup codes, trusted devices                                     |
| [create-auth-skill](.agents/skills/create-auth-skill/SKILL.md)                                               | Scaffold authentication in TypeScript/JavaScript apps using Better Auth                                  |

### Development Patterns

| Skill                                                          | Description                                                                                                          |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| [api-design](.agents/skills/api-design/SKILL.md)               | REST API design patterns including resource naming, status codes, pagination, filtering, error responses, versioning |
| [backend-patterns](.agents/skills/backend-patterns/SKILL.md)   | Backend architecture patterns, API design, database optimization, server-side best practices                         |
| [frontend-patterns](.agents/skills/frontend-patterns/SKILL.md) | React development patterns, state management, performance optimization, UI best practices                            |
| [coding-standards](.agents/skills/coding-standards/SKILL.md)   | Universal coding standards, best practices for TypeScript, JavaScript, React, Node.js                                |

### Testing & Quality

| Skill                                                          | Description                                                                |
| -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [e2e-testing](.agents/skills/e2e-testing/SKILL.md)             | Playwright E2E testing patterns, Page Object Model, CI/CD integration      |
| [expect](.agents/skills/expect/SKILL.md)                       | Adversarial browser testing to verify changes work and identify edge cases |
| [verification-loop](.agents/skills/verification-loop/SKILL.md) | Comprehensive verification system for code sessions                        |

### Infrastructure & Tools

| Skill                                                              | Description                                                                           |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| [bun-runtime](.agents/skills/bun-runtime/SKILL.md)                 | Bun as runtime, package manager, bundler, and test runner                             |
| [mcp-server-patterns](.agents/skills/mcp-server-patterns/SKILL.md) | Build MCP servers with Node/TypeScript SDK, tools, resources, prompts, Zod validation |

## Using Skills

AI agents automatically load relevant skills based on the task. For example:

- When working on authentication → loads better-auth-related skills
- When designing APIs → loads api-design skill
- When writing frontend code → loads frontend-patterns skill

## Skill Structure

Each skill follows this structure:

- **name**: Skill identifier
- **description**: When to activate the skill
- **content**: Domain-specific instructions and best practices

## Contributing

To add a new skill:

1. Create `.agents/skills/<skill-name>/SKILL.md`
2. Follow the skill format with name, description, and content
3. Skills should provide actionable guidance for AI agents