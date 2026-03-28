---
name: code-review
description: Reviews code for quality and best practices
license: MIT
metadata:
  author: tss-elysia
  version: 0.0.0
---

# Code Review

Performs code reviews focusing on quality, best practices, and potential issues.

## The Command

```bash
# Review code changes
git diff --stat
git diff
```

## Review Focus Areas

- **Code Quality**: Clean code, proper naming, DRY principles
- **Best Practices**: Follow project conventions, idiomatic code
- **Potential Bugs**: Edge cases, null checks, error handling
- **Performance**: Efficient algorithms, unnecessary computations
- **Security**: Input validation, authentication, data exposure

## Guidelines

1. Provide constructive feedback
2. Don't make direct changes (suggest only)
3. Focus on critical issues first
4. Suggest improvements with code examples
5. Be respectful and professional

## Output Format

```markdown
## Code Review Summary

### Critical Issues

- Issue 1
- Issue 2

### Suggestions

- Suggestion 1
- Suggestion 2

### Positive Notes

- Good practice observed
```
