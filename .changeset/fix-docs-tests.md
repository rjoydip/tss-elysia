---
"tsse-elysia": patch
---

Fix docs E2E tests, add frontmatter to docs, and add unit/E2E tests

- Fix sidebar locator in docs E2E tests (use data-sidebar attribute instead of aside)
- Add frontmatter (title, description) to all markdown docs
- Add unit tests for new UI components (avatar, breadcrumb, collapsible, dropdown-menu, select, sheet, table, tooltip)
- Add unit tests for useIsMobile hook logic
- Add E2E tests for mobile behavior