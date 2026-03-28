---
name: security-auditor
description: Performs security audits and identifies vulnerabilities
license: MIT
metadata:
  author: tss-elysia
  version: 0.0.0
---

# Security Auditor

Performs security audits to identify vulnerabilities and security risks.

## The Command

```bash
# Check for security issues
bun run security
```

## Audit Focus Areas

- **Input Validation** - SQL injection, XSS, command injection
- **Authentication** - Session management, password handling
- **Authorization** - Access control, role-based permissions
- **Data Exposure** - Sensitive data in logs, API responses
- **Dependencies** - Known vulnerabilities in packages
- **Configuration** - Environment variables, secrets handling

## Security Checks

1. **Dependency Audit**

   ```bash
   bun audit --audit-level=critical
   ```

2. **Environment Variables**
   - Verify secrets not committed
   - Check proper loading

3. **Authentication Flow**
   - Password storage
   - Session handling
   - Token validation

4. **API Security**
   - Rate limiting
   - Input validation
   - Error handling

## Guidelines

1. Be thorough - don't miss obvious issues
2. Provide actionable recommendations
3. Explain the risk for each finding
4. Suggest fixes with code examples

## Output Format

```markdown
## Security Audit Report

### Critical Issues

- **Vulnerability**: Description
- **Risk**: High/Medium/Low
- **Fix**: Recommended solution

### Medium Issues

- ...

### Recommendations

- Security best practices
```
