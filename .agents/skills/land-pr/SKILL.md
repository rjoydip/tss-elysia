---
name: land-pr
description: Land a PR (merge with proper workflow)
license: MIT
metadata:
  author: tss-elysia
  version: 1.0.0
---

# Land PR

Lands a PR with proper workflow using GitHub CLI.

## Input

- PR: `$1 <number|url>`
  - If missing: use the most recent PR mentioned in the conversation.
  - If ambiguous: ask.

## The Command

```bash
# Use gh CLI to land PR
gh pr view <PR> --json number,title,author,headRefName,baseRefName
```

## Workflow

1. Assign PR to self:
   - `gh pr edit <PR> --add-assignee @me`
2. Ensure repo is clean: `git status`
3. Identify PR metadata:
   - Get author, head branch, base branch
4. Fast-forward base branch:
   - `git checkout main`
   - `git pull --ff-only`
5. Create temp base branch:
   - `git checkout -b temp/landpr-<timestamp>`
6. Check out PR branch locally:
   - `gh pr checkout <PR>`
7. Rebase onto temp base:
   - Fix conflicts if any
8. Run tests and linting:
   - `bun run lint && bun run build && bun test`
9. Push updated branch:
   - `git push --force-with-lease`
10. Merge PR:
    - Squash (preferred): `gh pr merge <PR> --squash`
    - Or rebase: `gh pr merge <PR> --rebase`
11. Sync main:
    - `git checkout main && git pull --ff-only`
12. Verify merged state:
    - `gh pr view <PR> --json state --jq .state`
13. Clean up:
    - Delete temp branch

## Example

```bash
gh pr edit 42 --add-assignee @me
gh pr checkout 42
git rebase main
bun run lint && bun run build && bun test
gh pr merge 42 --squash
```
